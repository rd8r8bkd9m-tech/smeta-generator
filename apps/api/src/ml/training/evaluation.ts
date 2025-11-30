/**
 * Model Evaluation utilities
 */

/**
 * Evaluation metrics for regression models
 */
export interface RegressionMetrics {
  mse: number // Mean Squared Error
  rmse: number // Root Mean Squared Error
  mae: number // Mean Absolute Error
  r2: number // R-squared (coefficient of determination)
  mape: number // Mean Absolute Percentage Error
}

/**
 * Evaluation metrics for classification models
 */
export interface ClassificationMetrics {
  accuracy: number
  precision: number
  recall: number
  f1Score: number
  confusionMatrix: number[][]
}

/**
 * Calculate regression metrics
 */
export function calculateRegressionMetrics(
  predictions: number[],
  actual: number[]
): RegressionMetrics {
  if (predictions.length !== actual.length || predictions.length === 0) {
    return { mse: 0, rmse: 0, mae: 0, r2: 0, mape: 0 }
  }

  const n = predictions.length

  // MSE and MAE
  let mseSum = 0
  let maeSum = 0
  let mapeSum = 0

  for (let i = 0; i < n; i++) {
    const error = predictions[i] - actual[i]
    mseSum += error * error
    maeSum += Math.abs(error)

    if (actual[i] !== 0) {
      mapeSum += Math.abs(error / actual[i])
    }
  }

  const mse = mseSum / n
  const rmse = Math.sqrt(mse)
  const mae = maeSum / n
  const mape = (mapeSum / n) * 100

  // R-squared
  const actualMean = actual.reduce((a, b) => a + b, 0) / n
  let totalSumSquares = 0
  let residualSumSquares = 0

  for (let i = 0; i < n; i++) {
    totalSumSquares += Math.pow(actual[i] - actualMean, 2)
    residualSumSquares += Math.pow(actual[i] - predictions[i], 2)
  }

  const r2 = totalSumSquares > 0 ? 1 - residualSumSquares / totalSumSquares : 0

  return {
    mse: Math.round(mse * 10000) / 10000,
    rmse: Math.round(rmse * 10000) / 10000,
    mae: Math.round(mae * 10000) / 10000,
    r2: Math.round(r2 * 10000) / 10000,
    mape: Math.round(mape * 100) / 100,
  }
}

/**
 * Calculate classification metrics
 */
export function calculateClassificationMetrics(
  predictions: number[],
  actual: number[],
  numClasses: number
): ClassificationMetrics {
  if (predictions.length !== actual.length || predictions.length === 0) {
    return {
      accuracy: 0,
      precision: 0,
      recall: 0,
      f1Score: 0,
      confusionMatrix: [],
    }
  }

  const n = predictions.length

  // Initialize confusion matrix
  const confusionMatrix: number[][] = []
  for (let i = 0; i < numClasses; i++) {
    confusionMatrix.push(new Array(numClasses).fill(0))
  }

  // Populate confusion matrix
  let correct = 0
  for (let i = 0; i < n; i++) {
    const pred = predictions[i]
    const act = actual[i]

    if (pred >= 0 && pred < numClasses && act >= 0 && act < numClasses) {
      confusionMatrix[act][pred]++
    }

    if (pred === act) {
      correct++
    }
  }

  const accuracy = correct / n

  // Calculate per-class metrics
  let totalPrecision = 0
  let totalRecall = 0
  let classCount = 0

  for (let c = 0; c < numClasses; c++) {
    // True positives
    const tp = confusionMatrix[c][c]

    // False positives (column sum - tp)
    let fp = 0
    for (let i = 0; i < numClasses; i++) {
      if (i !== c) fp += confusionMatrix[i][c]
    }

    // False negatives (row sum - tp)
    let fn = 0
    for (let i = 0; i < numClasses; i++) {
      if (i !== c) fn += confusionMatrix[c][i]
    }

    const precision = tp + fp > 0 ? tp / (tp + fp) : 0
    const recall = tp + fn > 0 ? tp / (tp + fn) : 0

    if (tp + fp + fn > 0) {
      totalPrecision += precision
      totalRecall += recall
      classCount++
    }
  }

  // Macro-averaged precision and recall
  const avgPrecision = classCount > 0 ? totalPrecision / classCount : 0
  const avgRecall = classCount > 0 ? totalRecall / classCount : 0

  // F1 Score
  const f1Score =
    avgPrecision + avgRecall > 0
      ? (2 * avgPrecision * avgRecall) / (avgPrecision + avgRecall)
      : 0

  return {
    accuracy: Math.round(accuracy * 10000) / 10000,
    precision: Math.round(avgPrecision * 10000) / 10000,
    recall: Math.round(avgRecall * 10000) / 10000,
    f1Score: Math.round(f1Score * 10000) / 10000,
    confusionMatrix,
  }
}

/**
 * Cross-validation for regression
 */
export function crossValidateRegression(
  model: {
    train: (features: number[][], labels: number[]) => void
    predict: (features: number[][]) => number[]
  },
  features: number[][],
  labels: number[],
  k: number = 5
): RegressionMetrics {
  const foldSize = Math.ceil(features.length / k)
  const allMetrics: RegressionMetrics[] = []

  for (let fold = 0; fold < k; fold++) {
    const testStart = fold * foldSize
    const testEnd = Math.min((fold + 1) * foldSize, features.length)

    // Split data
    const testFeatures = features.slice(testStart, testEnd)
    const testLabels = labels.slice(testStart, testEnd)
    const trainFeatures = [...features.slice(0, testStart), ...features.slice(testEnd)]
    const trainLabels = [...labels.slice(0, testStart), ...labels.slice(testEnd)]

    // Train and evaluate
    model.train(trainFeatures, trainLabels)
    const predictions = model.predict(testFeatures)
    const metrics = calculateRegressionMetrics(predictions, testLabels)

    allMetrics.push(metrics)
  }

  // Average metrics
  return {
    mse: average(allMetrics.map((m) => m.mse)),
    rmse: average(allMetrics.map((m) => m.rmse)),
    mae: average(allMetrics.map((m) => m.mae)),
    r2: average(allMetrics.map((m) => m.r2)),
    mape: average(allMetrics.map((m) => m.mape)),
  }
}

/**
 * Cross-validation for classification
 */
export function crossValidateClassification(
  model: {
    train: (features: number[][], labels: number[], numClasses: number) => void
    predict: (features: number[][]) => number[]
  },
  features: number[][],
  labels: number[],
  numClasses: number,
  k: number = 5
): ClassificationMetrics {
  const foldSize = Math.ceil(features.length / k)
  const allMetrics: ClassificationMetrics[] = []

  for (let fold = 0; fold < k; fold++) {
    const testStart = fold * foldSize
    const testEnd = Math.min((fold + 1) * foldSize, features.length)

    // Split data
    const testFeatures = features.slice(testStart, testEnd)
    const testLabels = labels.slice(testStart, testEnd)
    const trainFeatures = [...features.slice(0, testStart), ...features.slice(testEnd)]
    const trainLabels = [...labels.slice(0, testStart), ...labels.slice(testEnd)]

    // Train and evaluate
    model.train(trainFeatures, trainLabels, numClasses)
    const predictions = model.predict(testFeatures)
    const metrics = calculateClassificationMetrics(predictions, testLabels, numClasses)

    allMetrics.push(metrics)
  }

  // Average metrics (excluding confusion matrix)
  const avgConfusion = allMetrics[0].confusionMatrix.map((row) => [...row])

  return {
    accuracy: average(allMetrics.map((m) => m.accuracy)),
    precision: average(allMetrics.map((m) => m.precision)),
    recall: average(allMetrics.map((m) => m.recall)),
    f1Score: average(allMetrics.map((m) => m.f1Score)),
    confusionMatrix: avgConfusion,
  }
}

/**
 * Generate evaluation report
 */
export function generateEvaluationReport(
  modelName: string,
  metrics: RegressionMetrics | ClassificationMetrics,
  isClassification: boolean = false
): string {
  const lines: string[] = []

  lines.push(`=== Evaluation Report: ${modelName} ===`)
  lines.push(`Generated: ${new Date().toISOString()}`)
  lines.push('')

  if (isClassification) {
    const classMetrics = metrics as ClassificationMetrics
    lines.push('Classification Metrics:')
    lines.push(`  Accuracy:  ${(classMetrics.accuracy * 100).toFixed(2)}%`)
    lines.push(`  Precision: ${(classMetrics.precision * 100).toFixed(2)}%`)
    lines.push(`  Recall:    ${(classMetrics.recall * 100).toFixed(2)}%`)
    lines.push(`  F1 Score:  ${(classMetrics.f1Score * 100).toFixed(2)}%`)

    if (classMetrics.confusionMatrix.length > 0) {
      lines.push('')
      lines.push('Confusion Matrix:')
      for (const row of classMetrics.confusionMatrix) {
        lines.push(`  ${row.join('\t')}`)
      }
    }
  } else {
    const regMetrics = metrics as RegressionMetrics
    lines.push('Regression Metrics:')
    lines.push(`  MSE:  ${regMetrics.mse}`)
    lines.push(`  RMSE: ${regMetrics.rmse}`)
    lines.push(`  MAE:  ${regMetrics.mae}`)
    lines.push(`  R²:   ${regMetrics.r2}`)
    lines.push(`  MAPE: ${regMetrics.mape}%`)
  }

  lines.push('')
  lines.push('===========================')

  return lines.join('\n')
}

/**
 * Helper: calculate average
 */
function average(values: number[]): number {
  if (values.length === 0) return 0
  const sum = values.reduce((a, b) => a + b, 0)
  return Math.round((sum / values.length) * 10000) / 10000
}

/**
 * Calculate confidence interval for metric
 */
export function confidenceInterval(
  values: number[],
  confidence: number = 0.95
): { mean: number; lower: number; upper: number } {
  if (values.length === 0) {
    return { mean: 0, lower: 0, upper: 0 }
  }

  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length
  const std = Math.sqrt(variance)

  // Z-score for confidence level
  const zScores: Record<number, number> = {
    0.9: 1.645,
    0.95: 1.96,
    0.99: 2.576,
  }
  const z = zScores[confidence] ?? 1.96

  const marginOfError = (z * std) / Math.sqrt(values.length)

  return {
    mean: Math.round(mean * 10000) / 10000,
    lower: Math.round((mean - marginOfError) * 10000) / 10000,
    upper: Math.round((mean + marginOfError) * 10000) / 10000,
  }
}
