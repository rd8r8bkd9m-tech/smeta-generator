import { Router, type Request, type Response, type Router as RouterType } from 'express'
import { z } from 'zod'
import type { Prisma } from '@prisma/client'
import prisma from '../lib/prisma.js'
import { generateEstimate } from '../ai/flows/generateEstimate.flow.js'
import { normativesMatcher } from '../ai/services/normativesMatcher.js'
import { parseVoiceCommand, parseVoiceCommandLocal } from '../ai/flows/voiceCommand.flow.js'
import { analyzeBlueprint, analyzeRoomsManually } from '../ai/flows/blueprintAnalysis.flow.js'
import { predictPrices, generateRecommendations } from '../ai/flows/pricePrediction.flow.js'
import {
  GenerateEstimateRequestSchema,
  CustomPriceRequestSchema,
  ImportCommercialPricesRequestSchema,
} from '../ai/schemas/estimate.schema.js'

const router: RouterType = Router()

// POST /api/ai/generate - Generate estimate from text description
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const validatedInput = GenerateEstimateRequestSchema.parse(req.body)

    // Check if GOOGLE_AI_API_KEY is configured
    if (!process.env.GOOGLE_AI_API_KEY) {
      return res.status(503).json({
        error: 'AI service unavailable',
        message: 'AI generation service is not configured. Please contact support.',
      })
    }

    const result = await generateEstimate(validatedInput)

    res.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error('Error generating estimate:', error)

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors,
      })
    }

    res.status(500).json({
      error: 'Failed to generate estimate',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

// GET /api/ai/normatives/search - Search normatives
router.get('/normatives/search', async (req: Request, res: Response) => {
  try {
    const {
      q: query,
      type,
      category,
      limit,
      includeCommercial,
      userId,
      region,
    } = req.query

    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        error: 'Query parameter "q" is required',
      })
    }

    const normatives = await normativesMatcher.searchNormatives(query, {
      type: type as string | undefined,
      category: category as string | undefined,
      limit: limit ? parseInt(String(limit), 10) : 20,
      includeCommercial: includeCommercial === 'true',
      userId: userId as string | undefined,
      region: region as string | undefined,
    })

    res.json({
      success: true,
      data: normatives,
      count: normatives.length,
    })
  } catch (error) {
    console.error('Error searching normatives:', error)
    res.status(500).json({
      error: 'Failed to search normatives',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

// POST /api/ai/prices/custom - Save custom price
router.post('/prices/custom', async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string

    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User ID is required',
      })
    }

    const validatedInput = CustomPriceRequestSchema.parse(req.body)

    // Check if normative exists if normativeId is provided
    if (validatedInput.normativeId) {
      const normative = await prisma.normative.findUnique({
        where: { id: validatedInput.normativeId },
      })
      if (!normative) {
        return res.status(404).json({
          error: 'Normative not found',
        })
      }
    }

    // Upsert custom price
    const customPrice = await prisma.customPrice.upsert({
      where: validatedInput.normativeId
        ? { userId_normativeId: { userId, normativeId: validatedInput.normativeId } }
        : { userId_code: { userId, code: validatedInput.code || '' } },
      update: {
        name: validatedInput.name,
        unit: validatedInput.unit,
        category: validatedInput.category,
        price: validatedInput.price,
        notes: validatedInput.notes,
      },
      create: {
        userId,
        normativeId: validatedInput.normativeId,
        code: validatedInput.code,
        name: validatedInput.name,
        unit: validatedInput.unit,
        category: validatedInput.category,
        price: validatedInput.price,
        notes: validatedInput.notes,
      },
    })

    res.status(201).json({
      success: true,
      data: customPrice,
    })
  } catch (error) {
    console.error('Error saving custom price:', error)

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors,
      })
    }

    res.status(500).json({
      error: 'Failed to save custom price',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

// GET /api/ai/prices/custom - Get user's custom prices
router.get('/prices/custom', async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string

    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User ID is required',
      })
    }

    const { category, search } = req.query

    const where: Prisma.CustomPriceWhereInput = { userId }

    if (category) {
      where.category = String(category)
    }

    if (search) {
      where.OR = [
        { name: { contains: String(search), mode: 'insensitive' } },
        { code: { contains: String(search), mode: 'insensitive' } },
      ]
    }

    const customPrices = await prisma.customPrice.findMany({
      where,
      include: {
        normative: {
          select: {
            id: true,
            code: true,
            name: true,
            unit: true,
            price: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    })

    res.json({
      success: true,
      data: customPrices,
      count: customPrices.length,
    })
  } catch (error) {
    console.error('Error fetching custom prices:', error)
    res.status(500).json({
      error: 'Failed to fetch custom prices',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

// DELETE /api/ai/prices/custom/:id - Delete custom price
router.delete('/prices/custom/:id', async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string
    const { id } = req.params

    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User ID is required',
      })
    }

    const customPrice = await prisma.customPrice.findFirst({
      where: { id, userId },
    })

    if (!customPrice) {
      return res.status(404).json({
        error: 'Custom price not found',
      })
    }

    await prisma.customPrice.delete({
      where: { id },
    })

    res.status(204).send()
  } catch (error) {
    console.error('Error deleting custom price:', error)
    res.status(500).json({
      error: 'Failed to delete custom price',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

// POST /api/ai/prices/import - Import commercial prices (admin only)
router.post('/prices/import', async (req: Request, res: Response) => {
  try {
    const validatedInput = ImportCommercialPricesRequestSchema.parse(req.body)

    const results = await Promise.all(
      validatedInput.prices.map(async (priceData) => {
        const data: Prisma.CommercialPriceCreateInput = {
          name: priceData.name,
          unit: priceData.unit,
          price: priceData.price,
          code: priceData.code,
          category: priceData.category,
          minPrice: priceData.minPrice,
          maxPrice: priceData.maxPrice,
          costPrice: priceData.costPrice,
          marginPercent: priceData.marginPercent,
          region: priceData.region,
          source: priceData.source,
          notes: priceData.notes,
        }

        if (priceData.normativeId) {
          data.normative = { connect: { id: priceData.normativeId } }
        }

        return prisma.commercialPrice.create({ data })
      })
    )

    res.status(201).json({
      success: true,
      data: results,
      count: results.length,
    })
  } catch (error) {
    console.error('Error importing commercial prices:', error)

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors,
      })
    }

    res.status(500).json({
      error: 'Failed to import commercial prices',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

// GET /api/ai/prices/commercial - Get commercial prices
router.get('/prices/commercial', async (req: Request, res: Response) => {
  try {
    const { category, region, search, limit } = req.query

    const where: Prisma.CommercialPriceWhereInput = {
      isActive: true,
    }

    if (category) {
      where.category = String(category)
    }

    if (region) {
      where.region = String(region)
    }

    if (search) {
      where.OR = [
        { name: { contains: String(search), mode: 'insensitive' } },
        { code: { contains: String(search), mode: 'insensitive' } },
      ]
    }

    const commercialPrices = await prisma.commercialPrice.findMany({
      where,
      include: {
        normative: {
          select: {
            id: true,
            code: true,
            name: true,
            unit: true,
            price: true,
          },
        },
      },
      orderBy: { name: 'asc' },
      take: limit ? parseInt(String(limit), 10) : 100,
    })

    res.json({
      success: true,
      data: commercialPrices,
      count: commercialPrices.length,
    })
  } catch (error) {
    console.error('Error fetching commercial prices:', error)
    res.status(500).json({
      error: 'Failed to fetch commercial prices',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

// =====================================================
// AI ASSISTANT ENDPOINTS (Enhanced Features)
// =====================================================

// POST /api/ai/voice/parse - Parse voice command
router.post('/voice/parse', async (req: Request, res: Response) => {
  try {
    const { command, context, useAI } = req.body

    if (!command || typeof command !== 'string') {
      return res.status(400).json({
        error: 'Command is required',
      })
    }

    let parsedCommand

    // Use AI parsing if available and requested
    if (useAI && process.env.GOOGLE_AI_API_KEY) {
      try {
        parsedCommand = await parseVoiceCommand({ command, context })
      } catch (aiError) {
        console.warn('AI parsing failed, falling back to local parsing:', aiError)
        parsedCommand = parseVoiceCommandLocal(command)
      }
    } else {
      // Use local pattern matching
      parsedCommand = parseVoiceCommandLocal(command)
    }

    res.json({
      success: true,
      data: parsedCommand,
    })
  } catch (error) {
    console.error('Error parsing voice command:', error)
    res.status(500).json({
      error: 'Failed to parse voice command',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

// POST /api/ai/blueprint/analyze - Analyze blueprint/plan image
router.post('/blueprint/analyze', async (req: Request, res: Response) => {
  try {
    const { imageBase64, imageType, projectType, includeWorkSuggestions, manualRooms } = req.body

    // If manual rooms provided, use local analysis
    if (manualRooms && Array.isArray(manualRooms)) {
      const analysis = analyzeRoomsManually(manualRooms)
      return res.json({
        success: true,
        data: analysis,
        source: 'manual',
      })
    }

    // Check if image is provided for AI analysis
    if (!imageBase64) {
      return res.status(400).json({
        error: 'Image (imageBase64) or manualRooms is required',
      })
    }

    // Validate base64 image size (max 10MB)
    const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10MB
    const imageSize = Buffer.byteLength(imageBase64, 'base64')
    if (imageSize > MAX_IMAGE_SIZE) {
      return res.status(400).json({
        error: 'Image too large',
        message: 'Maximum image size is 10MB',
      })
    }

    // Validate image type
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (imageType && !ALLOWED_TYPES.includes(imageType)) {
      return res.status(400).json({
        error: 'Invalid image type',
        message: 'Allowed types: JPEG, PNG, WebP, GIF',
      })
    }

    // Check if AI is configured
    if (!process.env.GOOGLE_AI_API_KEY) {
      return res.status(503).json({
        error: 'AI service unavailable',
        message: 'Blueprint analysis requires AI service. Please provide manualRooms instead.',
      })
    }

    const analysis = await analyzeBlueprint({
      imageBase64,
      imageType,
      projectType,
      includeWorkSuggestions: includeWorkSuggestions !== false,
    })

    res.json({
      success: true,
      data: analysis,
      source: 'ai',
    })
  } catch (error) {
    console.error('Error analyzing blueprint:', error)
    res.status(500).json({
      error: 'Failed to analyze blueprint',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

// POST /api/ai/prices/predict - Predict future prices
router.post('/prices/predict', async (req: Request, res: Response) => {
  try {
    const { items, region, forecastMonths } = req.body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: 'Items array is required',
      })
    }

    // Validate items structure
    const validatedItems = items.map((item: Record<string, unknown>) => ({
      id: String(item.id || ''),
      name: String(item.name || ''),
      category: String(item.category || 'general'),
      currentPrice: Number(item.currentPrice || item.price || 0),
      unit: String(item.unit || 'шт'),
    }))

    const predictions = await predictPrices({
      items: validatedItems,
      region,
      forecastMonths: forecastMonths || 3,
    })

    res.json({
      success: true,
      data: predictions,
    })
  } catch (error) {
    console.error('Error predicting prices:', error)
    res.status(500).json({
      error: 'Failed to predict prices',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

// POST /api/ai/recommendations - Get smart recommendations
router.post('/recommendations', async (req: Request, res: Response) => {
  try {
    const { projectType, totalArea, rooms, currentItems, budget, region, preferences } = req.body

    if (!projectType || !totalArea) {
      return res.status(400).json({
        error: 'projectType and totalArea are required',
      })
    }

    const recommendations = await generateRecommendations({
      projectType,
      totalArea: Number(totalArea),
      rooms,
      currentItems,
      budget: budget ? Number(budget) : undefined,
      region,
      preferences,
    })

    res.json({
      success: true,
      data: recommendations,
    })
  } catch (error) {
    console.error('Error generating recommendations:', error)
    res.status(500).json({
      error: 'Failed to generate recommendations',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

// GET /api/ai/market/trends - Get market trends
router.get('/market/trends', async (_req: Request, res: Response) => {
  try {
    // Return cached/static market trends data
    // In production, this would fetch from a real data source
    const trends = getMarketTrends()

    res.json({
      success: true,
      data: trends,
      updatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error fetching market trends:', error)
    res.status(500).json({
      error: 'Failed to fetch market trends',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

// GET /api/ai/regions - Get regional price data
router.get('/regions', async (_req: Request, res: Response) => {
  try {
    const regions = getRegionalData()

    res.json({
      success: true,
      data: regions,
    })
  } catch (error) {
    console.error('Error fetching regional data:', error)
    res.status(500).json({
      error: 'Failed to fetch regional data',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

// Helper function: Get market trends
function getMarketTrends() {
  const currentMonth = new Date().getMonth()
  const season = currentMonth >= 2 && currentMonth <= 4 ? 'весна' :
                 currentMonth >= 5 && currentMonth <= 7 ? 'лето' :
                 currentMonth >= 8 && currentMonth <= 10 ? 'осень' : 'зима'

  return {
    season,
    trends: [
      {
        category: 'Строительные смеси',
        trend: 'rising' as const,
        changePercent: 8,
        period: 'last_quarter',
        forecast: 'up' as const,
        forecastPeriod: '3_months',
        reasons: ['Рост стоимости логистики', 'Сезонный спрос'],
        affectedItems: [
          { name: 'Цемент М500', currentPrice: 450, expectedChange: 5 },
          { name: 'Штукатурка гипсовая', currentPrice: 380, expectedChange: 7 },
        ],
      },
      {
        category: 'Напольные покрытия',
        trend: 'stable' as const,
        changePercent: 2,
        period: 'last_quarter',
        forecast: 'stable' as const,
        forecastPeriod: '3_months',
        reasons: ['Стабильный спрос', 'Достаточные запасы'],
        affectedItems: [
          { name: 'Ламинат 32 класс', currentPrice: 850, expectedChange: 2 },
          { name: 'Линолеум бытовой', currentPrice: 450, expectedChange: 1 },
        ],
      },
      {
        category: 'Сантехника',
        trend: 'falling' as const,
        changePercent: -3,
        period: 'last_quarter',
        forecast: 'stable' as const,
        forecastPeriod: '3_months',
        reasons: ['Снижение спроса в несезон', 'Распродажи'],
        affectedItems: [
          { name: 'Унитаз компакт', currentPrice: 8500, expectedChange: -2 },
          { name: 'Смеситель для ванны', currentPrice: 4500, expectedChange: -3 },
        ],
      },
    ],
    insights: [
      {
        type: 'seasonal',
        message: season === 'зима' 
          ? 'Сейчас выгодное время для закупки материалов — цены ниже на 5-10%'
          : 'Пик сезона ремонтов — ожидается рост цен на материалы',
        priority: 'high',
      },
      {
        type: 'forecast',
        message: 'Прогноз: цены на металлопрокат вырастут на 10-12% в следующем квартале',
        priority: 'medium',
      },
    ],
  }
}

// Helper function: Get regional price data
function getRegionalData() {
  return [
    {
      region: 'moscow',
      regionName: 'Москва',
      priceMultiplier: 1.0,
      averageWage: 75000,
      materialCostIndex: 1.0,
      seasonalFactors: [
        { month: 1, factor: 0.95, description: 'Низкий сезон' },
        { month: 4, factor: 1.05, description: 'Начало сезона' },
        { month: 7, factor: 1.10, description: 'Пик сезона' },
        { month: 10, factor: 1.0, description: 'Конец сезона' },
      ],
    },
    {
      region: 'spb',
      regionName: 'Санкт-Петербург',
      priceMultiplier: 0.95,
      averageWage: 65000,
      materialCostIndex: 0.98,
      seasonalFactors: [
        { month: 1, factor: 0.92, description: 'Низкий сезон' },
        { month: 5, factor: 1.08, description: 'Начало сезона' },
        { month: 8, factor: 1.05, description: 'Пик сезона' },
      ],
    },
    {
      region: 'krasnodar',
      regionName: 'Краснодар',
      priceMultiplier: 0.85,
      averageWage: 45000,
      materialCostIndex: 0.90,
      seasonalFactors: [
        { month: 1, factor: 1.0, description: 'Активный сезон (теплая зима)' },
        { month: 7, factor: 0.95, description: 'Жара - снижение активности' },
      ],
    },
    {
      region: 'novosibirsk',
      regionName: 'Новосибирск',
      priceMultiplier: 0.80,
      averageWage: 50000,
      materialCostIndex: 0.88,
      seasonalFactors: [
        { month: 1, factor: 0.85, description: 'Холода - сложная логистика' },
        { month: 6, factor: 1.10, description: 'Короткий сезон - высокий спрос' },
      ],
    },
    {
      region: 'kazan',
      regionName: 'Казань',
      priceMultiplier: 0.82,
      averageWage: 48000,
      materialCostIndex: 0.85,
      seasonalFactors: [],
    },
  ]
}

export default router
