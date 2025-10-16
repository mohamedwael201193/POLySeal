import { SchemaRegistry } from "@ethereum-attestation-service/eas-sdk"
import dotenv from 'dotenv'
import { ethers } from "ethers"
import fs from 'fs'
import path from 'path'

dotenv.config()

const SCHEMA_REGISTRY_ADDRESS = "0x23c5701A1BDa89C61d181BD79E5203c730708AE7"
const PAID_INFERENCE_SCHEMA = "address payer,address provider,bytes32 requestId,string model,uint256 priceUSDC,bytes32 inputHash,string outputRef,uint8 status,uint64 chainId,bytes32 txHash,uint64 timestamp"

async function main() {
  console.log("🔄 POLySeal EAS Schema Registration")
  console.log("=====================================")
  
  if (!process.env.PROVIDER_PRIVATE_KEY) {
    throw new Error("❌ PROVIDER_PRIVATE_KEY not set in .env")
  }
  if (!process.env.AMOY_RPC) {
    throw new Error("❌ AMOY_RPC not set in .env")  
  }

  console.log("🌐 Network: Polygon Amoy (Chain ID: 80002)")
  console.log("📍 Schema Registry:", SCHEMA_REGISTRY_ADDRESS)
  console.log("🔧 Schema Definition:")
  console.log("   ", PAID_INFERENCE_SCHEMA)
  
  const provider = new ethers.JsonRpcProvider(process.env.AMOY_RPC)
  const wallet = new ethers.Wallet(process.env.PROVIDER_PRIVATE_KEY, provider)
  
  console.log("👤 Provider Wallet:", wallet.address)
  
  const balance = await provider.getBalance(wallet.address)
  console.log("💰 POL Balance:", ethers.formatEther(balance), "POL")
  
  if (balance < ethers.parseEther("0.001")) {
    console.warn("⚠️  Low POL balance! Get testnet POL from faucet")
  }
  
  const schemaRegistry = new SchemaRegistry(SCHEMA_REGISTRY_ADDRESS)
  schemaRegistry.connect(wallet)

  console.log("🚀 Registering schema...")
  
  try {
    const transaction = await schemaRegistry.register({
      schema: PAID_INFERENCE_SCHEMA,
      resolverAddress: ethers.ZeroAddress,
      revocable: false,
    })

    // Extract transaction hash from the response
    const txHash = (transaction as any).hash || (transaction as any).transactionHash || 'unknown'
    console.log("📤 Transaction sent:", txHash)
    console.log("⏳ Waiting for confirmation...")
    
    const receipt = await transaction.wait()
    if (!receipt) throw new Error("Transaction failed")
    
    console.log("✅ Transaction confirmed!")
    console.log("📊 Gas Used:", (receipt as any).gasUsed?.toString() || 'Unknown')
    
    // Extract schema UID from logs
    let schemaUID = ''
    const logs = (receipt as any).logs
    if (logs && logs.length > 0) {
      // Look for the Registered event which should have the schema UID
      for (const log of logs) {
        if (log.topics && log.topics.length > 1) {
          schemaUID = log.topics[1]
          break
        }
      }
    }
    
    // Fallback: try to get from transaction response
    if (!schemaUID && (transaction as any).schemaUID) {
      schemaUID = (transaction as any).schemaUID
    }
    
    console.log("\n🎯 Schema Registration Complete!")
    if (schemaUID) {
      console.log("🆔 Schema UID:", schemaUID)
      
      // Update .env file with the schema UID
      const envPath = path.join(__dirname, '.env')
      const envContent = fs.readFileSync(envPath, 'utf8')
      const updatedContent = envContent.replace(
        /SCHEMA_UID=.*/,
        `SCHEMA_UID=${schemaUID}`
      )
      fs.writeFileSync(envPath, updatedContent)
      console.log("💾 Updated .env with schema UID")
    } else {
      console.log("⚠️ Could not extract schema UID from transaction")
      console.log("ℹ️ Check the transaction on Polygonscan to get the schema UID manually")
    }
    
    console.log("🔗 View on Explorer:", `https://amoy.polygonscan.com/tx/${txHash}`)
    
    // Update .env files
    const envPath = path.resolve(process.cwd(), '../.env')
    let envContent = ''
    
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8')
    }
    
    if (envContent.includes('SCHEMA_UID=')) {
      envContent = envContent.replace(/SCHEMA_UID=.*/, `SCHEMA_UID=${schemaUID}`)
    } else {
      envContent += `\nSCHEMA_UID=${schemaUID}\n`
    }
    
    fs.writeFileSync(envPath, envContent)
    console.log("📝 Updated .env with SCHEMA_UID")
    console.log("\n🎉 Schema registration complete!")
    console.log("🔗 EAS Explorer: https://polygon-amoy.easscan.org")
    
  } catch (error: any) {
    console.error("❌ Registration failed:", error.message)
    if (error.message.includes('insufficient funds')) {
      console.log("💡 Get testnet POL from: https://faucet.polygon.technology/")
    }
    process.exit(1)
  }
}

main().catch(console.error)