import { Router, type Router as RouterType } from 'express'
import prisma from '../lib/prisma.js'

const router: RouterType = Router()

router.get('/', async (req, res) => {
  const userId = req.headers['x-user-id'] as string
  if (!userId) return res.status(401).json({ error: 'Unauthorized' })

  const docs = await prisma.document.findMany({
    where: { userId }
  })
  res.json(docs)
})

export default router
