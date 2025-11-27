import express, { type Application } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'
import dotenv from 'dotenv'

import calculatorRoutes from './routes/calculator.js'
import projectsRoutes from './routes/projects.js'
import clientsRoutes from './routes/clients.js'
import authRoutes from './routes/auth.js'
import exportRoutes from './routes/export.js'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'

dotenv.config()

const app: Application = express()
const PORT = process.env.PORT || 4000

// Middleware
app.use(helmet())
app.use(compression())
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}))
app.use(express.json())
app.use(morgan('dev'))

// Routes
app.use('/api/calculator', calculatorRoutes)
app.use('/api/projects', projectsRoutes)
app.use('/api/clients', clientsRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/export', exportRoutes)

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Error handlers
app.use(errorHandler)
app.use(notFoundHandler)

app.listen(PORT, () => {
  console.log(`🚀 API Server running on http://localhost:${PORT}`)
  console.log(`📚 Health check: http://localhost:${PORT}/api/health`)
})

export default app
