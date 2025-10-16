export interface SessionData {
  requestId: `0x${string}`
  payer: `0x${string}`
  provider: `0x${string}`
  token: `0x${string}`
  amount: bigint
  model: string
  inputHash: `0x${string}`
  createdAt: bigint
  settled: boolean
  outputRef: string
}

export interface AttestationData {
  payer: `0x${string}`
  provider: `0x${string}`
  requestId: `0x${string}`
  model: string
  priceUSDC: bigint
  inputHash: `0x${string}`
  outputRef: string
  status: number
  chainId: number
  txHash: `0x${string}`
  timestamp: number
}

export interface POLySealConfig {
  rpcUrl: string
  sessionPayAddress: `0x${string}`
  mockUSDCAddress: `0x${string}`
  easAddress: `0x${string}`
  schemaRegistryAddress: `0x${string}`
  schemaUID?: `0x${string}`
}

export interface OpenSessionParams {
  provider: `0x${string}`
  amount: bigint
  requestId: `0x${string}`
  model: string
  inputHash: `0x${string}`
}

export interface ConfirmSuccessParams {
  requestId: `0x${string}`
  outputRef: string
}

export interface ApproveUSDCParams {
  spender: `0x${string}`
  amount: bigint
}

export enum AttestationStatus {
  SUCCESS = 1,
  FAILED = 2,
  REFUNDED = 3
}

export interface SDKError extends Error {
  code: string
  details?: any
}