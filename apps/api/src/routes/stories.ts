import { Router, type Router as RouterType } from 'express'
import { z } from 'zod'
import prisma from '../lib/prisma.js'

const router: RouterType = Router()

const StorySchema = z.object({
  userId: z.string(),
  type: z.enum(['TEXT', 'IMAGE', 'VIDEO']),
  content: z.string().min(1),
  background: z.string().optional().nullable(),
})

// Get all active stories for feed
router.get('/', async (req, res) => {
  try {
    const now = new Date()
    const stories = await prisma.story.findMany({
      where: {
        status: 'ACTIVE',
        expiresAt: { gt: now }
      },
      include: {
        user: {
          select: { id: true, name: true, avatar: true, username: true }
        },
        reactions: true
      },
      orderBy: { createdAt: 'desc' },
    })
    res.json(stories)
  } catch (error) {
    console.error('Error fetching stories:', error)
    res.status(500).json({ error: 'Failed to fetch stories' })
  }
})

// Create story
router.post('/', async (req, res) => {
  try {
    const data = StorySchema.parse(req.body)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    
    const story = await prisma.story.create({
      data: {
        ...data,
        expiresAt,
        status: 'ACTIVE'
      }
    })
    
    res.status(201).json(story)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors })
    }
    console.error('Error creating story:', error)
    res.status(500).json({ error: 'Failed to create story' })
  }
})

// Add reaction to story
router.post('/:id/reactions', async (req, res) => {
  try {
    const { id } = req.params
    const { userId, type } = z.object({ userId: z.string(), type: z.string() }).parse(req.body)
    
    const reaction = await prisma.storyReaction.upsert({
      where: {
        userId_storyId: {
          userId,
          storyId: id
        }
      },
      update: { type },
      create: {
        userId,
        storyId: id,
        type
      }
    })
    
    res.json(reaction)
  } catch (error) {
    console.error('Error adding reaction:', error)
    res.status(500).json({ error: 'Failed to add reaction' })
  }
})

export default router
