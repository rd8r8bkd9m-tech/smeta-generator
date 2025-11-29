/**
 * TypeScript types for Machine Learning system
 */

// ===== Price Prediction Types =====

export interface PricePredictionInput {
  itemId: string
  name: string
  category: string
  currentPrice: number
  unit: string
  region?: string
  historicalPrices?: HistoricalPrice[]
}

export interface HistoricalPrice {
  date: string
  price: number
}

export interface PricePrediction {
  itemId: string
  currentPrice: number
  predictedPrice: number
  confidence: number
  trend: 'rising' | 'falling' | 'stable'
  factors: PriceFactor[]
  forecastPeriod: number
  forecast: ForecastPoint[]
}

export interface PriceFactor {
  name: string
  impact: 'positive' | 'negative' | 'neutral'
  weight: number
  description: string
}

export interface ForecastPoint {
  date: string
  price: number
  confidence: number
}

// ===== Recommendation Types =====

export interface RecommendationInput {
  projectType: string
  totalArea: number
  rooms?: string[]
  currentItems?: RecommendationItem[]
  budget?: number
  region?: string
  preferences?: string[]
}

export interface RecommendationItem {
  id: string
  name: string
  category: string
  price: number
  quantity: number
}

export interface Recommendation {
  itemId: string
  name: string
  score: number
  reason: string
  alternatives: AlternativeItem[]
  savingsPercent?: number
  type: 'material' | 'work' | 'bundle'
}

export interface AlternativeItem {
  id: string
  name: string
  price: number
  qualityDiff: 'same' | 'better' | 'lower'
  savingsPercent: number
}

// ===== Work Classification Types =====

export interface ClassificationInput {
  text: string
  context?: ClassificationContext
}

export interface ClassificationContext {
  projectType?: string
  previousWorks?: string[]
  region?: string
}

export interface ClassificationResult {
  category: string
  subcategory: string
  confidence: number
  extractedEntities: ExtractedEntities
  suggestedNormatives?: string[]
}

export interface ExtractedEntities {
  area?: number
  quantity?: number
  materials?: string[]
  workTypes?: string[]
  dimensions?: Dimensions
}

export interface Dimensions {
  length?: number
  width?: number
  height?: number
}

// ===== Anomaly Detection Types =====

export interface AnomalyInput {
  itemId: string
  name: string
  category: string
  price: number
  quantity: number
  unit: string
  region?: string
}

export interface AnomalyResult {
  itemId: string
  isAnomaly: boolean
  anomalyScore: number
  expectedRange: PriceRange
  actualPrice: number
  suggestion: string
  anomalyType?: 'price_high' | 'price_low' | 'quantity_unusual' | 'combination'
}

export interface PriceRange {
  min: number
  max: number
  median: number
}

// ===== Cost Optimization Types =====

export interface OptimizationInput {
  items: OptimizationItem[]
  budget?: number
  qualityLevel: 'economy' | 'standard' | 'premium'
  constraints?: OptimizationConstraints
}

export interface OptimizationItem {
  id: string
  name: string
  category: string
  currentPrice: number
  quantity: number
  unit: string
  isOptional?: boolean
  alternatives?: string[]
}

export interface OptimizationConstraints {
  minQuality?: number
  maxBudget?: number
  requiredCategories?: string[]
  excludeCategories?: string[]
}

export interface OptimizationResult {
  originalTotal: number
  optimizedTotal: number
  savings: number
  savingsPercent: number
  changes: OptimizationChange[]
  qualityImpact: 'none' | 'minimal' | 'moderate'
  recommendations: string[]
}

export interface OptimizationChange {
  itemId: string
  originalItem: string
  suggestedItem: string
  originalPrice: number
  suggestedPrice: number
  savings: number
  reason: string
}

// ===== Model Status Types =====

export interface ModelStatus {
  name: string
  version: string
  isLoaded: boolean
  lastTrainedAt?: string
  accuracy?: number
  status: 'ready' | 'loading' | 'error' | 'not_trained'
  error?: string
}

export interface MLServiceStatus {
  isAvailable: boolean
  models: Record<string, ModelStatus>
  lastUpdate: string
}

// ===== Training Types =====

export interface TrainingData {
  features: number[][]
  labels: number[]
  metadata?: Record<string, unknown>
}

export interface TrainingConfig {
  epochs: number
  batchSize: number
  learningRate: number
  validationSplit: number
}

export interface TrainingResult {
  success: boolean
  modelPath?: string
  metrics: TrainingMetrics
  error?: string
}

export interface TrainingMetrics {
  loss: number
  accuracy?: number
  mse?: number
  mae?: number
  validationLoss?: number
  validationAccuracy?: number
}

// ===== ML Insights Types =====

export interface MLInsights {
  pricePredictions: PricePrediction[]
  recommendations: Recommendation[]
  anomalies: AnomalyResult[]
  optimization?: OptimizationResult
  generatedAt: string
}

export interface MLInsightsInput {
  items: RecommendationItem[]
  projectType: string
  region?: string
  budget?: number
}
