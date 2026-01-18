import { Router, type Router as RouterType } from 'express'
import { z } from 'zod'
import type { Prisma } from '@prisma/client'
import prisma from '../lib/prisma.js'
import { getOrCreateDemoUser } from '../lib/demoUser.js'

const router: RouterType = Router()

async function updateProjectTotal(projectId: string) {
  const estimates = await prisma.estimate.findMany({
    where: { projectId },
    select: { total: true },
  })
  const totalAmount = estimates.reduce((sum, est) => sum + (est.total || 0), 0)
  await prisma.project.update({
    where: { id: projectId },
    data: { totalAmount },
  })
}

/**
 * @openapi
 * tags:
 *   name: Calculator
 *   description: Управление расчетами и сметами
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     CalculateItem:
 *       type: object
 *       required: [id, name, unit, quantity, price]
 *       properties:
 *         id: { type: string }
 *         name: { type: string }
 *         unit: { type: string }
 *         quantity: { type: number }
 *         price: { type: number }
 *         coefficient: { type: number }
 */

// Validation schemas
const CalculateItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  unit: z.string(),
  quantity: z.number().min(0),
  price: z.number().min(0),
  coefficient: z.number().optional(),
})

const CalculateRequestSchema = z.object({
  items: z.array(CalculateItemSchema),
  options: z.object({
    overheadRate: z.number().min(0).max(1).optional(),
    profitRate: z.number().min(0).max(1).optional(),
    vatRate: z.number().min(0).max(1).optional(),
    includeVat: z.boolean().optional(),
  }).optional(),
})

/**
 * @openapi
 * /api/calculator/calculate:
 *   post:
 *     summary: Рассчитать смету
 *     tags: [Calculator]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/CalculateItem'
 *     responses:
 *       200:
 *         description: Результаты расчета
 */
// Calculate estimate
router.post('/calculate', async (req, res) => {
  try {
    const { items, options } = CalculateRequestSchema.parse(req.body)
    
    const defaultOptions = {
      overheadRate: 0.12,
      profitRate: 0.08,
      vatRate: 0.20,
      includeVat: true,
      ...options,
    }

    // Calculate subtotal
    const subtotal = items.reduce((sum, item) => {
      const coefficient = item.coefficient || 1
      return sum + item.quantity * item.price * coefficient
    }, 0)

    // Calculate overhead and profit
    const overhead = subtotal * defaultOptions.overheadRate
    const profit = (subtotal + overhead) * defaultOptions.profitRate
    
    // Calculate total with VAT
    let total = subtotal + overhead + profit
    if (defaultOptions.includeVat) {
      total = total * (1 + defaultOptions.vatRate)
    }

    res.json({
      items,
      subtotal: Math.round(subtotal * 100) / 100,
      overhead: Math.round(overhead * 100) / 100,
      profit: Math.round(profit * 100) / 100,
      total: Math.round(total * 100) / 100,
      options: defaultOptions,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors })
    }
    throw error
  }
})

// Get templates
router.get('/templates', async (_req, res) => {
  const templates = [
    {
      id: 'renovation-basic',
      name: 'Базовый ремонт квартиры',
      description: 'Шаблон для типового ремонта квартиры, включая демонтаж, штукатурку и отделку.',
      category: 'Жилая недвижимость',
      items: [
        { id: 'work-1', name: 'Демонтаж старых покрытий', unit: 'м²', price: 150 },
        { id: 'work-2', name: 'Штукатурка стен', unit: 'м²', price: 450 },
        { id: 'work-3', name: 'Шпаклевка стен', unit: 'м²', price: 280 },
        { id: 'work-4', name: 'Покраска стен', unit: 'м²', price: 180 },
        { id: 'work-5', name: 'Укладка ламината', unit: 'м²', price: 350 },
      ],
    },
    {
      id: 'renovation-premium',
      name: 'Премиум ремонт квартиры',
      description: 'Высококачественный ремонт с использованием премиальных материалов и сложных технологий.',
      category: 'Жилая недвижимость',
      items: [
        { id: 'work-1', name: 'Демонтаж старых покрытий', unit: 'м²', price: 200 },
        { id: 'work-2', name: 'Выравнивание стен (штукатурка по маякам)', unit: 'м²', price: 650 },
        { id: 'work-3', name: 'Шпаклевка стен под покраску', unit: 'м²', price: 380 },
        { id: 'work-4', name: 'Покраска стен (2 слоя)', unit: 'м²', price: 280 },
        { id: 'work-5', name: 'Укладка паркетной доски', unit: 'м²', price: 550 },
      ],
    },
    {
      id: 'office-build',
      name: 'Строительство офиса',
      description: 'Полный цикл работ по созданию офисного пространства Open Space.',
      category: 'Коммерческая недвижимость',
      items: [
        { id: 'work-1', name: 'Монтаж перегородок из ГКЛ', unit: 'м²', price: 850 },
        { id: 'work-2', name: 'Устройство потолка Армстронг', unit: 'м²', price: 450 },
        { id: 'work-3', name: 'Прокладка силового кабеля', unit: 'м.п.', price: 120 },
        { id: 'work-4', name: 'Монтаж розеток и выключателей', unit: 'шт', price: 350 },
        { id: 'work-5', name: 'Укладка ковролина', unit: 'м²', price: 400 },
      ],
    },
    {
      id: 'house-construction',
      name: 'Строительство дома (коробка)',
      description: 'Основные этапы строительства частного дома: фундамент, стены, кровля.',
      category: 'Жилая недвижимость',
      items: [
        { id: 'work-1', name: 'Разработка грунта', unit: 'м³', price: 1200 },
        { id: 'work-2', name: 'Устройство ленточного фундамента', unit: 'м³', price: 15000 },
        { id: 'work-3', name: 'Кладка стен из газобетона', unit: 'м³', price: 4500 },
        { id: 'work-4', name: 'Монтаж стропильной системы', unit: 'м²', price: 1800 },
        { id: 'work-5', name: 'Устройство кровли (металлочерепица)', unit: 'м²', price: 950 },
      ],
    },
    {
      id: 'landscape-design',
      name: 'Благоустройство территории',
      description: 'Ландшафтные работы, укладка плитки и озеленение.',
      category: 'Ландшафт',
      items: [
        { id: 'work-1', name: 'Планировка участка', unit: 'м²', price: 150 },
        { id: 'work-2', name: 'Укладка тротуарной плитки', unit: 'м²', price: 1200 },
        { id: 'work-3', name: 'Устройство газона', unit: 'м²', price: 350 },
        { id: 'work-4', name: 'Посадка кустарников', unit: 'шт', price: 800 },
        { id: 'work-5', name: 'Монтаж системы полива', unit: 'м.п.', price: 650 },
      ],
    },
  ]
  
  res.json(templates)
})

// Save estimate
router.post('/estimates', async (req, res) => {
  try {
    const { name, description, items, subtotal, overhead, profit, total, options, userId, projectId, type } = req.body

    const validUserId = await getOrCreateDemoUser(userId)

    const estimate = await prisma.estimate.create({
      data: {
        name: name || 'Новая смета',
        description,
        type: type || 'COMMERCIAL',
        items: items || [],
        subtotal: subtotal || 0,
        overhead: overhead || 0,
        profit: profit || 0,
        total: total || 0,
        options,
        userId: validUserId,
        projectId,
      },
    })

    if (projectId) {
      await updateProjectTotal(projectId)
    }

    res.status(201).json(estimate)
  } catch (error) {
    console.error('Error creating estimate:', error)
    res.status(500).json({ error: 'Failed to create estimate' })
  }
})

// Get estimates
router.get('/estimates', async (req, res) => {
  try {
    const { userId, projectId } = req.query
    
    const where: { userId?: string; projectId?: string } = {}
    if (userId) where.userId = String(userId)
    if (projectId) where.projectId = String(projectId)
    
    const estimates = await prisma.estimate.findMany({
      where,
      include: {
        project: true,
      },
      orderBy: { updatedAt: 'desc' },
    })
    
    res.json(estimates)
  } catch (error) {
    console.error('Error fetching estimates:', error)
    res.status(500).json({ error: 'Failed to fetch estimates' })
  }
})

// Get estimate by ID
router.get('/estimates/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    const estimate = await prisma.estimate.findUnique({
      where: { id },
      include: {
        project: true,
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    })
    
    if (!estimate) {
      return res.status(404).json({ error: 'Estimate not found' })
    }
    
    res.json(estimate)
  } catch (error) {
    console.error('Error fetching estimate:', error)
    res.status(500).json({ error: 'Failed to fetch estimate' })
  }
})

// Update estimate
router.put('/estimates/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { name, description, items, subtotal, overhead, profit, total, options, projectId, type } = req.body

    const existingEstimate = await prisma.estimate.findUnique({ where: { id } })
    if (!existingEstimate) {
      return res.status(404).json({ error: 'Estimate not found' })
    }

    const previousProjectId = existingEstimate.projectId

    const estimate = await prisma.estimate.update({
      where: { id },
      data: {
        name,
        description,
        type,
        items,
        subtotal,
        overhead,
        profit,
        total,
        options,
        projectId,
      },
    })

    if (previousProjectId && previousProjectId !== estimate.projectId) {
      await updateProjectTotal(previousProjectId)
    }
    if (estimate.projectId) {
      await updateProjectTotal(estimate.projectId)
    }

    res.json(estimate)
  } catch (error) {
    console.error('Error updating estimate:', error)
    res.status(500).json({ error: 'Failed to update estimate' })
  }
})

// Delete estimate
router.delete('/estimates/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    const existingEstimate = await prisma.estimate.findUnique({ where: { id } })
    if (!existingEstimate) {
      return res.status(404).json({ error: 'Estimate not found' })
    }
    
    await prisma.estimate.delete({ where: { id } })

    if (existingEstimate.projectId) {
      await updateProjectTotal(existingEstimate.projectId)
    }
    res.status(204).send()
  } catch (error) {
    console.error('Error deleting estimate:', error)
    res.status(500).json({ error: 'Failed to delete estimate' })
  }
})

// Get normatives from database
router.get('/normatives', async (req, res) => {
  try {
    const { type, category, search } = req.query
    
    const where: Prisma.NormativeWhereInput = {}
    if (type) {
      where.type = String(type) as Prisma.NormativeWhereInput['type']
    }
    if (category) where.category = String(category)
    if (search) {
      where.OR = [
        { name: { contains: String(search), mode: 'insensitive' } },
        { code: { contains: String(search), mode: 'insensitive' } },
      ]
    }
    
    const normatives = await prisma.normative.findMany({
      where,
      orderBy: { code: 'asc' },
    })
    
    res.json(normatives)
  } catch (error) {
    console.error('Error fetching normatives:', error)
    res.status(500).json({ error: 'Failed to fetch normatives' })
  }
})

// Get materials from database
router.get('/materials', async (req, res) => {
  try {
    const { category, search } = req.query
    
    const where: Prisma.MaterialWhereInput = {}
    if (category) where.category = String(category)
    if (search) {
      where.OR = [
        { name: { contains: String(search), mode: 'insensitive' } },
        { code: { contains: String(search), mode: 'insensitive' } },
      ]
    }
    
    const materials = await prisma.material.findMany({
      where,
      orderBy: { code: 'asc' },
    })
    
    res.json(materials)
  } catch (error) {
    console.error('Error fetching materials:', error)
    res.status(500).json({ error: 'Failed to fetch materials' })
  }
})

export default router
