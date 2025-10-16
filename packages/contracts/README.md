# POLySeal Smart Contracts

Smart contracts for POLySeal - AI inference escrow and attestation system on Polygon Amoy testnet.

## 📄 Contracts

### MockUSDC

- **Purpose**: 6-decimal test USDC token for Polygon Amoy
- **Features**: Mintable by owner, ERC20 standard
- **Decimals**: 6 (matches real USDC)

### SessionPay

- **Purpose**: Escrow contract managing AI inference payments
- **Features**:
  - Isolated escrow per session (no pooled funds)
  - 15-minute refund protection for users
  - Provider-only settlement access
  - Pause/unpause functionality
  - Reentrancy protection

## 🛡️ Security Features

- **SafeERC20**: All token operations use OpenZeppelin's SafeERC20
- **ReentrancyGuard**: Protection against reentrancy attacks
- **Ownable**: Admin functions restricted to contract owner
- **Pausable**: Emergency pause functionality
- **Input Validation**: Comprehensive parameter validation

## 🚀 Quick Start

### Prerequisites

```bash
npm install
```

### Compile Contracts

```bash
npm run build
```

### Run Tests

```bash
npm test
```

### Deploy to Polygon Amoy

```bash
# Ensure .env is configured with DEPLOYER_PRIVATE_KEY and AMOY_RPC
npm run deploy
```

### Verify Contracts

```bash
# Requires POLYGONSCAN_API_KEY in .env
npm run verify
```

## 🔧 Configuration

Environment variables needed:

- `DEPLOYER_PRIVATE_KEY`: Private key for contract deployment
- `AMOY_RPC`: Polygon Amoy RPC URL
- `POLYGONSCAN_API_KEY`: For contract verification

## 📝 Contract Addresses

After deployment, addresses will be written to root `.env` file:

- `MOCKUSDC_ADDRESS`: MockUSDC contract address
- `SESSIONPAY_ADDRESS`: SessionPay contract address

## 🔍 Usage Flow

1. **User**: Approves MockUSDC spending by SessionPay
2. **User**: Calls `openSession()` with provider, amount, requestId, model, inputHash
3. **Provider**: Runs AI inference off-chain
4. **Provider**: Calls `confirmSuccess()` with outputRef to settle payment
5. **User**: Can call `refund()` after 15 minutes if provider doesn't settle

## 🧪 Testing

Tests cover:

- Contract deployment and initialization
- Session creation and validation
- Settlement by provider
- Refund functionality and timing
- Access controls and security
- Pause/unpause functionality
- Edge cases and error conditions

Run with:

```bash
npm test
```

## 📊 Gas Optimization

- Packed structs for storage efficiency
- Minimal external calls
- Optimized for common use cases
- Gas reporter enabled in tests

## 🔗 Integration

These contracts integrate with:

- **EAS (Ethereum Attestation Service)**: For creating attestation receipts
- **Frontend**: Web3 interface for user interactions
- **Backend**: API for provider settlement operations

## 📚 Resources

- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [Hardhat Documentation](https://hardhat.org/docs)
- [Polygon Amoy Testnet](https://docs.polygon.technology/tools/faucets/)
- [EAS Documentation](https://docs.attest.sh/)
