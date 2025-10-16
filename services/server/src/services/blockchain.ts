import { EAS, SchemaEncoder } from '@ethereum-attestation-service/eas-sdk'
import { ethers } from 'ethers'
import { v4 as uuidv4 } from 'uuid'
import { createPublicClient, createWalletClient, formatUnits, http, keccak256, parseUnits, toHex } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { polygonAmoy } from 'viem/chains'
import { config } from '../config/env.js'
import { ERC20_ABI, SESSION_PAY_ABI } from '../contracts/abis.js'
import { logger } from '../utils/logger.js'

export class BlockchainService {
  private publicClient
  private walletClient  
  private account
  private eas: EAS
  private provider: ethers.JsonRpcProvider
  private signer: ethers.Wallet

  constructor() {
    this.account = privateKeyToAccount(config.blockchain.privateKey)
    
    this.publicClient = createPublicClient({
      chain: polygonAmoy,
      transport: http(config.blockchain.rpcUrl),
      batch: { multicall: true }
    })
    
    this.walletClient = createWalletClient({
      account: this.account,
      chain: polygonAmoy,
      transport: http(config.blockchain.rpcUrl)
    })
    
    // Setup ethers for EAS
    this.provider = new ethers.JsonRpcProvider(config.blockchain.rpcUrl)
    this.signer = new ethers.Wallet(config.blockchain.privateKey, this.provider)
    this.eas = new EAS(config.contracts.eas)
    this.eas.connect(this.signer)
    
    logger.info('Blockchain service initialized', {
      provider: this.account.address,
      chainId: config.blockchain.chainId,
      contracts: {
        sessionPay: config.contracts.sessionPay,
        mockUSDC: config.contracts.mockUSDC,
        eas: config.contracts.eas,
      }
    })
  }

  generateRequestId(): `0x${string}` {
    const uuid = uuidv4()
    const timestamp = Date.now().toString()
    const combined = `${uuid}-${timestamp}`
    return keccak256(toHex(combined))
  }

  generateInputHash(prompt: string, model: string, params: any = {}): `0x${string}` {
    const input = JSON.stringify({ 
      prompt, 
      model, 
      params,
      timestamp: Date.now() 
    })
    return keccak256(toHex(input))
  }

  async getNetworkStatus() {
    try {
      const [blockNumber, gasPrice] = await Promise.all([
        this.publicClient.getBlockNumber(),
        this.publicClient.getGasPrice()
      ])
      
      return {
        blockNumber: Number(blockNumber),
        gasPrice: Number(gasPrice),
        gasPriceGwei: Number(formatUnits(gasPrice, 9)),
        status: 'healthy' as const
      }
    } catch (error) {
      logger.error('Failed to get network status', { error })
      return {
        blockNumber: 0,
        gasPrice: 0,
        gasPriceGwei: 0,
        status: 'offline' as const
      }
    }
  }

  async getProviderBalance(): Promise<{ pol: string, usdc: string }> {
    try {
      const [polBalance, usdcBalance] = await Promise.all([
        this.publicClient.getBalance({ address: this.account.address }),
        this.publicClient.readContract({
          address: config.contracts.mockUSDC,
          abi: ERC20_ABI,
          functionName: 'balanceOf',
          args: [this.account.address]
        })
      ])

      return {
        pol: formatUnits(polBalance, 18),
        usdc: formatUnits(usdcBalance as bigint, 6)
      }
    } catch (error) {
      logger.error('Failed to get provider balance', { error })
      throw new Error('Failed to get provider balance')
    }
  }

  async getSession(requestId: `0x${string}`) {
    try {
      const result = await this.publicClient.readContract({
        address: config.contracts.sessionPay,
        abi: SESSION_PAY_ABI,
        functionName: 'getSession',
        args: [requestId]
      }) as [string, string, string, bigint, bigint, boolean, string, string, string]

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
    } catch (error) {
      logger.error('Failed to get session', { requestId, error })
      throw new Error(`Session not found: ${requestId}`)
    }
  }

  async confirmSuccess(requestId: `0x${string}`, outputRef: string): Promise<`0x${string}`> {
    try {
      logger.info('Confirming session success', { requestId, outputRef })
      
      // Estimate gas first
      const gasEstimate = await this.publicClient.estimateContractGas({
        account: this.account,
        address: config.contracts.sessionPay,
        abi: SESSION_PAY_ABI,
        functionName: 'confirmSuccess',
        args: [requestId, outputRef]
      })

      const { request } = await this.publicClient.simulateContract({
        account: this.account,
        address: config.contracts.sessionPay,
        abi: SESSION_PAY_ABI,
        functionName: 'confirmSuccess',
        args: [requestId, outputRef],
        gas: gasEstimate + BigInt(10000) // Add buffer
      })

      const txHash = await this.walletClient.writeContract(request)
      
      // Wait for confirmation
      const receipt = await this.publicClient.waitForTransactionReceipt({ 
        hash: txHash,
        timeout: 60000 // 1 minute timeout
      })
      
      logger.info('Session confirmed successfully', { 
        requestId, 
        txHash,
        gasUsed: receipt.gasUsed,
        status: receipt.status
      })
      
      return txHash
    } catch (error) {
      logger.error('Failed to confirm session', { requestId, error })
      throw new Error(`Failed to confirm session: ${error}`)
    }
  }

  async createAttestation(data: {
    payer: `0x${string}`
    provider: `0x${string}`
    requestId: `0x${string}`
    model: string
    priceUSDC: bigint
    inputHash: `0x${string}`
    outputRef: string
    status: number
    txHash: `0x${string}`
  }): Promise<string> {
    try {
      logger.info('Creating attestation', { requestId: data.requestId })
      
      const schemaEncoder = new SchemaEncoder(
        "address payer,address provider,bytes32 requestId,string model,uint256 priceUSDC,bytes32 inputHash,string outputRef,uint8 status,uint64 chainId,bytes32 txHash,uint64 timestamp"
      )
      
      const encodedData = schemaEncoder.encodeData([
        { name: "payer", value: data.payer, type: "address" },
        { name: "provider", value: data.provider, type: "address" },
        { name: "requestId", value: data.requestId, type: "bytes32" },
        { name: "model", value: data.model, type: "string" },
        { name: "priceUSDC", value: data.priceUSDC.toString(), type: "uint256" },
        { name: "inputHash", value: data.inputHash, type: "bytes32" },
        { name: "outputRef", value: data.outputRef, type: "string" },
        { name: "status", value: data.status, type: "uint8" },
        { name: "chainId", value: config.blockchain.chainId, type: "uint64" },
        { name: "txHash", value: data.txHash, type: "bytes32" },
        { name: "timestamp", value: Math.floor(Date.now() / 1000), type: "uint64" }
      ])

      const tx = await this.eas.attest({
        schema: config.contracts.schemaUID,
        data: {
          recipient: data.payer,
          expirationTime: 0n,
          revocable: false,
          data: encodedData,
        },
      })

      const attestationUID = await tx.wait()
      if (!attestationUID) throw new Error('Attestation transaction failed')
      
      logger.info('Attestation created successfully', {
        requestId: data.requestId,
        attestationUID,
        transactionData: (tx as any).data || 'unknown'
      })
      
      return attestationUID
    } catch (error) {
      logger.error('Failed to create attestation', { 
        requestId: data.requestId, 
        error 
      })
      throw new Error(`Failed to create attestation: ${error}`)
    }
  }

  generateExplorerLinks(txHash?: string, attestationUID?: string) {
    return {
      transaction: txHash 
        ? `https://amoy.polygonscan.com/tx/${txHash}` 
        : undefined,
      attestation: attestationUID 
        ? `https://polygon-amoy.easscan.org/attestation/${attestationUID}`
        : undefined
    }
  }

  formatUSDC(amount: bigint | string): string {
    return formatUnits(BigInt(amount), 6)
  }

  parseUSDC(amount: string): bigint {
    return parseUnits(amount, 6)
  }

  calculateUSDCost(usdcAmount: string): number {
    // Convert USDC (6 decimals) to actual USD
    return parseFloat(usdcAmount) / 1000000
  }
}