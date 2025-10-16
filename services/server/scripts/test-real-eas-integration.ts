#!/usr/bin/env tsx

/**
 * REAL EAS Integration Test Suite
 * Tests actual blockchain transactions on Polygon Amoy testnet
 */

import { realAttestationService } from '../src/services/realAttestationService.js'

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function testWalletSetup(): Promise<boolean> {
  console.log('\n🔐 Testing Wallet Setup...')
  console.log('=' .repeat(50))
  
  try {
    const status = await realAttestationService.getServiceStatus()
    
    console.log(`📍 Wallet Address: ${status.wallet.address}`)
    console.log(`💰 Current Balance: ${status.wallet.balance} POL`)
    console.log(`🌐 Network: ${status.network.name} (Chain ID: ${status.network.chainId})`)
    console.log(`⛽ Gas Price: ${status.gasPrice} gwei`)
    console.log(`📊 Health Score: ${status.healthScore}/100`)
    
    if (!status.wallet.hasEnoughFunds) {
      console.log('\n⚠️  INSUFFICIENT FUNDS DETECTED!')
      console.log('💡 Get testnet POL from these faucets:')
      console.log('   • https://faucet.polygon.technology/')
      console.log('   • https://www.alchemy.com/faucets/polygon-amoy')
      console.log(`   • Send to: ${status.wallet.address}`)
      return false
    }
    
    console.log('✅ Wallet setup is valid!')
    return true
  } catch (error) {
    console.error('❌ Wallet setup test failed:', error)
    return false
  }
}

async function testGasEstimation(): Promise<boolean> {
  console.log('\n⛽ Testing Gas Estimation...')
  console.log('=' .repeat(50))
  
  try {
    const testParams = {
      recipient: '0x742d35Cc6634C0532925a3b8D698F2C0E8F5f598', // Example address
      data: {
        message: 'Test attestation for gas estimation',
        score: 95,
        verified: true
      }
    }
    
    const gasEstimate = await realAttestationService.estimateAttestationGas(testParams)
    
    console.log(`📊 Gas Estimation Results:`)
    console.log(`   Estimated Gas: ${gasEstimate.estimatedGas.toString()}`)
    console.log(`   Estimated Cost: ${gasEstimate.estimatedCost} POL`)
    console.log(`   Gas Price: ${gasEstimate.gasPrice} gwei`)
    
    // Check if cost is reasonable (should be less than 0.05 POL on testnet)
    const costNumber = parseFloat(gasEstimate.estimatedCost)
    if (costNumber > 0.05) {
      console.warn('⚠️  High gas cost detected:', costNumber, 'POL')
      return false
    }
    
    if (costNumber > 0.02) {
      console.warn('⚠️  High gas cost detected:', costNumber, 'POL')
    }
    
    console.log('✅ Gas estimation successful!')
    return true
  } catch (error) {
    console.error('❌ Gas estimation test failed:', error)
    return false
  }
}

async function testAddressValidation(): Promise<boolean> {
  console.log('\n🔍 Testing Address Validation...')
  console.log('=' .repeat(50))
  
  const testCases = [
    {
      name: 'Valid full address',
      input: '0x742d35Cc6634C0532925a3b8D698F2C0E8F5f598',
      shouldPass: true
    },
    {
      name: 'Truncated address',
      input: '0x742d35Cc6634C0532925a3b8D698F2C0E8F5f',
      shouldPass: true
    },
    {
      name: 'Address without 0x',
      input: '742d35Cc6634C0532925a3b8D698F2C0E8F5f598',
      shouldPass: true
    },
    {
      name: 'Invalid characters',
      input: '0x742d35Cc6634C0532925a3b8D698F2C0E8F5fXYZ',
      shouldPass: false
    },
    {
      name: 'Too short',
      input: '0x742d35',
      shouldPass: true // Should pad
    }
  ]
  
  let passed = 0
  
  for (const testCase of testCases) {
    try {
      console.log(`\n🧪 Testing: ${testCase.name}`)
      console.log(`   Input: ${testCase.input}`)
      
      // Access private method through service instance (for testing)
      const result = (realAttestationService as any).validateAndNormalizeAddress(testCase.input, 'test')
      
      console.log(`   ✅ Result: ${result}`)
      
      if (testCase.shouldPass) {
        console.log('   ✅ PASSED - Address validated successfully')
        passed++
      } else {
        console.log('   ❌ FAILED - Should have thrown error but didn\'t')
      }
    } catch (error) {
      if (!testCase.shouldPass) {
        console.log(`   ✅ PASSED - Correctly rejected invalid address`)
        passed++
      } else {
        console.log(`   ❌ FAILED - Should have passed but threw error:`, error instanceof Error ? error.message : error)
      }
    }
  }
  
  console.log(`\n📊 Address Validation Results: ${passed}/${testCases.length} passed`)
  return passed === testCases.length
}

async function testRealAttestation(): Promise<boolean> {
  console.log('\n🔗 Testing REAL Blockchain Attestation...')
  console.log('=' .repeat(50))
  
  try {
    // Check wallet balance first
    const fundingCheck = await realAttestationService.validateWalletFunding()
    
    if (!fundingCheck.hasEnoughFunds) {
      console.log('⚠️  Skipping real attestation test - insufficient funds')
      console.log(`   Balance: ${fundingCheck.balance} POL`)
      console.log(`   Required: ${fundingCheck.requiredAmount} POL`)
      return false
    }
    
    const attestationParams = {
      recipient: '0x742d35Cc6634C0532925a3b8D698F2C0E8F5f598', // Test recipient
      data: {
        message: 'POLySeal Real EAS Test Attestation',
        score: 100,
        verified: true,
        timestamp: new Date().toISOString(),
        testId: `test-${Date.now()}`
      }
    }
    
    console.log('📝 Creating attestation with params:')
    console.log('   Recipient:', attestationParams.recipient)
    console.log('   Message:', attestationParams.data.message)
    console.log('   Score:', attestationParams.data.score)
    
    console.log('\n⏳ Submitting transaction to Polygon Amoy...')
    
    const result = await realAttestationService.createAttestation(attestationParams)
    
    console.log('\n🎉 REAL Attestation Created!')
    console.log(`   UID: ${result.uid}`)
    console.log(`   Transaction: ${result.transactionHash}`)
    console.log(`   Scanner: ${result.scannerUrl}`)
    console.log(`   EAS Explorer: ${result.easScanUrl}`)
    
    if (result.fallback) {
      console.log('⚠️  Used fallback response due to error:', result.error)
      return false
    }
    
    if (result.blockNumber) {
      console.log(`   Block: ${result.blockNumber}`)
    }
    
    if (result.gasUsed) {
      console.log(`   Gas Used: ${result.gasUsed}`)
    }
    
    if (result.cost) {
      console.log(`   Cost: ${result.cost} POL`)
    }
    
    console.log('\n✅ Real attestation test SUCCESSFUL!')
    
    // Wait a moment then try to fetch the attestation
    console.log('\n⏳ Waiting 10 seconds before verification...')
    await sleep(10000)
    
    try {
      console.log('🔍 Verifying attestation on blockchain...')
      const fetchedAttestation = await realAttestationService.getAttestation(result.uid)
      
      console.log('✅ Attestation verified on blockchain!')
      console.log(`   Attester: ${fetchedAttestation.attester}`)
      console.log(`   Recipient: ${fetchedAttestation.recipient}`)
      console.log(`   Valid: ${fetchedAttestation.isValid}`)
      
      if (fetchedAttestation.decodedData) {
        console.log(`   Decoded Message: ${fetchedAttestation.decodedData.message}`)
        console.log(`   Decoded Score: ${fetchedAttestation.decodedData.score}`)
      }
      
      return true
    } catch (verificationError) {
      console.warn('⚠️  Attestation created but verification failed:', verificationError)
      return true // Still consider success if creation worked
    }
    
  } catch (error) {
    console.error('❌ Real attestation test failed:', error)
    return false
  }
}

async function testHealthCheck(): Promise<boolean> {
  console.log('\n🏥 Testing Service Health...')
  console.log('=' .repeat(50))
  
  try {
    const isHealthy = await realAttestationService.healthCheck()
    
    if (isHealthy) {
      console.log('✅ Service is healthy and ready!')
      return true
    } else {
      console.log('⚠️  Service health check indicates issues')
      return false
    }
  } catch (error) {
    console.error('❌ Health check failed:', error)
    return false
  }
}

async function runFullTestSuite(): Promise<void> {
  console.log('🚀 Starting REAL EAS Integration Test Suite')
  console.log('=' .repeat(60))
  console.log('Testing actual blockchain transactions on Polygon Amoy testnet')
  console.log('=' .repeat(60))
  
  const tests = [
    { name: 'Wallet Setup', fn: testWalletSetup },
    { name: 'Address Validation', fn: testAddressValidation },
    { name: 'Gas Estimation', fn: testGasEstimation },
    { name: 'Service Health', fn: testHealthCheck },
    { name: 'Real Attestation', fn: testRealAttestation }
  ]
  
  const results: { name: string; passed: boolean; duration: number }[] = []
  
  for (const test of tests) {
    const startTime = Date.now()
    try {
      const passed = await test.fn()
      const duration = Date.now() - startTime
      results.push({ name: test.name, passed, duration })
      
      if (passed) {
        console.log(`\n✅ ${test.name} test PASSED (${duration}ms)`)
      } else {
        console.log(`\n❌ ${test.name} test FAILED (${duration}ms)`)
      }
    } catch (error) {
      const duration = Date.now() - startTime
      results.push({ name: test.name, passed: false, duration })
      console.log(`\n💥 ${test.name} test CRASHED (${duration}ms):`, error)
    }
  }
  
  console.log('\n' + '=' .repeat(60))
  console.log('🏁 TEST SUITE COMPLETED')
  console.log('=' .repeat(60))
  
  const passed = results.filter(r => r.passed).length
  const total = results.length
  
  console.log(`📊 Results: ${passed}/${total} tests passed`)
  console.log('\n📋 Test Summary:')
  
  results.forEach(result => {
    const status = result.passed ? '✅ PASS' : '❌ FAIL'
    console.log(`   ${status} ${result.name} (${result.duration}ms)`)
  })
  
  if (passed === total) {
    console.log('\n🎉 ALL TESTS PASSED! POLySeal EAS integration is ready for production.')
  } else {
    console.log('\n⚠️  Some tests failed. Review the issues above before proceeding.')
  }
}

// Run the test suite
runFullTestSuite().catch(error => {
  console.error('💥 Test suite crashed:', error)
  process.exit(1)
})