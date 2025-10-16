import { formatUnits, parseUnits, type Hash, type PublicClient, type WalletClient } from 'viem'
import { AMOY_CONFIG, ERC20_ABI, SESSION_PAY_ABI } from './constants.js'
import type { SessionData } from './types.js'

export class POLySealContracts {
  private publicClient: PublicClient
  private walletClient?: WalletClient

  constructor(publicClient: PublicClient, walletClient?: WalletClient) {
    this.publicClient = publicClient
    this.walletClient = walletClient
  }

  // MockUSDC Functions
  async approveUSDC(params: {
    spender: `0x${string}`
    amount: bigint
  }): Promise<Hash> {
    if (!this.walletClient) throw new Error('Wallet client required')
    
    const { request } = await this.publicClient.simulateContract({
      account: this.walletClient.account!,
      address: AMOY_CONFIG.mockUSDCAddress,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [params.spender, params.amount]
    })

    return await this.walletClient.writeContract(request)
  }

  async getUSDCBalance(address: `0x${string}`): Promise<bigint> {
    return await this.publicClient.readContract({
      address: AMOY_CONFIG.mockUSDCAddress,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [address]
    })
  }

  async getUSDCAllowance(owner: `0x${string}`, spender: `0x${string}`): Promise<bigint> {
    return await this.publicClient.readContract({
      address: AMOY_CONFIG.mockUSDCAddress,
      abi: ERC20_ABI,
      functionName: 'allowance',
      args: [owner, spender]
    })
  }

  // SessionPay Functions
  async openSession(params: {
    provider: `0x${string}`
    amount: bigint
    requestId: `0x${string}`
    model: string
    inputHash: `0x${string}`
  }): Promise<Hash> {
    if (!this.walletClient) throw new Error('Wallet client required')

    const { request } = await this.publicClient.simulateContract({
      account: this.walletClient.account!,
      address: AMOY_CONFIG.sessionPayAddress,
      abi: SESSION_PAY_ABI,
      functionName: 'openSession',
      args: [
        params.provider,
        AMOY_CONFIG.mockUSDCAddress,
        params.amount,
        params.requestId,
        params.model,
        params.inputHash
      ]
    })

    return await this.walletClient.writeContract(request)
  }

  async confirmSuccess(params: {
    requestId: `0x${string}`
    outputRef: string
  }): Promise<Hash> {
    if (!this.walletClient) throw new Error('Wallet client required')

    const { request } = await this.publicClient.simulateContract({
      account: this.walletClient.account!,
      address: AMOY_CONFIG.sessionPayAddress,
      abi: SESSION_PAY_ABI,
      functionName: 'confirmSuccess',
      args: [params.requestId, params.outputRef]
    })

    return await this.walletClient.writeContract(request)
  }

  async getSession(requestId: `0x${string}`): Promise<SessionData> {
    const result = await this.publicClient.readContract({
      address: AMOY_CONFIG.sessionPayAddress,
      abi: SESSION_PAY_ABI,
      functionName: 'getSession',
      args: [requestId]
    }) as unknown as [string, string, string, bigint, bigint, boolean, string, string, string]

    return {
      requestId,
      payer: result[0] as `0x${string}`,
      provider: result[1] as `0x${string}`,
      token: result[2] as `0x${string}`,
      amount: result[3],
      createdAt: result[4],
      settled: result[5],
      inputHash: result[6] as `0x${string}`,
      model: result[7],
      outputRef: result[8]
    }
  }

  async refund(requestId: `0x${string}`): Promise<Hash> {
    if (!this.walletClient) throw new Error('Wallet client required')

    const { request } = await this.publicClient.simulateContract({
      account: this.walletClient.account!,
      address: AMOY_CONFIG.sessionPayAddress,
      abi: SESSION_PAY_ABI,
      functionName: 'refund',
      args: [requestId]
    })

    return await this.walletClient.writeContract(request)
  }

  // Utility functions
  formatUSDC(amount: bigint): string {
    return formatUnits(amount, 6) // USDC has 6 decimals
  }

  parseUSDC(amount: string): bigint {
    return parseUnits(amount, 6)
  }
}