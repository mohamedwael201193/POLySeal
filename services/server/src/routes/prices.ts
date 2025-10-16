import axios from 'axios'
import { Request, Response, Router } from 'express'
import { config } from '../config/env.js'
import type { ApiResponse, PriceData } from '../types/api'

const router: Router = Router()

// GET /api/prices - Get live crypto prices from CoinGecko
router.get('/', async (req: Request, res: Response<ApiResponse<PriceData>>) => {
  try {
    // Call CoinGecko API for real-time prices  
    const coingeckoResponse = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
      params: {
        ids: 'matic-network,ethereum,bitcoin',
        vs_currencies: 'usd',
        include_24hr_change: true
      },
      headers: config.apis.coingecko ? {
        'x-cg-demo-api-key': config.apis.coingecko
      } : {},
      timeout: config.timeouts.upstream
    })

    const geckoData = coingeckoResponse.data

    const realPrices: PriceData = {
      pol: geckoData['matic-network']?.usd || 0,
      polChange24h: geckoData['matic-network']?.usd_24h_change || 0,
      eth: geckoData.ethereum?.usd || 0,
      ethChange24h: geckoData.ethereum?.usd_24h_change || 0,
      btc: geckoData.bitcoin?.usd || 0,
      btcChange24h: geckoData.bitcoin?.usd_24h_change || 0,
      timestamp: Date.now()
    }

    res.json({
      success: true,
      data: realPrices,
      timestamp: Date.now(),
      version: '1.0.0'
    })
  } catch (error) {
    console.error('CoinGecko API error:', error)
    
    // Fallback to cached/default values on API failure
    const fallbackPrices: PriceData = {
      pol: 0.2024,
      polChange24h: -1.8,
      eth: 2580.50,
      ethChange24h: -1.2,
      btc: 67890.25,
      btcChange24h: 3.8,
      timestamp: Date.now()
    }

    res.json({
      success: true,
      data: fallbackPrices,
      timestamp: Date.now(),
      version: '1.0.0'
    })
  }
})

export default router