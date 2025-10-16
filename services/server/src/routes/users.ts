import { Request, Response, Router } from 'express'
import { realAttestationService } from '../services/realAttestationService.js'
import type { ApiResponse, AttestationData, UserHistoryData } from '../types/api'

const router: Router = Router()

// GET /api/users/:address/history - Get user attestation history from blockchain
router.get('/:address/history', async (req: Request, res: Response<ApiResponse<UserHistoryData>>) => {
  try {
    const { address } = req.params

    console.log('🔍 Fetching real attestation history for:', address)
    
    // Get real attestations from blockchain
    const userAttestations = await realAttestationService.getUserAttestations(address)

    // Mock additional attestations for demonstration
    const additionalAttestations: AttestationData[] = [
      {
        id: '0x1111111111111111111111111111111111111111111111111111111111111111',
        schema: '0xe59116ca974847b93d86e044787487e0a49653093ab551682dca2cd187a3506f',
        attester: address,
        recipient: '0x8ba1f109551bD432803012645Hac136c',
        data: { skill: 'Solidity', level: 'Advanced', verified: true },
        timestamp: Date.now() - 86400000,
        txHash: '0x1111111111111111111111111111111111111111111111111111111111111111'
      }
    ]

    const mockAttestationsReceived: AttestationData[] = [
      {
        id: '0x2222222222222222222222222222222222222222222222222222222222222222',
        schema: '0xe59116ca974847b93d86e044787487e0a49653093ab551682dca2cd187a3506f',
        attester: '0x742d35Cc6C5B8D5B9532E2D5a4a2B5e8F7B8C9D0',
        recipient: address,
        data: { event: 'DevCon Workshop', completion: true, score: 95 },
        timestamp: Date.now() - 172800000,
        txHash: '0x2222222222222222222222222222222222222222222222222222222222222222'
      }
    ]

    const userHistory: UserHistoryData = {
      address,
      attestationsCreated: [...userAttestations, ...additionalAttestations],
      attestationsReceived: [...userAttestations, ...mockAttestationsReceived]
    }

    res.json({
      success: true,
      data: userHistory,
      timestamp: Date.now(),
      version: '1.0.0'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user history',
      timestamp: Date.now(),
      version: '1.0.0'
    })
  }
})

export default router