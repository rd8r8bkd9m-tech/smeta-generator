import { Router, type Router as RouterType } from 'express'
import { z } from 'zod'
import prisma from '../lib/prisma.js'

const router: RouterType = Router()

// Validation schemas
const ClientSchema = z.object({
  name: z.string().min(1).max(255),
  type: z.enum(['COMPANY', 'INDIVIDUAL']),
  contact: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().nullable(),
  address: z.string().optional(),
  inn: z.string().optional(),
  kpp: z.string().optional(),
  notes: z.string().optional(),
  userId: z.string(),
})

// Get all clients
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query
    const clients = await prisma.client.findMany({
      where: userId ? { userId: String(userId) } : undefined,
      include: {
        projects: true,
      },
      orderBy: { updatedAt: 'desc' },
    })
    res.json(clients)
  } catch (error) {
    console.error('Error fetching clients:', error)
    res.status(500).json({ error: 'Failed to fetch clients' })
  }
})

// Get client by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        projects: {
          include: { estimates: true },
        },
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    })
    
    if (!client) {
      return res.status(404).json({ error: 'Client not found' })
    }
    
    res.json(client)
  } catch (error) {
    console.error('Error fetching client:', error)
    res.status(500).json({ error: 'Failed to fetch client' })
  }
})

// Create client
router.post('/', async (req, res) => {
  try {
    const data = ClientSchema.parse(req.body)
    
    const client = await prisma.client.create({
      data: {
        name: data.name,
        type: data.type,
        contact: data.contact,
        phone: data.phone,
        email: data.email,
        address: data.address,
        inn: data.inn,
        kpp: data.kpp,
        notes: data.notes,
        userId: data.userId,
      },
      include: {
        projects: true,
      },
    })
    
    res.status(201).json(client)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors })
    }
    console.error('Error creating client:', error)
    res.status(500).json({ error: 'Failed to create client' })
  }
})

// Update client
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const data = ClientSchema.partial().parse(req.body)
    
    const existingClient = await prisma.client.findUnique({ where: { id } })
    if (!existingClient) {
      return res.status(404).json({ error: 'Client not found' })
    }
    
    const updatedClient = await prisma.client.update({
      where: { id },
      data: {
        name: data.name,
        type: data.type,
        contact: data.contact,
        phone: data.phone,
        email: data.email,
        address: data.address,
        inn: data.inn,
        kpp: data.kpp,
        notes: data.notes,
      },
      include: {
        projects: true,
      },
    })
    
    res.json(updatedClient)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors })
    }
    console.error('Error updating client:', error)
    res.status(500).json({ error: 'Failed to update client' })
  }
})

// Delete client
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    const existingClient = await prisma.client.findUnique({ where: { id } })
    if (!existingClient) {
      return res.status(404).json({ error: 'Client not found' })
    }
    
    await prisma.client.delete({ where: { id } })
    res.status(204).send()
  } catch (error) {
    console.error('Error deleting client:', error)
    res.status(500).json({ error: 'Failed to delete client' })
  }
})

// Get client projects
router.get('/:id/projects', async (req, res) => {
  try {
    const { id } = req.params
    
    const client = await prisma.client.findUnique({ where: { id } })
    if (!client) {
      return res.status(404).json({ error: 'Client not found' })
    }
    
    const projects = await prisma.project.findMany({
      where: { clientId: id },
      include: { estimates: true },
      orderBy: { updatedAt: 'desc' },
    })
    
    res.json(projects)
  } catch (error) {
    console.error('Error fetching client projects:', error)
    res.status(500).json({ error: 'Failed to fetch client projects' })
  }
})

export default router
