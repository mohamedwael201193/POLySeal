#!/usr/bin/env tsx
import { ethers } from 'ethers'
import { config } from '../src/config/env.js'

// Schema Registry ABI for register function
const SCHEMA_REGISTRY_ABI = [
  {
    "inputs": [
      {
        "components": [
          { "internalType": "string", "name": "schema", "type": "string" },
          { "internalType": "address", "name": "resolver", "type": "address" },
          { "internalType": "bool", "name": "revocable", "type": "bool" }
        ],
        "internalType": "struct ISchemaRegistry.SchemaRecord",
        "name": "schema",
        "type": "tuple"
      }
    ],
    "name": "register",
    "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]

async function deployPOLySealSchema() {
  console.log('🚀 Deploying POLySeal Schema to Polygon Amoy...')
  
  try {
    // Initialize provider and signer
    const provider = new ethers.JsonRpcProvider(config.blockchain.rpcUrl)
    const signer = new ethers.Wallet(config.blockchain.privateKey, provider)
    
    console.log('✅ Connected to Polygon Amoy')
    console.log('   RPC:', config.blockchain.rpcUrl)
    console.log('   Deployer:', signer.address)
    
    // Initialize Schema Registry contract
    const schemaRegistry = new ethers.Contract(
      config.contracts.schemaRegistry,
      SCHEMA_REGISTRY_ABI,
      signer
    )
    
    console.log('✅ Schema Registry connected:', config.contracts.schemaRegistry)
    
    // Define POLySeal attestation schema
    const schema = 'string message,uint256 score,bool verified'
    const resolverAddress = '0x0000000000000000000000000000000000000000' // No resolver
    const revocable = true
    
    console.log('📝 Registering schema:', schema)
    console.log('   Revocable:', revocable)
    console.log('   Resolver:', resolverAddress)
    
    // Register the schema
    const tx = await schemaRegistry.register({
      schema,
      resolver: resolverAddress,
      revocable
    })
    
    console.log('⏳ Transaction sent, waiting for confirmation...')
    console.log('   Tx Hash:', (tx as any).hash || 'Unknown')
    
    const receipt = await tx.wait()
    
    // Extract schema UID from logs with proper type handling
    let schemaUID = 'Not found'
    let txHash = 'Unknown'
    let blockNumber: number | undefined
    let gasUsed: string | undefined
    
    if (receipt) {
      // Handle transaction hash
      txHash = (receipt as any).hash || (tx as any).hash || txHash
      
      // Handle block number
      if ('blockNumber' in receipt) {
        blockNumber = (receipt as any).blockNumber
      }
      
      // Handle gas used
      if ('gasUsed' in receipt) {
        const gasUsedValue = (receipt as any).gasUsed
        gasUsed = gasUsedValue ? gasUsedValue.toString() : undefined
      }
      
      // Extract schema UID from logs
      if ('logs' in receipt && Array.isArray((receipt as any).logs) && (receipt as any).logs.length > 0) {
        const log = (receipt as any).logs[0]
        if (log && log.topics && log.topics.length > 1) {
          schemaUID = log.topics[1]
        }
      }
    }
    
    console.log('🎉 Schema deployed successfully!')
    console.log('   Schema UID:', schemaUID)
    console.log('   Transaction Hash:', txHash)
    console.log('   Block Number:', blockNumber)
    console.log('   Gas Used:', gasUsed)
    
    console.log('\n📋 Add this to your .env file:')
    console.log(`POLYSEAL_SCHEMA_UID=${schemaUID}`)
    
    console.log('\n🔗 View on scanners:')
    console.log(`   PolygonScan: https://amoy.polygonscan.com/tx/${txHash}`)
    console.log(`   EAS Scan: https://polygon-amoy.easscan.org/schema/view/${schemaUID}`)
    
  } catch (error) {
    console.error('❌ Schema deployment failed:', error)
    process.exit(1)
  }
}

// Run the deployment
deployPOLySealSchema()
  .then(() => {
    console.log('✅ Schema deployment completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error)
    process.exit(1)
  })