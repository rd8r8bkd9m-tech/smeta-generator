import { Router, type Router as RouterType } from 'express'
import { z } from 'zod'

const router: RouterType = Router()

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
      description: 'Шаблон для типового ремонта квартиры',
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
      description: 'Шаблон для премиального ремонта',
      items: [
        { id: 'work-1', name: 'Демонтаж старых покрытий', unit: 'м²', price: 200 },
        { id: 'work-2', name: 'Выравнивание стен (штукатурка по маякам)', unit: 'м²', price: 650 },
        { id: 'work-3', name: 'Шпаклевка стен под покраску', unit: 'м²', price: 380 },
        { id: 'work-4', name: 'Покраска стен (2 слоя)', unit: 'м²', price: 280 },
        { id: 'work-5', name: 'Укладка паркетной доски', unit: 'м²', price: 550 },
      ],
    },
  ]
  
  res.json(templates)
})

// Save estimate
router.post('/estimates', async (req, res) => {
  try {
    const estimate = req.body
    
    // In production, save to database
    const savedEstimate = {
      id: `EST-${Date.now().toString(36).toUpperCase()}`,
      ...estimate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    res.status(201).json(savedEstimate)
  } catch (error) {
    throw error
  }
})

// Get estimates
router.get('/estimates', async (_req, res) => {
  // In production, fetch from database
  res.json([])
})

// Get estimate by ID
router.get('/estimates/:id', async (req, res) => {
  const { id } = req.params
  // In production, fetch from database
  res.json({ id, items: [], createdAt: new Date().toISOString() })
})

export default router
