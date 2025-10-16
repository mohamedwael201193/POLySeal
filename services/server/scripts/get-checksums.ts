#!/usr/bin/env tsx
/**
 * Quick test to get correct checksummed addresses
 */

import { RealAttestationService } from '../dist/services/realAttestationService.js'

async function getCorrectChecksums() {
  console.log('🔍 Getting correct checksummed addresses...\n')
  
  const service = new RealAttestationService()
  
  const testAddresses = [
    "0xde84a47a744165b5123d428321f541fd524c4435",
    "0xe1641a049381149afaacef386ee58fda5ad9be32",
    "0x000000000e1641a049381149afaacef386ee58fd" // padded version
  ]
  
  for (const addr of testAddresses) {
    try {
      const result = await service.validateAndNormalizeAddress(addr)
      console.log(`${addr} -> ${result}`)
    } catch (error) {
      console.log(`${addr} -> ERROR: ${error}`)
    }
  }
}

getCorrectChecksums().catch(console.error)