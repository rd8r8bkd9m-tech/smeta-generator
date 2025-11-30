/**
 * ML Price Predictor Model
 *
 * Uses statistical methods and simple neural network patterns for price prediction.
 * Falls back to rule-based predictions when ML is not available.
 */

import type {
  PricePredictionInput,
  PricePrediction,
  PriceFactor,
  ForecastPoint,
  ModelStatus,
} from '../types.js'
import { getMLConfig, priceFactors } from '../config.js'
import {
  extractItemFeatures,
  calculateTrend,
  calculateVolatility,
} from '../utils/featureEngineering.js'

interface PredictionCache {
  [key: string]: {
    prediction: PricePrediction
    timestamp: number
  }
}

/**
 * Price Predictor class using statistical methods
 */
export class PricePredictor {
  private config = getMLConfig().pricePredictor
  private cache: PredictionCache = {}
  private isInitialized = false
  private modelWeights: number[] | null = null

  constructor() {
    this.initialize()
  }

  /**
   * Initialize the predictor
   */
  async initialize(): Promise<void> {
    try {
      // Initialize with default weights (in production, these would be loaded from trained model)
      this.modelWeights = this.getDefaultWeights()
      this.isInitialized = true
      console.log('PricePredictor initialized')
    } catch (error) {
      console.error('Failed to initialize PricePredictor:', error)
      this.isInitialized = false
    }
  }

  /**
   * Get model status
   */
  getStatus(): ModelStatus {
    return {
      name: 'PricePredictor',
      version: '1.0.0',
      isLoaded: this.isInitialized,
      status: this.isInitialized ? 'ready' : 'error',
      accuracy: 0.75, // Placeholder - would be calculated from evaluation
    }
  }

  /**
   * Predict prices for multiple items
   */
  async predictPrices(
    items: PricePredictionInput[],
    forecastMonths: number = 3
  ): Promise<PricePrediction[]> {
    return Promise.all(items.map((item) => this.predictPrice(item, forecastMonths)))
  }

  /**
   * Predict price for a single item
   */
  async predictPrice(item: PricePredictionInput, forecastMonths: number = 3): Promise<PricePrediction> {
    // Check cache
    const cacheKey = this.getCacheKey(item, forecastMonths)
    if (this.config.cacheEnabled) {
      const cached = this.cache[cacheKey]
      if (cached && Date.now() - cached.timestamp < this.config.cacheTTL * 1000) {
        return cached.prediction
      }
    }

    let prediction: PricePrediction

    if (this.isInitialized && this.modelWeights) {
      prediction = this.mlPredict(item, forecastMonths)
    } else if (this.config.fallbackEnabled) {
      prediction = this.fallbackPredict(item, forecastMonths)
    } else {
      throw new Error('Price predictor is not available')
    }

    // Cache result
    if (this.config.cacheEnabled) {
      this.cache[cacheKey] = {
        prediction,
        timestamp: Date.now(),
      }
    }

    return prediction
  }

  /**
   * ML-based prediction using feature extraction
   */
  private mlPredict(item: PricePredictionInput, forecastMonths: number): PricePrediction {
    const features = extractItemFeatures(
      {
        price: item.currentPrice,
        category: item.category,
        region: item.region,
      },
      { min: 0, max: 100000 }
    )

    // Calculate base prediction factors
    const seasonalImpact = this.calculateSeasonalImpact(forecastMonths)
    const inflationImpact = this.calculateInflationImpact(forecastMonths)
    const categoryVolatility = this.getCategoryVolatility(item.category)
    const regionalFactor = features.regionalFactor

    // Historical trend analysis if data available
    let historicalTrend = 0
    let volatility = 0.05
    if (item.historicalPrices && item.historicalPrices.length > 3) {
      const prices = item.historicalPrices.map((p) => p.price)
      historicalTrend = calculateTrend(prices)
      volatility = calculateVolatility(prices)
    }

    // Combined prediction
    const basePrediction =
      item.currentPrice * (1 + inflationImpact * forecastMonths / 12) * seasonalImpact * regionalFactor

    // Apply ML adjustment using weights
    const mlAdjustment = this.applyModelWeights([
      features.priceNormalized,
      features.seasonalFactor,
      features.regionalFactor,
      features.isHighVolatility,
      historicalTrend,
      volatility,
    ])

    const predictedPrice = Math.round(basePrediction * (1 + mlAdjustment))
    const priceChange = ((predictedPrice - item.currentPrice) / item.currentPrice) * 100

    // Determine trend
    let trend: 'rising' | 'falling' | 'stable'
    if (priceChange > 3) trend = 'rising'
    else if (priceChange < -3) trend = 'falling'
    else trend = 'stable'

    // Calculate confidence based on data quality
    const confidence = this.calculateConfidence(item, volatility, historicalTrend)

    // Generate factors
    const factors = this.generateFactors(item, seasonalImpact, inflationImpact, categoryVolatility, regionalFactor)

    // Generate forecast points
    const forecast = this.generateForecast(item.currentPrice, predictedPrice, forecastMonths, confidence)

    return {
      itemId: item.itemId,
      currentPrice: item.currentPrice,
      predictedPrice,
      confidence: Math.round(confidence * 100),
      trend,
      factors,
      forecastPeriod: forecastMonths,
      forecast,
    }
  }

  /**
   * Fallback prediction using simple rules
   */
  private fallbackPredict(item: PricePredictionInput, forecastMonths: number): PricePrediction {
    const currentMonth = new Date().getMonth()
    const seasonalFactor = priceFactors.seasonal[currentMonth]
    const regionalFactor = priceFactors.regional[item.region || 'default'] || priceFactors.regional.default

    // Simple inflation estimate (5% annual)
    const inflationFactor = Math.pow(1.05, forecastMonths / 12)

    // Calculate predicted price
    const predictedPrice = Math.round(item.currentPrice * inflationFactor * seasonalFactor)
    const priceChange = ((predictedPrice - item.currentPrice) / item.currentPrice) * 100

    // Determine trend
    let trend: 'rising' | 'falling' | 'stable'
    if (priceChange > 3) trend = 'rising'
    else if (priceChange < -3) trend = 'falling'
    else trend = 'stable'

    const factors: PriceFactor[] = [
      {
        name: 'Инфляция',
        impact: 'negative',
        weight: 0.4,
        description: 'Общий рост цен в экономике',
      },
      {
        name: 'Сезонность',
        impact: seasonalFactor > 1 ? 'negative' : 'positive',
        weight: 0.3,
        description: this.getSeasonDescription(currentMonth),
      },
      {
        name: 'Регион',
        impact: regionalFactor < 1 ? 'positive' : 'neutral',
        weight: 0.2,
        description: `Региональный коэффициент: ${regionalFactor.toFixed(2)}`,
      },
    ]

    const forecast = this.generateForecast(item.currentPrice, predictedPrice, forecastMonths, 0.65)

    return {
      itemId: item.itemId,
      currentPrice: item.currentPrice,
      predictedPrice,
      confidence: 65, // Lower confidence for fallback
      trend,
      factors,
      forecastPeriod: forecastMonths,
      forecast,
    }
  }

  /**
   * Apply model weights to features
   */
  private applyModelWeights(features: number[]): number {
    if (!this.modelWeights || this.modelWeights.length !== features.length) {
      return 0
    }

    // Simple weighted sum
    let adjustment = 0
    for (let i = 0; i < features.length; i++) {
      adjustment += features[i] * this.modelWeights[i]
    }

    // Apply sigmoid-like function to keep adjustment reasonable
    return Math.tanh(adjustment) * 0.1 // Max 10% adjustment
  }

  /**
   * Get default weights for the model
   */
  private getDefaultWeights(): number[] {
    // These would be trained from historical data
    return [
      0.05, // price normalized weight
      0.15, // seasonal factor weight
      0.1, // regional factor weight
      0.1, // high volatility weight
      0.3, // historical trend weight
      0.2, // volatility weight
    ]
  }

  /**
   * Calculate seasonal impact for future months
   */
  private calculateSeasonalImpact(forecastMonths: number): number {
    const currentMonth = new Date().getMonth()
    let impact = 1

    // Average seasonal factors over forecast period
    for (let i = 1; i <= forecastMonths; i++) {
      const futureMonth = (currentMonth + i) % 12
      impact *= priceFactors.seasonal[futureMonth]
    }

    return Math.pow(impact, 1 / forecastMonths)
  }

  /**
   * Calculate inflation impact
   */
  private calculateInflationImpact(forecastMonths: number): number {
    // Base annual inflation rate (could be fetched from external source)
    const annualInflation = 0.05
    return annualInflation * (forecastMonths / 12)
  }

  /**
   * Get category volatility
   */
  private getCategoryVolatility(category: string): number {
    for (const [key, volatility] of Object.entries(priceFactors.volatility)) {
      if (category.toLowerCase().includes(key)) {
        return volatility
      }
    }
    return priceFactors.volatility.default
  }

  /**
   * Calculate prediction confidence
   */
  private calculateConfidence(
    item: PricePredictionInput,
    volatility: number,
    historicalTrend: number
  ): number {
    let confidence = 0.7 // Base confidence

    // More historical data = higher confidence
    if (item.historicalPrices) {
      if (item.historicalPrices.length > 12) confidence += 0.15
      else if (item.historicalPrices.length > 6) confidence += 0.1
      else if (item.historicalPrices.length > 3) confidence += 0.05
    }

    // Lower volatility = higher confidence
    if (volatility < 0.05) confidence += 0.1
    else if (volatility > 0.1) confidence -= 0.1

    // Clear trend = higher confidence
    if (Math.abs(historicalTrend) > 0.1) confidence += 0.05

    return Math.max(0.5, Math.min(0.95, confidence))
  }

  /**
   * Generate prediction factors
   */
  private generateFactors(
    item: PricePredictionInput,
    seasonalImpact: number,
    inflationImpact: number,
    categoryVolatility: number,
    regionalFactor: number
  ): PriceFactor[] {
    const factors: PriceFactor[] = []
    const currentMonth = new Date().getMonth()

    // Seasonal factor
    factors.push({
      name: 'Сезонность',
      impact: seasonalImpact > 1 ? 'negative' : seasonalImpact < 1 ? 'positive' : 'neutral',
      weight: 0.25,
      description: this.getSeasonDescription(currentMonth),
    })

    // Inflation factor
    factors.push({
      name: 'Инфляция',
      impact: 'negative',
      weight: 0.35,
      description: `Прогноз роста ${(inflationImpact * 100).toFixed(1)}% за период`,
    })

    // Category volatility
    factors.push({
      name: 'Волатильность категории',
      impact: categoryVolatility > 0.08 ? 'negative' : 'neutral',
      weight: 0.2,
      description: `Категория "${item.category}" имеет ${categoryVolatility > 0.08 ? 'повышенную' : 'нормальную'} волатильность цен`,
    })

    // Regional factor
    factors.push({
      name: 'Региональный фактор',
      impact: regionalFactor < 1 ? 'positive' : regionalFactor > 1 ? 'negative' : 'neutral',
      weight: 0.2,
      description: `Коэффициент региона: ${regionalFactor.toFixed(2)}`,
    })

    return factors
  }

  /**
   * Generate forecast points
   */
  private generateForecast(
    currentPrice: number,
    predictedPrice: number,
    months: number,
    baseConfidence: number
  ): ForecastPoint[] {
    const forecast: ForecastPoint[] = []
    const priceStep = (predictedPrice - currentPrice) / months

    for (let i = 1; i <= months; i++) {
      const date = new Date()
      date.setMonth(date.getMonth() + i)

      // Use deterministic variance based on month index for reproducibility
      // This creates realistic price fluctuations without randomness
      const varianceFactor = Math.sin(i * 0.7) * 0.01
      const price = Math.round(currentPrice + priceStep * i + currentPrice * varianceFactor)

      // Confidence decreases with distance
      const confidence = Math.round((baseConfidence - 0.05 * i) * 100)

      forecast.push({
        date: date.toISOString().split('T')[0],
        price,
        confidence: Math.max(50, confidence),
      })
    }

    return forecast
  }

  /**
   * Get season description
   */
  private getSeasonDescription(month: number): string {
    const seasons: Record<number, string> = {
      0: 'Зима - низкий сезон, цены снижены',
      1: 'Зима - низкий сезон, цены снижены',
      2: 'Весна - начало сезона, рост спроса',
      3: 'Весна - активный сезон',
      4: 'Весна - активный сезон',
      5: 'Лето - пик сезона, максимальный спрос',
      6: 'Лето - пик сезона, максимальный спрос',
      7: 'Лето - высокий сезон',
      8: 'Осень - спад сезона',
      9: 'Осень - умеренный спрос',
      10: 'Осень - снижение активности',
      11: 'Зима - низкий сезон, цены снижены',
    }
    return seasons[month] || 'Нет данных о сезонности'
  }

  /**
   * Get cache key for item
   */
  private getCacheKey(item: PricePredictionInput, forecastMonths: number): string {
    return `${item.itemId}_${item.currentPrice}_${item.region || 'default'}_${forecastMonths}`
  }

  /**
   * Clear prediction cache
   */
  clearCache(): void {
    this.cache = {}
  }
}

// Export singleton instance
export const pricePredictor = new PricePredictor()
export default pricePredictor
