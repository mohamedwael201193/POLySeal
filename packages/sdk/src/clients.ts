import { createPublicClient, createWalletClient, http, type PrivateKeyAccount } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { AMOY_CHAIN } from './constants.js'

export class POLySealClients {
  private rpcUrl: string

  constructor(rpcUrl: string = 'https://rpc-amoy.polygon.technology') {
    this.rpcUrl = rpcUrl
  }

  createPublicClient() {
    return createPublicClient({
      chain: AMOY_CHAIN,
      transport: http(this.rpcUrl)
    })
  }

  createWalletClient(privateKey: `0x${string}`) {
    const account = privateKeyToAccount(privateKey)
    return createWalletClient({
      account,
      chain: AMOY_CHAIN,
      transport: http(this.rpcUrl)
    })
  }

  createAccount(privateKey: `0x${string}`): PrivateKeyAccount {
    return privateKeyToAccount(privateKey)
  }
}