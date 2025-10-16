import { NextFunction, Request, Response } from 'express'
import { ZodError } from 'zod'
import type { ApiResponse } from '../types/api.js'
import { logError } from '../utils/logger.js'

export class AppError extends Error {
  public readonly statusCode: number
  public readonly code?: string
  public readonly isOperational: boolean

  constructor(
    message: string,
    statusCode: number = 500,
    code?: string,
    isOperational: boolean = true
  ) {
    super(message)
    this.statusCode = statusCode
    this.code = code
    this.isOperational = isOperational
    Error.captureStackTrace(this, this.constructor)
  }
}

export const errorHandler = (
  error: Error | AppError | ZodError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const logger = req.logger || req.app.locals.logger

  // Default error values
  let statusCode = 500
  let message = 'Internal server error'
  let code = 'INTERNAL_ERROR'

  // Handle known error types
  if (error instanceof AppError) {
    statusCode = error.statusCode
    message = error.message
    code = error.code || 'APP_ERROR'
  } else if (error instanceof ZodError) {
    statusCode = 400
    message = 'Validation error'
    code = 'VALIDATION_ERROR'
    
    // Include validation details in development
    if (process.env.NODE_ENV === 'development') {
      const details = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
        received: 'input' in err ? err.input : undefined
      }))
      message = `Validation failed: ${details.map(d => `${d.field}: ${d.message}`).join(', ')}`
    }
  } else if (error.message?.includes('insufficient funds')) {
    statusCode = 400
    message = 'Insufficient blockchain funds for transaction'
    code = 'INSUFFICIENT_FUNDS'
  } else if (error.message?.includes('network')) {
    statusCode = 503
    message = 'Blockchain network temporarily unavailable'
    code = 'NETWORK_ERROR'
  }

  // Log the error
  logError(error, `API Error - ${req.method} ${req.path}`, {
    statusCode,
    code,
    requestId: req.requestId,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    body: req.body
  })

  // Send error response
  const response: ApiResponse & { stack?: string } = {
    success: false,
    error: message,
    code,
    timestamp: Date.now(),
    version: process.env.npm_package_version || '1.0.0'
  }

  // Include stack trace in development
  if (process.env.NODE_ENV === 'development' && error.stack) {
    response.stack = error.stack
  }

  res.status(statusCode).json(response)
}

// Async error wrapper
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}
