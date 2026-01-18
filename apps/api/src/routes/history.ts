import { Router, type Router as RouterType } from 'express'
import prisma from '../lib/prisma.js'

const router: RouterType = Router()

router.get('/', async (req, res) => {
  const userId = req.headers['x-user-id'] as string
  if (!userId) return res.status(401).json({ error: 'Unauthorized' })

  const history = await prisma.changeHistory.findMany({
    where: { userId },
    orderBy: { timestamp: 'desc' },
    take: 100
  })
  res.json(history)
})

export default router
