import compression from 'compression'
import cors from 'cors'
import type { Application } from 'express'
import express, { Request, Response } from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import { config } from './config/env.js'
import { errorHandler } from './middleware/errorHandler.js'
import { requestLogger } from './middleware/requestLogger.js'
import aiRoutes from './routes/ai.js'
import attestationsRoutes from './routes/attestations.js'
import explorerRoutes from './routes/explorer.js'
import metricsRoutes from './routes/metrics.js'
import pricesRoutes from './routes/prices.js'
import sessionRoutes from './routes/sessions-simple.js'
import usersRoutes from './routes/users.js'
import type { ApiResponse } from './types/api.js'
import { logger, logStartup } from './utils/logger.js'

// Initialize Express app
const app: Application = express()

// Trust proxy for rate limiting
app.set('trust proxy', 1)

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}))

// CORS configuration
app.use(cors({
  origin: config.server.nodeEnv === 'production' ? [
    process.env.CORS_ORIGIN,
    'https://polyseal.vercel.app',
    'https://polyseal-frontend.vercel.app'
  ] : [
    config.cors.origin,  // Frontend development server
    'http://localhost:5173', // Vite default
    'http://localhost:8080', // Lovable frontend port
    'http://localhost:3000', // Alternative dev port
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: config.cors.credentials,
  optionsSuccessStatus: config.cors.optionsSuccessStatus
}))

// Compression middleware
app.use(compression({
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false
    }
    return compression.filter(req, res)
  }
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: config.server.nodeEnv === 'production' ? 100 : 1000, // limit each IP
  message: {
    success: false,
    error: 'Too many requests, please try again later',
    code: 'RATE_LIMIT_EXCEEDED',
    timestamp: Date.now(),
    version: '1.0.0'
  } as ApiResponse,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Rate limit exceeded', { 
      ip: req.ip, 
      userAgent: req.get('User-Agent'),
      path: req.path 
    })
    res.status(429).json({
      success: false,
      error: 'Too many requests, please try again later',
      code: 'RATE_LIMIT_EXCEEDED',
      timestamp: Date.now(),
      version: '1.0.0'
    } as ApiResponse)
  }
})

app.use(limiter)

// Body parsing middleware
app.use(express.json({ 
  limit: '10mb',
  strict: true,
  type: 'application/json'
}))
app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb' 
}))

// Request logging middleware
app.use(requestLogger)

// Enhanced health check endpoint
app.get('/health', async (req: Request, res: Response) => {
  const startTime = Date.now()
  
  try {
    // Check AI service
    const aiHealthy = await checkAIHealth()
    
    const response: ApiResponse = {
      success: true,
      data: {
        status: 'healthy',
        timestamp: Date.now(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: '1.0.0',
        environment: config.server.nodeEnv,
        services: {
          ai: {
            status: aiHealthy ? 'healthy' : 'degraded',
            model: config.ai.model,
            timeout: config.timeouts.upstream
          },
          api: {
            status: 'healthy',
            responseTime: Date.now() - startTime
          }
        }
      },
      timestamp: Date.now(),
      version: '1.0.0'
    }
    res.json(response)
  } catch (error) {
    res.status(503).json({
      success: false,
      error: 'Health check failed',
      code: 'SERVICE_UNAVAILABLE',
      timestamp: Date.now(),
      version: '1.0.0'
    })
  }
})

// Check AI service health
async function checkAIHealth(): Promise<boolean> {
  const abortController = new AbortController()
  const timeoutId = setTimeout(() => abortController.abort(), config.timeouts.healthCheck)
  
  try {
    const openai = new (await import('openai')).default({
      apiKey: config.ai.apiKey,
      baseURL: config.ai.baseUrl
    })
    
    // Simple health check - just verify API key works
    await openai.models.list({ signal: abortController.signal })
    clearTimeout(timeoutId)
    return true
  } catch (error) {
    clearTimeout(timeoutId)
    logger.warn('AI health check failed', { error })
    return false
  }
}

// API routes
app.use('/api/sessions', sessionRoutes)
app.use('/api/metrics', metricsRoutes)
app.use('/api/explorer', explorerRoutes)
app.use('/api/attestations', attestationsRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/prices', pricesRoutes)
app.use('/api/ai', aiRoutes)

// 404 handler
app.use('*', (req: Request, res: Response) => {
  const response: ApiResponse = {
    success: false,
    error: 'Endpoint not found',
    code: 'NOT_FOUND',
    timestamp: Date.now(),
    version: '1.0.0'
  }
  res.status(404).json(response)
})

// Global error handler
app.use(errorHandler)

// Graceful shutdown handler
const gracefulShutdown = (signal: string) => {
  logger.info(`${signal} received, shutting down gracefully`)
  
  const server = app.listen(config.server.port, () => {
    logger.info(`Server running on port ${config.server.port}`)
  })
  
  server.close(() => {
    logger.info('HTTP server closed')
    process.exit(0)
  })
  
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down')
    process.exit(1)
  }, 10000)
}

// Handle process signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', { error: error.message, stack: error.stack })
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection', { reason, promise })
  process.exit(1)
})

export default app

// Start server if this file is run directly
if (require.main === module) {
  const server = app.listen(config.server.port, () => {
    logStartup(config.server.port)
  })
  
  // Handle server errors
  server.on('error', (error: NodeJS.ErrnoException) => {
    if (error.code === 'EADDRINUSE') {
      logger.error(`Port ${config.server.port} is already in use`)
    } else {
      logger.error('Server error', { error: error.message })
    }
    process.exit(1)
  })
}