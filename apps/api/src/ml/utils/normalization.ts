/**
 * Normalization utilities for ML models
 */

export interface NormalizationParams {
  min: number
  max: number
  mean: number
  std: number
}

/**
 * Min-Max normalization to [0, 1] range
 */
export function minMaxNormalize(value: number, min: number, max: number): number {
  if (max === min) return 0.5
  return (value - min) / (max - min)
}

/**
 * Reverse min-max normalization
 */
export function minMaxDenormalize(normalized: number, min: number, max: number): number {
  return normalized * (max - min) + min
}

/**
 * Z-score normalization (standardization)
 */
export function zScoreNormalize(value: number, mean: number, std: number): number {
  if (std === 0) return 0
  return (value - mean) / std
}

/**
 * Reverse z-score normalization
 */
export function zScoreDenormalize(normalized: number, mean: number, std: number): number {
  return normalized * std + mean
}

/**
 * Calculate normalization parameters from data array
 */
export function calculateNormParams(data: number[]): NormalizationParams {
  if (data.length === 0) {
    return { min: 0, max: 1, mean: 0.5, std: 0.5 }
  }

  const min = Math.min(...data)
  const max = Math.max(...data)
  const mean = data.reduce((sum, v) => sum + v, 0) / data.length
  const variance = data.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / data.length
  const std = Math.sqrt(variance)

  return { min, max, mean, std }
}

/**
 * Normalize an array of values using min-max
 */
export function normalizeArray(data: number[], params?: NormalizationParams): number[] {
  const { min, max } = params || calculateNormParams(data)
  return data.map((v) => minMaxNormalize(v, min, max))
}

/**
 * Normalize a feature matrix (each column independently)
 */
export function normalizeFeatures(
  features: number[][],
  params?: NormalizationParams[]
): { normalized: number[][]; params: NormalizationParams[] } {
  if (features.length === 0) {
    return { normalized: [], params: [] }
  }

  const numFeatures = features[0].length
  const normParams: NormalizationParams[] = []

  // Calculate params for each feature column
  for (let j = 0; j < numFeatures; j++) {
    const column = features.map((row) => row[j])
    normParams.push(params?.[j] || calculateNormParams(column))
  }

  // Normalize each feature
  const normalized = features.map((row) =>
    row.map((val, j) => minMaxNormalize(val, normParams[j].min, normParams[j].max))
  )

  return { normalized, params: normParams }
}

/**
 * One-hot encode a categorical value
 */
export function oneHotEncode(value: string, categories: string[]): number[] {
  return categories.map((cat) => (cat === value ? 1 : 0))
}

/**
 * Label encode a categorical value
 */
export function labelEncode(value: string, categories: string[]): number {
  const index = categories.indexOf(value)
  return index === -1 ? categories.length : index
}

/**
 * Decode one-hot encoded value
 */
export function oneHotDecode(encoded: number[], categories: string[]): string {
  const index = encoded.indexOf(1)
  return index === -1 || index >= categories.length ? 'unknown' : categories[index]
}

/**
 * Clamp value to range
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

/**
 * Softmax function for probability distribution
 */
export function softmax(values: number[]): number[] {
  const max = Math.max(...values)
  const exps = values.map((v) => Math.exp(v - max))
  const sum = exps.reduce((a, b) => a + b, 0)
  return exps.map((e) => e / sum)
}

/**
 * Sigmoid activation function
 */
export function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x))
}

/**
 * ReLU activation function
 */
export function relu(x: number): number {
  return Math.max(0, x)
}
