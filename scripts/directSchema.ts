import dotenv from 'dotenv'
import { ethers } from "ethers"

dotenv.config()

const SCHEMA_REGISTRY_ADDRESS = "0x23c5701A1BDa89C61d181BD79E5203c730708AE7"

// ABI for the register function of Schema Registry
const SCHEMA_REGISTRY_ABI = [
  "function register(string schema, address resolver, bool revocable) external returns (bytes32)",
  "function getSchema(bytes32 uid) external view returns (string memory schema, address resolver, bool revocable, uint256 index)"
]

async function directSchemaRegistration() {
  console.log("🔧 Direct Schema Registry Contract Interaction")
  console.log("==============================================")
  console.log("🌐 Network: Polygon Amoy")
  console.log("📍 Schema Registry:", SCHEMA_REGISTRY_ADDRESS)
  console.log()

  const provider = new ethers.JsonRpcProvider("https://rpc-amoy.polygon.technology/")
  const wallet = new ethers.Wallet(process.env.PROVIDER_PRIVATE_KEY!, provider)
  
  console.log("👤 Wallet:", wallet.address)
  const balance = await provider.getBalance(wallet.address)
  console.log("💰 Balance:", ethers.formatEther(balance), "POL")
  console.log()

  // Create contract instance
  const schemaRegistry = new ethers.Contract(
    SCHEMA_REGISTRY_ADDRESS,
    SCHEMA_REGISTRY_ABI,
    wallet
  )

  // Test schema
  const testSchema = "uint256 number,string text"
  console.log("🧪 Test Schema:", testSchema)
  console.log()

  try {
    console.log("🚀 Registering schema directly...")
    
    // Estimate gas first
    const gasEstimate = await schemaRegistry.register.estimateGas(
      testSchema,
      ethers.ZeroAddress,
      true
    )
    console.log("⛽ Gas estimate:", gasEstimate.toString())
    
    // Send transaction
    const tx = await schemaRegistry.register(
      testSchema,
      ethers.ZeroAddress,
      true,
      { gasLimit: gasEstimate * 120n / 100n } // Add 20% buffer
    )
    
    console.log("📤 Transaction hash:", tx.hash)
    console.log("⏳ Waiting for confirmation...")
    
    const receipt = await tx.wait()
    console.log("✅ Transaction confirmed!")
    
    // Parse the logs to get the schema UID
    for (const log of receipt.logs) {
      if (log.address.toLowerCase() === SCHEMA_REGISTRY_ADDRESS.toLowerCase()) {
        console.log("📋 Schema Registry log found:")
        console.log("  Topics:", log.topics)
        console.log("  Data:", log.data)
        
        // The first topic should be the event signature, second should be the schema UID
        if (log.topics.length > 1) {
          const schemaUID = log.topics[1]
          console.log("🆔 Schema UID:", schemaUID)
          
          // Verify the schema by reading it back
          try {
            const schemaInfo = await schemaRegistry.getSchema(schemaUID)
            console.log("✅ Schema verification successful:")
            console.log("  Schema:", schemaInfo[0])
            console.log("  Resolver:", schemaInfo[1])
            console.log("  Revocable:", schemaInfo[2])
          } catch (error) {
            console.log("⚠️ Could not verify schema:", error)
          }
        }
      }
    }

  } catch (error: any) {
    console.error("❌ Registration failed:", error.message)
    
    // Check if it's a revert with specific error
    if (error.data) {
      console.error("📊 Error data:", error.data)
      
      // Try to decode common errors
      if (error.data === "0x23369fa6") {
        console.error("🔍 This error might mean: Schema already exists or invalid format")
      }
    }
    
    if (error.reason) {
      console.error("📝 Reason:", error.reason)
    }
  }
}

directSchemaRegistration().catch(console.error)