import { Router, type Router as RouterType } from 'express'
import prisma from '../lib/prisma.js'

const router: RouterType = Router()

// Work Directory
router.get('/work', async (_req, res) => {
  const items = await prisma.workDirectory.findMany()
  res.json(items)
})

// Material Directory
router.get('/material', async (_req, res) => {
  const items = await prisma.materialDirectory.findMany()
  res.json(items)
})

export default router
