import dotenv from 'dotenv'
import { ethers } from "ethers"

dotenv.config()

async function findExistingSchema() {
  console.log("🔍 Looking for existing schemas on Polygon Amoy")
  console.log("===============================================")
  
  const provider = new ethers.JsonRpcProvider("https://rpc-amoy.polygon.technology/")
  const SCHEMA_REGISTRY_ADDRESS = "0x23c5701A1BDa89C61d181BD79E5203c730708AE7"
  
  // Minimal ABI for Schema Registry
  const schemaRegistryAbi = [
    "function getSchema(bytes32 uid) external view returns (string memory schema, address resolver, bool revocable, uint256 index)",
    "event Registered(bytes32 indexed uid, address indexed registerer, string schema, address resolver, bool revocable)"
  ]
  
  const schemaRegistry = new ethers.Contract(
    SCHEMA_REGISTRY_ADDRESS,
    schemaRegistryAbi,
    provider
  )
  
  console.log("🎯 Our target schema:")
  const ourSchema = "address payer,address provider,bytes32 requestId,string model,uint256 priceUSDC,bytes32 inputHash,string outputRef,uint8 status,uint64 chainId,bytes32 txHash,uint64 timestamp"
  console.log(`   ${ourSchema}`)
  console.log()
  
  // Try some common schema UIDs that might exist
  const testSchemaUIDs = [
    // Try computing the schema UID manually
    ethers.keccak256(ethers.toUtf8Bytes(ourSchema)),
    // Some common test schemas
    "0x0000000000000000000000000000000000000000000000000000000000000001",
    "0x0000000000000000000000000000000000000000000000000000000000000002",
    "0xb16fa048b0d597f5a821747eba64efa4762ee5143e9a80600d0005386edfc995", // Example from docs
  ]
  
  console.log("🔍 Testing possible schema UIDs...")
  
  for (let i = 0; i < testSchemaUIDs.length; i++) {
    const uid = testSchemaUIDs[i]
    console.log(`\n🧪 Testing UID ${i + 1}: ${uid}`)
    
    try {
      const schema = await schemaRegistry.getSchema(uid)
      console.log("✅ Schema found!")
      console.log("   Schema:", schema[0])
      console.log("   Resolver:", schema[1])
      console.log("   Revocable:", schema[2])
      console.log("   Index:", schema[3].toString())
      
      if (schema[0] === ourSchema) {
        console.log("🎉 MATCH! This is our schema!")
        console.log(`🆔 Use this Schema UID: ${uid}`)
        
        // Update the .env file
        const fs = require('fs')
        const path = require('path')
        const envPath = path.join(__dirname, '.env')
        const envContent = fs.readFileSync(envPath, 'utf8')
        const updatedContent = envContent.replace(
          /SCHEMA_UID=.*/,
          `SCHEMA_UID=${uid}`
        )
        fs.writeFileSync(envPath, updatedContent)
        console.log("💾 Updated .env with schema UID")
        break
      }
      
    } catch (error: any) {
      console.log("❌ Schema not found or error:", error.message?.split('(')[0] || 'Unknown error')
    }
  }
  
  // Try to register a simple unique schema instead
  console.log("\n💡 Let's try registering a unique test schema...")
  
  const wallet = new ethers.Wallet(process.env.PROVIDER_PRIVATE_KEY!, provider)
  const connectedRegistry = schemaRegistry.connect(wallet)
  
  // Create a unique schema with timestamp
  const timestamp = Math.floor(Date.now() / 1000)
  const uniqueSchema = `uint256 timestamp,string message`
  console.log(`🆕 Unique schema: ${uniqueSchema}`)
  
  try {
    const registerAbi = [
      "function register(string schema, address resolver, bool revocable) external returns (bytes32)"
    ]
    
    const registryWithRegister = new ethers.Contract(
      SCHEMA_REGISTRY_ADDRESS,
      registerAbi,
      wallet
    )
    
    console.log("🚀 Attempting to register unique schema...")
    const tx = await registryWithRegister.register(
      uniqueSchema,
      ethers.ZeroAddress,
      true
    )
    
    console.log("📤 Transaction sent:", tx.hash)
    const receipt = await tx.wait()
    console.log("✅ Registration successful!")
    
    // Parse logs to get schema UID
    for (const log of receipt.logs) {
      if (log.address.toLowerCase() === SCHEMA_REGISTRY_ADDRESS.toLowerCase()) {
        console.log("🆔 New Schema UID:", log.topics[1])
      }
    }
    
  } catch (error: any) {
    console.error("❌ Registration failed:", error.message || 'Unknown error')
    console.log("\n💭 The error suggests there might be an issue with:")
    console.log("   1. Schema already exists")
    console.log("   2. Permission/access control")
    console.log("   3. Contract version mismatch")
    console.log("   4. Network configuration")
  }
}

findExistingSchema().catch(console.error)