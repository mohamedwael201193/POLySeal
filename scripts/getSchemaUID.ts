import { SchemaRegistry } from "@ethereum-attestation-service/eas-sdk"
import dotenv from 'dotenv'
import { ethers } from "ethers"
import fs from 'fs'
import path from 'path'

dotenv.config()

const SCHEMA_REGISTRY_ADDRESS = "0x23c5701A1BDa89C61d181BD79E5203c730708AE7"
const PAID_INFERENCE_SCHEMA = "address payer,address provider,bytes32 requestId,string model,uint256 priceUSDC,bytes32 inputHash,string outputRef,uint8 status,uint64 chainId,bytes32 txHash,uint64 timestamp"

async function getSchemaUID() {
  console.log("🔍 POLySeal EAS Schema UID Lookup")
  console.log("=====================================")
  console.log("🌐 Network: Polygon Amoy (Chain ID: 80002)")
  console.log("📍 Schema Registry:", SCHEMA_REGISTRY_ADDRESS)
  console.log("🔧 Schema Definition:")
  console.log("   ", PAID_INFERENCE_SCHEMA)
  console.log()

  // Setup provider and wallet
  const provider = new ethers.JsonRpcProvider("https://rpc-amoy.polygon.technology/")
  const privateKey = process.env.PROVIDER_PRIVATE_KEY
  if (!privateKey) throw new Error("PROVIDER_PRIVATE_KEY not found in environment")
  
  const wallet = new ethers.Wallet(privateKey, provider)
  console.log("👤 Provider Wallet:", wallet.address)

  // Get balance
  const balance = await provider.getBalance(wallet.address)
  console.log("💰 POL Balance:", ethers.formatEther(balance), "POL")
  console.log()

  // Initialize schema registry
  const schemaRegistry = new SchemaRegistry(SCHEMA_REGISTRY_ADDRESS)
  schemaRegistry.connect(wallet)

  console.log("🔍 Computing schema UID...")
  
  try {
    // Calculate the schema UID by hashing the schema string
    const schemaUID = ethers.keccak256(ethers.toUtf8Bytes(PAID_INFERENCE_SCHEMA))
    console.log("🆔 Computed Schema UID:", schemaUID)
    
    // Try to fetch the schema to verify it exists
    const schema = await schemaRegistry.getSchema({ uid: schemaUID })
    console.log("✅ Schema found in registry!")
    console.log("📋 Schema details:", schema)
    
    // Update .env file with the schema UID
    const envPath = path.join(__dirname, '.env')
    const envContent = fs.readFileSync(envPath, 'utf8')
    const updatedContent = envContent.replace(
      /SCHEMA_UID=.*/,
      `SCHEMA_UID=${schemaUID}`
    )
    fs.writeFileSync(envPath, updatedContent)
    console.log("💾 Updated .env with schema UID")
    
  } catch (error) {
    console.error("❌ Error getting schema:", error)
    console.log("ℹ️ The schema might not be registered yet or the UID calculation is incorrect")
  }
}

getSchemaUID().catch(console.error)