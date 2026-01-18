import 'dotenv/config'
import { validateEnv } from './lib/env.js'
validateEnv()

import express, { type Application } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import swaggerUi from 'swagger-ui-express'
import swaggerJsdoc from 'swagger-jsdoc'

import calculatorRoutes from './routes/calculator.js'
import projectsRoutes from './routes/projects.js'
import clientsRoutes from './routes/clients.js'
import authRoutes from './routes/auth.js'
import exportRoutes from './routes/export.js'
import aiRoutes from './routes/ai.js'
import integrationsRoutes from './routes/integrations.js'
import historyRoutes from './routes/history.js'
import directoriesRoutes from './routes/directories.js'
import documentsRoutes from './routes/documents.js'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'

const app: Application = express()
const PORT = process.env.PORT || 4000

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}))
app.use(compression())

// Global rate limiting
const globalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'), // 1 minute
  max: parseInt(process.env.RATE_LIMIT_MAX || '100'), // 100 requests per minute
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === '/api/health', // Skip rate limiting for health checks
})
app.use(globalLimiter)

const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000'
if (process.env.NODE_ENV === 'production' && !process.env.CORS_ORIGIN) {
  console.warn('⚠️ CORS_ORIGIN not set in production, using default: http://localhost:3000')
}

app.use(cors({
  origin: corsOrigin,
  credentials: true,
}))
app.use(express.json())
app.use(morgan('dev'))

// Swagger Configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Smeta Unified API',
      version: '1.0.0',
      description: 'API для управления строительными сметами с ИИ-генератором',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 4000}`,
      },
    ],
  },
  apis: ['./src/routes/*.ts'], // Path to the API docs
}

const swaggerSpec = swaggerJsdoc(swaggerOptions)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

// Routes
app.use('/api/calculator', calculatorRoutes)
app.use('/api/projects', projectsRoutes)
app.use('/api/clients', clientsRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/export', exportRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/integrations', integrationsRoutes)
app.use('/api/history', historyRoutes)
app.use('/api/directories', directoriesRoutes)
app.use('/api/documents', documentsRoutes)

// Health check with detailed status
app.get('/api/health', async (_req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    services: {
      api: 'healthy',
      database: 'unknown',
    },
  }

  // Check database connection
  try {
    const prisma = (await import('./lib/prisma.js')).default
    await prisma.$queryRaw`SELECT 1`
    health.services.database = 'healthy'
  } catch {
    health.services.database = 'unhealthy'
    health.status = 'degraded'
  }

  const statusCode = health.status === 'ok' ? 200 : 503
  res.status(statusCode).json(health)
})

// Error handlers
app.use(errorHandler)
app.use(notFoundHandler)

app.listen(PORT, () => {
  console.log(`🚀 API Server running on http://localhost:${PORT}`)
  console.log(`📚 Health check: http://localhost:${PORT}/api/health`)
})

export default app
