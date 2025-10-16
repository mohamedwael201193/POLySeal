#!/usr/bin/env tsx

/**
 * Wallet Funding Helper for Polygon Amoy Testnet
 * Provides wallet status and funding instructions
 */

import { realAttestationService } from '../src/services/realAttestationService.js'

interface FaucetInfo {
  name: string
  url: string
  description: string
  instructions: string[]
}

const POLYGON_FAUCETS: FaucetInfo[] = [
  {
    name: 'Official Polygon Faucet',
    url: 'https://faucet.polygon.technology/',
    description: 'Primary official faucet by Polygon Labs',
    instructions: [
      '1. Visit https://faucet.polygon.technology/',
      '2. Select "Polygon Amoy" network',
      '3. Connect your wallet or paste wallet address',
      '4. Complete any required verification (captcha, social login)',
      '5. Request POL tokens (usually 0.1 POL per request)',
      '6. Wait 1-2 minutes for tokens to arrive'
    ]
  },
  {
    name: 'Alchemy Faucet',
    url: 'https://www.alchemy.com/faucets/polygon-amoy',
    description: 'Reliable alternative faucet by Alchemy',
    instructions: [
      '1. Visit https://www.alchemy.com/faucets/polygon-amoy',
      '2. Create free Alchemy account if needed',
      '3. Enter your wallet address',
      '4. Complete verification process',
      '5. Request testnet POL',
      '6. Tokens usually arrive within 1-5 minutes'
    ]
  },
  {
    name: 'AllThatNode Faucet',
    url: 'https://www.allthatnode.com/faucet/polygon.dsrv',
    description: 'Additional community faucet option',
    instructions: [
      '1. Visit https://www.allthatnode.com/faucet/polygon.dsrv',
      '2. Select "Polygon Amoy Testnet"',
      '3. Enter wallet address',
      '4. Complete captcha verification',
      '5. Request tokens',
      '6. Check wallet after few minutes'
    ]
  }
]

async function checkWalletStatus(): Promise<void> {
  console.log('🔐 WALLET STATUS CHECK')
  console.log('=' .repeat(50))
  
  try {
    const status = await realAttestationService.getServiceStatus()
    
    console.log(`📍 Wallet Address: ${status.wallet.address}`)
    console.log(`💰 Current Balance: ${status.wallet.balance} POL`)
    console.log(`🌐 Network: ${status.network.name} (Chain ID: ${status.network.chainId})`)
    console.log(`📊 Health Score: ${status.healthScore}/100`)
    
    if (status.network.chainId !== 80002) {
      console.log('\n❌ WRONG NETWORK DETECTED!')
      console.log('   Expected: Polygon Amoy (Chain ID: 80002)')
      console.log(`   Current: ${status.network.name} (Chain ID: ${status.network.chainId})`)
      console.log('\n🔧 Fix: Update your RPC URL in .env file:')
      console.log('   POLYGON_RPC_URL=https://rpc-amoy.polygon.technology/')
      return
    }
    
    const balanceNumber = parseFloat(status.wallet.balance)
    
    if (balanceNumber === 0) {
      console.log('\n💸 WALLET IS EMPTY - NEEDS FUNDING')
      showFundingInstructions(status.wallet.address)
    } else if (balanceNumber < 0.01) {
      console.log('\n⚠️  LOW BALANCE WARNING')
      console.log('   Recommended minimum: 0.01 POL for gas fees')
      console.log('   Consider adding more funds for reliable operation')
      showFundingInstructions(status.wallet.address)
    } else if (balanceNumber < 0.1) {
      console.log('\n✅ SUFFICIENT BALANCE for testing')
      console.log('   You have enough for several test transactions')
      console.log('   Add more funds if planning extensive testing')
    } else {
      console.log('\n🎉 EXCELLENT BALANCE!')
      console.log('   Ready for extensive testing and operations')
    }
    
    console.log('\n📋 Service Recommendations:')
    status.recommendations.forEach(rec => console.log(`   ${rec}`))
    
  } catch (error) {
    console.error('❌ Failed to check wallet status:', error)
  }
}

function showFundingInstructions(walletAddress: string): void {
  console.log('\n💰 FUNDING INSTRUCTIONS')
  console.log('=' .repeat(50))
  console.log(`📍 Your Wallet Address: ${walletAddress}`)
  console.log('💡 Copy this address to use with faucets below\n')
  
  POLYGON_FAUCETS.forEach((faucet, index) => {
    console.log(`${index + 1}. ${faucet.name}`)
    console.log(`   🔗 ${faucet.url}`)
    console.log(`   📝 ${faucet.description}`)
    console.log('   📋 Instructions:')
    faucet.instructions.forEach(instruction => {
      console.log(`      ${instruction}`)
    })
    console.log()
  })
  
  console.log('💡 PRO TIPS:')
  console.log('   • Try multiple faucets if one is rate-limited')
  console.log('   • Some faucets require social media verification')
  console.log('   • Wait a few minutes between requests from same faucet')
  console.log('   • Check your wallet after each request')
  console.log('   • Join Polygon Discord for community help if needed')
}

async function estimateTransactionCosts(): Promise<void> {
  console.log('\n⛽ TRANSACTION COST ESTIMATES')
  console.log('=' .repeat(50))
  
  try {
    const gasEstimate = await realAttestationService.estimateAttestationGas({
      recipient: '0x742d35Cc6634C0532925a3b8D698F2C0E8F5f598',
      data: { message: 'Test', score: 100, verified: true }
    })
    
    console.log('📊 Attestation Transaction Costs:')
    console.log(`   Estimated Gas: ${gasEstimate.estimatedGas.toString()}`)
    console.log(`   Gas Price: ${gasEstimate.gasPrice} gwei`)
    console.log(`   Total Cost: ${gasEstimate.estimatedCost} POL`)
    
    const costNumber = parseFloat(gasEstimate.estimatedCost)
    const recommendedBalance = costNumber * 20 // 20 transactions worth
    
    console.log('\n💰 Funding Recommendations:')
    console.log(`   Minimum for 1 transaction: ${gasEstimate.estimatedCost} POL`)
    console.log(`   Recommended for testing: ${recommendedBalance.toFixed(6)} POL`)
    console.log('   Safe amount: 0.1 POL (covers ~100+ transactions)')
    
  } catch (error) {
    console.error('❌ Failed to estimate transaction costs:', error)
    console.log('\n💰 General Recommendations:')
    console.log('   Minimum balance: 0.01 POL')
    console.log('   Recommended: 0.1 POL')
    console.log('   Each attestation costs ~0.001-0.005 POL')
  }
}

async function testNetworkConnection(): Promise<void> {
  console.log('\n🌐 NETWORK CONNECTION TEST')
  console.log('=' .repeat(50))
  
  try {
    const status = await realAttestationService.getServiceStatus()
    
    if (status.network.connected) {
      console.log('✅ Successfully connected to Polygon Amoy')
      console.log(`   Network: ${status.network.name}`)
      console.log(`   Chain ID: ${status.network.chainId}`)
      console.log(`   Current Block: ${status.network.blockNumber || 'Unknown'}`)
      console.log(`   Gas Price: ${status.gasPrice} gwei`)
    } else {
      console.log('❌ Failed to connect to Polygon Amoy')
      console.log('\n🔧 Troubleshooting:')
      console.log('   1. Check your internet connection')
      console.log('   2. Verify RPC URL in .env file')
      console.log('   3. Try alternative RPC endpoints:')
      console.log('      • https://rpc-amoy.polygon.technology/')
      console.log('      • https://polygon-amoy-bor-rpc.publicnode.com')
      console.log('      • https://polygon-amoy.gateway.tatum.io')
    }
    
    console.log('\n📄 Contract Status:')
    console.log(`   EAS Contract: ${status.contracts.eas}`)
    console.log(`   Schema Registry: ${status.contracts.schemaRegistry}`)
    console.log(`   Accessible: ${status.contracts.accessible ? '✅ Yes' : '❌ No'}`)
    
  } catch (error) {
    console.error('❌ Network connection test failed:', error)
  }
}

async function main(): Promise<void> {
  console.log('🚀 POLYSEAL WALLET FUNDING HELPER')
  console.log('=' .repeat(60))
  console.log('Get your Polygon Amoy testnet wallet ready for real EAS transactions')
  console.log('=' .repeat(60))
  
  // Check current wallet status
  await checkWalletStatus()
  
  // Test network connection
  await testNetworkConnection()
  
  // Show transaction cost estimates
  await estimateTransactionCosts()
  
  console.log('\n🎯 NEXT STEPS:')
  console.log('1. Fund your wallet using faucets above if needed')
  console.log('2. Wait for tokens to arrive (usually 1-5 minutes)')
  console.log('3. Run the test suite: pnpm run test:eas')
  console.log('4. Create real attestations once tests pass')
  
  console.log('\n📞 NEED HELP?')
  console.log('• Check Polygon documentation: https://docs.polygon.technology/')
  console.log('• Join Polygon Discord: https://discord.gg/polygon')
  console.log('• POLySeal GitHub: Check repository issues/discussions')
}

// Run the helper
main().catch(error => {
  console.error('💥 Wallet funding helper crashed:', error)
  process.exit(1)
})