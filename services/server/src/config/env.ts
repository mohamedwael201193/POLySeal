import dotenv from 'dotenv'
import { z } from 'zod'

dotenv.config()

const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3001'),
  HOST: z.string().default('0.0.0.0'),
  
  // Blockchain - Polygon Amoy Testnet (Chain ID: 80002)
  POLYGON_RPC_URL: z.string().url(),
  SERVER_PRIVATE_KEY: z.string().startsWith('0x'),
  
  // Official Polygon Amoy EAS Contracts ✅ (Updated from official docs)
  EAS_CONTRACT_ADDRESS: z.string().startsWith('0x').default('0xb101275a60d8bfb14529C421899aD7CA1Ae5B5Fc'),
  SCHEMA_REGISTRY_ADDRESS: z.string().startsWith('0x').default('0x23c5701A1BDa89C61d181BD79E5203c730708AE7'),
  POLYSEAL_SCHEMA_UID: z.string().startsWith('0x').default('0x27d06e3659317e9a4f8154d1e849eb53d43d91fb4f219884d1684f86d797804a'),
  
  // Legacy addresses (keeping for compatibility)
  SESSIONPAY_ADDRESS: z.string().startsWith('0x').default('0xE23EF3e9A5903cB8F68334FCAfDb89d50541d235'),
  MOCKUSDC_ADDRESS: z.string().startsWith('0x').default('0xcF28F960aA85b051D030374B1ACd14668abaAf3e'),
  
  // AI Service - REAL API INTEGRATION
  AI_API_KEY: z.string().min(1),
  AI_BASE_URL: z.string().url().default('https://api.openai.com/v1'),
  AI_MODEL: z.string().default('gpt-4o-mini'),
  AI_MAX_TOKENS: z.string().default('1000'),
  AI_TEMPERATURE: z.string().default('0.7'),
  
  // Google Gemini AI
  GEMINI_API_KEY: z.string().min(1),
  
  // Timeouts
  UPSTREAM_TIMEOUT_MS: z.string().default('25000'),
  REQUEST_TIMEOUT_MS: z.string().default('30000'),
  HEALTH_CHECK_TIMEOUT_MS: z.string().default('5000'),
  
  // CORS
  FRONTEND_ORIGIN: z.string().url().default('http://localhost:5173'),
  
  // Redis (for caching and session management)
  REDIS_URL: z.string().default('redis://localhost:6379'),
  
  // External APIs
  POLYGONSCAN_API_KEY: z.string().optional(),
  COINGECKO_API_KEY: z.string().optional(),
  INFURA_API_KEY: z.string().optional(),
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().default('900000'), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.string().default('100'),
  
  // Security
  JWT_SECRET: z.string().min(32).optional(),
  ENCRYPTION_KEY: z.string().min(32).optional(),
})

export const env = envSchema.parse(process.env)

export const config = {
  server: {
    port: parseInt(env.PORT),
    host: env.HOST,
    nodeEnv: env.NODE_ENV,
    isDevelopment: env.NODE_ENV === 'development',
    isProduction: env.NODE_ENV === 'production',
  },
  
  blockchain: {
    rpcUrl: env.POLYGON_RPC_URL,
    privateKey: env.SERVER_PRIVATE_KEY as `0x${string}`,
    chainId: 80002,
    networkName: 'polygon-amoy',
    scannerBase: 'https://amoy.polygonscan.com',
  },
  
  eas: {
    contractAddress: env.EAS_CONTRACT_ADDRESS as `0x${string}`,
    schemaRegistry: env.SCHEMA_REGISTRY_ADDRESS as `0x${string}`,
    defaultSchema: env.POLYSEAL_SCHEMA_UID as `0x${string}`,
  },
  
  contracts: {
    sessionPay: env.SESSIONPAY_ADDRESS as `0x${string}`,
    mockUSDC: env.MOCKUSDC_ADDRESS as `0x${string}`,
    eas: env.EAS_CONTRACT_ADDRESS as `0x${string}`,
    schemaRegistry: env.SCHEMA_REGISTRY_ADDRESS as `0x${string}`,
    schemaUID: env.POLYSEAL_SCHEMA_UID as `0x${string}`,
  },
  
  ai: {
    apiKey: env.AI_API_KEY,
    baseUrl: env.AI_BASE_URL,
    model: env.AI_MODEL,
    maxTokens: parseInt(env.AI_MAX_TOKENS),
    temperature: parseFloat(env.AI_TEMPERATURE),
    geminiApiKey: env.GEMINI_API_KEY,
    // REAL 2024 PRICING: GPT-4o-mini
    pricing: {
      inputTokens: 0.00000015,  // $0.15 per 1M input tokens
      outputTokens: 0.0000006,  // $0.60 per 1M output tokens
    }
  },
  
  timeouts: {
    upstream: parseInt(env.UPSTREAM_TIMEOUT_MS),
    request: parseInt(env.REQUEST_TIMEOUT_MS),
    healthCheck: parseInt(env.HEALTH_CHECK_TIMEOUT_MS)
  },
  
  cors: {
    origin: env.FRONTEND_ORIGIN,
    credentials: true,
    optionsSuccessStatus: 200,
  },
  
  redis: {
    url: env.REDIS_URL,
  },
  
  rateLimit: {
    windowMs: parseInt(env.RATE_LIMIT_WINDOW_MS),
    max: parseInt(env.RATE_LIMIT_MAX_REQUESTS),
  },
  
  apis: {
    polygonscan: env.POLYGONSCAN_API_KEY,
    coingecko: env.COINGECKO_API_KEY,
    infura: env.INFURA_API_KEY,
  }
}