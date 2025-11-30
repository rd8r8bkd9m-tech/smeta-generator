/**
 * Feature Engineering utilities for ML models
 */

import { categoryMappings, priceFactors } from '../config.js'
import { oneHotEncode, minMaxNormalize } from './normalization.js'

export interface ItemFeatures {
  priceNormalized: number
  categoryEncoded: number[]
  seasonalFactor: number
  regionalFactor: number
  quantityNormalized: number
  isHighVolatility: number
}

export interface ProjectFeatures {
  totalArea: number
  roomCount: number
  projectTypeEncoded: number[]
  budgetPerSqm: number
  qualityLevel: number
}

/**
 * Extract features from an item for ML models
 */
export function extractItemFeatures(
  item: {
    price: number
    category: string
    quantity?: number
    region?: string
  },
  priceRange: { min: number; max: number } = { min: 0, max: 100000 }
): ItemFeatures {
  const currentMonth = new Date().getMonth()

  // Normalize price
  const priceNormalized = minMaxNormalize(item.price, priceRange.min, priceRange.max)

  // One-hot encode category - convert readonly array to string array
  const categories: string[] = [...categoryMappings.categories]
  const categoryEncoded = oneHotEncode(item.category.toLowerCase(), categories)

  // Get seasonal factor
  const seasonalFactor = priceFactors.seasonal[currentMonth]

  // Get regional factor
  const regionalFactor = priceFactors.regional[item.region || 'default'] || priceFactors.regional.default

  // Normalize quantity (assuming typical range 0-1000)
  const quantityNormalized = minMaxNormalize(item.quantity || 1, 0, 1000)

  // Check volatility
  const volatilityCategory = Object.keys(priceFactors.volatility).find((key) =>
    item.category.toLowerCase().includes(key)
  )
  const volatility = volatilityCategory
    ? priceFactors.volatility[volatilityCategory]
    : priceFactors.volatility.default
  const isHighVolatility = volatility > 0.08 ? 1 : 0

  return {
    priceNormalized,
    categoryEncoded,
    seasonalFactor,
    regionalFactor,
    quantityNormalized,
    isHighVolatility,
  }
}

/**
 * Extract features from a project context
 */
export function extractProjectFeatures(
  project: {
    totalArea: number
    rooms?: string[]
    projectType?: string
    budget?: number
    qualityLevel?: 'economy' | 'standard' | 'premium'
  },
  areaRange: { min: number; max: number } = { min: 10, max: 500 }
): ProjectFeatures {
  const projectTypes = ['apartment', 'house', 'office', 'commercial', 'industrial', 'other']
  const qualityLevels = { economy: 0, standard: 0.5, premium: 1 }

  return {
    totalArea: minMaxNormalize(project.totalArea, areaRange.min, areaRange.max),
    roomCount: minMaxNormalize(project.rooms?.length || 1, 1, 10),
    projectTypeEncoded: oneHotEncode(project.projectType || 'other', projectTypes),
    budgetPerSqm: project.budget ? minMaxNormalize(project.budget / project.totalArea, 0, 50000) : 0.5,
    qualityLevel: qualityLevels[project.qualityLevel || 'standard'],
  }
}

/**
 * Convert features to flat array for model input
 */
export function featuresToArray(features: ItemFeatures | ProjectFeatures): number[] {
  const values: number[] = []

  for (const value of Object.values(features)) {
    if (Array.isArray(value)) {
      values.push(...value)
    } else if (typeof value === 'number') {
      values.push(value)
    }
  }

  return values
}

/**
 * Create time series features for price prediction
 */
export function createTimeSeriesFeatures(
  historicalPrices: { date: string; price: number }[],
  windowSize: number = 6
): {
  features: number[][]
  labels: number[]
} {
  if (historicalPrices.length < windowSize + 1) {
    return { features: [], labels: [] }
  }

  // Sort by date
  const sorted = [...historicalPrices].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const prices = sorted.map((p) => p.price)
  const priceRange = { min: Math.min(...prices), max: Math.max(...prices) }

  const features: number[][] = []
  const labels: number[] = []

  for (let i = windowSize; i < prices.length; i++) {
    // Create sliding window features
    const window = prices.slice(i - windowSize, i).map((p) => minMaxNormalize(p, priceRange.min, priceRange.max))

    // Add additional features
    const monthIndex = new Date(sorted[i].date).getMonth()
    const seasonalFactor = priceFactors.seasonal[monthIndex]
    const trend = calculateTrend(prices.slice(i - windowSize, i))

    features.push([...window, seasonalFactor, trend])
    labels.push(minMaxNormalize(prices[i], priceRange.min, priceRange.max))
  }

  return { features, labels }
}

/**
 * Calculate simple trend from price series
 */
export function calculateTrend(prices: number[]): number {
  if (prices.length < 2) return 0

  const first = prices[0]
  const last = prices[prices.length - 1]

  if (first === 0) return 0

  const change = (last - first) / first
  // Normalize to [-1, 1]
  return Math.max(-1, Math.min(1, change))
}

/**
 * Calculate moving average
 */
export function movingAverage(data: number[], window: number): number[] {
  if (data.length < window) return data

  const result: number[] = []
  for (let i = window - 1; i < data.length; i++) {
    const sum = data.slice(i - window + 1, i + 1).reduce((a, b) => a + b, 0)
    result.push(sum / window)
  }

  return result
}

/**
 * Calculate exponential moving average
 */
export function exponentialMovingAverage(data: number[], alpha: number = 0.3): number[] {
  if (data.length === 0) return []

  const result = [data[0]]
  for (let i = 1; i < data.length; i++) {
    result.push(alpha * data[i] + (1 - alpha) * result[i - 1])
  }

  return result
}

/**
 * Calculate price volatility (standard deviation of returns)
 */
export function calculateVolatility(prices: number[]): number {
  if (prices.length < 2) return 0

  const returns: number[] = []
  for (let i = 1; i < prices.length; i++) {
    if (prices[i - 1] !== 0) {
      returns.push((prices[i] - prices[i - 1]) / prices[i - 1])
    }
  }

  if (returns.length === 0) return 0

  const mean = returns.reduce((a, b) => a + b, 0) / returns.length
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length

  return Math.sqrt(variance)
}

/**
 * Extract text features for work classification
 */
export function extractTextFeatures(
  text: string,
  vocabulary: string[]
): {
  bagOfWords: number[]
  wordCount: number
  hasNumbers: number
  hasUnits: number
} {
  const normalizedText = text.toLowerCase()
  const words = normalizedText.split(/\s+/)

  // Bag of words
  const bagOfWords = vocabulary.map((word) => (normalizedText.includes(word.toLowerCase()) ? 1 : 0))

  // Word count (normalized)
  const wordCount = minMaxNormalize(words.length, 1, 100)

  // Check for numbers
  const hasNumbers = /\d+/.test(text) ? 1 : 0

  // Check for measurement units
  const units = ['м²', 'м2', 'кв.м', 'м³', 'м3', 'куб.м', 'шт', 'п.м', 'кг', 'л']
  const hasUnits = units.some((unit) => text.includes(unit)) ? 1 : 0

  return { bagOfWords, wordCount, hasNumbers, hasUnits }
}
