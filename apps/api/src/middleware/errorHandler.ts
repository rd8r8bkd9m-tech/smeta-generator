import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'

export interface AppError extends Error {
  statusCode?: number
  code?: string
}

// Prisma error codes
const PRISMA_ERROR_CODES = {
  UNIQUE_CONSTRAINT: 'P2002',
  RECORD_NOT_FOUND: 'P2025',
} as const

export function createError(message: string, statusCode: number, code?: string): AppError {
  const error: AppError = new Error(message)
  error.statusCode = statusCode
  error.code = code
  return error
}

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found',
    code: 'NOT_FOUND',
  })
}

export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('Error:', err.message)

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Validation Error',
      message: 'Invalid request data',
      code: 'VALIDATION_ERROR',
      details: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    })
    return
  }

  // Handle known errors with status codes
  if (err.statusCode) {
    res.status(err.statusCode).json({
      error: err.message,
      code: err.code || 'ERROR',
    })
    return
  }

  // Handle Prisma errors
  if (err.code === PRISMA_ERROR_CODES.UNIQUE_CONSTRAINT) {
    res.status(409).json({
      error: 'Conflict',
      message: 'A record with this value already exists',
      code: 'DUPLICATE_ENTRY',
    })
    return
  }

  if (err.code === PRISMA_ERROR_CODES.RECORD_NOT_FOUND) {
    res.status(404).json({
      error: 'Not Found',
      message: 'The requested record was not found',
      code: 'NOT_FOUND',
    })
    return
  }

  // Handle unknown errors
  const statusCode = err.statusCode || 500
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal Server Error' 
    : err.message

  res.status(statusCode).json({
    error: message,
    code: err.code || 'INTERNAL_ERROR',
  })
}
