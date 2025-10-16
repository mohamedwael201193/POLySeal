import type { Address, Hash } from 'viem'

// =============================================================================
// BASE TYPES
// =============================================================================

export type SessionStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'

export type NetworkStatus = 'healthy' | 'congested' | 'offline'

export type AIRole = 'user' | 'assistant' | 'system'

// =============================================================================
// API RESPONSE WRAPPER
// =============================================================================

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  code?: string
  timestamp: number
  version: string
}

// =============================================================================
// SESSION TYPES
// =============================================================================

export interface CreateSessionRequest {
  provider: Address
  amount: string
  model: string
  prompt: string
  maxTokens?: number
  temperature?: number
}

export interface SessionResponse {
  requestId: Hash
  status: SessionStatus
  payer?: Address
  provider: Address
  model: string
  amount: string
  amountUSD: string
  inputHash: Hash
  prompt?: string // Only returned to session creator
  output?: string
  outputRef?: string
  createdAt: number
  completedAt?: number
  txHashes: {
    openSession?: Hash
    confirmSuccess?: Hash
  }
  attestationUID?: Hash
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

// =============================================================================
// AI TYPES
// =============================================================================

export interface AIMessage {
  role: AIRole
  content: string
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

export interface AIThread {
  id: string
  messages: AIMessage[]
  createdAt: number
  updatedAt: number
}

// =============================================================================
// ATTESTATION TYPES
// =============================================================================

export interface AttestationData {
  id: Hash
  schema: Hash
  attester: Address
  recipient: Address
  data: Record<string, any>
  timestamp: number
  txHash: Hash
  revocable: boolean
  revoked: boolean
  expirationTime?: number
}

export interface CreateAttestationRequest {
  schema: Hash
  recipient: Address
  data: Record<string, any>
  revocable?: boolean
  expirationTime?: number
}

// =============================================================================
// EXPLORER TYPES
// =============================================================================

export interface ExplorerSearchResult {
  attestations: AttestationData[]
  total: number
  page: number
  pageSize: number
}

export interface ExplorerSearchParams {
  query?: string
  schema?: Hash
  attester?: Address
  recipient?: Address
  page?: number
  pageSize?: number
  sortBy?: 'timestamp' | 'attester' | 'recipient'
  sortOrder?: 'asc' | 'desc'
}

// =============================================================================
// USER TYPES
// =============================================================================

export interface UserHistoryData {
  address: Address
  attestationsCreated: AttestationData[]
  attestationsReceived: AttestationData[]
  totalCreated: number
  totalReceived: number
}

// =============================================================================
// METRICS TYPES
// =============================================================================

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

export interface ProviderStats {
  address: Address
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
  networkStatus: NetworkStatus
}

// =============================================================================
// PRICE TYPES
// =============================================================================

export interface PriceData {
  pol: number
  polChange24h?: number
  eth: number
  ethChange24h?: number
  btc?: number
  btcChange24h?: number
  timestamp: number
}

// =============================================================================
// TOAST/NOTIFICATION TYPES
// =============================================================================

export interface Toast {
  id: string
  title: string
  description?: string
  variant?: 'default' | 'destructive' | 'success'
  action?: string
}

// =============================================================================
// TRANSACTION TYPES
// =============================================================================

export interface PendingTransaction {
  hash: Hash
  description: string
  timestamp: number
}

// =============================================================================
// ERROR TYPES
// =============================================================================

export interface APIError {
  code: string
  message: string
  details?: Record<string, any>
}

export type ErrorCode = 
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN' 
  | 'NOT_FOUND'
  | 'RATE_LIMITED'
  | 'SERVER_ERROR'
  | 'NETWORK_ERROR'
  | 'CONTRACT_ERROR'
  | 'INSUFFICIENT_FUNDS'
  | 'OPENAI_QUOTA_EXCEEDED'
  | 'UPSTREAM_TIMEOUT'
  | 'UPSTREAM_AUTH'