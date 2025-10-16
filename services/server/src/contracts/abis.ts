// SessionPay Contract ABI
export const SESSION_PAY_ABI = [
  {
    "inputs": [
      {"name": "requestId", "type": "bytes32"},
      {"name": "provider", "type": "address"},
      {"name": "token", "type": "address"},
      {"name": "amount", "type": "uint256"},
      {"name": "inputHash", "type": "bytes32"},
      {"name": "model", "type": "string"}
    ],
    "name": "openSession",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "requestId", "type": "bytes32"},
      {"name": "outputRef", "type": "string"}
    ],
    "name": "confirmSuccess",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "requestId", "type": "bytes32"}],
    "name": "getSession",
    "outputs": [
      {"name": "payer", "type": "address"},
      {"name": "provider", "type": "address"},
      {"name": "token", "type": "address"},
      {"name": "amount", "type": "uint256"},
      {"name": "createdAt", "type": "uint256"},
      {"name": "settled", "type": "bool"},
      {"name": "inputHash", "type": "bytes32"},
      {"name": "model", "type": "string"},
      {"name": "outputRef", "type": "string"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "requestId", "type": "bytes32"}],
    "name": "refund",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "requestId", "type": "bytes32"},
      {"indexed": true, "name": "payer", "type": "address"},
      {"indexed": true, "name": "provider", "type": "address"},
      {"name": "amount", "type": "uint256"},
      {"name": "model", "type": "string"}
    ],
    "name": "SessionOpened",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "requestId", "type": "bytes32"},
      {"indexed": true, "name": "provider", "type": "address"},
      {"name": "outputRef", "type": "string"}
    ],
    "name": "SessionConfirmed",
    "type": "event"
  }
] as const

// ERC20 ABI (MockUSDC)
export const ERC20_ABI = [
  {
    "inputs": [{"name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "to", "type": "address"},
      {"name": "amount", "type": "uint256"}
    ],
    "name": "transfer",
    "outputs": [{"name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "from", "type": "address"},
      {"name": "to", "type": "address"},
      {"name": "amount", "type": "uint256"}
    ],
    "name": "transferFrom",
    "outputs": [{"name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "spender", "type": "address"},
      {"name": "amount", "type": "uint256"}
    ],
    "name": "approve",
    "outputs": [{"name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "owner", "type": "address"},
      {"name": "spender", "type": "address"}
    ],
    "name": "allowance",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [{"name": "", "type": "uint8"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const