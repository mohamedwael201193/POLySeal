import { Request, Response, Router } from 'express';
import { realAttestationService } from '../services/realAttestationService.js';
import type { ApiResponse, AttestationData } from '../types/api';

const router: Router = Router()

// POST /api/attestations/create - Create REAL blockchain attestation on Polygon Amoy
router.post('/create', async (req: Request, res: Response<ApiResponse<{ attestationId: string; txHash: string }>>) => {
  try {
    const { recipient, data, schema } = req.body

    if (!recipient) {
      return res.status(400).json({
        success: false,
        error: 'Recipient address is required',
        timestamp: Date.now(),
        version: '1.0.0'
      })
    }

    console.log('🔗 Creating REAL Polygon attestation:', { recipient, data, schema })

    // Create real blockchain attestation using EAS
    const result = await realAttestationService.createAttestation({
      recipient,
      data,
      schema, // Optional: use default POLySeal schema if not provided
      expirationTime: 0, // No expiration
      revocable: true
    })
    
    console.log('✅ Real attestation created:', result)

    // Return consistent response format
    const response = {
      attestationId: result.uid,
      txHash: result.transactionHash,
      scannerUrl: result.scannerUrl,
      easScanUrl: result.easScanUrl,
      isReal: !('fallback' in result),
      ...('fallback' in result && { fallbackReason: result.error })
    }

    res.status(201).json({
      success: true,
      data: response,
      timestamp: Date.now(),
      version: '1.0.0'
    } as any)
  } catch (error) {
    console.error('❌ Attestation creation failed:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    res.status(500).json({
      success: false,
      error: `Failed to create attestation: ${errorMessage}`,
      timestamp: Date.now(),
      version: '1.0.0'
    })
  }
})

// GET /api/attestations - List attestations
router.get('/', async (req: Request, res: Response<ApiResponse<AttestationData[]>>) => {
  try {
    const { q: query } = req.query

    // TODO: Replace with actual data from EAS contract
    const mockAttestations: AttestationData[] = [
      {
        id: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        schema: '0xe59116ca974847b93d86e044787487e0a49653093ab551682dca2cd187a3506f',
        attester: '0x742d35Cc6C5B8D5B9532E2D5a4a2B5e8F7B8C9D0',
        recipient: '0x8ba1f109551bD432803012645Hac136c',
        data: { skill: 'TypeScript', level: 'Expert' },
        timestamp: Date.now() - 86400000,
        txHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
      }
    ]

    // Filter if query provided
    const filteredAttestations = query 
      ? mockAttestations.filter(att => JSON.stringify(att.data).includes(query.toString()))
      : mockAttestations

    res.json({
      success: true,
      data: filteredAttestations,
      timestamp: Date.now(),
      version: '1.0.0'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch attestations',
      timestamp: Date.now(),
      version: '1.0.0'
    })
  }
})

export default router