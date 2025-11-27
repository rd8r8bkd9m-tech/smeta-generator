import { Router, type Router as RouterType } from 'express'
import { z } from 'zod'
import prisma from '../lib/prisma.js'

const router: RouterType = Router()

// Validation schemas
const ProjectSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  clientId: z.string().optional(),
  status: z.enum(['DRAFT', 'IN_PROGRESS', 'COMPLETED', 'ARCHIVED']).optional(),
  userId: z.string(),
})

// Get all projects
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query
    const projects = await prisma.project.findMany({
      where: userId ? { userId: String(userId) } : undefined,
      include: {
        client: true,
        estimates: true,
      },
      orderBy: { updatedAt: 'desc' },
    })
    res.json(projects)
  } catch (error) {
    console.error('Error fetching projects:', error)
    res.status(500).json({ error: 'Failed to fetch projects' })
  }
})

// Get project by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        client: true,
        estimates: true,
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    })
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' })
    }
    
    res.json(project)
  } catch (error) {
    console.error('Error fetching project:', error)
    res.status(500).json({ error: 'Failed to fetch project' })
  }
})

// Create project
router.post('/', async (req, res) => {
  try {
    const data = ProjectSchema.parse(req.body)
    
    const project = await prisma.project.create({
      data: {
        name: data.name,
        description: data.description,
        status: data.status || 'DRAFT',
        userId: data.userId,
        clientId: data.clientId,
      },
      include: {
        client: true,
        estimates: true,
      },
    })
    
    res.status(201).json(project)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors })
    }
    console.error('Error creating project:', error)
    res.status(500).json({ error: 'Failed to create project' })
  }
})

// Update project
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const data = ProjectSchema.partial().parse(req.body)
    
    const existingProject = await prisma.project.findUnique({ where: { id } })
    if (!existingProject) {
      return res.status(404).json({ error: 'Project not found' })
    }
    
    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        status: data.status,
        clientId: data.clientId,
      },
      include: {
        client: true,
        estimates: true,
      },
    })
    
    res.json(updatedProject)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors })
    }
    console.error('Error updating project:', error)
    res.status(500).json({ error: 'Failed to update project' })
  }
})

// Delete project
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    const existingProject = await prisma.project.findUnique({ where: { id } })
    if (!existingProject) {
      return res.status(404).json({ error: 'Project not found' })
    }
    
    await prisma.project.delete({ where: { id } })
    res.status(204).send()
  } catch (error) {
    console.error('Error deleting project:', error)
    res.status(500).json({ error: 'Failed to delete project' })
  }
})

// Add estimate to project
router.post('/:id/estimates', async (req, res) => {
  try {
    const { id } = req.params
    const { name, description, items, subtotal, overhead, profit, total, options, userId } = req.body
    
    const project = await prisma.project.findUnique({ where: { id } })
    if (!project) {
      return res.status(404).json({ error: 'Project not found' })
    }
    
    const estimate = await prisma.estimate.create({
      data: {
        name,
        description,
        items: items || [],
        subtotal: subtotal || 0,
        overhead: overhead || 0,
        profit: profit || 0,
        total: total || 0,
        options,
        projectId: id,
        userId: userId || project.userId,
      },
    })
    
    // Update project total
    const allEstimates = await prisma.estimate.findMany({
      where: { projectId: id },
    })
    const totalAmount = allEstimates.reduce((sum: number, est: { total: number }) => sum + est.total, 0)
    
    await prisma.project.update({
      where: { id },
      data: { totalAmount },
    })
    
    res.status(201).json(estimate)
  } catch (error) {
    console.error('Error creating estimate:', error)
    res.status(500).json({ error: 'Failed to create estimate' })
  }
})

export default router
