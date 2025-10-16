export * from './clients.js'
export * from './constants.js'
export * from './contracts.js'
export * from './eas.js'
export * from './types.js'

// Convenience factory function
import { POLySealClients } from './clients.js'
import { POLySealContracts } from './contracts.js'

export function createPOLySealSDK(rpcUrl?: string) {
  const clients = new POLySealClients(rpcUrl)
  const publicClient = clients.createPublicClient()
  
  return {
    clients,
    publicClient,
    createContracts: (walletClient?: any) => new POLySealContracts(publicClient, walletClient),
    createWalletClient: (privateKey: `0x${string}`) => clients.createWalletClient(privateKey)
  }
}