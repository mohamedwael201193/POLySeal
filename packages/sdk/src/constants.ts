import { polygonAmoy } from 'viem/chains'

export const AMOY_CHAIN = polygonAmoy

export const AMOY_CONFIG = {
  chainId: 80002,
  rpcUrl: 'https://rpc-amoy.polygon.technology',
  explorer: 'https://amoy.polygonscan.com',
  easAddress: '0xb101275a60d8bfb14529C421899aD7CA1Ae5B5Fc' as const,
  schemaRegistryAddress: '0x23c5701A1BDa89C61d181BD79E5203c730708AE7' as const,
  // Your deployed contract addresses
  sessionPayAddress: '0xE23EF3e9A5903cB8F68334FCAfDb89d50541d235' as const,
  mockUSDCAddress: '0xcF28F960aA85b051D030374B1ACd14668abaAf3e' as const,
}

export const PAID_INFERENCE_SCHEMA = "address payer,address provider,bytes32 requestId,string model,uint256 priceUSDC,bytes32 inputHash,string outputRef,uint8 status,uint64 chainId,bytes32 txHash,uint64 timestamp" as const

// ABI for SessionPay contract
export const SESSION_PAY_ABI = [
  {
    "type": "function",
    "name": "openSession",
    "inputs": [
      {"name": "provider", "type": "address"},
      {"name": "token", "type": "address"},
      {"name": "amount", "type": "uint256"},
      {"name": "requestId", "type": "bytes32"},
      {"name": "model", "type": "string"},
      {"name": "inputHash", "type": "bytes32"}
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "confirmSuccess",
    "inputs": [
      {"name": "requestId", "type": "bytes32"},
      {"name": "outputRef", "type": "string"}
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "getSession",
    "inputs": [{"name": "requestId", "type": "bytes32"}],
    "outputs": [{
      "name": "",
      "type": "tuple",
      "components": [
        {"name": "payer", "type": "address"},
        {"name": "provider", "type": "address"},
        {"name": "token", "type": "address"},
        {"name": "amount", "type": "uint256"},
        {"name": "createdAt", "type": "uint64"},
        {"name": "settled", "type": "bool"},
        {"name": "inputHash", "type": "bytes32"},
        {"name": "model", "type": "string"},
        {"name": "outputRef", "type": "string"}
      ]
    }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "refund",
    "inputs": [{"name": "requestId", "type": "bytes32"}],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "sessionExists",
    "inputs": [{"name": "requestId", "type": "bytes32"}],
    "outputs": [{"name": "", "type": "bool"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "isSettled",
    "inputs": [{"name": "requestId", "type": "bytes32"}],
    "outputs": [{"name": "", "type": "bool"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "canRefund",
    "inputs": [{"name": "requestId", "type": "bytes32"}],
    "outputs": [{"name": "", "type": "bool"}],
    "stateMutability": "view"
  },
  {
    "type": "event",
    "name": "SessionOpened",
    "inputs": [
      {"name": "requestId", "type": "bytes32", "indexed": true},
      {"name": "payer", "type": "address", "indexed": true},
      {"name": "provider", "type": "address", "indexed": true},
      {"name": "token", "type": "address", "indexed": false},
      {"name": "amount", "type": "uint256", "indexed": false},
      {"name": "model", "type": "string", "indexed": false},
      {"name": "inputHash", "type": "bytes32", "indexed": false},
      {"name": "createdAt", "type": "uint64", "indexed": false}
    ]
  },
  {
    "type": "event",
    "name": "SessionSettled",
    "inputs": [
      {"name": "requestId", "type": "bytes32", "indexed": true},
      {"name": "payer", "type": "address", "indexed": true},
      {"name": "provider", "type": "address", "indexed": true},
      {"name": "token", "type": "address", "indexed": false},
      {"name": "amount", "type": "uint256", "indexed": false},
      {"name": "outputRef", "type": "string", "indexed": false}
    ]
  },
  {
    "type": "event",
    "name": "SessionRefunded",
    "inputs": [
      {"name": "requestId", "type": "bytes32", "indexed": true},
      {"name": "payer", "type": "address", "indexed": true},
      {"name": "token", "type": "address", "indexed": false},
      {"name": "amount", "type": "uint256", "indexed": false}
    ]
  }
] as const

// Standard ERC20 ABI for MockUSDC interactions
export const ERC20_ABI = [
  {
    "type": "function",
    "name": "approve",
    "inputs": [
      {"name": "spender", "type": "address"},
      {"name": "amount", "type": "uint256"}
    ],
    "outputs": [{"name": "", "type": "bool"}],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "balanceOf",
    "inputs": [{"name": "account", "type": "address"}],
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "allowance",
    "inputs": [
      {"name": "owner", "type": "address"},
      {"name": "spender", "type": "address"}
    ],
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "transfer",
    "inputs": [
      {"name": "to", "type": "address"},
      {"name": "amount", "type": "uint256"}
    ],
    "outputs": [{"name": "", "type": "bool"}],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "decimals",
    "inputs": [],
    "outputs": [{"name": "", "type": "uint8"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "name",
    "inputs": [],
    "outputs": [{"name": "", "type": "string"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "symbol",
    "inputs": [],
    "outputs": [{"name": "", "type": "string"}],
    "stateMutability": "view"
  }
] as const

// Explorer URLs
export const EXPLORER_URLS = {
  transaction: (hash: string) => `${AMOY_CONFIG.explorer}/tx/${hash}`,
  address: (address: string) => `${AMOY_CONFIG.explorer}/address/${address}`,
  easscan: (attestationUID: string) => `https://polygon-amoy.easscan.org/attestation/${attestationUID}`
} as const