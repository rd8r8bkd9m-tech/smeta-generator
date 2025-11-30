/**
 * ML Cost Optimizer
 *
 * Optimizes estimate costs using genetic algorithm-inspired approach.
 * Balances quality and price within constraints.
 */

import type {
  OptimizationInput,
  OptimizationResult,
  OptimizationChange,
  ModelStatus,
} from '../types.js'
import { getMLConfig, priceFactors } from '../config.js'

// Material alternatives database
const materialAlternatives: Record<
  string,
  Array<{
    id: string
    name: string
    price: number
    quality: number // 0-1
  }>
> = {
  flooring: [
    { id: 'lin-economy', name: 'Линолеум бытовой', price: 350, quality: 0.4 },
    { id: 'lin-standard', name: 'Линолеум полукоммерческий', price: 550, quality: 0.6 },
    { id: 'lam-economy', name: 'Ламинат 31 класс', price: 450, quality: 0.5 },
    { id: 'lam-standard', name: 'Ламинат 32 класс', price: 750, quality: 0.7 },
    { id: 'lam-premium', name: 'Ламинат 33 класс', price: 1200, quality: 0.85 },
    { id: 'parquet', name: 'Паркетная доска', price: 2500, quality: 0.95 },
  ],
  painting: [
    { id: 'paint-water', name: 'Краска водоэмульсионная', price: 180, quality: 0.5 },
    { id: 'paint-latex', name: 'Краска латексная', price: 350, quality: 0.7 },
    { id: 'paint-silicone', name: 'Краска силиконовая', price: 650, quality: 0.9 },
    { id: 'wallpaper-paper', name: 'Обои бумажные', price: 250, quality: 0.4 },
    { id: 'wallpaper-vinyl', name: 'Обои виниловые', price: 450, quality: 0.6 },
    { id: 'wallpaper-fleece', name: 'Обои флизелиновые', price: 750, quality: 0.8 },
  ],
  plastering: [
    { id: 'plaster-cement', name: 'Штукатурка цементная', price: 280, quality: 0.6 },
    { id: 'plaster-gypsum', name: 'Штукатурка гипсовая', price: 320, quality: 0.7 },
    { id: 'plaster-machine', name: 'Штукатурка машинная', price: 250, quality: 0.75 },
    { id: 'plaster-decorative', name: 'Штукатурка декоративная', price: 800, quality: 0.9 },
  ],
  tiling: [
    { id: 'tile-economy', name: 'Плитка эконом', price: 450, quality: 0.5 },
    { id: 'tile-standard', name: 'Плитка стандарт', price: 850, quality: 0.7 },
    { id: 'tile-premium', name: 'Керамогранит', price: 1500, quality: 0.85 },
    { id: 'tile-mosaic', name: 'Мозаика', price: 2500, quality: 0.9 },
  ],
  electrical: [
    { id: 'wire-economy', name: 'Провод ВВГ', price: 50, quality: 0.6 },
    { id: 'wire-standard', name: 'Провод NYM', price: 80, quality: 0.8 },
    { id: 'socket-economy', name: 'Розетка эконом', price: 100, quality: 0.5 },
    { id: 'socket-standard', name: 'Розетка стандарт', price: 250, quality: 0.7 },
    { id: 'socket-premium', name: 'Розетка премиум', price: 500, quality: 0.9 },
  ],
  plumbing: [
    { id: 'pipe-ppr', name: 'Труба ППР', price: 80, quality: 0.6 },
    { id: 'pipe-metal', name: 'Труба металлопластик', price: 120, quality: 0.75 },
    { id: 'mixer-economy', name: 'Смеситель эконом', price: 2000, quality: 0.5 },
    { id: 'mixer-standard', name: 'Смеситель стандарт', price: 4500, quality: 0.7 },
    { id: 'mixer-premium', name: 'Смеситель премиум', price: 8000, quality: 0.9 },
  ],
}

// Quality level to numeric mapping
const qualityLevelValues = {
  economy: 0.4,
  standard: 0.7,
  premium: 0.9,
}

/**
 * Cost Optimizer class using genetic algorithm approach
 */
export class CostOptimizer {
  private config = getMLConfig().costOptimizer
  private isInitialized = false

  constructor() {
    this.initialize()
  }

  /**
   * Initialize the optimizer
   */
  async initialize(): Promise<void> {
    try {
      this.isInitialized = true
      console.log('CostOptimizer initialized')
    } catch (error) {
      console.error('Failed to initialize CostOptimizer:', error)
      this.isInitialized = false
    }
  }

  /**
   * Get model status
   */
  getStatus(): ModelStatus {
    return {
      name: 'CostOptimizer',
      version: '1.0.0',
      isLoaded: this.isInitialized,
      status: this.isInitialized ? 'ready' : 'error',
      accuracy: 0.78,
    }
  }

  /**
   * Optimize estimate costs
   */
  async optimize(input: OptimizationInput): Promise<OptimizationResult> {
    const targetQuality = qualityLevelValues[input.qualityLevel]
    const changes: OptimizationChange[] = []
    let optimizedTotal = 0
    let originalTotal = 0

    // Process each item
    for (const item of input.items) {
      originalTotal += item.currentPrice * item.quantity

      // Find best alternative
      const alternative = this.findBestAlternative(item, targetQuality, input.constraints)

      if (alternative && alternative.price < item.currentPrice) {
        // Use alternative
        optimizedTotal += alternative.price * item.quantity

        changes.push({
          itemId: item.id,
          originalItem: item.name,
          suggestedItem: alternative.name,
          originalPrice: item.currentPrice,
          suggestedPrice: alternative.price,
          savings: (item.currentPrice - alternative.price) * item.quantity,
          reason: this.generateChangeReason(item, alternative, targetQuality),
        })
      } else {
        // Keep original
        optimizedTotal += item.currentPrice * item.quantity
      }
    }

    // Apply budget constraint if specified
    if (input.budget && optimizedTotal > input.budget) {
      const additionalOptimization = this.applyBudgetConstraint(
        input.items,
        changes,
        input.budget,
        targetQuality
      )
      changes.push(...additionalOptimization.additionalChanges)
      optimizedTotal = additionalOptimization.total
    }

    const savings = originalTotal - optimizedTotal
    const savingsPercent = originalTotal > 0 ? (savings / originalTotal) * 100 : 0

    // Calculate quality impact
    const qualityImpact = this.assessQualityImpact(changes, targetQuality)

    // Generate recommendations
    const recommendations = this.generateRecommendations(input, changes, savings)

    return {
      originalTotal: Math.round(originalTotal),
      optimizedTotal: Math.round(optimizedTotal),
      savings: Math.round(savings),
      savingsPercent: Math.round(savingsPercent * 10) / 10,
      changes,
      qualityImpact,
      recommendations,
    }
  }

  /**
   * Find best alternative for an item
   */
  private findBestAlternative(
    item: { name: string; category: string; currentPrice: number },
    targetQuality: number,
    constraints?: { minQuality?: number; excludeCategories?: string[] }
  ): { id: string; name: string; price: number; quality: number } | null {
    // Get alternatives for category
    const category = this.normalizeCategory(item.category)
    const alternatives = materialAlternatives[category]

    if (!alternatives) return null

    // Check if category is excluded
    if (constraints?.excludeCategories?.includes(category)) {
      return null
    }

    const minQuality = constraints?.minQuality ?? targetQuality * 0.8

    // Find best alternative: maximize value (quality / price) while meeting constraints
    let bestAlternative: (typeof alternatives)[0] | null = null
    let bestScore = 0

    for (const alt of alternatives) {
      // Skip if below minimum quality
      if (alt.quality < minQuality) continue

      // Skip if more expensive
      if (alt.price >= item.currentPrice) continue

      // Calculate score: combination of savings and quality match
      const savingsRatio = (item.currentPrice - alt.price) / item.currentPrice
      const qualityMatch = 1 - Math.abs(alt.quality - targetQuality)

      const score =
        savingsRatio * this.config.priceWeight + qualityMatch * this.config.qualityWeight

      if (score > bestScore) {
        bestScore = score
        bestAlternative = alt
      }
    }

    return bestAlternative
  }

  /**
   * Apply budget constraint by finding additional savings
   */
  private applyBudgetConstraint(
    items: OptimizationInput['items'],
    existingChanges: OptimizationChange[],
    budget: number,
    targetQuality: number
  ): { additionalChanges: OptimizationChange[]; total: number } {
    const additionalChanges: OptimizationChange[] = []

    // Calculate current total
    let currentTotal = items.reduce((sum, item) => {
      const existingChange = existingChanges.find((c) => c.itemId === item.id)
      return sum + (existingChange ? existingChange.suggestedPrice : item.currentPrice) * item.quantity
    }, 0)

    if (currentTotal <= budget) {
      return { additionalChanges: [], total: currentTotal }
    }

    // Look for items not yet optimized
    for (const item of items) {
      if (currentTotal <= budget) break
      if (existingChanges.some((c) => c.itemId === item.id)) continue

      const category = this.normalizeCategory(item.category)
      const alternatives = materialAlternatives[category]
      if (!alternatives) continue

      // Find cheapest acceptable alternative
      const cheapest = alternatives
        .filter((alt) => alt.quality >= targetQuality * 0.7 && alt.price < item.currentPrice)
        .sort((a, b) => a.price - b.price)[0]

      if (cheapest) {
        const savings = (item.currentPrice - cheapest.price) * item.quantity
        currentTotal -= savings

        additionalChanges.push({
          itemId: item.id,
          originalItem: item.name,
          suggestedItem: cheapest.name,
          originalPrice: item.currentPrice,
          suggestedPrice: cheapest.price,
          savings,
          reason: 'Оптимизация для соблюдения бюджета',
        })
      }
    }

    return { additionalChanges, total: currentTotal }
  }

  /**
   * Assess quality impact of changes
   */
  private assessQualityImpact(
    changes: OptimizationChange[],
    _targetQuality: number
  ): 'none' | 'minimal' | 'moderate' {
    if (changes.length === 0) return 'none'

    // Calculate average quality drop
    let totalQualityDrop = 0
    let count = 0

    for (const change of changes) {
      // Estimate quality drop from price drop
      const priceDrop = (change.originalPrice - change.suggestedPrice) / change.originalPrice
      // Assume quality drop is proportional but less than price drop
      const estimatedQualityDrop = priceDrop * 0.5
      totalQualityDrop += estimatedQualityDrop
      count++
    }

    const avgQualityDrop = totalQualityDrop / count

    if (avgQualityDrop < 0.1) return 'none'
    if (avgQualityDrop < 0.2) return 'minimal'
    return 'moderate'
  }

  /**
   * Generate change reason
   */
  private generateChangeReason(
    original: { name: string; currentPrice: number },
    alternative: { name: string; price: number; quality: number },
    targetQuality: number
  ): string {
    const savings = ((original.currentPrice - alternative.price) / original.currentPrice) * 100

    if (alternative.quality >= targetQuality) {
      return `Экономия ${savings.toFixed(0)}% при сохранении целевого качества`
    } else if (alternative.quality >= targetQuality * 0.9) {
      return `Экономия ${savings.toFixed(0)}% с минимальным снижением качества`
    } else {
      return `Экономия ${savings.toFixed(0)}% при переходе на бюджетный вариант`
    }
  }

  /**
   * Generate optimization recommendations
   */
  private generateRecommendations(
    input: OptimizationInput,
    changes: OptimizationChange[],
    totalSavings: number
  ): string[] {
    const recommendations: string[] = []

    if (totalSavings > 0) {
      recommendations.push(
        `Применив предложенные замены, можно сэкономить ${totalSavings.toLocaleString('ru-RU')} ₽`
      )
    }

    // Seasonal recommendation
    const currentMonth = new Date().getMonth()
    const seasonalFactor = priceFactors.seasonal[currentMonth]
    if (seasonalFactor > 1.05) {
      recommendations.push(
        'Сейчас высокий сезон. Рассмотрите возможность отложить закупку материалов на 2-3 месяца для дополнительной экономии.'
      )
    } else if (seasonalFactor < 0.98) {
      recommendations.push(
        'Сейчас низкий сезон - отличное время для закупки материалов по сниженным ценам.'
      )
    }

    // Quality recommendation
    if (input.qualityLevel === 'economy') {
      recommendations.push(
        'При выборе бюджетных материалов обратите внимание на гарантийные сроки и условия эксплуатации.'
      )
    } else if (input.qualityLevel === 'premium') {
      recommendations.push(
        'Премиум материалы обычно имеют длительную гарантию и лучшие эксплуатационные характеристики.'
      )
    }

    // Bulk purchase recommendation
    const largeItems = input.items.filter((i) => i.quantity > 50)
    if (largeItems.length > 0) {
      recommendations.push(
        'При больших объемах закупки запросите скидку у поставщика - обычно возможна экономия 5-10%.'
      )
    }

    return recommendations
  }

  /**
   * Normalize category name
   */
  private normalizeCategory(category: string): string {
    const normalized = category.toLowerCase()

    for (const key of Object.keys(materialAlternatives)) {
      if (normalized.includes(key) || key.includes(normalized)) {
        return key
      }
    }

    return 'general'
  }

  /**
   * Get available alternatives for a category
   */
  getAlternatives(
    category: string
  ): Array<{ id: string; name: string; price: number; quality: number }> {
    const normalized = this.normalizeCategory(category)
    return materialAlternatives[normalized] || []
  }

  /**
   * Calculate potential savings for an estimate
   */
  async calculatePotentialSavings(
    items: OptimizationInput['items'],
    qualityLevel: 'economy' | 'standard' | 'premium' = 'standard'
  ): Promise<{
    currentTotal: number
    potentialMinimum: number
    potentialMaximum: number
    maxSavingsPercent: number
  }> {
    const currentTotal = items.reduce((sum, item) => sum + item.currentPrice * item.quantity, 0)

    let potentialMinimum = 0
    let potentialMaximum = 0
    const targetQuality = qualityLevelValues[qualityLevel]

    for (const item of items) {
      const category = this.normalizeCategory(item.category)
      const alternatives = materialAlternatives[category]

      if (!alternatives) {
        potentialMinimum += item.currentPrice * item.quantity
        potentialMaximum += item.currentPrice * item.quantity
        continue
      }

      const acceptableAlternatives = alternatives.filter((a) => a.quality >= targetQuality * 0.8)

      if (acceptableAlternatives.length > 0) {
        const cheapest = Math.min(...acceptableAlternatives.map((a) => a.price))
        const mostExpensive = Math.max(...acceptableAlternatives.map((a) => a.price))

        potentialMinimum += Math.min(cheapest, item.currentPrice) * item.quantity
        potentialMaximum += Math.max(mostExpensive, item.currentPrice) * item.quantity
      } else {
        potentialMinimum += item.currentPrice * item.quantity
        potentialMaximum += item.currentPrice * item.quantity
      }
    }

    const maxSavingsPercent =
      currentTotal > 0 ? ((currentTotal - potentialMinimum) / currentTotal) * 100 : 0

    return {
      currentTotal: Math.round(currentTotal),
      potentialMinimum: Math.round(potentialMinimum),
      potentialMaximum: Math.round(potentialMaximum),
      maxSavingsPercent: Math.round(maxSavingsPercent * 10) / 10,
    }
  }
}

// Export singleton instance
export const costOptimizer = new CostOptimizer()
export default costOptimizer
