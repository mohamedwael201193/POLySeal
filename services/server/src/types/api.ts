import { z } from 'zod'

// Request validation schemas
export const createSessionSchema = z.object({
  provider: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid provider address'),
  amount: z.string().regex(/^\d+$/, 'Amount must be a positive integer'),
  model: z.string().min(1).max(50),
  prompt: z.string().min(1).max(4000, 'Prompt too long'),
  maxTokens: z.number().min(10).max(4000).optional(),
  temperature: z.number().min(0).max(2).optional(),
})

export const getSessionSchema = z.object({
  requestId: z.string().regex(/^0x[a-fA-F0-9]{64}$/, 'Invalid request ID'),
})

export const confirmSessionSchema = z.object({
  requestId: z.string().regex(/^0x[a-fA-F0-9]{64}$/, 'Invalid request ID'),
  signature: z.string().optional(), // For provider verification
})

// Enhanced response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  code?: string
  timestamp: number
  version: string
}

export interface SessionResponse {
  requestId: string
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
  payer?: string
  provider: string
  model: string
  amount: string
  amountUSD: string
  inputHash: string
  prompt?: string // Only returned to session creator
  output?: string
  outputRef?: string
  createdAt: number
  completedAt?: number
  txHashes: {
    openSession?: string
    confirmSuccess?: string
  }
  attestationUID?: string
  explorerLinks: {
    openSession?: string
    confirmSuccess?: string
    attestation?: string
  }
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
    cost: number
  }
  processing?: {
    startedAt?: number
    estimatedCompletion?: number
    progress?: string
  }
}

export interface AIResponse {
  content: string
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
  model: string
  created: number
  cost: number
}

export interface ProviderStats {
  address: string
  totalSessions: number
  completedSessions: number
  totalEarnings: string
  averageResponseTime: number
  successRate: number
  reputation: number
  models: string[]
  isActive: boolean
}

export interface SystemStats {
  totalSessions: number
  totalVolume: string
  activeProviders: number
  averageGasPrice: number
  networkStatus: 'healthy' | 'congested' | 'offline'
}

export interface MetricsData {
  totalAttestations: number
  totalUsers: number
  totalVolume: string
  totalSessions: number
  recentActivity: Array<{
    type: string
    count: number
    timestamp: string
  }>
}

export interface AttestationData {
  id: string
  schema: string
  attester: string
  recipient: string
  data: Record<string, any>
  timestamp: number
  txHash: string
}

export interface ExplorerSearchResult {
  attestations: AttestationData[]
  total: number
  page: number
  pageSize: number
}

export interface UserHistoryData {
  address: string
  attestationsCreated: AttestationData[]
  attestationsReceived: AttestationData[]
}

export interface PriceData {
  pol: number
  polChange24h?: number
  eth: number
  ethChange24h?: number
  btc?: number
  btcChange24h?: number
  timestamp: number
}

export interface AIMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}