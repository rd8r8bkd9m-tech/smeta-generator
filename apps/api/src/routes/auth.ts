import { Router, type Router as RouterType } from 'express'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import jwt, { type SignOptions } from 'jsonwebtoken'
import rateLimit from 'express-rate-limit'
import prisma from '../lib/prisma.js'

const router: RouterType = Router()

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET must be set in environment variables')
}

const JWT_EXPIRES_IN = '7d'

// Helper to generate JWT
function generateToken(user: { id: string; email: string; name: string }): string {
  const options: SignOptions = { expiresIn: JWT_EXPIRES_IN }
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    JWT_SECRET as string,
    options
  )
}

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
})

// Validation schemas
const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
})

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Регистрация нового пользователя
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, name]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *               name:
 *                 type: string
 *                 minLength: 2
 *     responses:
 *       201:
 *         description: Пользователь успешно создан
 *       400:
 *         description: Ошибка валидации или пользователь уже существует
 */
router.post('/register', authLimiter, async (req, res) => {
  try {
    const { email, password, name } = RegisterSchema.parse(req.body)
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' })
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)
    
    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
    })
    
    // Generate token
    const token = generateToken(user)
    
    res.status(201).json({
      user: { id: user.id, email: user.email, name: user.name },
      token,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors })
    }
    console.error('Registration error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Авторизация пользователя
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Успешная авторизация
 *       401:
 *         description: Неверные учетные данные
 */
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = LoginSchema.parse(req.body)
    
    // Find user
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    
    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    
    // Generate token
    const token = generateToken(user)
    
    res.json({
      user: { id: user.id, email: user.email, name: user.name },
      token,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors })
    }
    console.error('Login error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get current user
router.get('/me', authLimiter, async (req, res) => {
  const authHeader = req.headers.authorization
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' })
  }
  
  const token = authHeader.substring(7)
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; name: string }
    res.json({ user: decoded })
  } catch {
    return res.status(401).json({ error: 'Invalid token' })
  }
})

// Refresh token
router.post('/refresh', authLimiter, async (req, res) => {
  const authHeader = req.headers.authorization
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' })
  }
  
  const token = authHeader.substring(7)
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; name: string }
    const newToken = generateToken(decoded)
    res.json({ token: newToken })
  } catch {
    return res.status(401).json({ error: 'Invalid token' })
  }
})

export default router
