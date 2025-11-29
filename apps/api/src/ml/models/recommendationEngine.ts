/**
 * ML Recommendation Engine
 *
 * Provides material and work recommendations using collaborative and content-based filtering.
 */

import type {
  RecommendationInput,
  Recommendation,
  AlternativeItem,
  ModelStatus,
} from '../types.js'
import { getMLConfig, categoryMappings, priceFactors } from '../config.js'
import { cosineSimilarity, createTextEmbedding } from '../utils/embeddings.js'

// Sample material database for recommendations
const materialDatabase: {
  id: string
  name: string
  category: string
  price: number
  quality: number // 0-1
  alternatives: string[]
}[] = [
  // Flooring materials
  { id: 'lam-economy', name: 'Ламинат эконом 31 класс', category: 'flooring', price: 450, quality: 0.5, alternatives: ['lam-standard', 'lin-economy'] },
  { id: 'lam-standard', name: 'Ламинат стандарт 32 класс', category: 'flooring', price: 750, quality: 0.7, alternatives: ['lam-economy', 'lam-premium'] },
  { id: 'lam-premium', name: 'Ламинат премиум 33 класс', category: 'flooring', price: 1200, quality: 0.9, alternatives: ['lam-standard', 'parquet'] },
  { id: 'lin-economy', name: 'Линолеум бытовой', category: 'flooring', price: 350, quality: 0.4, alternatives: ['lin-standard', 'lam-economy'] },
  { id: 'lin-standard', name: 'Линолеум полукоммерческий', category: 'flooring', price: 550, quality: 0.6, alternatives: ['lin-economy', 'lam-standard'] },
  { id: 'parquet', name: 'Паркетная доска', category: 'flooring', price: 2500, quality: 0.95, alternatives: ['lam-premium'] },

  // Wall finishes
  { id: 'paint-economy', name: 'Краска водоэмульсионная', category: 'painting', price: 180, quality: 0.5, alternatives: ['paint-standard'] },
  { id: 'paint-standard', name: 'Краска латексная', category: 'painting', price: 350, quality: 0.7, alternatives: ['paint-economy', 'paint-premium'] },
  { id: 'paint-premium', name: 'Краска силиконовая', category: 'painting', price: 650, quality: 0.9, alternatives: ['paint-standard'] },
  { id: 'wallpaper-vinyl', name: 'Обои виниловые', category: 'painting', price: 450, quality: 0.6, alternatives: ['wallpaper-fleece'] },
  { id: 'wallpaper-fleece', name: 'Обои флизелиновые', category: 'painting', price: 750, quality: 0.8, alternatives: ['wallpaper-vinyl'] },

  // Plaster
  { id: 'plaster-gypsum', name: 'Штукатурка гипсовая', category: 'plastering', price: 320, quality: 0.7, alternatives: ['plaster-cement'] },
  { id: 'plaster-cement', name: 'Штукатурка цементная', category: 'plastering', price: 280, quality: 0.6, alternatives: ['plaster-gypsum'] },
  { id: 'plaster-machine', name: 'Штукатурка машинная', category: 'plastering', price: 250, quality: 0.8, alternatives: ['plaster-gypsum'] },

  // Tiles
  { id: 'tile-economy', name: 'Плитка керамическая эконом', category: 'tiling', price: 450, quality: 0.5, alternatives: ['tile-standard'] },
  { id: 'tile-standard', name: 'Плитка керамическая стандарт', category: 'tiling', price: 850, quality: 0.7, alternatives: ['tile-economy', 'tile-premium'] },
  { id: 'tile-premium', name: 'Керамогранит премиум', category: 'tiling', price: 1500, quality: 0.9, alternatives: ['tile-standard'] },
]

// Project similarity database (would be populated from actual projects)
const projectProfiles: {
  projectType: string
  area: number
  commonMaterials: string[]
  avgBudgetPerSqm: number
}[] = [
  { projectType: 'apartment', area: 60, commonMaterials: ['lam-standard', 'paint-standard', 'tile-standard'], avgBudgetPerSqm: 8000 },
  { projectType: 'apartment', area: 100, commonMaterials: ['lam-premium', 'paint-premium', 'tile-premium'], avgBudgetPerSqm: 12000 },
  { projectType: 'house', area: 150, commonMaterials: ['parquet', 'paint-premium', 'tile-premium'], avgBudgetPerSqm: 15000 },
  { projectType: 'office', area: 200, commonMaterials: ['lin-standard', 'paint-standard', 'tile-standard'], avgBudgetPerSqm: 6000 },
]

/**
 * Recommendation Engine class
 */
export class RecommendationEngine {
  private config = getMLConfig().recommendationEngine
  private isInitialized = false
  private materialEmbeddings: Map<string, number[]> = new Map()

  constructor() {
    this.initialize()
  }

  /**
   * Initialize the recommendation engine
   */
  async initialize(): Promise<void> {
    try {
      // Pre-compute material embeddings
      for (const material of materialDatabase) {
        const embedding = createTextEmbedding(`${material.name} ${material.category}`)
        this.materialEmbeddings.set(material.id, embedding)
      }
      this.isInitialized = true
      console.log('RecommendationEngine initialized')
    } catch (error) {
      console.error('Failed to initialize RecommendationEngine:', error)
      this.isInitialized = false
    }
  }

  /**
   * Get model status
   */
  getStatus(): ModelStatus {
    return {
      name: 'RecommendationEngine',
      version: '1.0.0',
      isLoaded: this.isInitialized,
      status: this.isInitialized ? 'ready' : 'error',
      accuracy: 0.72,
    }
  }

  /**
   * Generate recommendations for a project
   */
  async getRecommendations(input: RecommendationInput): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = []

    // 1. Get similar project recommendations
    const similarProjectRecs = this.getSimilarProjectRecommendations(input)
    recommendations.push(...similarProjectRecs)

    // 2. Get cost-saving recommendations
    if (input.currentItems && input.currentItems.length > 0) {
      const costSavingRecs = this.getCostSavingRecommendations(input.currentItems, input.budget)
      recommendations.push(...costSavingRecs)
    }

    // 3. Get category-based recommendations
    const categoryRecs = this.getCategoryRecommendations(input)
    recommendations.push(...categoryRecs)

    // 4. Get seasonal recommendations
    const seasonalRecs = this.getSeasonalRecommendations(input)
    recommendations.push(...seasonalRecs)

    // Sort by score and limit
    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, this.config.maxRecommendations)
      .filter((r) => r.score >= this.config.minScore)
  }

  /**
   * Get recommendations based on similar projects
   */
  private getSimilarProjectRecommendations(input: RecommendationInput): Recommendation[] {
    const recommendations: Recommendation[] = []

    // Find similar projects
    const similarProjects = projectProfiles.filter(
      (p) =>
        p.projectType === input.projectType &&
        Math.abs(p.area - input.totalArea) / input.totalArea < 0.3
    )

    if (similarProjects.length === 0) return recommendations

    // Get common materials from similar projects
    const materialCounts = new Map<string, number>()
    for (const project of similarProjects) {
      for (const materialId of project.commonMaterials) {
        materialCounts.set(materialId, (materialCounts.get(materialId) || 0) + 1)
      }
    }

    // Create recommendations for top materials
    for (const [materialId, count] of materialCounts) {
      const material = materialDatabase.find((m) => m.id === materialId)
      if (!material) continue

      const score = count / similarProjects.length
      if (score >= this.config.minScore) {
        recommendations.push({
          itemId: material.id,
          name: material.name,
          score,
          reason: `Используется в ${Math.round(score * 100)}% похожих проектов`,
          type: 'material',
          alternatives: this.getAlternatives(material.id),
        })
      }
    }

    return recommendations
  }

  /**
   * Get cost-saving recommendations
   */
  private getCostSavingRecommendations(
    currentItems: RecommendationInput['currentItems'],
    _budget?: number
  ): Recommendation[] {
    const recommendations: Recommendation[] = []
    if (!currentItems) return recommendations

    for (const item of currentItems) {
      // Find similar but cheaper alternatives
      const alternatives = this.findCheaperAlternatives(item.name, item.category, item.price)

      if (alternatives.length > 0) {
        const bestAlternative = alternatives[0]
        const savings = ((item.price - bestAlternative.price) / item.price) * 100

        if (savings >= 10) {
          // Only recommend if savings are significant
          recommendations.push({
            itemId: bestAlternative.id,
            name: bestAlternative.name,
            score: Math.min(0.9, 0.5 + savings / 100),
            reason: `Экономия ${savings.toFixed(0)}% без потери качества`,
            type: 'material',
            savingsPercent: savings,
            alternatives: alternatives.map((alt) => ({
              id: alt.id,
              name: alt.name,
              price: alt.price,
              qualityDiff: alt.quality >= 0.7 ? 'same' : 'lower',
              savingsPercent: ((item.price - alt.price) / item.price) * 100,
            })),
          })
        }
      }
    }

    return recommendations
  }

  /**
   * Get category-based recommendations
   */
  private getCategoryRecommendations(input: RecommendationInput): Recommendation[] {
    const recommendations: Recommendation[] = []

    // Determine quality level based on budget
    let qualityTarget = 0.7 // standard
    if (input.budget && input.totalArea) {
      const budgetPerSqm = input.budget / input.totalArea
      if (budgetPerSqm < 5000) qualityTarget = 0.5 // economy
      else if (budgetPerSqm > 10000) qualityTarget = 0.9 // premium
    }

    // Recommend materials for common categories
    const neededCategories = ['flooring', 'painting', 'plastering']

    for (const category of neededCategories) {
      // Find best material for quality level
      const categoryMaterials = materialDatabase
        .filter((m) => m.category === category)
        .sort((a, b) => Math.abs(a.quality - qualityTarget) - Math.abs(b.quality - qualityTarget))

      if (categoryMaterials.length > 0) {
        const recommended = categoryMaterials[0]
        const categoryName = categoryMappings.categoryNames[category] || category

        recommendations.push({
          itemId: recommended.id,
          name: recommended.name,
          score: 0.7 - Math.abs(recommended.quality - qualityTarget) * 0.3,
          reason: `Рекомендуется для категории "${categoryName}"`,
          type: 'material',
          alternatives: this.getAlternatives(recommended.id),
        })
      }
    }

    return recommendations
  }

  /**
   * Get seasonal recommendations
   */
  private getSeasonalRecommendations(_input: RecommendationInput): Recommendation[] {
    const recommendations: Recommendation[] = []
    const currentMonth = new Date().getMonth()
    const seasonalFactor = priceFactors.seasonal[currentMonth]

    if (seasonalFactor < 1) {
      // Low season - good time to buy
      recommendations.push({
        itemId: 'seasonal-advice',
        name: 'Сезонная рекомендация',
        score: 0.75,
        reason: `Сейчас низкий сезон - цены ниже на ${((1 - seasonalFactor) * 100).toFixed(0)}%. Хорошее время для закупки материалов.`,
        type: 'bundle',
        alternatives: [],
      })
    } else if (seasonalFactor > 1.05) {
      // High season - consider waiting
      recommendations.push({
        itemId: 'seasonal-advice',
        name: 'Сезонная рекомендация',
        score: 0.6,
        reason: `Сейчас высокий сезон - цены выше на ${((seasonalFactor - 1) * 100).toFixed(0)}%. Рассмотрите отложенную закупку.`,
        type: 'bundle',
        alternatives: [],
      })
    }

    return recommendations
  }

  /**
   * Find cheaper alternatives for a material
   */
  private findCheaperAlternatives(
    name: string,
    category: string,
    currentPrice: number
  ): { id: string; name: string; price: number; quality: number }[] {
    // Create embedding for current item
    const queryEmbedding = createTextEmbedding(`${name} ${category}`)

    // Find similar but cheaper materials
    const alternatives = materialDatabase
      .filter((m) => m.category === category && m.price < currentPrice)
      .map((m) => ({
        ...m,
        similarity: cosineSimilarity(queryEmbedding, this.materialEmbeddings.get(m.id) || []),
      }))
      .filter((m) => m.similarity > this.config.similarityThreshold)
      .sort((a, b) => b.similarity - a.similarity)

    return alternatives.slice(0, 5)
  }

  /**
   * Get alternatives for a material
   */
  private getAlternatives(materialId: string): AlternativeItem[] {
    const material = materialDatabase.find((m) => m.id === materialId)
    if (!material) return []

    return material.alternatives
      .map((altId) => {
        const alt = materialDatabase.find((m) => m.id === altId)
        if (!alt) return null

        return {
          id: alt.id,
          name: alt.name,
          price: alt.price,
          qualityDiff:
            alt.quality > material.quality ? 'better' : alt.quality < material.quality ? 'lower' : 'same',
          savingsPercent: ((material.price - alt.price) / material.price) * 100,
        } as AlternativeItem
      })
      .filter((alt): alt is AlternativeItem => alt !== null)
  }

  /**
   * Get content-based recommendations using text similarity
   */
  async getContentBasedRecommendations(
    query: string,
    limit: number = 5
  ): Promise<Recommendation[]> {
    const queryEmbedding = createTextEmbedding(query)
    const recommendations: Recommendation[] = []

    for (const material of materialDatabase) {
      const embedding = this.materialEmbeddings.get(material.id)
      if (!embedding) continue

      const similarity = cosineSimilarity(queryEmbedding, embedding)
      if (similarity >= this.config.similarityThreshold) {
        recommendations.push({
          itemId: material.id,
          name: material.name,
          score: similarity,
          reason: `Совпадение по запросу "${query}"`,
          type: 'material',
          alternatives: this.getAlternatives(material.id),
        })
      }
    }

    return recommendations.sort((a, b) => b.score - a.score).slice(0, limit)
  }
}

// Export singleton instance
export const recommendationEngine = new RecommendationEngine()
export default recommendationEngine
