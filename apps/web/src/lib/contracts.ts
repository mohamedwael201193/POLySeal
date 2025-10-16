import { createPOLySealSDK } from '@polyseal/sdk';
import { createWalletClient, custom, type Address } from 'viem';
import { polygonAmoy } from 'viem/chains';
import {
    easAddress,
    mockUsdcAddress,
    rpcUrl,
    schemaRegistry,
    sessionPayAddress,
} from './env';

// Initialize POLySeal SDK
const sdk = createPOLySealSDK(rpcUrl);

// Export SDK instances for use throughout the app
export const publicClient = sdk.publicClient;

// Wallet client (requires window.ethereum)
export function getWalletClient() {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('No Ethereum wallet detected');
  }
  
  return createWalletClient({
    chain: polygonAmoy,
    transport: custom(window.ethereum),
  });
}

// Contract addresses (for backward compatibility)
export const contracts = {
  eas: easAddress,
  schemaRegistry,
  sessionPay: sessionPayAddress,
  mockUsdc: mockUsdcAddress,
} as const;

// SDK contract instance factory
export function createSDKContracts(walletClient?: any) {
  return sdk.createContracts(walletClient);
}

// EAS contract ABI (minimal, add more methods as needed)
export const easAbi = [
  {
    inputs: [
      {
        components: [
          { name: 'schema', type: 'bytes32' },
          { name: 'recipient', type: 'address' },
          { name: 'expirationTime', type: 'uint64' },
          { name: 'revocable', type: 'bool' },
          { name: 'refUID', type: 'bytes32' },
          { name: 'data', type: 'bytes' },
          { name: 'value', type: 'uint256' },
        ],
        name: 'request',
        type: 'tuple',
      },
    ],
    name: 'attest',
    outputs: [{ name: '', type: 'bytes32' }],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [{ name: 'uid', type: 'bytes32' }],
    name: 'getAttestation',
    outputs: [
      {
        components: [
          { name: 'uid', type: 'bytes32' },
          { name: 'schema', type: 'bytes32' },
          { name: 'time', type: 'uint64' },
          { name: 'expirationTime', type: 'uint64' },
          { name: 'revocationTime', type: 'uint64' },
          { name: 'refUID', type: 'bytes32' },
          { name: 'recipient', type: 'address' },
          { name: 'attester', type: 'address' },
          { name: 'revocable', type: 'bool' },
          { name: 'data', type: 'bytes' },
        ],
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

// MockUSDC ABI
export const mockUsdcAbi = [
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

// Helper functions using SDK
export async function getTokenBalance(address: Address, tokenAddress: Address): Promise<bigint> {
  const sdkContracts = createSDKContracts();
  if (tokenAddress === mockUsdcAddress) {
    return await sdkContracts.getUSDCBalance(address as `0x${string}`);
  }
  // For other tokens, fall back to generic balance check
  return await publicClient.getBalance({ address });
}

export async function getPOLBalance(address: Address): Promise<bigint> {
  return await publicClient.getBalance({ address });
}

// Export SDK contract methods for convenient access
export async function getUSDCBalance(address: `0x${string}`): Promise<bigint> {
  const sdkContracts = createSDKContracts();
  return await sdkContracts.getUSDCBalance(address);
}

export async function approveUSDC(spender: `0x${string}`, amount: bigint, walletClient: any): Promise<`0x${string}`> {
  const sdkContracts = createSDKContracts(walletClient);
  return await sdkContracts.approveUSDC({ spender, amount });
}
