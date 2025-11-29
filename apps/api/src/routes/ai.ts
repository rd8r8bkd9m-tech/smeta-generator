import { Router, type Request, type Response, type Router as RouterType } from 'express'
import { z } from 'zod'
import type { Prisma } from '@prisma/client'
import prisma from '../lib/prisma.js'
import { generateEstimate } from '../ai/flows/generateEstimate.flow.js'
import { normativesMatcher } from '../ai/services/normativesMatcher.js'
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
        error: 'AI service not configured',
        message: 'GOOGLE_AI_API_KEY environment variable is not set',
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

export default router
