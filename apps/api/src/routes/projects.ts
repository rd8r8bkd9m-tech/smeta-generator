import { Router } from 'express'
import { z } from 'zod'

const router = Router()

// Validation schemas
const ProjectSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  clientId: z.string().optional(),
  status: z.enum(['draft', 'in_progress', 'completed', 'archived']).optional(),
})

// Mock data (in production, use Prisma)
const projects: Record<string, unknown> = {}

// Get all projects
router.get('/', async (_req, res) => {
  res.json(Object.values(projects))
})

// Get project by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params
  const project = projects[id]
  
  if (!project) {
    return res.status(404).json({ error: 'Project not found' })
  }
  
  res.json(project)
})

// Create project
router.post('/', async (req, res) => {
  try {
    const data = ProjectSchema.parse(req.body)
    
    const project = {
      id: `PRJ-${Date.now().toString(36).toUpperCase()}`,
      ...data,
      status: data.status || 'draft',
      totalAmount: 0,
      estimates: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    projects[project.id] = project
    res.status(201).json(project)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors })
    }
    throw error
  }
})

// Update project
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const data = ProjectSchema.partial().parse(req.body)
    
    const existingProject = projects[id]
    if (!existingProject) {
      return res.status(404).json({ error: 'Project not found' })
    }
    
    const updatedProject = {
      ...existingProject as object,
      ...data,
      updatedAt: new Date().toISOString(),
    }
    
    projects[id] = updatedProject
    res.json(updatedProject)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors })
    }
    throw error
  }
})

// Delete project
router.delete('/:id', async (req, res) => {
  const { id } = req.params
  
  if (!projects[id]) {
    return res.status(404).json({ error: 'Project not found' })
  }
  
  delete projects[id]
  res.status(204).send()
})

// Add estimate to project
router.post('/:id/estimates', async (req, res) => {
  const { id } = req.params
  const estimate = req.body
  
  const project = projects[id]
  if (!project) {
    return res.status(404).json({ error: 'Project not found' })
  }
  
  const estimateWithId = {
    id: `EST-${Date.now().toString(36).toUpperCase()}`,
    ...estimate,
    createdAt: new Date().toISOString(),
  }
  
  const proj = project as { estimates: unknown[], totalAmount: number }
  proj.estimates.push(estimateWithId)
  proj.totalAmount = proj.estimates.reduce(
    (sum: number, est: { total?: number }) => sum + (est.total || 0),
    0
  )
  
  res.status(201).json(estimateWithId)
})

export default router
