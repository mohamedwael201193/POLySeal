import { SchemaRegistry } from "@ethereum-attestation-service/eas-sdk"
import dotenv from 'dotenv'
import { ethers } from "ethers"

dotenv.config()

const SCHEMA_REGISTRY_ADDRESS = "0x23c5701A1BDa89C61d181BD79E5203c730708AE7"

// Simple test schema first
const TEST_SCHEMA = "uint256 number,string text"

async function testSchemaRegistration() {
  console.log("🧪 Testing EAS Schema Registration")
  console.log("=================================")
  console.log("🌐 Network: Polygon Amoy")
  console.log("📍 Schema Registry:", SCHEMA_REGISTRY_ADDRESS)
  console.log("🧪 Test Schema:", TEST_SCHEMA)
  console.log()

  const provider = new ethers.JsonRpcProvider("https://rpc-amoy.polygon.technology/")
  const wallet = new ethers.Wallet(process.env.PROVIDER_PRIVATE_KEY!, provider)
  
  console.log("👤 Wallet:", wallet.address)
  const balance = await provider.getBalance(wallet.address)
  console.log("💰 Balance:", ethers.formatEther(balance), "POL")
  console.log()

  // Initialize schema registry
  const schemaRegistry = new SchemaRegistry(SCHEMA_REGISTRY_ADDRESS)
  schemaRegistry.connect(wallet)

  console.log("🚀 Registering test schema...")
  
  try {
    const transaction = await schemaRegistry.register({
      schema: TEST_SCHEMA,
      resolverAddress: ethers.ZeroAddress,
      revocable: true,
    })

    console.log("📤 Transaction type:", typeof transaction)
    console.log("📤 Transaction keys:", Object.keys(transaction))
    console.log("📤 Transaction data:", (transaction as any).data)
    
    // The receipt from EAS SDK might be the schema UID directly
    const receipt = await transaction.wait()
    console.log("✅ Transaction confirmed!")
    
    console.log("📊 Receipt:", receipt)
    console.log("📊 Receipt type:", typeof receipt)
    
    // Try to parse the receipt as a schema UID
    if (typeof receipt === 'string' && receipt.length === 66 && receipt.startsWith('0x')) {
      console.log("🆔 Schema UID:", receipt)
    } else {
      console.log("📊 Receipt keys:", Object.keys(receipt || {}))
      
      if (receipt && (receipt as any).logs) {
        console.log("📋 Number of logs:", (receipt as any).logs.length)
        for (let i = 0; i < (receipt as any).logs.length; i++) {
          const log = (receipt as any).logs[i]
          console.log(`📋 Log ${i}:`, {
            address: log.address,
            topics: log.topics,
            data: log.data
          })
        }
      }
    }

  } catch (error: any) {
    console.error("❌ Registration failed:", error.message)
    if (error.data) {
      console.error("📊 Error data:", error.data)
    }
  }
}

testSchemaRegistration().catch(console.error)