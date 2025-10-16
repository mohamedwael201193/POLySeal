#!/usr/bin/env tsx
/**
 * Minimal EAS SDK test to isolate the issue
 */

const { EAS, SchemaEncoder } = require('@ethereum-attestation-service/eas-sdk')
import { ethers } from 'ethers'
import { config } from '../dist/config/env.js'

async function minimalEASTest() {
  console.log('🧪 Minimal EAS SDK Test...\n')
  
  try {
    // Setup provider and signer
    const provider = new ethers.JsonRpcProvider(config.blockchain.rpcUrl)
    const signer = new ethers.Wallet(config.blockchain.privateKey, provider)
    
    console.log(`🔗 Provider: ${config.blockchain.rpcUrl}`)
    console.log(`🔑 Signer: ${signer.address}`)
    
    // Initialize EAS
    const eas = new EAS(config.contracts.eas)
    eas.connect(signer)
    
    console.log(`📋 EAS Contract: ${config.contracts.eas}`)
    
    // Simple test data
    const schemaEncoder = new SchemaEncoder('string message,uint256 score,bool verified')
    const encodedData = schemaEncoder.encodeData([
      { name: 'message', value: 'Minimal test', type: 'string' },
      { name: 'score', value: 100, type: 'uint256' },
      { name: 'verified', value: true, type: 'bool' }
    ])
    
    console.log(`📝 Encoded data: ${encodedData}`)
    
    // Use a simple, clean address
    const recipient = '0xDE84a47a744165B5123D428321F541fD524c4435' // Our own signer address
    console.log(`👤 Recipient: ${recipient}`)
    console.log(`   Length: ${recipient.length}`)
    console.log(`   Is valid: ${ethers.isAddress(recipient)}`)
    
    // Try to create attestation
    console.log('\n🚀 Creating attestation...')
    
    const tx = await eas.attest({
      schema: '0x27d06e3659317e9a4f8154d1e849eb53d43d91fb4f219884d1684f86d797804a',
      data: {
        recipient: recipient,
        expirationTime: 0,
        revocable: true,
        refUID: '0x0000000000000000000000000000000000000000000000000000000000000000',
        data: encodedData,
        value: 0
      }
    })
    
    console.log('✅ Transaction created successfully!')
    console.log('   Tx Hash:', tx.hash || 'pending')
    
    // Try to wait for confirmation
    const receipt = await tx.wait()
    console.log('🎉 Transaction confirmed!')
    console.log('   Block:', receipt.blockNumber)
    
  } catch (error) {
    console.log('❌ Error:', error instanceof Error ? error.message : String(error))
    if (error instanceof Error && error.stack) {
      console.log('   Stack:', error.stack)
    }
  }
}

minimalEASTest().catch(console.error)