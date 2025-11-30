/**
 * ML System - Main Entry Point
 *
 * Comprehensive machine learning system for construction estimate optimization.
 * Includes price prediction, recommendations, work classification, anomaly detection,
 * and cost optimization.
 */

// Types
export * from './types.js'

// Config
export { getMLConfig, defaultMLConfig, categoryMappings, priceFactors } from './config.js'
export type { MLConfig, Category } from './config.js'

// Models
export { pricePredictor, PricePredictor } from './models/pricePredictor.js'
export { recommendationEngine, RecommendationEngine } from './models/recommendationEngine.js'
export { workClassifier, WorkClassifier } from './models/workClassifier.js'
export { anomalyDetector, AnomalyDetector } from './models/anomalyDetector.js'
export { costOptimizer, CostOptimizer } from './models/costOptimizer.js'

// Utils
export {
  minMaxNormalize,
  minMaxDenormalize,
  zScoreNormalize,
  zScoreDenormalize,
  calculateNormParams,
  normalizeArray,
  normalizeFeatures,
  oneHotEncode,
  labelEncode,
  softmax,
  sigmoid,
} from './utils/normalization.js'

export {
  extractItemFeatures,
  extractProjectFeatures,
  featuresToArray,
  createTimeSeriesFeatures,
  calculateTrend,
  movingAverage,
  exponentialMovingAverage,
  calculateVolatility,
  extractTextFeatures,
} from './utils/featureEngineering.js'

export {
  createTextEmbedding,
  cosineSimilarity,
  euclideanDistance,
  findMostSimilar,
  extractKeywords,
  classifyIntent,
  extractNumericEntities,
  constructionVocabulary,
} from './utils/embeddings.js'

// Training
export {
  preparePriceData,
  prepareClassificationData,
  prepareAnomalyData,
  generateSyntheticPriceData,
  generateSyntheticClassificationData,
  kFoldSplit,
} from './training/dataPreparation.js'

export {
  LinearRegression,
  LogisticRegression,
  trainPricePredictor,
  trainWorkClassifier,
} from './training/modelTraining.js'

export {
  calculateRegressionMetrics,
  calculateClassificationMetrics,
  crossValidateRegression,
  crossValidateClassification,
  generateEvaluationReport,
  confidenceInterval,
} from './training/evaluation.js'

// Import models for service
import { pricePredictor } from './models/pricePredictor.js'
import { recommendationEngine } from './models/recommendationEngine.js'
import { workClassifier } from './models/workClassifier.js'
import { anomalyDetector } from './models/anomalyDetector.js'
import { costOptimizer } from './models/costOptimizer.js'

import type {
  MLInsights,
  MLInsightsInput,
  MLServiceStatus,
  PricePrediction,
  Recommendation,
  AnomalyResult,
  OptimizationResult,
  ClassificationResult,
} from './types.js'

/**
 * ML Service - Unified interface for all ML features
 */
export class MLService {
  /**
   * Get status of all ML models
   */
  getStatus(): MLServiceStatus {
    return {
      isAvailable: true,
      models: {
        pricePredictor: pricePredictor.getStatus(),
        recommendationEngine: recommendationEngine.getStatus(),
        workClassifier: workClassifier.getStatus(),
        anomalyDetector: anomalyDetector.getStatus(),
        costOptimizer: costOptimizer.getStatus(),
      },
      lastUpdate: new Date().toISOString(),
    }
  }

  /**
   * Get comprehensive ML insights for an estimate
   */
  async getInsights(input: MLInsightsInput): Promise<MLInsights> {
    const [pricePredictions, recommendations, anomalyAnalysis, optimization] = await Promise.all([
      // Price predictions
      pricePredictor.predictPrices(
        input.items.map((item) => ({
          itemId: item.id,
          name: item.name,
          category: item.category,
          currentPrice: item.price,
          unit: 'шт',
          region: input.region,
        })),
        3
      ),

      // Recommendations
      recommendationEngine.getRecommendations({
        projectType: input.projectType,
        totalArea: input.items.reduce((sum, i) => sum + (i.quantity || 1), 0),
        currentItems: input.items,
        budget: input.budget,
        region: input.region,
      }),

      // Anomaly detection
      anomalyDetector.analyzeEstimate(
        input.items.map((item) => ({
          itemId: item.id,
          name: item.name,
          category: item.category,
          price: item.price,
          quantity: item.quantity || 1,
          unit: 'шт',
          region: input.region,
        }))
      ),

      // Cost optimization
      costOptimizer.optimize({
        items: input.items.map((item) => ({
          id: item.id,
          name: item.name,
          category: item.category,
          currentPrice: item.price,
          quantity: item.quantity || 1,
          unit: 'шт',
        })),
        budget: input.budget,
        qualityLevel: 'standard',
      }),
    ])

    return {
      pricePredictions,
      recommendations,
      anomalies: anomalyAnalysis.results,
      optimization,
      generatedAt: new Date().toISOString(),
    }
  }

  /**
   * Predict prices for items
   */
  async predictPrices(
    items: Array<{
      id: string
      name: string
      category: string
      currentPrice: number
      region?: string
    }>,
    forecastMonths: number = 3
  ): Promise<PricePrediction[]> {
    return pricePredictor.predictPrices(
      items.map((item) => ({
        itemId: item.id,
        name: item.name,
        category: item.category,
        currentPrice: item.currentPrice,
        unit: 'шт',
        region: item.region,
      })),
      forecastMonths
    )
  }

  /**
   * Get material recommendations
   */
  async getRecommendations(
    projectType: string,
    totalArea: number,
    options?: {
      budget?: number
      region?: string
      currentItems?: Array<{ id: string; name: string; category: string; price: number; quantity: number }>
    }
  ): Promise<Recommendation[]> {
    return recommendationEngine.getRecommendations({
      projectType,
      totalArea,
      budget: options?.budget,
      region: options?.region,
      currentItems: options?.currentItems,
    })
  }

  /**
   * Classify work description
   */
  async classifyWork(text: string): Promise<ClassificationResult> {
    return workClassifier.classify({ text })
  }

  /**
   * Detect anomalies in estimate items
   */
  async detectAnomalies(
    items: Array<{
      id: string
      name: string
      category: string
      price: number
      quantity: number
      region?: string
    }>
  ): Promise<AnomalyResult[]> {
    return anomalyDetector.detectAnomalies(
      items.map((item) => ({
        itemId: item.id,
        name: item.name,
        category: item.category,
        price: item.price,
        quantity: item.quantity,
        unit: 'шт',
        region: item.region,
      }))
    )
  }

  /**
   * Optimize estimate costs
   */
  async optimizeCosts(
    items: Array<{
      id: string
      name: string
      category: string
      price: number
      quantity: number
    }>,
    options?: {
      budget?: number
      qualityLevel?: 'economy' | 'standard' | 'premium'
    }
  ): Promise<OptimizationResult> {
    return costOptimizer.optimize({
      items: items.map((item) => ({
        id: item.id,
        name: item.name,
        category: item.category,
        currentPrice: item.price,
        quantity: item.quantity,
        unit: 'шт',
      })),
      budget: options?.budget,
      qualityLevel: options?.qualityLevel || 'standard',
    })
  }
}

// Export singleton instance
export const mlService = new MLService()
export default mlService
