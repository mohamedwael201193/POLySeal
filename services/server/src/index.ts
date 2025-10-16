import app from './app.js'
import { config } from './config/env.js'
import { logger } from './utils/logger.js'

async function startServer() {
  try {
    // Start basic server without service initialization for testing
    logger.info('Starting POLySeal server...')
    
    // Start server
    const server = app.listen(config.server.port, config.server.host, () => {
      logger.info('🚀 POLySeal server started successfully', {
        port: config.server.port,
        host: config.server.host,
        environment: config.server.nodeEnv,
        endpoints: {
          health: `http://${config.server.host}:${config.server.port}/health`,
          sessions: `http://${config.server.host}:${config.server.port}/api/sessions`,
        }
      })
    })
    
    // Graceful shutdown handling
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received, shutting down gracefully...')
      server.close(() => {
        logger.info('Server closed')
        process.exit(0)
      })
    })
    
    process.on('SIGINT', () => {
      logger.info('SIGINT received, shutting down gracefully...')
      server.close(() => {
        logger.info('Server closed')
        process.exit(0)
      })
    })
    
  } catch (error) {
    logger.error('Failed to start server', { error })
    process.exit(1)
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', { error })
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection', { reason, promise })
  process.exit(1)
})

// Start the server
startServer()