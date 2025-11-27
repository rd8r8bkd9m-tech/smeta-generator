import { Request, Response, NextFunction } from 'express'
import { ZodSchema, z } from 'zod'

type ValidationTarget = 'body' | 'query' | 'params'

export function validate(schema: ZodSchema, target: ValidationTarget = 'body') {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req[target]
      schema.parse(data)
      next()
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Invalid request data',
          code: 'VALIDATION_ERROR',
          details: error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        })
      }
      next(error)
    }
  }
}

export function validateBody(schema: ZodSchema) {
  return validate(schema, 'body')
}

export function validateQuery(schema: ZodSchema) {
  return validate(schema, 'query')
}

export function validateParams(schema: ZodSchema) {
  return validate(schema, 'params')
}

// Common validation schemas
export const IdParamsSchema = z.object({
  id: z.string().min(1, 'ID is required'),
})

export const PaginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
})

export const EmailSchema = z.string().email('Invalid email format')

export const PasswordSchema = z.string()
  .min(6, 'Password must be at least 6 characters')
  .max(100, 'Password must be at most 100 characters')

export const NameSchema = z.string()
  .min(1, 'Name is required')
  .max(255, 'Name must be at most 255 characters')

export const PhoneSchema = z.string()
  .regex(/^\+?[0-9\s\-()]+$/, 'Invalid phone number format')
  .optional()

export const INNSchema = z.string()
  .regex(/^\d{10,12}$/, 'INN must be 10-12 digits')
  .optional()

export const KPPSchema = z.string()
  .regex(/^\d{9}$/, 'KPP must be 9 digits')
  .optional()
