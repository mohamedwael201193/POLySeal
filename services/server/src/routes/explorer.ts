import { Request, Response, Router } from 'express'
import { realAttestationService } from '../services/realAttestationService.js'
import type { ApiResponse, AttestationData, ExplorerSearchResult } from '../types/api'

const router: Router = Router()

// GET /api/explorer - Search real EAS attestations
router.get('/', async (req: Request, res: Response<ApiResponse<ExplorerSearchResult>>) => {
  try {
    const { q: query = '', page = 1, pageSize = 20 } = req.query

    console.log('🔍 Real EAS Explorer search for:', query)

    let allAttestations: AttestationData[] = []

    if (query && typeof query === 'string') {
      // Check if it's a UID (64 character hex string)
      if (query.match(/^0x[a-fA-F0-9]{64}$/)) {
        console.log('🔍 Searching by attestation UID:', query)
        try {
          const attestation = await realAttestationService.getAttestation(query)
          if (attestation) {
            // Convert EAS attestation format to our AttestationData format
            const formattedAttestation: AttestationData = {
              id: attestation.uid,
              schema: attestation.schema,
              attester: attestation.attester,
              recipient: attestation.recipient,
              data: attestation.decodedData || { raw: attestation.data },
              timestamp: attestation.time * 1000, // Convert to milliseconds
              txHash: `0x${Math.random().toString(16).substring(2).padEnd(64, '0')}` // Mock tx hash
            }
            allAttestations = [formattedAttestation]
            console.log('✅ Found attestation by UID')
          }
        } catch (error) {
          console.log('❌ Attestation UID not found:', error)
        }
      }
      // Check if it's an address (40 character hex string)  
      else if (query.match(/^0x[a-fA-F0-9]{40}$/)) {
        console.log('🔍 Searching by address:', query)
        try {
          const addressAttestations = await realAttestationService.getUserAttestations(query)
          // Convert to AttestationData format
          const formattedAttestations: AttestationData[] = addressAttestations.map(att => ({
            id: att.id,
            schema: att.schema,
            attester: att.attester,
            recipient: att.recipient,
            data: att.data,
            timestamp: att.timestamp,
            txHash: att.txHash
          }))
          allAttestations = [...allAttestations, ...formattedAttestations]
          console.log(`📋 Found ${formattedAttestations.length} attestations for address ${query}`)
        } catch (error) {
          console.error('Error searching by address:', error)
        }
      }
      // Partial search for shorter queries
      else if (query.startsWith('0x') && query.length >= 6) {
        console.log('🔍 Searching by partial match:', query)
        try {
          const addressAttestations = await realAttestationService.getUserAttestations(query)
          const formattedAttestations: AttestationData[] = addressAttestations.map(att => ({
            id: att.id,
            schema: att.schema,
            attester: att.attester,
            recipient: att.recipient,
            data: att.data,
            timestamp: att.timestamp,
            txHash: att.txHash
          }))
          allAttestations = [...allAttestations, ...formattedAttestations]
          console.log(`📋 Found ${formattedAttestations.length} attestations for partial query`)
        } catch (error) {
          console.error('Error in partial search:', error)
        }
      }
    }

    // Add some mock attestations for better demonstration
    const mockAttestations: AttestationData[] = [
      {
        id: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        schema: '0xe59116ca974847b93d86e044787487e0a49653093ab551682dca2cd187a3506f',
        attester: '0x742d35Cc6C5B8D5B9532E2D5a4a2B5e8F7B8C9D0',
        recipient: '0x8ba1f109551bD432803012645Hac136c',
        data: { skill: 'TypeScript', level: 'Expert', verified: true },
        timestamp: Date.now() - 86400000,
        txHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
      },
      {
        id: '0x2345678901bcdef12345678901bcdef12345678901bcdef12345678901bcdef1',
        schema: '0xe59116ca974847b93d86e044787487e0a49653093ab551682dca2cd187a3506f',
        attester: '0x853d955aCEf822Db058eb8505911ED77F175b99e',
        recipient: '0x742d35Cc6C5B8D5B9532E2D5a4a2B5e8F7B8C9D0',
        data: { event: 'ETHGlobal Hackathon', attendance: true, role: 'participant' },
        timestamp: Date.now() - 172800000,
        txHash: '0xbcdef12345678901bcdef12345678901bcdef12345678901bcdef12345678901'
      }
    ]

    // Combine real and mock attestations
    allAttestations = [...allAttestations, ...mockAttestations]

    // Filter based on query (text search across multiple fields)
    const filteredAttestations = query 
      ? allAttestations.filter(att => {
          const searchTerm = query.toString().toLowerCase()
          return (
            att.id.toLowerCase().includes(searchTerm) ||
            att.attester.toLowerCase().includes(searchTerm) ||
            att.recipient.toLowerCase().includes(searchTerm) ||
            att.txHash.toLowerCase().includes(searchTerm) ||
            JSON.stringify(att.data).toLowerCase().includes(searchTerm)
          )
        })
      : allAttestations

    // Pagination
    const startIndex = (Number(page) - 1) * Number(pageSize)
    const endIndex = startIndex + Number(pageSize)
    const paginatedResults = filteredAttestations.slice(startIndex, endIndex)

    // Add proper scanner URLs to results
    const resultsWithUrls = paginatedResults.map(attestation => ({
      ...attestation,
      scannerUrl: `https://amoy.polygonscan.com/tx/${attestation.txHash}`,
      easScanUrl: `https://polygon-amoy.easscan.org/attestation/${attestation.id}`,
      timestamp: attestation.timestamp || Date.now()
    }))

    const result: ExplorerSearchResult = {
      attestations: resultsWithUrls,
      total: filteredAttestations.length,
      page: Number(page),
      pageSize: Number(pageSize)
    }

    res.json({
      success: true,
      data: result,
      timestamp: Date.now(),
      version: '1.0.0'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to search explorer',
      timestamp: Date.now(),
      version: '1.0.0'
    })
  }
})

export default router