import { Router, type Router as RouterType } from 'express'
import prisma from '../lib/prisma.js'
import { z } from 'zod'

const router: RouterType = Router()

const IntegrationSchema = z.object({
  type: z.string(),
  config: z.any(),
  isActive: z.boolean().optional().default(true),
})

router.get('/', async (req, res) => {
  const userId = req.headers['x-user-id'] as string
  if (!userId) return res.status(401).json({ error: 'Unauthorized' })

  const integrations = await prisma.integration.findMany({
    where: { userId }
  })
  res.json(integrations)
})

router.post('/', async (req, res) => {
  const userId = req.headers['x-user-id'] as string
  if (!userId) return res.status(401).json({ error: 'Unauthorized' })

  const data = IntegrationSchema.parse(req.body)
  const integration = await prisma.integration.create({
    data: { 
      type: data.type,
      config: data.config,
      isActive: data.isActive,
      userId 
    }
  })
  res.status(201).json(integration)
})

export default router
