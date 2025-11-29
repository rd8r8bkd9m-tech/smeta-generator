/**
 * Model Training utilities
 *
 * Simple training implementations using gradient descent.
 * In production, would use TensorFlow.js for more complex models.
 */

import type { TrainingConfig, TrainingResult, TrainingMetrics } from '../types.js'
import { getMLConfig } from '../config.js'

const defaultConfig = getMLConfig().training

/**
 * Simple linear regression model
 */
export class LinearRegression {
  private weights: number[] = []
  private bias: number = 0
  private learningRate: number

  constructor(learningRate: number = 0.001) {
    this.learningRate = learningRate
  }

  /**
   * Train the model
   */
  train(
    features: number[][],
    labels: number[],
    config: Partial<TrainingConfig> = {}
  ): TrainingMetrics {
    const epochs = config.epochs ?? defaultConfig.epochs
    const batchSize = config.batchSize ?? defaultConfig.batchSize

    if (features.length === 0) {
      return { loss: Infinity, mse: Infinity, mae: Infinity }
    }

    const numFeatures = features[0].length

    // Initialize weights
    this.weights = new Array(numFeatures).fill(0).map(() => Math.random() * 0.1 - 0.05)
    this.bias = 0

    let lastLoss = Infinity

    for (let epoch = 0; epoch < epochs; epoch++) {
      // Mini-batch gradient descent
      for (let i = 0; i < features.length; i += batchSize) {
        const batchFeatures = features.slice(i, i + batchSize)
        const batchLabels = labels.slice(i, i + batchSize)

        const gradients = this.calculateGradients(batchFeatures, batchLabels)

        // Update weights
        for (let j = 0; j < this.weights.length; j++) {
          this.weights[j] -= this.learningRate * gradients.weights[j]
        }
        this.bias -= this.learningRate * gradients.bias
      }

      // Calculate loss
      lastLoss = this.calculateMSE(features, labels)

      // Early stopping
      if (lastLoss < 0.0001) break
    }

    const mse = this.calculateMSE(features, labels)
    const mae = this.calculateMAE(features, labels)

    return {
      loss: lastLoss,
      mse,
      mae,
    }
  }

  /**
   * Predict values
   */
  predict(features: number[][]): number[] {
    return features.map((f) => this.predictSingle(f))
  }

  /**
   * Predict single value
   */
  predictSingle(features: number[]): number {
    let result = this.bias
    for (let i = 0; i < features.length && i < this.weights.length; i++) {
      result += features[i] * this.weights[i]
    }
    return result
  }

  /**
   * Calculate gradients for batch
   */
  private calculateGradients(
    features: number[][],
    labels: number[]
  ): { weights: number[]; bias: number } {
    const n = features.length
    const numFeatures = this.weights.length

    const weightGradients = new Array(numFeatures).fill(0)
    let biasGradient = 0

    for (let i = 0; i < n; i++) {
      const prediction = this.predictSingle(features[i])
      const error = prediction - labels[i]

      for (let j = 0; j < numFeatures; j++) {
        weightGradients[j] += (error * features[i][j]) / n
      }
      biasGradient += error / n
    }

    return { weights: weightGradients, bias: biasGradient }
  }

  /**
   * Calculate Mean Squared Error
   */
  private calculateMSE(features: number[][], labels: number[]): number {
    let sum = 0
    for (let i = 0; i < features.length; i++) {
      const prediction = this.predictSingle(features[i])
      sum += Math.pow(prediction - labels[i], 2)
    }
    return sum / features.length
  }

  /**
   * Calculate Mean Absolute Error
   */
  private calculateMAE(features: number[][], labels: number[]): number {
    let sum = 0
    for (let i = 0; i < features.length; i++) {
      const prediction = this.predictSingle(features[i])
      sum += Math.abs(prediction - labels[i])
    }
    return sum / features.length
  }

  /**
   * Get model weights
   */
  getWeights(): { weights: number[]; bias: number } {
    return { weights: [...this.weights], bias: this.bias }
  }

  /**
   * Set model weights
   */
  setWeights(weights: number[], bias: number): void {
    this.weights = [...weights]
    this.bias = bias
  }
}

/**
 * Simple logistic regression for classification
 */
export class LogisticRegression {
  private weights: number[][] = []
  private biases: number[] = []
  private numClasses: number = 0
  private learningRate: number

  constructor(learningRate: number = 0.01) {
    this.learningRate = learningRate
  }

  /**
   * Train the model
   */
  train(
    features: number[][],
    labels: number[],
    numClasses: number,
    config: Partial<TrainingConfig> = {}
  ): TrainingMetrics {
    const epochs = config.epochs ?? defaultConfig.epochs
    const batchSize = config.batchSize ?? defaultConfig.batchSize

    if (features.length === 0) {
      return { loss: Infinity, accuracy: 0 }
    }

    this.numClasses = numClasses
    const numFeatures = features[0].length

    // Initialize weights for each class
    this.weights = []
    this.biases = []
    for (let c = 0; c < numClasses; c++) {
      this.weights.push(new Array(numFeatures).fill(0).map(() => Math.random() * 0.1 - 0.05))
      this.biases.push(0)
    }

    let lastLoss = Infinity

    for (let epoch = 0; epoch < epochs; epoch++) {
      let totalLoss = 0

      // Mini-batch gradient descent
      for (let i = 0; i < features.length; i += batchSize) {
        const batchFeatures = features.slice(i, i + batchSize)
        const batchLabels = labels.slice(i, i + batchSize)

        totalLoss += this.trainBatch(batchFeatures, batchLabels)
      }

      lastLoss = totalLoss / Math.ceil(features.length / batchSize)

      // Early stopping
      if (lastLoss < 0.01) break
    }

    const accuracy = this.calculateAccuracy(features, labels)

    return {
      loss: lastLoss,
      accuracy,
    }
  }

  /**
   * Train on a single batch
   */
  private trainBatch(features: number[][], labels: number[]): number {
    const n = features.length
    let batchLoss = 0

    for (let i = 0; i < n; i++) {
      const probabilities = this.softmax(this.computeLogits(features[i]))
      const label = labels[i]

      // Cross-entropy loss
      batchLoss -= Math.log(Math.max(probabilities[label], 1e-10))

      // Gradient descent
      for (let c = 0; c < this.numClasses; c++) {
        const error = probabilities[c] - (c === label ? 1 : 0)

        for (let j = 0; j < features[i].length; j++) {
          this.weights[c][j] -= (this.learningRate * error * features[i][j]) / n
        }
        this.biases[c] -= (this.learningRate * error) / n
      }
    }

    return batchLoss / n
  }

  /**
   * Compute logits for all classes
   */
  private computeLogits(features: number[]): number[] {
    const logits = []
    for (let c = 0; c < this.numClasses; c++) {
      let logit = this.biases[c]
      for (let j = 0; j < features.length && j < this.weights[c].length; j++) {
        logit += features[j] * this.weights[c][j]
      }
      logits.push(logit)
    }
    return logits
  }

  /**
   * Softmax function
   */
  private softmax(logits: number[]): number[] {
    const max = Math.max(...logits)
    const exps = logits.map((l) => Math.exp(l - max))
    const sum = exps.reduce((a, b) => a + b, 0)
    return exps.map((e) => e / sum)
  }

  /**
   * Predict class for features
   */
  predict(features: number[][]): number[] {
    return features.map((f) => this.predictSingle(f))
  }

  /**
   * Predict class for single input
   */
  predictSingle(features: number[]): number {
    const probabilities = this.softmax(this.computeLogits(features))
    return probabilities.indexOf(Math.max(...probabilities))
  }

  /**
   * Predict probabilities
   */
  predictProbabilities(features: number[]): number[] {
    return this.softmax(this.computeLogits(features))
  }

  /**
   * Calculate accuracy
   */
  private calculateAccuracy(features: number[][], labels: number[]): number {
    let correct = 0
    for (let i = 0; i < features.length; i++) {
      if (this.predictSingle(features[i]) === labels[i]) {
        correct++
      }
    }
    return correct / features.length
  }

  /**
   * Get model parameters
   */
  getParams(): { weights: number[][]; biases: number[]; numClasses: number } {
    return {
      weights: this.weights.map((w) => [...w]),
      biases: [...this.biases],
      numClasses: this.numClasses,
    }
  }

  /**
   * Set model parameters
   */
  setParams(weights: number[][], biases: number[], numClasses: number): void {
    this.weights = weights.map((w) => [...w])
    this.biases = [...biases]
    this.numClasses = numClasses
  }
}

/**
 * Train price prediction model
 */
export async function trainPricePredictor(
  trainFeatures: number[][],
  trainLabels: number[],
  config?: Partial<TrainingConfig>
): Promise<TrainingResult> {
  try {
    const model = new LinearRegression(config?.learningRate ?? 0.001)
    const metrics = model.train(trainFeatures, trainLabels, config)

    return {
      success: true,
      metrics,
    }
  } catch (error) {
    return {
      success: false,
      metrics: { loss: Infinity },
      error: error instanceof Error ? error.message : 'Training failed',
    }
  }
}

/**
 * Train work classifier model
 */
export async function trainWorkClassifier(
  trainFeatures: number[][],
  trainLabels: number[],
  numClasses: number,
  config?: Partial<TrainingConfig>
): Promise<TrainingResult> {
  try {
    const model = new LogisticRegression(config?.learningRate ?? 0.01)
    const metrics = model.train(trainFeatures, trainLabels, numClasses, config)

    return {
      success: true,
      metrics,
    }
  } catch (error) {
    return {
      success: false,
      metrics: { loss: Infinity, accuracy: 0 },
      error: error instanceof Error ? error.message : 'Training failed',
    }
  }
}

export { LinearRegression, LogisticRegression }
