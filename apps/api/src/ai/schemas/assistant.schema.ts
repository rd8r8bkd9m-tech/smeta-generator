import { z } from 'zod'

// Voice command schema for natural language processing
export const VoiceCommandSchema = z.object({
  action: z.enum(['add', 'remove', 'update', 'calculate', 'query']).describe('Action to perform'),
  target: z.string().describe('Target item or area'),
  quantity: z.number().optional().describe('Quantity if specified'),
  unit: z.string().optional().describe('Unit of measurement'),
  room: z.string().optional().describe('Room or area name'),
  material: z.string().optional().describe('Material type if specified'),
  notes: z.string().optional().describe('Additional notes'),
})

export type VoiceCommand = z.infer<typeof VoiceCommandSchema>

// Blueprint/plan analysis schema
export const BlueprintAnalysisSchema = z.object({
  rooms: z.array(z.object({
    name: z.string(),
    area: z.number(),
    perimeter: z.number().optional(),
    height: z.number().optional(),
    type: z.string(), // bedroom, bathroom, kitchen, etc.
  })),
  totalArea: z.number(),
  totalPerimeter: z.number().optional(),
  floorCount: z.number().optional(),
  buildingType: z.string().optional(),
  suggestedWorks: z.array(z.object({
    room: z.string(),
    works: z.array(z.string()),
    estimatedCost: z.number().optional(),
  })),
})

export type BlueprintAnalysis = z.infer<typeof BlueprintAnalysisSchema>

// Price prediction schema
export const PricePredictionSchema = z.object({
  itemId: z.string(),
  itemName: z.string(),
  currentPrice: z.number(),
  predictedPrice: z.number(),
  priceChange: z.number(), // percentage
  confidence: z.number(), // 0-100
  factors: z.array(z.object({
    factor: z.string(),
    impact: z.enum(['positive', 'negative', 'neutral']),
    weight: z.number(),
    description: z.string(),
  })),
  forecast: z.array(z.object({
    date: z.string(),
    price: z.number(),
    confidence: z.number(),
  })),
  region: z.string().optional(),
  season: z.string().optional(),
})

export type PricePrediction = z.infer<typeof PricePredictionSchema>

// Smart recommendation schema
export const SmartRecommendationSchema = z.object({
  type: z.enum(['similar_project', 'cost_saving', 'quality_upgrade', 'seasonal', 'regional']),
  title: z.string(),
  description: z.string(),
  confidence: z.number(), // 0-100
  savings: z.number().optional(), // potential savings
  items: z.array(z.object({
    name: z.string(),
    currentChoice: z.string().optional(),
    recommendedChoice: z.string(),
    priceDiff: z.number().optional(),
    reason: z.string(),
  })).optional(),
  basedOn: z.object({
    similarProjects: z.number().optional(),
    region: z.string().optional(),
    projectType: z.string().optional(),
    season: z.string().optional(),
  }).optional(),
})

export type SmartRecommendation = z.infer<typeof SmartRecommendationSchema>

// Regional price data schema
export const RegionalPriceDataSchema = z.object({
  region: z.string(),
  regionName: z.string(),
  priceMultiplier: z.number(), // relative to Moscow
  averageWage: z.number(),
  materialCostIndex: z.number(),
  seasonalFactors: z.array(z.object({
    month: z.number(),
    factor: z.number(),
    description: z.string(),
  })),
  popularMaterials: z.array(z.object({
    name: z.string(),
    localPrice: z.number(),
    moscowPrice: z.number(),
    availability: z.enum(['high', 'medium', 'low']),
  })),
})

export type RegionalPriceData = z.infer<typeof RegionalPriceDataSchema>

// Market trend schema
export const MarketTrendSchema = z.object({
  category: z.string(),
  trend: z.enum(['rising', 'falling', 'stable']),
  changePercent: z.number(),
  period: z.string(), // e.g., "last_month", "last_quarter"
  forecast: z.enum(['up', 'down', 'stable']),
  forecastPeriod: z.string(),
  reasons: z.array(z.string()),
  affectedItems: z.array(z.object({
    name: z.string(),
    currentPrice: z.number(),
    expectedChange: z.number(),
  })),
})

export type MarketTrend = z.infer<typeof MarketTrendSchema>

// AI Assistant response schema
export const AIAssistantResponseSchema = z.object({
  message: z.string(),
  action: z.string().optional(),
  data: z.any().optional(),
  suggestions: z.array(z.string()).optional(),
  recommendations: z.array(SmartRecommendationSchema).optional(),
  pricePredictions: z.array(PricePredictionSchema).optional(),
  marketTrends: z.array(MarketTrendSchema).optional(),
})

export type AIAssistantResponse = z.infer<typeof AIAssistantResponseSchema>
