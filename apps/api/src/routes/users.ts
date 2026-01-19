import { Router, type Router as RouterType } from 'express'
import { z } from 'zod'
import prisma from '../lib/prisma.js'

const router: RouterType = Router()

const UserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  avatar: z.string().url().optional(),
  phoneNumber: z.string().optional(),
  username: z.string().min(3).optional(),
  bio: z.string().max(500).optional(),
})

// Get all users
router.get('/', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { updatedAt: 'desc' },
    })
    res.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    res.status(500).json({ error: 'Failed to fetch users' })
  }
})

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        stories: {
          where: {
            status: 'ACTIVE',
            expiresAt: { gt: new Date() }
          }
        }
      }
    })
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    res.json(user)
  } catch (error) {
    console.error('Error fetching user:', error)
    res.status(500).json({ error: 'Failed to fetch user' })
  }
})

// Update user
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const data = UserSchema.partial().parse(req.body)
    
    const updatedUser = await prisma.user.update({
      where: { id },
      data
    })
    
    res.json(updatedUser)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors })
    }
    console.error('Error updating user:', error)
    res.status(500).json({ error: 'Failed to update user' })
  }
})

export default router
