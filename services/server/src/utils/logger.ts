

import path from 'path'
import winston from 'winston'
import { config } from '../config/env.js'

// Custom log levels with priorities
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
}

// Define colors for each level (only for console)
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  verbose: 'white',
  debug: 'blue',
}

// Tell winston that we want to link the colors defined above to the priority levels
winston.addColors(colors)

// Determine log level based on environment
const level = () => {
  const env = config.server.nodeEnv
  const isDevelopment = env === 'development'
  return isDevelopment ? 'debug' : 'warn'
}

// Define different log formats
const formats = {
  // Console format with colors and readable layout
  console: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.colorize({ all: true }),
    winston.format.printf((info) => {
      const { timestamp, level, message, service, requestId, ...meta } = info
      const metaStr = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : ''
      const reqId = requestId ? `[${requestId}]` : ''
      const svc = service ? `[${service}]` : ''
      return `${timestamp} ${level}${svc}${reqId}: ${message}${metaStr}`
    })
  ),

  // File format - structured JSON for log aggregation
  file: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),

  // HTTP format for external log services
  http: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
}

// Define transports based on environment
const getTransports = () => {
  const transports: winston.transport[] = []

  // Console transport - always available
  transports.push(
    new winston.transports.Console({
      level: level(),
      format: formats.console,
    })
  )

  // File transports - only in production or when LOG_TO_FILE is set
  if (config.server.isProduction || process.env.LOG_TO_FILE === 'true') {
    // Combined log file
    transports.push(
      new winston.transports.File({
        filename: path.join(process.cwd(), 'logs', 'combined.log'),
        format: formats.file,
        level: 'info',
        maxsize: 10485760, // 10MB
        maxFiles: 5,
        tailable: true,
      })
    )

    // Error log file
    transports.push(
      new winston.transports.File({
        filename: path.join(process.cwd(), 'logs', 'error.log'),
        format: formats.file,
        level: 'error',
        maxsize: 10485760, // 10MB
        maxFiles: 5,
        tailable: true,
      })
    )
  }

  return transports
}

// Create the logger instance
export const logger = winston.createLogger({
  level: level(),
  levels,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp'] })
  ),
  defaultMeta: {
    service: 'polyseal-server',
    version: process.env.npm_package_version || '1.0.0',
    environment: config.server.nodeEnv,
  },
  transports: getTransports(),
  exitOnError: false,
  rejectionHandlers: [
    new winston.transports.File({ 
      filename: path.join(process.cwd(), 'logs', 'rejections.log') 
    })
  ],
  exceptionHandlers: [
    new winston.transports.File({ 
      filename: path.join(process.cwd(), 'logs', 'exceptions.log') 
    })
  ],
})

// Create request-scoped logger with request ID
export const createRequestLogger = (requestId: string) => {
  return logger.child({ requestId })
}

// Create service-scoped logger
export const createServiceLogger = (service: string) => {
  return logger.child({ service })
}

// Log startup information
export const logStartup = (port: number) => {
  logger.info('🚀 POLySeal Server Starting', {
    port,
    nodeEnv: config.server.nodeEnv,
    chainId: config.blockchain.chainId,
    provider: config.blockchain.rpcUrl,
    contracts: {
      sessionPay: config.contracts.sessionPay,
      mockUSDC: config.contracts.mockUSDC,
      eas: config.contracts.eas,
    }
  })
}

// Helper for structured logging of blockchain transactions
export const logTransaction = (
  action: string,
  txHash: string,
  requestId?: string,
  additional?: Record<string, any>
) => {
  logger.info(`Blockchain transaction: ${action}`, {
    txHash,
    requestId,
    explorerUrl: `https://amoy.polygonscan.com/tx/${txHash}`,
    ...additional
  })
}

// Helper for logging API requests (use with Express middleware)
export const logApiRequest = (
  method: string,
  url: string,
  statusCode: number,
  responseTime: number,
  requestId: string,
  userAgent?: string
) => {
  const level = statusCode >= 400 ? 'error' : statusCode >= 300 ? 'warn' : 'http'
  logger.log(level, `${method} ${url} ${statusCode} - ${responseTime}ms`, {
    method,
    url,
    statusCode,
    responseTime,
    requestId,
    userAgent,
  })
}

// Production error logging helper
export const logError = (
  error: Error | unknown,
  context?: string,
  additional?: Record<string, any>
) => {
  const errorObj = error instanceof Error ? {
    name: error.name,
    message: error.message,
    stack: error.stack,
  } : { message: String(error) }

  logger.error(`${context || 'Unexpected error'}`, {
    error: errorObj,
    ...additional
  })
}

