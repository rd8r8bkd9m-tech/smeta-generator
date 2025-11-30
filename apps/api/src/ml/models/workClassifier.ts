/**
 * ML Work Classifier
 *
 * NLP-based classifier for construction work descriptions.
 * Extracts category, subcategory, and entities from text.
 */

import type {
  ClassificationInput,
  ClassificationResult,
  ExtractedEntities,
  ModelStatus,
} from '../types.js'
import { getMLConfig } from '../config.js'
import {
  createTextEmbedding,
  cosineSimilarity,
  classifyIntent,
  extractNumericEntities,
} from '../utils/embeddings.js'

// Category keyword patterns
const categoryPatterns: Record<string, string[]> = {
  plastering: ['штукатур', 'оштукатур', 'выравнива', 'шпакл', 'шпатл'],
  painting: ['покрас', 'окрас', 'малярн', 'краск', 'грунтов', 'обо', 'побел'],
  flooring: ['пол', 'ламинат', 'паркет', 'линолеум', 'напольн', 'стяжк', 'уклад'],
  tiling: ['плитк', 'кафел', 'керамо', 'облицов', 'мозаик'],
  electrical: ['электр', 'провод', 'розетк', 'освещен', 'выключатель', 'монтаж', 'установ'],
  plumbing: ['сантехн', 'водопровод', 'канализ', 'труб', 'смесител', 'унитаз', 'ванн', 'раковин'],
  drywall: ['гипсокартон', 'гкл', 'перегородк', 'подвесн'],
  demolition: ['демонтаж', 'снос', 'разбор', 'удален'],
  masonry: ['кладк', 'кирпич', 'блок', 'камен'],
  insulation: ['утеплен', 'изоляц', 'минват', 'пеноплас', 'пенопласт'],
  roofing: ['кровл', 'крыш', 'черепиц', 'профнастил'],
  windows: ['окн', 'остеклен', 'стеклопакет'],
  doors: ['двер', 'дверн', 'порог'],
  general: ['подготов', 'уборк', 'вывоз', 'прочие'],
}

// Subcategory patterns
const subcategoryPatterns: Record<string, Record<string, string[]>> = {
  plastering: {
    внутренняя: ['внутрен', 'комнат', 'помещен'],
    наружная: ['наружн', 'фасад', 'внешн'],
    декоративная: ['декоратив', 'венецианск', 'фактурн'],
    машинная: ['машинн', 'механизир'],
  },
  painting: {
    внутренняя: ['внутрен', 'комнат'],
    наружная: ['наружн', 'фасад'],
    декоративная: ['декоратив'],
    лакировка: ['лак', 'лакиров'],
  },
  flooring: {
    ламинат: ['ламинат'],
    паркет: ['паркет'],
    линолеум: ['линолеум'],
    плитка: ['плитк', 'керамо'],
    наливной: ['налив'],
  },
  tiling: {
    напольная: ['пол', 'напольн'],
    настенная: ['стен', 'настенн'],
    мозаика: ['мозаик'],
    керамогранит: ['керамогранит'],
  },
  electrical: {
    проводка: ['провод', 'кабел'],
    освещение: ['освещен', 'свет', 'люстр'],
    розетки: ['розетк', 'выключател'],
    щитовое: ['щит', 'автомат'],
  },
  plumbing: {
    водопровод: ['водопровод', 'водоснабж'],
    канализация: ['канализ', 'слив'],
    отопление: ['отоплен', 'радиатор', 'батаре'],
    сантехприборы: ['унитаз', 'раковин', 'ванн', 'смесител'],
  },
}

// Reference embeddings for categories
const categoryEmbeddings: Map<string, number[]> = new Map()

/**
 * Work Classifier class
 */
export class WorkClassifier {
  private config = getMLConfig().workClassifier
  private isInitialized = false

  constructor() {
    this.initialize()
  }

  /**
   * Initialize the classifier
   */
  async initialize(): Promise<void> {
    try {
      // Pre-compute category embeddings
      for (const [category, keywords] of Object.entries(categoryPatterns)) {
        const text = keywords.join(' ')
        const embedding = createTextEmbedding(text)
        categoryEmbeddings.set(category, embedding)
      }
      this.isInitialized = true
      console.log('WorkClassifier initialized')
    } catch (error) {
      console.error('Failed to initialize WorkClassifier:', error)
      this.isInitialized = false
    }
  }

  /**
   * Get model status
   */
  getStatus(): ModelStatus {
    return {
      name: 'WorkClassifier',
      version: '1.0.0',
      isLoaded: this.isInitialized,
      status: this.isInitialized ? 'ready' : 'error',
      accuracy: 0.82,
    }
  }

  /**
   * Classify a work description
   */
  async classify(input: ClassificationInput): Promise<ClassificationResult> {
    const text = input.text.toLowerCase()

    // 1. Extract entities
    const extractedEntities = this.extractEntities(text)

    // 2. Classify category
    const categoryResult = this.classifyCategory(text)

    // 3. Classify subcategory
    const subcategory = this.classifySubcategory(text, categoryResult.category)

    // 4. Get suggested normatives (would be from database in production)
    const suggestedNormatives = this.getSuggestedNormatives(categoryResult.category, subcategory)

    return {
      category: categoryResult.category,
      subcategory,
      confidence: categoryResult.confidence,
      extractedEntities,
      suggestedNormatives,
    }
  }

  /**
   * Classify multiple texts
   */
  async classifyBatch(inputs: ClassificationInput[]): Promise<ClassificationResult[]> {
    return Promise.all(inputs.map((input) => this.classify(input)))
  }

  /**
   * Classify category using pattern matching and embeddings
   */
  private classifyCategory(text: string): { category: string; confidence: number } {
    const scores: { category: string; score: number }[] = []

    // Pattern matching scores
    for (const [category, patterns] of Object.entries(categoryPatterns)) {
      let patternScore = 0
      for (const pattern of patterns) {
        if (text.includes(pattern)) {
          patternScore += 1
        }
      }
      patternScore = patternScore / patterns.length
      scores.push({ category, score: patternScore * 0.6 }) // 60% weight to patterns
    }

    // Embedding similarity scores
    const textEmbedding = createTextEmbedding(text)
    for (const [category, embedding] of categoryEmbeddings) {
      const similarity = cosineSimilarity(textEmbedding, embedding)
      const existing = scores.find((s) => s.category === category)
      if (existing) {
        existing.score += similarity * 0.4 // 40% weight to embeddings
      }
    }

    // Find best match
    scores.sort((a, b) => b.score - a.score)
    const best = scores[0]

    // Calculate confidence
    const confidence = this.calculateConfidence(scores)

    // If confidence is too low, return 'general'
    if (confidence < this.config.confidenceThreshold && best.score < 0.3) {
      return { category: 'general', confidence: 0.5 }
    }

    return {
      category: best.category,
      confidence: Math.round(confidence * 100) / 100,
    }
  }

  /**
   * Classify subcategory
   */
  private classifySubcategory(text: string, category: string): string {
    const subcategories = subcategoryPatterns[category]
    if (!subcategories) return 'общая'

    let bestSubcategory = 'общая'
    let bestScore = 0

    for (const [subcategory, patterns] of Object.entries(subcategories)) {
      let score = 0
      for (const pattern of patterns) {
        if (text.includes(pattern)) {
          score += 1
        }
      }
      score = score / patterns.length

      if (score > bestScore) {
        bestScore = score
        bestSubcategory = subcategory
      }
    }

    return bestSubcategory
  }

  /**
   * Extract entities from text
   */
  private extractEntities(text: string): ExtractedEntities {
    const entities: ExtractedEntities = {}

    // Extract numeric entities
    const numericEntities = extractNumericEntities(text)
    Object.assign(entities, numericEntities)

    // Extract materials
    const materials = this.extractMaterials(text)
    if (materials.length > 0) {
      entities.materials = materials
    }

    // Extract work types
    const workTypes = this.extractWorkTypes(text)
    if (workTypes.length > 0) {
      entities.workTypes = workTypes
    }

    return entities
  }

  /**
   * Extract materials from text
   */
  private extractMaterials(text: string): string[] {
    const materialKeywords = [
      'гипсокартон',
      'ламинат',
      'линолеум',
      'плитка',
      'паркет',
      'обои',
      'краска',
      'штукатурка',
      'шпаклевка',
      'грунтовка',
      'цемент',
      'песок',
      'керамогранит',
      'мозаика',
      'провод',
      'кабель',
      'труба',
      'пенопласт',
      'минвата',
    ]

    const found: string[] = []
    for (const material of materialKeywords) {
      if (text.includes(material)) {
        found.push(material)
      }
    }

    return found
  }

  /**
   * Extract work types from text
   */
  private extractWorkTypes(text: string): string[] {
    const workKeywords = [
      'укладка',
      'монтаж',
      'демонтаж',
      'установка',
      'покраска',
      'штукатурка',
      'шпаклевка',
      'грунтовка',
      'облицовка',
      'утепление',
      'разводка',
      'прокладка',
    ]

    const found: string[] = []
    for (const work of workKeywords) {
      if (text.includes(work)) {
        found.push(work)
      }
    }

    return found
  }

  /**
   * Get suggested normatives based on classification
   */
  private getSuggestedNormatives(category: string, _subcategory: string): string[] {
    // This would be replaced with actual database queries in production
    const normativeHints: Record<string, string[]> = {
      plastering: ['ФЕР15-02-001', 'ФЕР15-02-002', 'ФЕР15-02-016'],
      painting: ['ФЕР15-04-001', 'ФЕР15-04-002', 'ФЕР15-04-025'],
      flooring: ['ФЕР11-01-001', 'ФЕР11-01-002', 'ФЕР11-01-036'],
      tiling: ['ФЕР11-01-027', 'ФЕР11-01-028', 'ФЕР11-01-034'],
      electrical: ['ФЕР08-01-001', 'ФЕР08-02-001', 'ФЕР08-03-001'],
      plumbing: ['ФЕР16-01-001', 'ФЕР16-02-001', 'ФЕР16-03-001'],
      drywall: ['ФЕР10-01-034', 'ФЕР10-01-035', 'ФЕР10-01-036'],
      demolition: ['ФЕР46-01-001', 'ФЕР46-01-002', 'ФЕР46-02-001'],
    }

    return normativeHints[category] || ['ФЕР01-01-001']
  }

  /**
   * Calculate classification confidence
   */
  private calculateConfidence(scores: { category: string; score: number }[]): number {
    if (scores.length < 2) return scores[0]?.score || 0

    const sorted = [...scores].sort((a, b) => b.score - a.score)
    const best = sorted[0].score
    const second = sorted[1].score

    // Higher gap between top scores = higher confidence
    const gap = best - second

    // Base confidence from best score
    let confidence = Math.min(1, best + gap * 0.5)

    // Penalize if best score is low
    if (best < 0.3) {
      confidence *= 0.7
    }

    return confidence
  }

  /**
   * Parse voice command
   */
  async parseVoiceCommand(command: string): Promise<{
    intent: 'add' | 'remove' | 'update' | 'calculate' | 'query' | 'unknown'
    classification: ClassificationResult
  }> {
    const intentResult = classifyIntent(command)
    const classification = await this.classify({ text: command })

    return {
      intent: intentResult.intent,
      classification,
    }
  }
}

// Export singleton instance
export const workClassifier = new WorkClassifier()
export default workClassifier
