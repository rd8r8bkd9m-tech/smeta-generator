import prisma from '../../lib/prisma.js'
import type { Prisma } from '@prisma/client'
import type { ParsedWork } from '../schemas/estimate.schema.js'
import type { Normative, CommercialPrice, CustomPrice } from '@prisma/client'

// Category mapping from parsed categories to database categories
const categoryMapping: Record<string, string[]> = {
  plastering: ['Отделка', 'Штукатурка'],
  painting: ['Отделка', 'Покраска', 'Окраска'],
  flooring: ['Полы', 'Напольные покрытия'],
  demolition: ['Демонтаж'],
  masonry: ['Кладка'],
  tiling: ['Плиточные работы', 'Отделка'],
  electrical: ['Электромонтаж', 'Электрика'],
  plumbing: ['Сантехника', 'Водопровод'],
  drywall: ['Гипсокартон', 'Отделка'],
  insulation: ['Утепление', 'Изоляция'],
  roofing: ['Кровля'],
  windows: ['Окна', 'Остекление'],
  doors: ['Двери'],
  general: ['Общестроительные работы'],
}

// Keyword mapping for better search
const keywordMapping: Record<string, string[]> = {
  штукатурка: ['штукатурка', 'оштукатуривание'],
  покраска: ['покраска', 'окраска', 'краска'],
  ламинат: ['ламинат', 'укладка ламината', 'напольное покрытие'],
  плитка: ['плитка', 'керамическая плитка', 'укладка плитки'],
  демонтаж: ['демонтаж', 'разборка'],
  шпаклевка: ['шпаклевка', 'шпатлевка'],
}

export interface MatchedNormative {
  normative: Normative
  commercialPrice: CommercialPrice | null
  customPrice: CustomPrice | null
  matchScore: number
}

export interface PriceInfo {
  ferPrice: number
  commercialPrice: number | null
  customPrice: number | null
  effectivePrice: number
  priceSource: 'DATABASE' | 'USER'
}

export class NormativesMatcher {
  // Search normatives by parsed work
  async findNormatives(
    work: ParsedWork,
    userId?: string,
    region?: string
  ): Promise<MatchedNormative[]> {
    const searchTerms = this.buildSearchTerms(work)
    const categorySearch = this.getCategorySearch(work.category)

    // Build Prisma where clause
    const whereConditions: Array<{
      OR?: Array<{
        name?: { contains: string; mode: 'insensitive' }
        code?: { contains: string; mode: 'insensitive' }
      }>
      category?: { in: string[] }
    }> = []

    // Add search term conditions
    if (searchTerms.length > 0) {
      whereConditions.push({
        OR: searchTerms.flatMap(term => [
          { name: { contains: term, mode: 'insensitive' as const } },
        ]),
      })
    }

    // Add category condition if available
    if (categorySearch.length > 0) {
      whereConditions.push({
        category: { in: categorySearch },
      })
    }

    // Query normatives
    const normatives = await prisma.normative.findMany({
      where: whereConditions.length > 0 ? { AND: whereConditions } : {},
      include: {
        commercialPrices: {
          where: {
            isActive: true,
            ...(region ? { region } : {}),
          },
          take: 1,
        },
        customPrices: userId
          ? {
              where: { userId },
              take: 1,
            }
          : false,
      },
      take: 10,
    })

    // Calculate match scores and sort
    const matched = normatives.map(norm => ({
      normative: norm,
      commercialPrice: norm.commercialPrices?.[0] || null,
      customPrice: (norm.customPrices as CustomPrice[])?.[0] || null,
      matchScore: this.calculateMatchScore(norm, work),
    }))

    // Sort by match score descending
    matched.sort((a, b) => b.matchScore - a.matchScore)

    return matched
  }

  // Get best matching normative for a work item
  async findBestMatch(
    work: ParsedWork,
    userId?: string,
    region?: string
  ): Promise<MatchedNormative | null> {
    const matches = await this.findNormatives(work, userId, region)
    return matches[0] || null
  }

  // Get price info for a normative
  getPriceInfo(matched: MatchedNormative): PriceInfo {
    const ferPrice = matched.normative.price
    const commercialPrice = matched.commercialPrice?.price || null
    const customPrice = matched.customPrice?.price || null

    // Priority: customPrice > commercialPrice > ferPrice
    let effectivePrice = ferPrice
    let priceSource: 'DATABASE' | 'USER' = 'DATABASE'

    if (customPrice !== null) {
      effectivePrice = customPrice
      priceSource = 'USER'
    } else if (commercialPrice !== null) {
      effectivePrice = commercialPrice
    }

    return {
      ferPrice,
      commercialPrice,
      customPrice,
      effectivePrice,
      priceSource,
    }
  }

  // Search normatives by text query
  async searchNormatives(
    query: string,
    options: {
      type?: string
      category?: string
      limit?: number
      includeCommercial?: boolean
      userId?: string
      region?: string
    } = {}
  ): Promise<Normative[]> {
    const { type, category, limit = 20, includeCommercial, userId, region } = options

    const where: Prisma.NormativeWhereInput = {
      OR: [
        { name: { contains: query, mode: 'insensitive' as const } },
        { code: { contains: query, mode: 'insensitive' as const } },
      ],
    }

    if (type) {
      where.type = type as Prisma.NormativeWhereInput['type']
    }
    if (category) where.category = category

    const include: {
      commercialPrices?: {
        where: { isActive: boolean; region?: string }
        take: number
      }
      customPrices?: { where: { userId: string }; take: number }
    } = {}

    if (includeCommercial) {
      include.commercialPrices = {
        where: {
          isActive: true,
          ...(region ? { region } : {}),
        },
        take: 1,
      }
      if (userId) {
        include.customPrices = {
          where: { userId },
          take: 1,
        }
      }
    }

    return prisma.normative.findMany({
      where,
      include: Object.keys(include).length > 0 ? include : undefined,
      take: limit,
      orderBy: { code: 'asc' },
    })
  }

  // Private helper methods
  private buildSearchTerms(work: ParsedWork): string[] {
    const terms: string[] = [...work.keywords]

    // Add description words
    const descWords = work.description
      .toLowerCase()
      .split(/\s+/)
      .filter(w => w.length > 3)
    terms.push(...descWords.slice(0, 5))

    // Expand keywords using mapping
    work.keywords.forEach(keyword => {
      const mapped = keywordMapping[keyword.toLowerCase()]
      if (mapped) {
        terms.push(...mapped)
      }
    })

    // Remove duplicates
    return [...new Set(terms)]
  }

  private getCategorySearch(category: string): string[] {
    const mapped = categoryMapping[category.toLowerCase()]
    return mapped || [category]
  }

  private calculateMatchScore(normative: Normative, work: ParsedWork): number {
    let score = 0
    const name = normative.name.toLowerCase()

    // Exact keyword match
    work.keywords.forEach(keyword => {
      if (name.includes(keyword.toLowerCase())) {
        score += 10
      }
    })

    // Category match
    const categorySearch = this.getCategorySearch(work.category)
    if (normative.category && categorySearch.includes(normative.category)) {
      score += 5
    }

    // Description word match
    const descWords = work.description.toLowerCase().split(/\s+/)
    descWords.forEach(word => {
      if (word.length > 3 && name.includes(word)) {
        score += 2
      }
    })

    return score
  }
}

export const normativesMatcher = new NormativesMatcher()
export default normativesMatcher
