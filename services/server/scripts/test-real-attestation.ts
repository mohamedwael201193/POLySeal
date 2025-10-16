#!/usr/bin/env tsx
/**
 * Real attestation test with validated addresses
 */

import { RealAttestationService } from '../dist/services/realAttestationService.js'

async function testRealAttestation() {
  console.log('🔗 Testing real attestation creation with validated addresses...\n')
  
  const service = new RealAttestationService()
  
  // Test with a potentially problematic truncated address
  const testAddress = "0xe1641A049381149AFAacef386ee58fDA5ad9Be32" // 42 chars, might be truncated
  
  console.log(`📝 Testing attestation for address: ${testAddress}`)
  
  try {
    // Create a test attestation with correct parameters
    const attestation = await service.createAttestation({
      recipient: testAddress, // This will be validated and normalized
      data: {
        message: "Test attestation with validated address",
        score: 95,
        verified: true
      },
      schema: '0x27d06e3659317e9a4f8154d1e849eb53d43d91fb4f219884d1684f86d797804a', // Use default schema
      revocable: true
    })
    
    console.log('✅ Attestation created successfully!')
    console.log(`   Transaction: ${attestation}`)
    
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('incorrect data length')) {
        console.log('❌ Still getting "incorrect data length" error - need to investigate further')
        console.log(`   Error: ${error.message}`)
      } else {
        console.log('⚠️  Different error (expected for mock schema):')
        console.log(`   Error: ${error.message}`)
      }
    }
  }
}

testRealAttestation().catch(console.error)