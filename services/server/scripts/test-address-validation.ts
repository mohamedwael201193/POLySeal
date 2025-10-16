#!/usr/bin/env tsx
/**
 * Comprehensive Address Validation Test Suite
 * Tests multiple address formats to ensure robust validation
 */

import { RealAttestationService } from '../dist/services/realAttestationService.js'

// Test cases with different address formats
const testAddresses = [
  // Truncated addresses (common issue)
  {
    name: 'Truncated (41 chars)',
    address: '0xe1641A049381149AFAacef386ee58fDA5ad9Be32',
    expected: '0xe1641A049381149AFAacef386ee58fDA5ad9Be32' // Correct EIP-55 checksum
  },
  {
    name: 'Truncated (40 chars, no 0x)',
    address: 'e1641A049381149AFAacef386ee58fDA5ad9Be32',
    expected: '0xe1641A049381149AFAacef386ee58fDA5ad9Be32' // Add 0x and checksum
  },
  {
    name: 'Very truncated (30 chars)',
    address: '0xe1641A049381149AFAacef386ee58fD',
    expected: '0x000000000E1641A049381149aFaAcEF386eE58fD' // Correct padded and checksummed
  },
  
  // Perfect addresses
  {
    name: 'Perfect lowercase',
    address: '0xde84a47a744165b5123d428321f541fd524c4435',
    expected: '0xDE84a47a744165B5123D428321F541fD524c4435' // Correct EIP-55 checksum
  },
  {
    name: 'Perfect uppercase',
    address: '0XDE84A47A744165B5123D428321F541FD524C4435',
    expected: '0xDE84a47a744165B5123D428321F541fD524c4435' // Normalize and checksum
  },
  {
    name: 'Perfect mixed case',
    address: '0xdE84a47a744165B5123D428321F541fD524C4435',
    expected: '0xDE84a47a744165B5123D428321F541fD524c4435' // Correct checksum
  },
  
  // Edge cases
  {
    name: 'No 0x prefix',
    address: 'de84a47a744165b5123d428321f541fd524c4435',
    expected: '0xDE84a47a744165B5123D428321F541fD524c4435' // Add 0x and checksum
  },
  {
    name: 'With whitespace',
    address: '  0xde84a47a744165b5123d428321f541fd524c4435  ',
    expected: '0xDE84a47a744165B5123D428321F541fD524c4435' // Trim and checksum
  },
  
  // Zero address variations
  {
    name: 'Zero address short',
    address: '0x0',
    expected: '0x0000000000000000000000000000000000000000'
  },
  {
    name: 'Zero address padded',
    address: '0x0000000000000000000000000000000000000000',
    expected: '0x0000000000000000000000000000000000000000'
  }
]

// Invalid test cases
const invalidAddresses = [
  {
    name: 'Invalid hex characters',
    address: '0xGHIJKLMNOPQRSTUVWXYZ1234567890abcdef123456'
  },
  {
    name: 'Empty string',
    address: ''
  },
  {
    name: 'Null/undefined',
    address: null as any
  },
  {
    name: 'Too long address',
    address: '0xde84a47a744165b5123d428321f541fd524c4435extracharacters'
  }
]

async function testAddressValidation() {
  console.log('🧪 Starting Comprehensive Address Validation Tests...\n')
  
  const service = new RealAttestationService()
  let passedTests = 0
  let totalTests = 0
  
  // Test valid addresses
  console.log('✅ VALID ADDRESS TESTS:')
  console.log('=' .repeat(50))
  
  for (const test of testAddresses) {
    totalTests++
    try {
      console.log(`\n📝 Testing ${test.name}:`)
      console.log(`   Input: "${test.address}"`)
      console.log(`   Expected: "${test.expected}"`)
      
      const result = (service as any).validateAndNormalizeAddress(test.address, 'test')
      
      if (result === test.expected) {
        console.log(`   ✅ PASS: Got "${result}"`)
        passedTests++
      } else {
        console.log(`   ❌ FAIL: Got "${result}", expected "${test.expected}"`)
      }
    } catch (error) {
      console.log(`   ❌ ERROR: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
  
  // Test invalid addresses
  console.log('\n\n❌ INVALID ADDRESS TESTS:')
  console.log('=' .repeat(50))
  
  for (const test of invalidAddresses) {
    totalTests++
    try {
      console.log(`\n📝 Testing ${test.name}:`)
      console.log(`   Input: "${test.address}"`)
      
      const result = (service as any).validateAndNormalizeAddress(test.address, 'test')
      console.log(`   ❌ FAIL: Should have thrown error but got "${result}"`)
    } catch (error) {
      console.log(`   ✅ PASS: Correctly rejected with error: ${error instanceof Error ? error.message : String(error)}`)
      passedTests++
    }
  }
  
  // Summary
  console.log('\n\n📊 TEST SUMMARY:')
  console.log('=' .repeat(50))
  console.log(`✅ Passed: ${passedTests}/${totalTests}`)
  console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests}`)
  console.log(`📈 Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`)
  
  if (passedTests === totalTests) {
    console.log('\n🎉 ALL TESTS PASSED! Address validation is working perfectly.')
    process.exit(0)
  } else {
    console.log('\n💥 SOME TESTS FAILED! Please review the address validation logic.')
    process.exit(1)
  }
}

// Run the tests
testAddressValidation().catch((error) => {
  console.error('❌ Test execution failed:', error)
  process.exit(1)
})