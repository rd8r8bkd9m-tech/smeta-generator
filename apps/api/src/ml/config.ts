/**
 * ML System Configuration
 */

export interface MLConfig {
  // Price Predictor settings
  pricePredictor: {
    enabled: boolean
    modelPath: string
    cacheEnabled: boolean
    cacheTTL: number // seconds
    fallbackEnabled: boolean
    confidenceThreshold: number
  }

  // Recommendation Engine settings
  recommendationEngine: {
    enabled: boolean
    modelPath: string
    maxRecommendations: number
    minScore: number
    similarityThreshold: number
  }

  // Work Classifier settings
  workClassifier: {
    enabled: boolean
    modelPath: string
    confidenceThreshold: number
    maxCategories: number
  }

  // Anomaly Detector settings
  anomalyDetector: {
    enabled: boolean
    modelPath: string
    anomalyThreshold: number
    minSampleSize: number
  }

  // Cost Optimizer settings
  costOptimizer: {
    enabled: boolean
    maxIterations: number
    qualityWeight: number
    priceWeight: number
  }

  // Training settings
  training: {
    dataPath: string
    batchSize: number
    epochs: number
    learningRate: number
    validationSplit: number
    saveBestOnly: boolean
  }
}

/**
 * Default ML configuration
 */
export const defaultMLConfig: MLConfig = {
  pricePredictor: {
    enabled: true,
    modelPath: './models/price_predictor',
    cacheEnabled: true,
    cacheTTL: 3600, // 1 hour
    fallbackEnabled: true,
    confidenceThreshold: 0.6,
  },

  recommendationEngine: {
    enabled: true,
    modelPath: './models/recommendation',
    maxRecommendations: 10,
    minScore: 0.5,
    similarityThreshold: 0.7,
  },

  workClassifier: {
    enabled: true,
    modelPath: './models/work_classifier',
    confidenceThreshold: 0.7,
    maxCategories: 5,
  },

  anomalyDetector: {
    enabled: true,
    modelPath: './models/anomaly_detector',
    anomalyThreshold: 0.8,
    minSampleSize: 10,
  },

  costOptimizer: {
    enabled: true,
    maxIterations: 100,
    qualityWeight: 0.4,
    priceWeight: 0.6,
  },

  training: {
    dataPath: './data/training',
    batchSize: 32,
    epochs: 100,
    learningRate: 0.001,
    validationSplit: 0.2,
    saveBestOnly: true,
  },
}

/**
 * Category mappings for classification
 */
export const categoryMappings = {
  // Main categories
  categories: [
    'plastering',
    'painting',
    'flooring',
    'tiling',
    'electrical',
    'plumbing',
    'drywall',
    'demolition',
    'masonry',
    'insulation',
    'roofing',
    'windows',
    'doors',
    'general',
  ] as const,

  // Category to Russian name mapping
  categoryNames: {
    plastering: 'Штукатурные работы',
    painting: 'Малярные работы',
    flooring: 'Напольные покрытия',
    tiling: 'Плиточные работы',
    electrical: 'Электромонтаж',
    plumbing: 'Сантехника',
    drywall: 'Гипсокартон',
    demolition: 'Демонтаж',
    masonry: 'Кладочные работы',
    insulation: 'Утепление',
    roofing: 'Кровля',
    windows: 'Окна',
    doors: 'Двери',
    general: 'Общестроительные',
  } as Record<string, string>,

  // Subcategories
  subcategories: {
    plastering: ['внутренняя', 'наружная', 'декоративная', 'машинная'],
    painting: ['внутренняя', 'наружная', 'декоративная', 'лакировка'],
    flooring: ['ламинат', 'паркет', 'линолеум', 'плитка', 'наливной'],
    tiling: ['напольная', 'настенная', 'мозаика', 'керамогранит'],
    electrical: ['проводка', 'освещение', 'розетки', 'щитовое'],
    plumbing: ['водопровод', 'канализация', 'отопление', 'сантехприборы'],
    drywall: ['стены', 'потолки', 'перегородки', 'короба'],
    demolition: ['полный', 'частичный', 'вынос мусора'],
    masonry: ['кирпичная', 'блочная', 'перегородки'],
    insulation: ['минвата', 'пенопласт', 'пенополистирол'],
    roofing: ['мягкая', 'металлическая', 'черепица'],
    windows: ['пластиковые', 'деревянные', 'алюминиевые'],
    doors: ['межкомнатные', 'входные', 'раздвижные'],
    general: ['подготовительные', 'завершающие'],
  } as Record<string, string[]>,
}

/**
 * Price adjustment factors
 */
export const priceFactors = {
  // Seasonal factors by month (0 = January)
  seasonal: [0.95, 0.95, 1.0, 1.05, 1.08, 1.10, 1.10, 1.08, 1.05, 1.0, 0.98, 0.95],

  // Regional price multipliers
  regional: {
    moscow: 1.0,
    spb: 0.95,
    krasnodar: 0.85,
    novosibirsk: 0.80,
    kazan: 0.82,
    yekaterinburg: 0.85,
    default: 0.88,
  } as Record<string, number>,

  // Material category price volatility (for prediction)
  volatility: {
    строительные_смеси: 0.08,
    металлопрокат: 0.12,
    пиломатериалы: 0.10,
    краски: 0.06,
    напольные_покрытия: 0.05,
    сантехника: 0.04,
    электрика: 0.05,
    default: 0.07,
  } as Record<string, number>,
}

/**
 * Get ML config from environment or use defaults
 */
export function getMLConfig(): MLConfig {
  const config = { ...defaultMLConfig }

  // Override from environment variables if available
  if (process.env.ML_PRICE_PREDICTOR_ENABLED === 'false') {
    config.pricePredictor.enabled = false
  }
  if (process.env.ML_RECOMMENDATION_ENABLED === 'false') {
    config.recommendationEngine.enabled = false
  }
  if (process.env.ML_CLASSIFIER_ENABLED === 'false') {
    config.workClassifier.enabled = false
  }
  if (process.env.ML_ANOMALY_ENABLED === 'false') {
    config.anomalyDetector.enabled = false
  }
  if (process.env.ML_OPTIMIZER_ENABLED === 'false') {
    config.costOptimizer.enabled = false
  }

  return config
}

export type Category = (typeof categoryMappings.categories)[number]
