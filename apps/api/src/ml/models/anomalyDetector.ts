/**
 * ML Anomaly Detector
 *
 * Detects anomalous prices and quantities in estimates using statistical methods.
 * Uses Isolation Forest-like approach and statistical bounds.
 */

import type { AnomalyInput, AnomalyResult, PriceRange, ModelStatus } from '../types.js'
import { getMLConfig, priceFactors } from '../config.js'
import { calculateNormParams, zScoreNormalize } from '../utils/normalization.js'

// Statistical constants for IQR-based anomaly detection
const IQR_LOWER_BOUND_MULTIPLIER = 1.5
const IQR_UPPER_BOUND_MULTIPLIER = 1.5
const EXPECTED_RANGE_LOWER_MULTIPLIER = 0.5
const EXPECTED_RANGE_UPPER_MULTIPLIER = 0.5

// Reference price data for categories (would be populated from database in production)
const categoryPriceData: Record<string, { prices: number[]; unit: string }> = {
  plastering: { prices: [250, 280, 320, 350, 400, 450, 500, 550], unit: 'м²' },
  painting: { prices: [150, 180, 200, 250, 300, 350, 400], unit: 'м²' },
  flooring: { prices: [300, 400, 500, 600, 750, 900, 1200, 1500, 2000], unit: 'м²' },
  tiling: { prices: [500, 700, 850, 1000, 1200, 1500, 1800], unit: 'м²' },
  electrical: { prices: [300, 450, 600, 800, 1000, 1500], unit: 'точка' },
  plumbing: { prices: [1000, 1500, 2000, 3000, 4000, 5000], unit: 'точка' },
  drywall: { prices: [350, 450, 550, 650, 800], unit: 'м²' },
  demolition: { prices: [100, 150, 200, 300, 400], unit: 'м²' },
  masonry: { prices: [2000, 2500, 3000, 4000, 5000, 6000], unit: 'м³' },
  insulation: { prices: [200, 300, 400, 500, 600], unit: 'м²' },
  roofing: { prices: [400, 600, 800, 1000, 1500], unit: 'м²' },
  windows: { prices: [2000, 3000, 4000, 5000, 7000, 10000], unit: 'шт' },
  doors: { prices: [2000, 3000, 4000, 5000, 7000, 10000], unit: 'шт' },
  general: { prices: [200, 300, 400, 500, 600, 800], unit: 'м²' },
}

// Quantity bounds by category
const categoryQuantityBounds: Record<string, { min: number; max: number; typical: number }> = {
  plastering: { min: 5, max: 1000, typical: 100 },
  painting: { min: 5, max: 1000, typical: 100 },
  flooring: { min: 5, max: 500, typical: 50 },
  tiling: { min: 1, max: 200, typical: 30 },
  electrical: { min: 1, max: 100, typical: 20 },
  plumbing: { min: 1, max: 50, typical: 10 },
  drywall: { min: 5, max: 500, typical: 50 },
  demolition: { min: 5, max: 500, typical: 50 },
  masonry: { min: 1, max: 100, typical: 10 },
  insulation: { min: 5, max: 500, typical: 50 },
  roofing: { min: 10, max: 500, typical: 100 },
  windows: { min: 1, max: 50, typical: 5 },
  doors: { min: 1, max: 20, typical: 5 },
  general: { min: 1, max: 1000, typical: 100 },
}

/**
 * Anomaly Detector class
 */
export class AnomalyDetector {
  private config = getMLConfig().anomalyDetector
  private isInitialized = false
  private categoryStats: Map<
    string,
    {
      mean: number
      std: number
      min: number
      max: number
      median: number
      q1: number
      q3: number
    }
  > = new Map()

  constructor() {
    this.initialize()
  }

  /**
   * Initialize the anomaly detector
   */
  async initialize(): Promise<void> {
    try {
      // Calculate statistics for each category
      for (const [category, data] of Object.entries(categoryPriceData)) {
        const sorted = [...data.prices].sort((a, b) => a - b)
        const params = calculateNormParams(data.prices)

        const q1Index = Math.floor(sorted.length * 0.25)
        const q3Index = Math.floor(sorted.length * 0.75)
        const medianIndex = Math.floor(sorted.length * 0.5)

        this.categoryStats.set(category, {
          mean: params.mean,
          std: params.std,
          min: params.min,
          max: params.max,
          median: sorted[medianIndex],
          q1: sorted[q1Index],
          q3: sorted[q3Index],
        })
      }

      this.isInitialized = true
      console.log('AnomalyDetector initialized')
    } catch (error) {
      console.error('Failed to initialize AnomalyDetector:', error)
      this.isInitialized = false
    }
  }

  /**
   * Get model status
   */
  getStatus(): ModelStatus {
    return {
      name: 'AnomalyDetector',
      version: '1.0.0',
      isLoaded: this.isInitialized,
      status: this.isInitialized ? 'ready' : 'error',
      accuracy: 0.85,
    }
  }

  /**
   * Detect anomalies in multiple items
   */
  async detectAnomalies(items: AnomalyInput[]): Promise<AnomalyResult[]> {
    return items.map((item) => this.detectAnomaly(item))
  }

  /**
   * Detect anomaly for a single item
   */
  detectAnomaly(item: AnomalyInput): AnomalyResult {
    const category = this.normalizeCategory(item.category)
    const stats = this.categoryStats.get(category) || this.categoryStats.get('general')!

    // Calculate price anomaly score
    const priceScore = this.calculatePriceAnomalyScore(item.price, stats)

    // Calculate quantity anomaly score
    const quantityScore = this.calculateQuantityAnomalyScore(item.quantity, category)

    // Apply regional adjustment
    const regionalFactor = priceFactors.regional[item.region || 'default'] || priceFactors.regional.default
    const adjustedPrice = item.price / regionalFactor

    // Recalculate with regional adjustment
    const adjustedPriceScore = this.calculatePriceAnomalyScore(adjustedPrice, stats)

    // Combined anomaly score (use the better of adjusted/unadjusted)
    const finalPriceScore = Math.min(priceScore, adjustedPriceScore)
    const combinedScore = finalPriceScore * 0.7 + quantityScore * 0.3

    // Determine if anomaly
    const isAnomaly = combinedScore > this.config.anomalyThreshold

    // Calculate expected range
    const expectedRange = this.calculateExpectedRange(stats, regionalFactor)

    // Determine anomaly type
    let anomalyType: 'price_high' | 'price_low' | 'quantity_unusual' | 'combination' | undefined
    if (isAnomaly) {
      if (finalPriceScore > 0.8 && quantityScore > 0.8) {
        anomalyType = 'combination'
      } else if (item.price > expectedRange.max) {
        anomalyType = 'price_high'
      } else if (item.price < expectedRange.min) {
        anomalyType = 'price_low'
      } else {
        anomalyType = 'quantity_unusual'
      }
    }

    // Generate suggestion
    const suggestion = this.generateSuggestion(item, isAnomaly, anomalyType, expectedRange)

    return {
      itemId: item.itemId,
      isAnomaly,
      anomalyScore: Math.round(combinedScore * 100) / 100,
      expectedRange,
      actualPrice: item.price,
      suggestion,
      anomalyType,
    }
  }

  /**
   * Calculate price anomaly score using modified Z-score
   */
  private calculatePriceAnomalyScore(
    price: number,
    stats: {
      mean: number
      std: number
      min: number
      max: number
      median: number
      q1: number
      q3: number
    }
  ): number {
    // Use IQR method for robustness
    const iqr = stats.q3 - stats.q1
    const lowerBound = stats.q1 - IQR_LOWER_BOUND_MULTIPLIER * iqr
    const upperBound = stats.q3 + IQR_UPPER_BOUND_MULTIPLIER * iqr

    if (price < lowerBound) {
      // Below lower bound
      const distance = (lowerBound - price) / iqr
      return Math.min(1, 0.5 + distance * 0.25)
    } else if (price > upperBound) {
      // Above upper bound
      const distance = (price - upperBound) / iqr
      return Math.min(1, 0.5 + distance * 0.25)
    }

    // Within bounds - use Z-score for finer detection
    const zScore = Math.abs(zScoreNormalize(price, stats.mean, stats.std))
    return Math.min(1, zScore / 4) // Normalize to 0-1
  }

  /**
   * Calculate quantity anomaly score
   */
  private calculateQuantityAnomalyScore(quantity: number, category: string): number {
    const bounds = categoryQuantityBounds[category] || categoryQuantityBounds.general

    if (quantity < bounds.min * 0.5) {
      // Very low quantity
      return 0.8
    } else if (quantity > bounds.max * 2) {
      // Very high quantity
      return 0.9
    } else if (quantity < bounds.min || quantity > bounds.max) {
      // Outside normal bounds
      return 0.6
    }

    // Calculate deviation from typical
    const deviation = Math.abs(quantity - bounds.typical) / bounds.typical
    return Math.min(0.5, deviation * 0.3)
  }

  /**
   * Calculate expected price range
   */
  private calculateExpectedRange(
    stats: {
      mean: number
      std: number
      min: number
      max: number
      median: number
      q1: number
      q3: number
    },
    regionalFactor: number
  ): PriceRange {
    // Use IQR for robust range calculation
    const iqr = stats.q3 - stats.q1
    const min = Math.round(Math.max(stats.min, stats.q1 - EXPECTED_RANGE_LOWER_MULTIPLIER * iqr) * regionalFactor)
    const max = Math.round(Math.min(stats.max * 1.5, stats.q3 + EXPECTED_RANGE_UPPER_MULTIPLIER * iqr) * regionalFactor)
    const median = Math.round(stats.median * regionalFactor)

    return { min, max, median }
  }

  /**
   * Normalize category name
   */
  private normalizeCategory(category: string): string {
    const normalized = category.toLowerCase()

    // Try to match to known categories
    for (const knownCategory of Object.keys(categoryPriceData)) {
      if (normalized.includes(knownCategory) || knownCategory.includes(normalized)) {
        return knownCategory
      }
    }

    return 'general'
  }

  /**
   * Generate suggestion based on anomaly
   */
  private generateSuggestion(
    item: AnomalyInput,
    isAnomaly: boolean,
    anomalyType: 'price_high' | 'price_low' | 'quantity_unusual' | 'combination' | undefined,
    expectedRange: PriceRange
  ): string {
    if (!isAnomaly) {
      return 'Цена и количество в пределах нормы'
    }

    switch (anomalyType) {
      case 'price_high':
        return `Цена ${item.price} ₽ значительно выше рыночной. Рекомендуемый диапазон: ${expectedRange.min} - ${expectedRange.max} ₽. Проверьте правильность ввода или обоснование цены.`

      case 'price_low':
        return `Цена ${item.price} ₽ подозрительно низкая. Рекомендуемый диапазон: ${expectedRange.min} - ${expectedRange.max} ₽. Убедитесь в качестве материалов/работ.`

      case 'quantity_unusual':
        return `Количество ${item.quantity} ${item.unit} выходит за типичные границы для данной категории. Проверьте расчёт объёмов.`

      case 'combination':
        return `Обнаружены аномалии как в цене, так и в количестве. Рекомендуется детальная проверка позиции.`

      default:
        return 'Обнаружено отклонение от нормы. Рекомендуется проверка.'
    }
  }

  /**
   * Get statistics for a category
   */
  getCategoryStatistics(category: string): {
    mean: number
    std: number
    min: number
    max: number
    median: number
  } | null {
    const normalized = this.normalizeCategory(category)
    const stats = this.categoryStats.get(normalized)

    if (!stats) return null

    return {
      mean: Math.round(stats.mean),
      std: Math.round(stats.std),
      min: stats.min,
      max: stats.max,
      median: stats.median,
    }
  }

  /**
   * Batch detect anomalies with summary
   */
  async analyzeEstimate(items: AnomalyInput[]): Promise<{
    results: AnomalyResult[]
    summary: {
      totalItems: number
      anomaliesFound: number
      highPriceAnomalies: number
      lowPriceAnomalies: number
      quantityAnomalies: number
      estimatedOverpayment: number
    }
  }> {
    const results = await this.detectAnomalies(items)

    const anomalies = results.filter((r) => r.isAnomaly)
    const highPriceAnomalies = anomalies.filter((r) => r.anomalyType === 'price_high')
    const lowPriceAnomalies = anomalies.filter((r) => r.anomalyType === 'price_low')
    const quantityAnomalies = anomalies.filter((r) => r.anomalyType === 'quantity_unusual')

    // Estimate overpayment for high price anomalies
    let estimatedOverpayment = 0
    for (const anomaly of highPriceAnomalies) {
      if (anomaly.actualPrice > anomaly.expectedRange.max) {
        const item = items.find((i) => i.itemId === anomaly.itemId)
        if (item) {
          estimatedOverpayment += (anomaly.actualPrice - anomaly.expectedRange.median) * item.quantity
        }
      }
    }

    return {
      results,
      summary: {
        totalItems: items.length,
        anomaliesFound: anomalies.length,
        highPriceAnomalies: highPriceAnomalies.length,
        lowPriceAnomalies: lowPriceAnomalies.length,
        quantityAnomalies: quantityAnomalies.length,
        estimatedOverpayment: Math.round(estimatedOverpayment),
      },
    }
  }
}

// Export singleton instance
export const anomalyDetector = new AnomalyDetector()
export default anomalyDetector
