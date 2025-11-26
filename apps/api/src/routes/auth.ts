import { Router } from 'express'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const router = Router()

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

// Validation schemas
const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
})

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

// Mock users storage (in production, use Prisma)
const users: Record<string, { id: string; email: string; name: string; password: string }> = {}

// Helper to generate JWT
function generateToken(user: { id: string; email: string; name: string }) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  )
}

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = RegisterSchema.parse(req.body)
    
    // Check if user exists
    const existingUser = Object.values(users).find(u => u.email === email)
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' })
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)
    
    // Create user
    const user = {
      id: `USR-${Date.now().toString(36).toUpperCase()}`,
      email,
      name,
      password: hashedPassword,
    }
    
    users[user.id] = user
    
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
    throw error
  }
})

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = LoginSchema.parse(req.body)
    
    // Find user
    const user = Object.values(users).find(u => u.email === email)
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
    throw error
  }
})

// Get current user
router.get('/me', async (req, res) => {
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
router.post('/refresh', async (req, res) => {
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
