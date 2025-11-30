/**
 * Data Preparation utilities for ML training
 */

import {
  extractItemFeatures,
  createTimeSeriesFeatures,
} from '../utils/featureEngineering.js'
import { normalizeFeatures, type NormalizationParams } from '../utils/normalization.js'

export interface PreparedData {
  trainFeatures: number[][]
  trainLabels: number[]
  testFeatures: number[][]
  testLabels: number[]
  normParams: NormalizationParams[]
}

/**
 * Prepare price data for training
 */
export function preparePriceData(
  priceHistory: Array<{
    itemId: string
    category: string
    prices: Array<{ date: string; price: number }>
    region?: string
  }>,
  testSplit: number = 0.2
): PreparedData {
  const allFeatures: number[][] = []
  const allLabels: number[] = []

  for (const item of priceHistory) {
    if (item.prices.length < 7) continue // Need at least 7 data points

    // Create time series features
    const { features, labels } = createTimeSeriesFeatures(item.prices, 6)

    // Add category and region features
    for (let i = 0; i < features.length; i++) {
      const itemFeatures = extractItemFeatures(
        {
          price: item.prices[i + 5].price, // Use last price in window
          category: item.category,
          region: item.region,
        },
        { min: 0, max: 100000 }
      )

      // Combine time series with item features
      const combinedFeatures = [
        ...features[i],
        itemFeatures.seasonalFactor,
        itemFeatures.regionalFactor,
        itemFeatures.isHighVolatility,
      ]

      allFeatures.push(combinedFeatures)
      allLabels.push(labels[i])
    }
  }

  // Split into train/test
  const splitIndex = Math.floor(allFeatures.length * (1 - testSplit))

  // Shuffle data
  const indices = allFeatures.map((_, i) => i)
  shuffleArray(indices)

  const shuffledFeatures = indices.map((i) => allFeatures[i])
  const shuffledLabels = indices.map((i) => allLabels[i])

  const trainFeatures = shuffledFeatures.slice(0, splitIndex)
  const trainLabels = shuffledLabels.slice(0, splitIndex)
  const testFeatures = shuffledFeatures.slice(splitIndex)
  const testLabels = shuffledLabels.slice(splitIndex)

  // Normalize features
  const { normalized: normalizedTrain, params } = normalizeFeatures(trainFeatures)
  const { normalized: normalizedTest } = normalizeFeatures(testFeatures, params)

  return {
    trainFeatures: normalizedTrain,
    trainLabels,
    testFeatures: normalizedTest,
    testLabels,
    normParams: params,
  }
}

/**
 * Prepare classification data for work classifier training
 */
export function prepareClassificationData(
  samples: Array<{
    text: string
    category: string
    subcategory?: string
  }>,
  vocabulary: string[],
  testSplit: number = 0.2
): {
  trainFeatures: number[][]
  trainLabels: number[]
  testFeatures: number[][]
  testLabels: number[]
  categories: string[]
} {
  // Get unique categories
  const categories = [...new Set(samples.map((s) => s.category))]

  const allFeatures: number[][] = []
  const allLabels: number[] = []

  for (const sample of samples) {
    const features = createTextFeatures(sample.text, vocabulary)
    const label = categories.indexOf(sample.category)

    allFeatures.push(features)
    allLabels.push(label)
  }

  // Split into train/test
  const splitIndex = Math.floor(allFeatures.length * (1 - testSplit))

  // Shuffle
  const indices = allFeatures.map((_, i) => i)
  shuffleArray(indices)

  const shuffledFeatures = indices.map((i) => allFeatures[i])
  const shuffledLabels = indices.map((i) => allLabels[i])

  return {
    trainFeatures: shuffledFeatures.slice(0, splitIndex),
    trainLabels: shuffledLabels.slice(0, splitIndex),
    testFeatures: shuffledFeatures.slice(splitIndex),
    testLabels: shuffledLabels.slice(splitIndex),
    categories,
  }
}

/**
 * Create text features for classification
 */
function createTextFeatures(text: string, vocabulary: string[]): number[] {
  const normalized = text.toLowerCase()
  const words = normalized.split(/\s+/)

  // Bag of words
  const bagOfWords = vocabulary.map((word) => (normalized.includes(word.toLowerCase()) ? 1 : 0))

  // Additional features
  const wordCount = Math.min(words.length / 50, 1) // Normalize
  const hasNumbers = /\d/.test(text) ? 1 : 0
  const hasUnits = /м²|м2|кв\.м|шт|п\.м|кг/i.test(text) ? 1 : 0
  const avgWordLength = words.reduce((sum, w) => sum + w.length, 0) / words.length / 10

  return [...bagOfWords, wordCount, hasNumbers, hasUnits, avgWordLength]
}

/**
 * Prepare anomaly detection data
 */
export function prepareAnomalyData(
  samples: Array<{
    price: number
    category: string
    quantity: number
    isAnomaly?: boolean
  }>
): {
  features: number[][]
  labels: number[]
  stats: { mean: number; std: number; min: number; max: number }
} {
  // Calculate price statistics
  const prices = samples.map((s) => s.price)
  const mean = prices.reduce((a, b) => a + b, 0) / prices.length
  const variance = prices.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / prices.length
  const std = Math.sqrt(variance)
  const min = Math.min(...prices)
  const max = Math.max(...prices)

  const features: number[][] = []
  const labels: number[] = []

  for (const sample of samples) {
    // Create features
    const priceZScore = std > 0 ? (sample.price - mean) / std : 0
    const quantityNorm = Math.min(sample.quantity / 100, 1)

    features.push([priceZScore, quantityNorm])
    labels.push(sample.isAnomaly ? 1 : 0)
  }

  return {
    features,
    labels,
    stats: { mean, std, min, max },
  }
}

/**
 * Generate synthetic training data for development/testing
 */
export function generateSyntheticPriceData(
  numItems: number = 100,
  monthsHistory: number = 12
): Array<{
  itemId: string
  category: string
  prices: Array<{ date: string; price: number }>
  region?: string
}> {
  const categories = ['flooring', 'painting', 'plastering', 'tiling', 'electrical', 'plumbing']
  const regions = ['moscow', 'spb', 'krasnodar', 'novosibirsk']
  const basePrices: Record<string, number> = {
    flooring: 600,
    painting: 250,
    plastering: 350,
    tiling: 900,
    electrical: 500,
    plumbing: 2500,
  }

  const data = []

  for (let i = 0; i < numItems; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)]
    const region = regions[Math.floor(Math.random() * regions.length)]
    const basePrice = basePrices[category]

    const prices = []
    let currentPrice = basePrice * (0.9 + Math.random() * 0.2)

    for (let m = 0; m < monthsHistory; m++) {
      const date = new Date()
      date.setMonth(date.getMonth() - (monthsHistory - m))

      // Add trend
      currentPrice *= 1 + (Math.random() - 0.4) * 0.05

      // Add seasonality
      const month = date.getMonth()
      const seasonalFactor = [0.95, 0.95, 1.0, 1.05, 1.08, 1.1, 1.1, 1.08, 1.05, 1.0, 0.98, 0.95][month]
      const seasonalPrice = currentPrice * seasonalFactor

      prices.push({
        date: date.toISOString().split('T')[0],
        price: Math.round(seasonalPrice),
      })
    }

    data.push({
      itemId: `item-${i}`,
      category,
      prices,
      region,
    })
  }

  return data
}

/**
 * Generate synthetic classification data
 */
export function generateSyntheticClassificationData(
  numSamples: number = 500
): Array<{
  text: string
  category: string
  subcategory?: string
}> {
  const templates: Record<string, string[]> = {
    plastering: [
      'Штукатурка стен {quantity} м²',
      'Оштукатуривание внутренних поверхностей {quantity} м²',
      'Выравнивание стен штукатуркой гипсовой {quantity} м²',
      'Машинная штукатурка потолков {quantity} м²',
    ],
    painting: [
      'Покраска стен водоэмульсионной краской {quantity} м²',
      'Окраска потолка в {rooms} слоя {quantity} м²',
      'Грунтовка и покраска стен {quantity} м²',
      'Оклейка обоями виниловыми {quantity} м²',
    ],
    flooring: [
      'Укладка ламината {quantity} м²',
      'Настил линолеума {quantity} м²',
      'Монтаж паркетной доски {quantity} м²',
      'Устройство стяжки пола {quantity} м²',
    ],
    tiling: [
      'Облицовка плиткой {quantity} м²',
      'Укладка керамогранита на пол {quantity} м²',
      'Мозаика в ванной комнате {quantity} м²',
      'Плиточные работы в санузле {quantity} м²',
    ],
    electrical: [
      'Монтаж электропроводки {quantity} точек',
      'Установка розеток и выключателей {quantity} шт',
      'Прокладка кабеля в гофре {quantity} м',
      'Подключение светильников {quantity} шт',
    ],
    plumbing: [
      'Разводка водопровода {quantity} точек',
      'Монтаж канализации {quantity} м',
      'Установка унитаза и раковины {quantity} комплект',
      'Подключение смесителя {quantity} шт',
    ],
  }

  const data = []

  for (let i = 0; i < numSamples; i++) {
    const categories = Object.keys(templates)
    const category = categories[Math.floor(Math.random() * categories.length)]
    const categoryTemplates = templates[category]
    const template = categoryTemplates[Math.floor(Math.random() * categoryTemplates.length)]

    const text = template
      .replace('{quantity}', String(Math.floor(Math.random() * 100) + 10))
      .replace('{rooms}', String(Math.floor(Math.random() * 3) + 1))

    data.push({ text, category })
  }

  return data
}

/**
 * Shuffle array in place
 */
function shuffleArray<T>(array: T[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
}

/**
 * Split data into k folds for cross-validation
 */
export function kFoldSplit<T>(
  data: T[],
  k: number = 5
): Array<{ train: T[]; test: T[] }> {
  const foldSize = Math.ceil(data.length / k)
  const folds = []

  for (let i = 0; i < k; i++) {
    const testStart = i * foldSize
    const testEnd = Math.min((i + 1) * foldSize, data.length)

    const test = data.slice(testStart, testEnd)
    const train = [...data.slice(0, testStart), ...data.slice(testEnd)]

    folds.push({ train, test })
  }

  return folds
}
