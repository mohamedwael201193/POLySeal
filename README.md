# POLySeal Frontend - Wave 1 (Polygon Buildathon)

> Next-generation attestation platform built on Polygon Amoy with AI assistance

## 🚀 Tech Stack

- **Framework**: Vite + React + TypeScript
- **Styling**: TailwindCSS + shadcn/ui
- **Web3**: wagmi v2 + viem + Web3Modal (WalletConnect)
- **Animations**: Framer Motion + Lottie
- **State**: Zustand
- **HTTP**: Axios with retry logic
- **Testing**: Vitest + React Testing Library

## 📦 Features

- ✅ **Home**: Animated hero, feature cards, live metrics
- ✅ **AI Assistant**: Streaming chat with server-side AI
- ✅ **Create Attestation**: Multi-step wizard with EAS integration
- ✅ **Explorer**: Search attestations by address/ID
- ✅ **Market**: Live MATIC/ETH price data
- ✅ **Dashboard**: Wallet profile + attestation history

## 🎨 Design System

- **Dark neon aesthetic** with purple gradients (8B5CF6→A855F7)
- **Electric blue** (06B6D4) and **neon green** (10B981) accents
- **Glassmorphism cards** with animated gradient mesh background
- **60fps animations** with Framer Motion
- **Inter** + **JetBrains Mono** fonts

## 🔧 Environment Variables

Create a `.env` file in the project root:

```bash
VITE_CHAIN_ID=80002
VITE_RPC_URL=https://rpc-amoy.polygon.technology
VITE_SCANNER_BASE=https://amoy.polygonscan.com
VITE_EAS_ADDRESS=0xb101275a60d8bfb14529C421899aD7CA1Ae5B5Fc
VITE_SCHEMA_REGISTRY=0x23c5701A1BDa89C61d181BD79E5203c730708AE7
VITE_WALLETCONNECT_PROJECT_ID=819c488197a77d15c78fc60950b32fe2
VITE_SESSIONPAY_ADDRESS=0xE23EF3e9A5903cB8F68334FCAfDb89d50541d235
VITE_MOCKUSDC_ADDRESS=0xcF28F960aA85b051D030374B1ACd14668abaAf3e
VITE_SERVER_URL=http://localhost:3001
```

## 🛠️ Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm test

# Lint
npm run lint
```

## 🌐 Network

- **Chain**: Polygon Amoy (testnet)
- **Chain ID**: 80002
- **Currency**: MATIC
- **Explorer**: https://amoy.polygonscan.com

## 📡 API Integration

All API calls go through `${VITE_SERVER_URL}/api/*`:

- `GET /api/metrics` - Platform metrics
- `GET /api/explorer?q={query}` - Search attestations
- `POST /api/attestations/create` - Create attestation
- `GET /api/attestations` - List attestations
- `GET /api/users/{address}/history` - User history
- `GET /api/prices` - Live crypto prices
- `POST /api/ai/stream` - AI streaming chat

## 🔐 Security

- No private keys in frontend
- All external API calls proxied through server
- Input validation with zod
- CORS configured for production
- Rate limiting on server endpoints

## 🎯 Acceptance Criteria

- ✅ Wallet connects to Polygon Amoy
- ✅ Network switch prompts if wrong chain
- ✅ Real API calls to server (no mocks)
- ✅ Attestation creation completes on-chain
- ✅ Explorer shows real attestations
- ✅ Build passes without errors
- ✅ Lighthouse score ≥ 95

## 📚 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn components
│   └── WalletConnect.tsx
├── config/             # Configuration
│   └── wagmi.ts        # Web3 config
├── layouts/            # Page layouts
│   └── AppLayout.tsx
├── lib/                # Utilities
│   ├── contracts.ts    # Contract helpers
│   ├── env.ts          # Environment validation
│   ├── format.ts       # Formatting utils
│   └── utils.ts
├── pages/              # Route pages
│   ├── Home.tsx
│   ├── AIAssistant.tsx
│   ├── CreateAttestation.tsx
│   ├── Explorer.tsx
│   ├── Market.tsx
│   ├── Dashboard.tsx
│   └── NotFound.tsx
├── services/           # API services
│   └── api.ts
├── stores/             # Zustand stores
│   ├── app.ts
│   └── ai.ts
├── App.tsx
├── index.css           # Global styles + design system
└── main.tsx
```

## 🚢 Deployment

1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy `dist/` folder to Vercel, Netlify, or any static host

3. Set environment variables in hosting platform

4. Ensure `VITE_SERVER_URL` points to production backend

## 📄 License

MIT

---

Built with ❤️ for Polygon Buildathon Wave 1
