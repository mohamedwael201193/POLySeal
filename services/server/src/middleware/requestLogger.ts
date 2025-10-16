import { NextFunction, Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { createRequestLogger, logApiRequest } from '../utils/logger.js'

declare global {
  namespace Express {
    interface Request {
      requestId: string
      logger: ReturnType<typeof createRequestLogger>
      startTime: number
    }
  }
}

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  req.requestId = uuidv4()
  req.logger = createRequestLogger(req.requestId)
  req.startTime = Date.now()

  // Log the incoming request
  req.logger.http(`→ ${req.method} ${req.path}`, {
    method: req.method,
    url: req.path,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    contentLength: req.get('Content-Length'),
  })

  // Log the response when finished
  res.on('finish', () => {
    const responseTime = Date.now() - req.startTime
    logApiRequest(
      req.method,
      req.path,
      res.statusCode,
      responseTime,
      req.requestId,
      req.get('User-Agent')
    )
  })

  next()
}
