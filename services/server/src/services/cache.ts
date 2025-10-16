import { createClient, RedisClientType } from 'redis'
import { config } from '../config/env.js'
import { logger } from '../utils/logger.js'

export class CacheService {
  private client: RedisClientType
  private isConnected: boolean = false

  constructor() {
    this.client = createClient({
      url: config.redis.url,
      socket: {
        reconnectStrategy: (retries) => Math.min(retries * 50, 500)
      }
    })

    this.client.on('error', (error) => {
      logger.error('Redis client error', { error })
    })

    this.client.on('connect', () => {
      logger.info('Redis client connected')
      this.isConnected = true
    })

    this.client.on('disconnect', () => {
      logger.warn('Redis client disconnected')
      this.isConnected = false
    })
  }

  async connect(): Promise<void> {
    if (!this.isConnected) {
      await this.client.connect()
    }
  }

  async disconnect(): Promise<void> {
    if (this.isConnected) {
      await this.client.disconnect()
    }
  }

  // Session caching
  async cacheSession(requestId: string, data: any, ttl: number = 3600): Promise<void> {
    try {
      await this.client.setEx(`session:${requestId}`, ttl, JSON.stringify(data))
    } catch (error) {
      logger.warn('Failed to cache session', { requestId, error })
    }
  }

  async getSession(requestId: string): Promise<any | null> {
    try {
      const data = await this.client.get(`session:${requestId}`)
      return data ? JSON.parse(data) : null
    } catch (error) {
      logger.warn('Failed to get cached session', { requestId, error })
      return null
    }
  }

  async deleteSession(requestId: string): Promise<void> {
    try {
      await this.client.del(`session:${requestId}`)
    } catch (error) {
      logger.warn('Failed to delete cached session', { requestId, error })
    }
  }

  // Provider statistics caching
  async cacheProviderStats(address: string, stats: any, ttl: number = 300): Promise<void> {
    try {
      await this.client.setEx(`provider:${address}`, ttl, JSON.stringify(stats))
    } catch (error) {
      logger.warn('Failed to cache provider stats', { address, error })
    }
  }

  async getProviderStats(address: string): Promise<any | null> {
    try {
      const data = await this.client.get(`provider:${address}`)
      return data ? JSON.parse(data) : null
    } catch (error) {
      logger.warn('Failed to get cached provider stats', { address, error })
      return null
    }
  }

  // Rate limiting
  async checkRateLimit(key: string, limit: number, window: number): Promise<{ allowed: boolean, remaining: number }> {
    try {
      const current = await this.client.incr(key)
      
      if (current === 1) {
        await this.client.expire(key, window)
      }
      
      return {
        allowed: current <= limit,
        remaining: Math.max(0, limit - current)
      }
    } catch (error) {
      logger.warn('Rate limit check failed', { key, error })
      return { allowed: true, remaining: limit }
    }
  }

  async health(): Promise<boolean> {
    try {
      await this.client.ping()
      return true
    } catch {
      return false
    }
  }
}