/**
 * Text embeddings utilities for NLP tasks
 */

// Common construction-related vocabulary for embeddings
export const constructionVocabulary = [
  // Work types
  'штукатурка',
  'шпаклевка',
  'покраска',
  'окраска',
  'грунтовка',
  'укладка',
  'монтаж',
  'демонтаж',
  'установка',
  'разборка',
  'облицовка',
  'утепление',
  'гидроизоляция',
  'звукоизоляция',
  'проводка',
  'разводка',

  // Materials
  'гипсокартон',
  'ламинат',
  'линолеум',
  'плитка',
  'керамогранит',
  'паркет',
  'обои',
  'краска',
  'штукатурка',
  'шпаклевка',
  'грунт',
  'клей',
  'затирка',
  'подложка',

  // Surfaces
  'стена',
  'стены',
  'потолок',
  'потолки',
  'пол',
  'полы',
  'перегородка',
  'откос',
  'ниша',
  'короб',

  // Rooms
  'комната',
  'кухня',
  'ванная',
  'туалет',
  'санузел',
  'прихожая',
  'коридор',
  'балкон',
  'лоджия',
  'спальня',
  'гостиная',
  'кабинет',

  // Measurements
  'метр',
  'квадратный',
  'кубический',
  'погонный',
  'штука',
  'комплект',
  'слой',

  // Quality
  'простой',
  'улучшенный',
  'высококачественный',
  'машинный',
  'ручной',

  // Actions
  'выровнять',
  'подготовить',
  'загрунтовать',
  'оштукатурить',
  'зашпаклевать',
  'покрасить',
  'уложить',
  'установить',
  'смонтировать',
]

/**
 * Simple TF-IDF calculation for text
 */
export function calculateTfIdf(
  text: string,
  documentFrequencies: Map<string, number>,
  totalDocuments: number
): Map<string, number> {
  const words = text.toLowerCase().split(/\s+/)
  const tf = new Map<string, number>()
  const tfidf = new Map<string, number>()

  // Calculate term frequency
  for (const word of words) {
    tf.set(word, (tf.get(word) || 0) + 1)
  }

  // Normalize TF and calculate TF-IDF
  const maxTf = Math.max(...tf.values())
  for (const [word, count] of tf) {
    const normalizedTf = count / maxTf
    const df = documentFrequencies.get(word) || 1
    const idf = Math.log(totalDocuments / df)
    tfidf.set(word, normalizedTf * idf)
  }

  return tfidf
}

/**
 * Create a simple embedding vector from text
 * Uses vocabulary-based approach with position weighting
 */
export function createTextEmbedding(text: string, embeddingSize: number = 64): number[] {
  const normalized = text.toLowerCase()
  const embedding = new Array(embeddingSize).fill(0)

  // Hash each word to a position in the embedding
  const words = normalized.split(/\s+/)
  for (let i = 0; i < words.length; i++) {
    const word = words[i]
    const hash = simpleHash(word)
    const position = hash % embeddingSize

    // Weight by position in text (earlier words get more weight)
    const positionWeight = 1 / (1 + i * 0.1)

    // Add to embedding with vocabulary boost
    const vocabBoost = constructionVocabulary.some((v) => word.includes(v) || v.includes(word)) ? 2 : 1

    embedding[position] += positionWeight * vocabBoost
  }

  // Normalize embedding
  const magnitude = Math.sqrt(embedding.reduce((sum, v) => sum + v * v, 0))
  if (magnitude > 0) {
    for (let i = 0; i < embedding.length; i++) {
      embedding[i] /= magnitude
    }
  }

  return embedding
}

/**
 * Simple hash function for strings
 */
function simpleHash(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash)
}

/**
 * Calculate cosine similarity between two vectors
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0

  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }

  const magnitude = Math.sqrt(normA) * Math.sqrt(normB)
  return magnitude === 0 ? 0 : dotProduct / magnitude
}

/**
 * Calculate Euclidean distance between two vectors
 */
export function euclideanDistance(a: number[], b: number[]): number {
  if (a.length !== b.length) return Infinity

  let sum = 0
  for (let i = 0; i < a.length; i++) {
    sum += Math.pow(a[i] - b[i], 2)
  }

  return Math.sqrt(sum)
}

/**
 * Find k most similar items to a query
 */
export function findMostSimilar<T>(
  query: number[],
  items: { item: T; embedding: number[] }[],
  k: number = 5
): { item: T; similarity: number }[] {
  const similarities = items.map(({ item, embedding }) => ({
    item,
    similarity: cosineSimilarity(query, embedding),
  }))

  return similarities.sort((a, b) => b.similarity - a.similarity).slice(0, k)
}

/**
 * Extract keywords from text
 */
export function extractKeywords(text: string, maxKeywords: number = 10): string[] {
  const normalized = text.toLowerCase()
  const words = normalized.split(/\s+/).filter((w) => w.length > 2)

  // Filter to construction vocabulary matches
  const matches = words.filter(
    (word) =>
      constructionVocabulary.some((v) => word.includes(v) || v.includes(word)) ||
      // Also include words with numbers (measurements)
      /\d/.test(word)
  )

  // Remove duplicates and limit
  return [...new Set(matches)].slice(0, maxKeywords)
}

/**
 * Simple intent classification based on keywords
 */
export function classifyIntent(
  text: string
): {
  intent: 'add' | 'remove' | 'update' | 'calculate' | 'query' | 'unknown'
  confidence: number
} {
  const normalized = text.toLowerCase()

  const intents: Record<string, string[]> = {
    add: ['добавить', 'добавь', 'включить', 'внести', 'новый', 'создать'],
    remove: ['удалить', 'удали', 'убрать', 'убери', 'исключить'],
    update: ['изменить', 'измени', 'обновить', 'обнови', 'заменить', 'поменять'],
    calculate: ['посчитать', 'посчитай', 'рассчитать', 'подсчитать', 'сколько', 'итого'],
    query: ['показать', 'покажи', 'найти', 'найди', 'поиск', 'список', 'какой', 'что'],
  }

  let bestIntent: 'add' | 'remove' | 'update' | 'calculate' | 'query' | 'unknown' = 'unknown'
  let bestScore = 0

  for (const [intent, keywords] of Object.entries(intents)) {
    const matches = keywords.filter((k) => normalized.includes(k)).length
    const score = matches / keywords.length
    if (score > bestScore) {
      bestScore = score
      bestIntent = intent as 'add' | 'remove' | 'update' | 'calculate' | 'query'
    }
  }

  return {
    intent: bestIntent,
    confidence: Math.min(1, bestScore * 2), // Scale up confidence
  }
}

/**
 * Extract numeric entities from text
 */
export function extractNumericEntities(text: string): {
  area?: number
  quantity?: number
  dimensions?: { length?: number; width?: number; height?: number }
} {
  const result: {
    area?: number
    quantity?: number
    dimensions?: { length?: number; width?: number; height?: number }
  } = {}

  // Extract area (м², кв.м, etc.)
  const areaMatch = text.match(/(\d+(?:[.,]\d+)?)\s*(?:м²|м2|кв\.?\s*м)/i)
  if (areaMatch) {
    result.area = parseFloat(areaMatch[1].replace(',', '.'))
  }

  // Extract quantity (шт, штук)
  const qtyMatch = text.match(/(\d+)\s*(?:шт|штук)/i)
  if (qtyMatch) {
    result.quantity = parseInt(qtyMatch[1], 10)
  }

  // Extract dimensions (e.g., 3x4 метра, 3 на 4)
  const dimMatch = text.match(/(\d+(?:[.,]\d+)?)\s*(?:x|х|на)\s*(\d+(?:[.,]\d+)?)/i)
  if (dimMatch) {
    result.dimensions = {
      length: parseFloat(dimMatch[1].replace(',', '.')),
      width: parseFloat(dimMatch[2].replace(',', '.')),
    }
  }

  // Extract height
  const heightMatch = text.match(/высот[аы]?\s*(?::|-)?\s*(\d+(?:[.,]\d+)?)/i)
  if (heightMatch) {
    result.dimensions = result.dimensions || {}
    result.dimensions.height = parseFloat(heightMatch[1].replace(',', '.'))
  }

  return result
}
