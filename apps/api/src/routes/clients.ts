import { Router, type Router as RouterType } from 'express'
import { z } from 'zod'

const router: RouterType = Router()

// Validation schemas
const ClientSchema = z.object({
  name: z.string().min(1).max(255),
  type: z.enum(['company', 'individual']),
  contact: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  inn: z.string().optional(),
  kpp: z.string().optional(),
  notes: z.string().optional(),
})

// Mock data (in production, use Prisma)
const clients: Record<string, unknown> = {}

// Get all clients
router.get('/', async (_req, res) => {
  res.json(Object.values(clients))
})

// Get client by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params
  const client = clients[id]
  
  if (!client) {
    return res.status(404).json({ error: 'Client not found' })
  }
  
  res.json(client)
})

// Create client
router.post('/', async (req, res) => {
  try {
    const data = ClientSchema.parse(req.body)
    
    const client = {
      id: `CLT-${Date.now().toString(36).toUpperCase()}`,
      ...data,
      projectsCount: 0,
      totalAmount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    clients[client.id] = client
    res.status(201).json(client)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors })
    }
    throw error
  }
})

// Update client
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const data = ClientSchema.partial().parse(req.body)
    
    const existingClient = clients[id]
    if (!existingClient) {
      return res.status(404).json({ error: 'Client not found' })
    }
    
    const updatedClient = {
      ...existingClient as object,
      ...data,
      updatedAt: new Date().toISOString(),
    }
    
    clients[id] = updatedClient
    res.json(updatedClient)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors })
    }
    throw error
  }
})

// Delete client
router.delete('/:id', async (req, res) => {
  const { id } = req.params
  
  if (!clients[id]) {
    return res.status(404).json({ error: 'Client not found' })
  }
  
  delete clients[id]
  res.status(204).send()
})

// Get client projects
router.get('/:id/projects', async (req, res) => {
  const { id } = req.params
  
  if (!clients[id]) {
    return res.status(404).json({ error: 'Client not found' })
  }
  
  // In production, fetch projects from database
  res.json([])
})

export default router
