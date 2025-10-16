#!/usr/bin/env tsx
/**
 * Debug address validation to see what's happening
 */

import { RealAttestationService } from '../dist/services/realAttestationService.js'

async function debugAddressValidation() {
  console.log('🔍 Debugging address validation...\n')
  
  const service = new RealAttestationService()
  
  // Test the problematic address
  const testAddress = "0xe1641A049381149AFAacef386ee58fDA5ad9Be32"
  
  console.log(`📝 Original address: "${testAddress}"`)
  console.log(`   Type: ${typeof testAddress}`)
  console.log(`   Length: ${testAddress.length}`)
  console.log(`   Starts with 0x: ${testAddress.startsWith('0x')}`)
  
  try {
    // Use the private method through any cast to access it
    const result = (service as any).validateAndNormalizeAddress(testAddress, 'test')
    
    console.log(`✅ Validated address: "${result}"`)
    console.log(`   Type: ${typeof result}`)
    console.log(`   Length: ${result.length}`)
    console.log(`   Starts with 0x: ${result.startsWith('0x')}`)
    
    // Check if ethers can handle the address
    console.log(`\n🔧 Checking ethers compatibility:`)
    
    // Test with ethers.isAddress
    const { ethers } = await import('ethers')
    console.log(`   ethers.isAddress("${testAddress}"): ${ethers.isAddress(testAddress)}`)
    console.log(`   ethers.isAddress("${result}"): ${ethers.isAddress(result)}`)
    
    // Test checksum conversion
    const checksumOriginal = ethers.getAddress(testAddress)
    const checksumResult = ethers.getAddress(result)
    
    console.log(`   ethers.getAddress("${testAddress}"): "${checksumOriginal}"`)
    console.log(`   ethers.getAddress("${result}"): "${checksumResult}"`)
    console.log(`   Are they the same? ${checksumOriginal === checksumResult}`)
    
  } catch (error) {
    console.log(`❌ ERROR: ${error instanceof Error ? error.message : String(error)}`)
  }
}

debugAddressValidation().catch(console.error)