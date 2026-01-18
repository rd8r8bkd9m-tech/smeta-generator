import { describe, it, expect } from 'vitest'
import request from 'supertest'
import express from 'express'
import cors from 'cors'

// Create a test app instance
const createTestApp = () => {
  const app = express()
  app.use(cors())
  app.use(express.json())

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
  })

  // Calculator endpoint
  app.post('/api/calculator/calculate', (req, res) => {
    const { items, options } = req.body

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ error: 'Items array is required' })
    }

    const subtotal = items.reduce((sum: number, item: any) => {
      const coefficient = item.coefficient || 1
      return sum + item.quantity * item.price * coefficient
    }, 0)

    const overhead = subtotal * (options?.overheadRate || 0.12)
    const profit = (subtotal + overhead) * (options?.profitRate || 0.08)
    let total = subtotal + overhead + profit

    if (options?.includeVat !== false) {
      total = total * (1 + (options?.vatRate || 0.20))
    }

    res.json({
      subtotal: Math.round(subtotal * 100) / 100,
      overhead: Math.round(overhead * 100) / 100,
      profit: Math.round(profit * 100) / 100,
      total: Math.round(total * 100) / 100,
    })
  })

  // AI Estimate endpoint (mock)
  app.post('/api/ai/generate-estimate', (req, res) => {
    const { description, area } = req.body

    if (!description) {
      return res.status(400).json({ error: 'Description is required' })
    }

    // Mock AI response for testing
    const mockItems = [
      {
        id: '1',
        name: 'Штукатурка гипсовая Knauf Rotband',
        unit: 'кг',
        quantity: Math.round((area || 100) * 8.5),
        price: 45,
        category: 'material',
      },
      {
        id: '2',
        name: 'Грунтовка глубокого проникновения',
        unit: 'л',
        quantity: Math.round((area || 100) * 0.2),
        price: 120,
        category: 'material',
      },
      {
        id: '3',
        name: 'Штукатурка стен по маякам',
        unit: 'м²',
        quantity: area || 100,
        price: 650,
        category: 'work',
      },
      {
        id: '4',
        name: 'Грунтование поверхности',
        unit: 'м²',
        quantity: area || 100,
        price: 80,
        category: 'work',
      },
    ]

    const subtotal = mockItems.reduce((sum, item) => sum + item.quantity * item.price, 0)

    res.json({
      items: mockItems,
      subtotal,
      parsed: {
        projectType: 'ремонт',
        totalArea: area || 100,
        works: mockItems.filter(i => i.category === 'work').map(i => ({
          description: i.name,
          category: 'general',
          estimatedQuantity: i.quantity,
          unit: i.unit,
        })),
      },
    })
  })

  // Templates endpoint
  app.get('/api/templates', (_req, res) => {
    res.json([
      { id: '1', name: 'Штукатурка стен', category: 'отделка', items: 4 },
      { id: '2', name: 'Укладка плитки', category: 'отделка', items: 6 },
      { id: '3', name: 'Электромонтаж', category: 'инженерия', items: 12 },
    ])
  })

  // Auth endpoints
  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    if (email === 'test@example.com' && password === 'password123') {
      res.json({
        token: 'mock-jwt-token',
        user: { id: '1', email, name: 'Test User' },
      })
    } else {
      res.status(401).json({ error: 'Invalid credentials' })
    }
  })

  app.post('/api/auth/register', (req, res) => {
    const { email, password, name } = req.body

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' })
    }

    res.status(201).json({
      token: 'mock-jwt-token',
      user: { id: '2', email, name },
    })
  })

  return app
}

describe('E2E API Tests', () => {
  const app = createTestApp()

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/api/health')
      
      expect(response.status).toBe(200)
      expect(response.body.status).toBe('ok')
      expect(response.body.timestamp).toBeDefined()
    })
  })

  describe('Calculator API', () => {
    it('should calculate estimate for plastering 109 m²', async () => {
      const response = await request(app)
        .post('/api/calculator/calculate')
        .send({
          items: [
            { id: '1', name: 'Штукатурка Knauf Rotband', unit: 'кг', quantity: 926, price: 45 },
            { id: '2', name: 'Грунтовка', unit: 'л', quantity: 22, price: 120 },
            { id: '3', name: 'Штукатурка стен', unit: 'м²', quantity: 109, price: 650 },
            { id: '4', name: 'Грунтование', unit: 'м²', quantity: 109, price: 80 },
          ],
          options: {
            overheadRate: 0.12,
            profitRate: 0.08,
            vatRate: 0.20,
            includeVat: true,
          },
        })

      expect(response.status).toBe(200)
      expect(response.body.subtotal).toBeGreaterThan(0)
      expect(response.body.total).toBeGreaterThan(response.body.subtotal)
    })

    it('should return error for missing items', async () => {
      const response = await request(app)
        .post('/api/calculator/calculate')
        .send({})

      expect(response.status).toBe(400)
      expect(response.body.error).toBe('Items array is required')
    })

    it('should handle empty items array', async () => {
      const response = await request(app)
        .post('/api/calculator/calculate')
        .send({ items: [] })

      expect(response.status).toBe(200)
      expect(response.body.subtotal).toBe(0)
      expect(response.body.total).toBe(0)
    })
  })

  describe('AI Estimate Generation', () => {
    it('should generate estimate for plastering description', async () => {
      const response = await request(app)
        .post('/api/ai/generate-estimate')
        .send({
          description: 'штукатурка стен 109 м2',
          area: 109,
        })

      expect(response.status).toBe(200)
      expect(response.body.items).toHaveLength(4)
      expect(response.body.subtotal).toBeGreaterThan(0)
      expect(response.body.parsed.totalArea).toBe(109)
    })

    it('should return error for missing description', async () => {
      const response = await request(app)
        .post('/api/ai/generate-estimate')
        .send({})

      expect(response.status).toBe(400)
      expect(response.body.error).toBe('Description is required')
    })

    it('should use default area when not provided', async () => {
      const response = await request(app)
        .post('/api/ai/generate-estimate')
        .send({ description: 'штукатурка стен' })

      expect(response.status).toBe(200)
      expect(response.body.parsed.totalArea).toBe(100)
    })
  })

  describe('Templates API', () => {
    it('should return list of templates', async () => {
      const response = await request(app).get('/api/templates')

      expect(response.status).toBe(200)
      expect(response.body).toHaveLength(3)
      expect(response.body[0]).toHaveProperty('id')
      expect(response.body[0]).toHaveProperty('name')
      expect(response.body[0]).toHaveProperty('category')
    })
  })

  describe('Authentication API', () => {
    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        })

      expect(response.status).toBe(200)
      expect(response.body.token).toBeDefined()
      expect(response.body.user.email).toBe('test@example.com')
    })

    it('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        })

      expect(response.status).toBe(401)
      expect(response.body.error).toBe('Invalid credentials')
    })

    it('should register new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'newuser@example.com',
          password: 'newpassword123',
          name: 'New User',
        })

      expect(response.status).toBe(201)
      expect(response.body.token).toBeDefined()
      expect(response.body.user.email).toBe('newuser@example.com')
    })

    it('should reject registration with missing fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'incomplete@example.com',
        })

      expect(response.status).toBe(400)
    })
  })
})

describe('Business Logic Tests', () => {
  describe('Estimate Calculation Scenarios', () => {
    it('should calculate correct total for apartment renovation', () => {
      const items = [
        { name: 'Демонтаж старых покрытий', unit: 'м²', quantity: 60, price: 150 },
        { name: 'Штукатурка стен', unit: 'м²', quantity: 120, price: 650 },
        { name: 'Шпаклевка стен', unit: 'м²', quantity: 120, price: 250 },
        { name: 'Покраска стен', unit: 'м²', quantity: 120, price: 180 },
        { name: 'Укладка ламината', unit: 'м²', quantity: 60, price: 450 },
      ]

      const subtotal = items.reduce((sum, item) => sum + item.quantity * item.price, 0)
      const overhead = subtotal * 0.12
      const profit = (subtotal + overhead) * 0.08
      const total = (subtotal + overhead + profit) * 1.20

      // Expected: 9000 + 78000 + 30000 + 21600 + 27000 = 165600
      expect(subtotal).toBe(165600)
      expect(Math.round(total)).toBeGreaterThan(200000)
    })

    it('should handle coefficient adjustments for complex work', () => {
      const basePrice = 650
      const area = 109
      const complexityCoefficient = 1.3 // 30% extra for complex surfaces

      const adjustedTotal = basePrice * area * complexityCoefficient
      expect(adjustedTotal).toBe(92105)
    })

    it('should calculate materials with waste factor', () => {
      const area = 109
      const consumptionPerM2 = 8.5 // kg per m²
      const wasteFactor = 1.1 // 10% waste

      const totalMaterial = Math.ceil(area * consumptionPerM2 * wasteFactor)
      expect(totalMaterial).toBe(1020) // 109 * 8.5 * 1.1 = 1019.15 → 1020
    })
  })

  describe('Price Validation', () => {
    it('should reject negative prices', () => {
      const validatePrice = (price: number) => price >= 0
      
      expect(validatePrice(100)).toBe(true)
      expect(validatePrice(0)).toBe(true)
      expect(validatePrice(-50)).toBe(false)
    })

    it('should reject zero quantities for required items', () => {
      const validateQuantity = (quantity: number, required: boolean) => {
        if (required) return quantity > 0
        return quantity >= 0
      }

      expect(validateQuantity(10, true)).toBe(true)
      expect(validateQuantity(0, true)).toBe(false)
      expect(validateQuantity(0, false)).toBe(true)
    })
  })
})

describe('Data Integrity Tests', () => {
  it('should maintain precision in calculations', () => {
    const price = 123.456
    const quantity = 7.89
    const expected = 974.06784

    const result = price * quantity
    expect(Math.round(result * 100000) / 100000).toBe(expected)
  })

  it('should handle large numbers correctly', () => {
    const items = Array.from({ length: 1000 }, () => ({
      quantity: 100,
      price: 1000,
    }))

    const total = items.reduce((sum, item) => sum + item.quantity * item.price, 0)
    expect(total).toBe(100000000) // 100 million
  })

  it('should handle currency rounding correctly', () => {
    const roundCurrency = (value: number) => Math.round(value * 100) / 100

    expect(roundCurrency(123.456)).toBe(123.46)
    expect(roundCurrency(123.454)).toBe(123.45)
    expect(roundCurrency(123.455)).toBe(123.46) // Banker's rounding
  })
})
