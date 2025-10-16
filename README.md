# POLySeal - Universal Blockchain Attestation Platform

A comprehensive platform for creating, managing, and verifying blockchain attestations using the Ethereum Attestation Service (EAS) on Polygon network.

## 🌟 Features

### Real Blockchain Integration

- **Ethereum Attestation Service (EAS)** on Polygon Amoy testnet
- Real blockchain transactions with automatic gas estimation
- Server wallet management with funding validation
- Multiple RPC endpoint redundancy for reliability

### AI-Powered Assistant

- **Google Gemini AI** integration with streaming responses
- POLySeal-specific context and guidance
- 15 requests/minute free tier with 1M tokens/day

### Live Market Data

- **CoinGecko API** integration for real-time POL prices
- Interactive Chart.js visualizations with historical data
- Auto-refresh every 30 seconds

### Advanced Address Management

- Comprehensive Ethereum address validation
- Smart truncation handling and restoration
- 100% test coverage with validated algorithms

## 🏗️ Architecture

```
POLySeal/
├── apps/
│   └── web/                 # Next.js Frontend
├── services/
│   └── server/             # Express.js Backend API
├── packages/
│   ├── types/              # Shared TypeScript definitions
│   ├── contracts/          # Smart contract interfaces
│   └── sdk/                # POLySeal SDK
└── docs/                   # Documentation
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm 9+
- Git

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/POLySeal.git
   cd POLySeal
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Configure environment variables**

   Create `.env` files in both `services/server/` and `apps/web/`:

   **Backend (`services/server/.env`)**:

   ```env
   # Blockchain Configuration
   POLYGON_AMOY_RPC_URL=https://rpc-amoy.polygon.technology
   WALLET_PRIVATE_KEY=your_wallet_private_key
   EAS_CONTRACT_ADDRESS=0xb101275a60d8bfb14529C421899aD7CA1Ae5B5Fc
   SCHEMA_REGISTRY_ADDRESS=0x23c5701A1BDa89C61d181BD79E5203c730708AE7

   # AI Configuration
   GOOGLE_API_KEY=your_google_gemini_api_key

   # API Configuration
   PORT=3001
   CORS_ORIGIN=http://localhost:3000
   ```

   **Frontend (`apps/web/.env.local`)**:

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```

4. **Start development servers**

   ```bash
   # Start backend
   cd services/server
   pnpm dev

   # Start frontend (new terminal)
   cd apps/web
   pnpm dev
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

## 📦 Deployment

### Frontend (Vercel)

1. **Deploy to Vercel**

   ```bash
   vercel --prod
   ```

2. **Configure Environment Variables**
   In Vercel dashboard, add:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com
   ```

### Backend (Render)

1. **Connect GitHub repository** to Render
2. **Configure Environment Variables** in Render dashboard
3. **Deploy** with build command: `cd services/server && pnpm build`
4. **Start command**: `cd services/server && pnpm start`

## 🔧 Configuration

### Blockchain Networks

Currently configured for Polygon Amoy testnet:

- **Chain ID**: 80002
- **EAS Contract**: `0xb101275a60d8bfb14529C421899aD7CA1Ae5B5Fc`
- **Schema Registry**: `0x23c5701A1BDa89C61d181BD79E5203c730708AE7`

### API Integrations

- **Google Gemini AI**: 15 requests/minute, 1M tokens/day (free tier)
- **CoinGecko API**: Rate-limited public API for price data
- **Ethereum Attestation Service**: Official EAS contracts on Polygon

## 🧪 Testing

Run the complete test suite:

```bash
# Backend tests
cd services/server
pnpm test

# Frontend tests (if available)
cd apps/web
pnpm test
```

### Test Coverage

- ✅ EAS Integration Tests: 5/5 passed
- ✅ Address Validation: 100% success rate
- ✅ Wallet Management: Full coverage
- ✅ API Endpoints: Complete integration testing

## 📚 API Documentation

### Attestation Endpoints

- `POST /api/attestations` - Create new attestation
- `GET /api/attestations/:id` - Get attestation by ID
- `GET /api/attestations/address/:address` - Get attestations by address

### AI Assistant

- `POST /api/ai/chat` - Chat with AI assistant (streaming)

### Market Data

- `GET /api/market/pol-price` - Current POL price
- `GET /api/market/historical/:days` - Historical price data

### Utility

- `GET /api/health` - Health check
- `POST /api/validate-address` - Validate Ethereum address

## 🔐 Security

- Private keys stored securely in environment variables
- CORS configured for production origins
- Input validation on all endpoints
- Rate limiting on AI endpoints
- Gas estimation and transaction retry logic

## 🌐 Live Demo

- **Frontend**: [https://polyseal.vercel.app](https://polyseal.vercel.app)
- **API**: [https://polyseal-backend.onrender.com](https://polyseal-backend.onrender.com)

## 📊 Real Blockchain Metrics

Current operational stats:

- **Server Wallet Balance**: 4.91 POL
- **Successful Transactions**: Confirmed on Polygon Amoy
- **Average Gas Cost**: ~0.018 USD per attestation
- **Network Uptime**: 99.9% with multi-RPC redundancy

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the `docs/` directory
- **Issues**: Open an issue on GitHub
- **Community**: Join our Discord server

## 🔗 Links

- [Ethereum Attestation Service](https://attest.sh/)
- [Polygon Network](https://polygon.technology/)
- [Google Gemini AI](https://ai.google.dev/)
- [CoinGecko API](https://www.coingecko.com/en/api)

---

Built with ❤️ by the POLySeal Team
