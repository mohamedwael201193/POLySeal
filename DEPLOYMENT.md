# POLySeal Deployment Guide

Complete step-by-step deployment guide for POLySeal platform to GitHub, Vercel (frontend), and Render (backend).

## 🚀 Quick Deployment Steps

### 1. GitHub Repository Setup

1. **Initialize Git Repository**

   ```bash
   git init
   git add .
   git commit -m "Initial commit: Complete POLySeal platform"
   ```

2. **Create GitHub Repository**
   - Go to [GitHub](https://github.com) and create new repository named `POLySeal`
   - Don't initialize with README (we already have one)

3. **Connect and Push**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/POLySeal.git
   git branch -M main
   git push -u origin main
   ```

### 2. Backend Deployment (Render)

1. **Connect Repository to Render**
   - Go to [Render.com](https://render.com) and sign up/login
   - Click "New +" → "Blueprint"
   - Connect your GitHub account
   - Select the POLySeal repository

2. **Configure Environment Variables**
   In Render dashboard, add these secrets:

   ```
   POLYGON_AMOY_RPC_URL=https://rpc-amoy.polygon.technology
   POLYGON_AMOY_RPC_URL_2=https://polygon-amoy.g.alchemy.com/v2/YOUR_KEY
   POLYGON_AMOY_RPC_URL_3=https://polygon-amoy.infura.io/v3/YOUR_KEY
   WALLET_PRIVATE_KEY=your_wallet_private_key_here
   GOOGLE_API_KEY=your_google_gemini_api_key
   CORS_ORIGIN=https://polyseal.vercel.app
   ```

3. **Deploy Service**
   - Service will auto-deploy using `render.yaml` configuration
   - Build command: `cd services/server && pnpm install && pnpm build`
   - Start command: `cd services/server && pnpm start`
   - Health check: `/api/health`

### 3. Frontend Deployment (Vercel)

1. **Install Vercel CLI**

   ```bash
   npm install -g vercel
   ```

2. **Deploy to Vercel**

   ```bash
   cd apps/web
   vercel --prod
   ```

3. **Configure Environment Variables**
   In Vercel dashboard, add:

   ```
   NEXT_PUBLIC_API_URL=https://your-render-app.onrender.com
   ```

4. **Update CORS**
   Update your Render environment variable:
   ```
   CORS_ORIGIN=https://your-vercel-app.vercel.app
   ```

## 🔧 Detailed Configuration

### Environment Variables Reference

#### Backend (Render)

```env
NODE_ENV=production
PORT=10000
POLYGON_AMOY_RPC_URL=https://rpc-amoy.polygon.technology
POLYGON_AMOY_RPC_URL_2=https://polygon-amoy.g.alchemy.com/v2/YOUR_KEY
POLYGON_AMOY_RPC_URL_3=https://polygon-amoy.infura.io/v3/YOUR_KEY
WALLET_PRIVATE_KEY=your_wallet_private_key_here
EAS_CONTRACT_ADDRESS=0xb101275a60d8bfb14529C421899aD7CA1Ae5B5Fc
SCHEMA_REGISTRY_ADDRESS=0x23c5701A1BDa89C61d181BD79E5203c730708AE7
GOOGLE_API_KEY=your_google_gemini_api_key
CORS_ORIGIN=https://your-vercel-app.vercel.app
SCHEMA_UID=0x123456789abcdef123456789abcdef123456789abcdef123456789abcdef1234
```

#### Frontend (Vercel)

```env
NEXT_PUBLIC_API_URL=https://your-render-app.onrender.com
```

### Domain Configuration

1. **Custom Domain (Optional)**
   - In Vercel: Settings → Domains → Add your domain
   - In Render: Settings → Custom Domains → Add your domain
   - Update CORS_ORIGIN to match your custom domain

2. **SSL Certificates**
   - Both Vercel and Render provide automatic SSL
   - No additional configuration needed

## 🧪 Deployment Verification

### 1. Health Checks

**Backend Health Check:**

```bash
curl https://your-render-app.onrender.com/api/health
```

Expected response:

```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600,
  "version": "1.0.0"
}
```

**Frontend Health Check:**

```bash
curl https://your-vercel-app.vercel.app
```

Should return the POLySeal homepage.

### 2. API Endpoints Test

```bash
# Test POL price endpoint
curl https://your-render-app.onrender.com/api/market/pol-price

# Test AI chat endpoint
curl -X POST https://your-render-app.onrender.com/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello"}'

# Test address validation
curl -X POST https://your-render-app.onrender.com/api/validate-address \
  -H "Content-Type: application/json" \
  -d '{"address": "0x742..."}'
```

### 3. Blockchain Integration Test

Visit your deployed frontend and:

1. Create a test attestation
2. Check transaction on [Polygon Amoy Explorer](https://amoy.polygonscan.com/)
3. Verify attestation on [EAS Explorer](https://polygon-amoy.easscan.org/)

## 🔐 Security Checklist

- [ ] All private keys stored as environment secrets
- [ ] CORS configured for production domains only
- [ ] HTTPS enforced on all endpoints
- [ ] Rate limiting enabled
- [ ] Security headers configured (helmet.js)
- [ ] Input validation on all endpoints
- [ ] Error messages don't expose sensitive information

## 📊 Monitoring & Maintenance

### 1. Render Monitoring

- Monitor CPU, Memory, and Disk usage in Render dashboard
- Set up alerts for service downtime
- Check logs regularly: `Logs` tab in Render dashboard

### 2. Vercel Analytics

- Enable Vercel Analytics for frontend performance
- Monitor build times and deployment success rate

### 3. Blockchain Monitoring

- Monitor wallet balance (current: 4.91 POL)
- Set up alerts for low balance
- Monitor gas prices and transaction success rate

### 4. API Rate Limits

- Google Gemini: 15 requests/minute (free tier)
- CoinGecko: Check rate limits in API responses
- Monitor usage and upgrade plans if needed

## 🚨 Troubleshooting

### Common Issues

1. **Build Failures**

   ```bash
   # Check Node version (requires 18+)
   node --version

   # Clear cache and reinstall
   rm -rf node_modules
   pnpm install
   ```

2. **CORS Errors**
   - Verify CORS_ORIGIN matches your frontend domain exactly
   - Include protocol (https://) in CORS_ORIGIN
   - Check both Render and Vercel environment variables

3. **Blockchain Connection Issues**
   - Verify wallet has sufficient POL balance
   - Check RPC endpoints are working
   - Verify contract addresses are correct for Polygon Amoy

4. **AI API Errors**
   - Check Google API key is valid
   - Monitor rate limit usage
   - Verify API key has Gemini API access enabled

### Logs Access

**Render Logs:**

```bash
# View in dashboard or use Render CLI
render logs -s your-service-name
```

**Vercel Logs:**

```bash
# View in dashboard or use Vercel CLI
vercel logs your-deployment-url
```

## 📈 Performance Optimization

1. **Frontend Optimization**
   - Enable Vercel Analytics
   - Use Next.js Image optimization
   - Implement proper caching headers

2. **Backend Optimization**
   - Monitor response times
   - Implement Redis caching if needed
   - Optimize database queries

3. **Blockchain Optimization**
   - Use multiple RPC endpoints for redundancy
   - Implement transaction retry logic
   - Monitor and adjust gas prices

## 🔄 CI/CD Pipeline

### Automatic Deployments

1. **Enable Auto-Deploy**
   - Render: Enable "Auto-Deploy" from main branch
   - Vercel: Automatically deploys on push to main

2. **Branch Protection**

   ```bash
   # Only deploy from main branch
   git checkout -b development
   git push -u origin development
   ```

3. **Environment Branches**
   - `main` → Production deployments
   - `development` → Staging deployments (optional)

## 📞 Support

If you encounter issues:

1. Check this deployment guide
2. Review application logs
3. Open GitHub issue with:
   - Error message
   - Steps to reproduce
   - Environment details
   - Screenshots if applicable

---

**Deployment completed! Your POLySeal platform is now live! 🚀**
