# POLySeal SDK

**TypeScript SDK for POLySeal AI Inference Escrow & Attestation System**

A comprehensive library for interacting with POLySeal smart contracts and EAS attestations on Polygon Amoy testnet.

## 📦 Installation

```bash
npm install @polyseal/sdk
```

## 🚀 Quick Start

```typescript
import { createPOLySealSDK } from '@polyseal/sdk';

// Initialize SDK
const sdk = createPOLySealSDK();

// Create wallet client with private key
const walletClient = sdk.createWalletClient('0x...');

// Create contracts instance
const contracts = sdk.createContracts(walletClient);

// Get USDC balance
const balance = await contracts.getUSDCBalance('0x...');
console.log('USDC Balance:', contracts.formatUSDC(balance));
```

## 🏗️ Architecture

The SDK provides four main modules:

- **Clients**: Viem client factories for blockchain interaction
- **Contracts**: High-level contract interaction functions
- **EAS**: Ethereum Attestation Service integration
- **Types**: TypeScript type definitions

## 📚 API Reference

### Clients

#### POLySealClients

```typescript
import { POLySealClients } from '@polyseal/sdk';

const clients = new POLySealClients('https://rpc-amoy.polygon.technology');

// Create read-only client
const publicClient = clients.createPublicClient();

// Create wallet client for transactions
const walletClient = clients.createWalletClient('0x...');

// Create account from private key
const account = clients.createAccount('0x...');
```

### Contracts

#### POLySealContracts

```typescript
import { POLySealContracts } from '@polyseal/sdk';

const contracts = new POLySealContracts(publicClient, walletClient);
```

##### MockUSDC Functions

```typescript
// Approve USDC spending
const hash = await contracts.approveUSDC({
  spender: '0x...',
  amount: contracts.parseUSDC('10.0'), // 10 USDC
});

// Get USDC balance
const balance = await contracts.getUSDCBalance('0x...');
console.log('Balance:', contracts.formatUSDC(balance));

// Check allowance
const allowance = await contracts.getUSDCAllowance('0x...', '0x...');
```

##### SessionPay Functions

```typescript
// Open AI inference session
const hash = await contracts.openSession({
  provider: '0x...', // AI provider address
  amount: contracts.parseUSDC('5.0'), // 5 USDC payment
  requestId: '0x...', // Unique request identifier
  model: 'gpt-4o-mini',
  inputHash: '0x...', // Hash of input data
});

// Get session details
const session = await contracts.getSession('0x...');
console.log('Session:', session);

// Confirm successful inference (provider only)
const hash = await contracts.confirmSuccess({
  requestId: '0x...',
  outputRef: 'ipfs://Qm...', // Reference to output
});

// Request refund (payer only, after delay)
const hash = await contracts.refund('0x...');
```

##### Utility Functions

```typescript
// Convert between string and BigInt
const amount = contracts.parseUSDC('10.5'); // 10500000n (6 decimals)
const readable = contracts.formatUSDC(10500000n); // "10.5"
```

### EAS Integration

#### POLySealEAS

```typescript
import { POLySealEAS } from '@polyseal/sdk';
import { ethers } from 'ethers';

const provider = new ethers.JsonRpcProvider('https://rpc-amoy.polygon.technology');
const signer = new ethers.Wallet('0x...', provider);
const eas = new POLySealEAS(signer);
```

##### Schema Registration

```typescript
// Register the AI inference schema (one-time setup)
const schemaUID = await eas.registerSchema();
console.log('Schema UID:', schemaUID);
```

##### Creating Attestations

```typescript
// Create attestation for successful AI inference
const attestationUID = await eas.attestPaidInference(
  {
    payer: '0x...', // Who paid for inference
    provider: '0x...', // AI service provider
    requestId: '0x...', // Session request ID
    model: 'gpt-4o-mini',
    priceUSDC: 5000000n, // 5 USDC (6 decimals)
    inputHash: '0x...', // Hash of input data
    outputRef: 'ipfs://Qm...', // Reference to output
    status: 1, // 1 = success, 0 = failure
    chainId: 80002, // Polygon Amoy
    txHash: '0x...', // Transaction hash
    timestamp: Math.floor(Date.now() / 1000),
  },
  schemaUID,
);

// Generate EASScan link
const link = eas.generateEASScanLink(attestationUID);
console.log('View attestation:', link);
```

## 🔧 Configuration

### Network Constants

```typescript
import { AMOY_CONFIG, AMOY_CHAIN } from '@polyseal/sdk';

console.log('Chain ID:', AMOY_CONFIG.chainId); // 80002
console.log('RPC URL:', AMOY_CONFIG.rpcUrl);
console.log('SessionPay:', AMOY_CONFIG.sessionPayAddress);
console.log('MockUSDC:', AMOY_CONFIG.mockUSDCAddress);
console.log('EAS:', AMOY_CONFIG.easAddress);
```

### Contract ABIs

```typescript
import { SESSION_PAY_ABI, ERC20_ABI } from '@polyseal/sdk';

// Use ABIs for custom integrations
const contract = new ethers.Contract(address, SESSION_PAY_ABI, signer);
```

## 🎯 Common Usage Patterns

### Complete Payment Flow

```typescript
import { createPOLySealSDK, POLySealEAS } from '@polyseal/sdk';
import { ethers } from 'ethers';

async function payForAIInference() {
  // 1. Setup
  const sdk = createPOLySealSDK();
  const walletClient = sdk.createWalletClient('0x...');
  const contracts = sdk.createContracts(walletClient);

  // 2. Approve USDC
  await contracts.approveUSDC({
    spender: '0xE23EF3e9A5903cB8F68334FCAfDb89d50541d235', // SessionPay address
    amount: contracts.parseUSDC('5.0'),
  });

  // 3. Open session
  const requestId = ethers.keccak256(ethers.toUtf8Bytes('unique-request-id'));
  const inputHash = ethers.keccak256(ethers.toUtf8Bytes('user input data'));

  const txHash = await contracts.openSession({
    provider: '0x...', // AI provider address
    amount: contracts.parseUSDC('5.0'),
    requestId,
    model: 'gpt-4o-mini',
    inputHash,
  });

  console.log('Session opened:', txHash);

  // 4. Wait for AI processing...

  // 5. Provider confirms success (separate flow)
  // 6. EAS attestation created (separate flow)
}
```

### Provider Settlement Flow

```typescript
async function settleAIInference() {
  const sdk = createPOLySealSDK();
  const providerWallet = sdk.createWalletClient('0x...'); // Provider's key
  const contracts = sdk.createContracts(providerWallet);

  // Confirm successful inference
  const txHash = await contracts.confirmSuccess({
    requestId: '0x...',
    outputRef: 'ipfs://Qm123...', // IPFS hash of AI output
  });

  console.log('Payment released:', txHash);
}
```

### EAS Attestation Creation

```typescript
async function createAttestation() {
  const provider = new ethers.JsonRpcProvider('https://rpc-amoy.polygon.technology');
  const signer = new ethers.Wallet('0x...', provider);
  const eas = new POLySealEAS(signer);

  const attestationUID = await eas.attestPaidInference(
    {
      payer: '0x...',
      provider: '0x...',
      requestId: '0x...',
      model: 'gpt-4o-mini',
      priceUSDC: 5000000n,
      inputHash: '0x...',
      outputRef: 'ipfs://Qm...',
      status: 1,
      chainId: 80002,
      txHash: '0x...',
      timestamp: Math.floor(Date.now() / 1000),
    },
    schemaUID,
  );

  console.log('Attestation created:', attestationUID);
}
```

## 🔗 Contract Addresses (Polygon Amoy)

- **SessionPay**: `0xE23EF3e9A5903cB8F68334FCAfDb89d50541d235`
- **MockUSDC**: `0xcF28F960aA85b051D030374B1ACd14668abaAf3e`
- **EAS**: `0xb101275a60d8bfb14529C421899aD7CA1Ae5B5Fc`
- **Schema Registry**: `0x23c5701A1BDa89C61d181BD79E5203c730708AE7`

## 🌐 Network Information

- **Chain**: Polygon Amoy Testnet
- **Chain ID**: 80002
- **RPC**: https://rpc-amoy.polygon.technology
- **Explorer**: https://amoy.polygonscan.com
- **EAS Explorer**: https://polygon-amoy.easscan.org
- **Gas Token**: POL (not MATIC)

## 🔒 Security

- All contract interactions use type-safe viem clients
- Private keys never leave your application
- Built-in error handling and validation
- Follows Ethereum best practices

## 📄 Types

```typescript
interface SessionData {
  requestId: `0x${string}`;
  payer: `0x${string}`;
  provider: `0x${string}`;
  token: `0x${string}`;
  amount: bigint;
  model: string;
  inputHash: `0x${string}`;
  createdAt: bigint;
  settled: boolean;
  outputRef: string;
}

interface AttestationData {
  payer: `0x${string}`;
  provider: `0x${string}`;
  requestId: `0x${string}`;
  model: string;
  priceUSDC: bigint;
  inputHash: `0x${string}`;
  outputRef: string;
  status: number;
  chainId: number;
  txHash: `0x${string}`;
  timestamp: number;
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.
