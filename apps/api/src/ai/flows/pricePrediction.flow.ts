import { ai } from '../genkit.config.js'
import { z } from 'zod'
import type { PricePrediction, SmartRecommendation, MarketTrend } from '../schemas/assistant.schema.js'

const PricePredictionOutputSchema = z.object({
  predictions: z.array(z.object({
    itemId: z.string(),
    itemName: z.string(),
    currentPrice: z.number(),
    predictedPrice: z.number(),
    priceChange: z.number(),
    confidence: z.number(),
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
  })),
  marketTrends: z.array(z.object({
    category: z.string(),
    trend: z.enum(['rising', 'falling', 'stable']),
    changePercent: z.number(),
    period: z.string(),
    forecast: z.enum(['up', 'down', 'stable']),
    forecastPeriod: z.string(),
    reasons: z.array(z.string()),
    affectedItems: z.array(z.object({
      name: z.string(),
      currentPrice: z.number(),
      expectedChange: z.number(),
    })),
  })),
})

/**
 * Predict future prices based on market data, region, and season
 */
export const predictPrices = ai.defineFlow(
  {
    name: 'predictPrices',
    inputSchema: z.object({
      items: z.array(z.object({
        id: z.string(),
        name: z.string(),
        category: z.string(),
        currentPrice: z.number(),
        unit: z.string(),
      })),
      region: z.string().optional(),
      forecastMonths: z.number().optional().default(3),
    }),
    outputSchema: PricePredictionOutputSchema,
  },
  async (input) => {
    const currentDate = new Date()
    const currentMonth = currentDate.toLocaleString('ru-RU', { month: 'long' })
    const currentSeason = getSeason(currentDate.getMonth())

    const prompt = `Ты эксперт по ценообразованию в строительной отрасли России.

Проанализируй следующие позиции и дай прогноз изменения цен на ${input.forecastMonths} месяца вперед.

Текущая дата: ${currentDate.toISOString().split('T')[0]}
Месяц: ${currentMonth}
Сезон: ${currentSeason}
${input.region ? `Регион: ${input.region}` : 'Регион: Россия (среднее)'}

Позиции для анализа:
${input.items.map(item => `- ${item.name} (${item.category}): ${item.currentPrice} ₽/${item.unit}`).join('\n')}

Учитывай следующие факторы:
1. Сезонность (зимой строительные материалы могут быть дешевле)
2. Курс валют (для импортных материалов)
3. Спрос (весна-лето - пик ремонтов)
4. Логистика (удаленность региона)
5. Инфляция
6. Рыночные тренды

Для каждой позиции укажи:
- Прогнозируемую цену
- Процент изменения
- Уверенность в прогнозе (0-100)
- Факторы влияния
- Помесячный прогноз

Также дай общие рыночные тренды по категориям.

Ответь в формате JSON.`

    try {
      const response = await ai.generate({
        model: 'googleai/gemini-1.5-flash',
        prompt,
        output: { schema: PricePredictionOutputSchema },
      })

      return response.output || { predictions: [], marketTrends: [] }
    } catch (error) {
      console.error('Error predicting prices:', error)
      // Return fallback predictions based on simple rules
      return generateFallbackPredictions(input.items, input.forecastMonths || 3)
    }
  }
)

const RecommendationOutputSchema = z.object({
  recommendations: z.array(z.object({
    type: z.enum(['similar_project', 'cost_saving', 'quality_upgrade', 'seasonal', 'regional']),
    title: z.string(),
    description: z.string(),
    confidence: z.number(),
    savings: z.number().optional(),
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
  })),
})

/**
 * Generate smart recommendations based on project context
 */
export const generateRecommendations = ai.defineFlow(
  {
    name: 'generateRecommendations',
    inputSchema: z.object({
      projectType: z.string(),
      totalArea: z.number(),
      rooms: z.array(z.string()).optional(),
      currentItems: z.array(z.object({
        name: z.string(),
        category: z.string(),
        price: z.number(),
      })).optional(),
      budget: z.number().optional(),
      region: z.string().optional(),
      preferences: z.array(z.string()).optional(), // e.g., ['eco-friendly', 'budget', 'premium']
    }),
    outputSchema: RecommendationOutputSchema,
  },
  async (input) => {
    const currentMonth = new Date().getMonth()
    const currentSeason = getSeason(currentMonth)

    const prompt = `Ты AI-консультант по ремонту и строительству в системе "ДениДом".

Проанализируй проект и дай умные рекомендации для оптимизации сметы.

Проект:
- Тип: ${input.projectType}
- Площадь: ${input.totalArea} м²
${input.rooms ? `- Комнаты: ${input.rooms.join(', ')}` : ''}
${input.budget ? `- Бюджет: ${input.budget.toLocaleString('ru-RU')} ₽` : ''}
${input.region ? `- Регион: ${input.region}` : ''}
${input.preferences ? `- Предпочтения: ${input.preferences.join(', ')}` : ''}

${input.currentItems ? `Текущие позиции:
${input.currentItems.map(i => `- ${i.name}: ${i.price} ₽`).join('\n')}` : ''}

Текущий сезон: ${currentSeason}

Дай рекомендации следующих типов:
1. similar_project - На основе похожих проектов ("В квартирах такого типа обычно...")
2. cost_saving - Экономия без потери качества
3. quality_upgrade - Улучшение качества в рамках бюджета
4. seasonal - Сезонные рекомендации ("Сейчас выгодно закупить...")
5. regional - Региональные особенности

Для каждой рекомендации укажи:
- Заголовок
- Описание
- Уверенность (0-100)
- Потенциальную экономию (если применимо)
- Конкретные позиции для замены (если есть)

Ответь в формате JSON.`

    try {
      const response = await ai.generate({
        model: 'googleai/gemini-1.5-flash',
        prompt,
        output: { schema: RecommendationOutputSchema },
      })

      return response.output || { recommendations: [] }
    } catch (error) {
      console.error('Error generating recommendations:', error)
      return generateFallbackRecommendations(input)
    }
  }
)

// Helper functions

function getSeason(month: number): string {
  if (month >= 2 && month <= 4) return 'весна'
  if (month >= 5 && month <= 7) return 'лето'
  if (month >= 8 && month <= 10) return 'осень'
  return 'зима'
}

function generateFallbackPredictions(
  items: Array<{ id: string; name: string; category: string; currentPrice: number; unit: string }>,
  forecastMonths: number
): { predictions: PricePrediction[]; marketTrends: MarketTrend[] } {
  const currentMonth = new Date().getMonth()
  const season = getSeason(currentMonth)
  
  // Seasonal multipliers
  const seasonalMultipliers: Record<string, number> = {
    'весна': 1.05, // Prices rise in spring
    'лето': 1.08,  // Peak season
    'осень': 1.02, // Slight increase
    'зима': 0.98,  // Lower demand
  }

  const predictions: PricePrediction[] = items.map(item => {
    const baseMultiplier = seasonalMultipliers[season]
    const inflationFactor = 1.05 // 5% annual inflation estimate
    const monthlyInflation = Math.pow(inflationFactor, forecastMonths / 12)
    
    const predictedPrice = Math.round(item.currentPrice * baseMultiplier * monthlyInflation)
    const priceChange = ((predictedPrice - item.currentPrice) / item.currentPrice) * 100

    const forecast = []
    for (let i = 1; i <= forecastMonths; i++) {
      const date = new Date()
      date.setMonth(date.getMonth() + i)
      const monthInflation = Math.pow(inflationFactor, i / 12)
      forecast.push({
        date: date.toISOString().split('T')[0],
        price: Math.round(item.currentPrice * monthInflation),
        confidence: Math.max(50, 85 - i * 5),
      })
    }

    return {
      itemId: item.id,
      itemName: item.name,
      currentPrice: item.currentPrice,
      predictedPrice,
      priceChange: Math.round(priceChange * 10) / 10,
      confidence: 65,
      factors: [
        {
          factor: 'Сезонность',
          impact: baseMultiplier > 1 ? 'negative' as const : 'positive' as const,
          weight: 0.3,
          description: `${season} - ${baseMultiplier > 1 ? 'повышенный спрос' : 'низкий спрос'}`,
        },
        {
          factor: 'Инфляция',
          impact: 'negative' as const,
          weight: 0.4,
          description: 'Общий рост цен в экономике',
        },
      ],
      forecast,
      season,
    }
  })

  const marketTrends: MarketTrend[] = [
    {
      category: 'Строительные материалы',
      trend: 'rising',
      changePercent: 5,
      period: 'last_quarter',
      forecast: 'up',
      forecastPeriod: '3_months',
      reasons: ['Сезонный спрос', 'Рост стоимости логистики'],
      affectedItems: [],
    },
  ]

  return { predictions, marketTrends }
}

function generateFallbackRecommendations(input: {
  projectType: string
  totalArea: number
  budget?: number
}): { recommendations: SmartRecommendation[] } {
  const recommendations: SmartRecommendation[] = [
    {
      type: 'similar_project',
      title: 'Типичный ремонт для вашего проекта',
      description: `В ${input.projectType === 'apartment' ? 'квартирах' : 'помещениях'} площадью ${input.totalArea} м² обычно выполняют стандартный набор работ: выравнивание стен, укладка полов, покраска потолков.`,
      confidence: 75,
      basedOn: {
        similarProjects: 150,
        projectType: input.projectType,
      },
    },
    {
      type: 'seasonal',
      title: 'Сезонная рекомендация',
      description: 'Закупайте материалы заранее — в сезон цены вырастают на 10-15%.',
      confidence: 80,
      savings: input.budget ? Math.round(input.budget * 0.1) : undefined,
      basedOn: {
        season: getSeason(new Date().getMonth()),
      },
    },
  ]

  return { recommendations }
}

export type { PricePrediction, SmartRecommendation, MarketTrend }
