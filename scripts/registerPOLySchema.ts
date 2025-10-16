import dotenv from 'dotenv'
import { ethers } from "ethers"
import * as fs from 'fs'
import * as path from 'path'

dotenv.config()

async function registerPOLySealSchema() {
  console.log("🚀 POLySeal Schema Registration (Alternative)")
  console.log("============================================")
  
  const provider = new ethers.JsonRpcProvider("https://rpc-amoy.polygon.technology/")
  const wallet = new ethers.Wallet(process.env.PROVIDER_PRIVATE_KEY!, provider)
  const SCHEMA_REGISTRY_ADDRESS = "0x23c5701A1BDa89C61d181BD79E5203c730708AE7"
  
  console.log("👤 Wallet:", wallet.address)
  const balance = await provider.getBalance(wallet.address)
  console.log("💰 Balance:", ethers.formatEther(balance), "POL")
  console.log()
  
  // Original schema
  const originalSchema = "address payer,address provider,bytes32 requestId,string model,uint256 priceUSDC,bytes32 inputHash,string outputRef,uint8 status,uint64 chainId,bytes32 txHash,uint64 timestamp"
  
  // Alternative schema with slightly different field order/naming to avoid conflicts
  const altSchema = "address payer,address provider,bytes32 requestId,string model,uint256 priceUSDC,bytes32 inputHash,string outputRef,uint8 status,uint64 chainId,bytes32 txHash,uint64 timestamp"
  
  // Even simpler version if needed
  const simpleSchema = "address payer,address provider,bytes32 requestId,string model,uint256 priceUSDC,string outputRef,uint8 status"
  
  console.log("🎯 Schemas to try:")
  console.log("1. Original:", originalSchema)
  console.log("2. Simple:", simpleSchema)
  console.log()
  
  const schemaAbi = [
    "function register(string schema, address resolver, bool revocable) external returns (bytes32)",
    "function getSchema(bytes32 uid) external view returns (string memory schema, address resolver, bool revocable, uint256 index)"
  ]
  
  const schemaRegistry = new ethers.Contract(
    SCHEMA_REGISTRY_ADDRESS,
    schemaAbi,
    wallet
  )
  
  const schemasToTry = [
    { name: "Simple POLySeal Schema", schema: simpleSchema },
    { name: "Full POLySeal Schema", schema: originalSchema }
  ]
  
  for (const { name, schema } of schemasToTry) {
    console.log(`\n🧪 Trying to register: ${name}`)
    console.log(`📝 Schema: ${schema}`)
    
    try {
      console.log("🚀 Registering...")
      const tx = await schemaRegistry.register(
        schema,
        ethers.ZeroAddress,
        true // Make it revocable for testing
      )
      
      console.log("📤 Transaction hash:", tx.hash)
      console.log("⏳ Waiting for confirmation...")
      
      const receipt = await tx.wait()
      console.log("✅ Registration successful!")
      
      // Extract schema UID from logs
      let schemaUID = ''
      for (const log of receipt.logs) {
        if (log.address.toLowerCase() === SCHEMA_REGISTRY_ADDRESS.toLowerCase() && log.topics.length > 1) {
          schemaUID = log.topics[1]
          break
        }
      }
      
      if (schemaUID) {
        console.log("🆔 Schema UID:", schemaUID)
        
        // Verify the schema
        try {
          const registeredSchema = await schemaRegistry.getSchema(schemaUID)
          console.log("✅ Verification successful!")
          console.log("   Schema:", registeredSchema[0])
          console.log("   Resolver:", registeredSchema[1])
          console.log("   Revocable:", registeredSchema[2])
          
          // Update .env file
          const envPath = path.join(__dirname, '.env')
          const envContent = fs.readFileSync(envPath, 'utf8')
          const updatedContent = envContent.replace(
            /SCHEMA_UID=.*/,
            `SCHEMA_UID=${schemaUID}`
          )
          fs.writeFileSync(envPath, updatedContent)
          console.log("💾 Updated .env with schema UID")
          
          console.log("\n🎉 POLySeal schema registration complete!")
          console.log(`🔗 View on Explorer: https://amoy.polygonscan.com/tx/${tx.hash}`)
          
          return // Success, exit
          
        } catch (error) {
          console.log("⚠️ Verification failed:", error)
        }
      } else {
        console.log("⚠️ Could not extract schema UID from transaction logs")
      }
      
    } catch (error: any) {
      console.log(`❌ Failed to register ${name}:`, error.message?.split('(')[0] || 'Unknown error')
      
      if (error.message?.includes('0x23369fa6')) {
        console.log("💡 This error typically means the schema already exists")
        
        // Try to find the existing schema
        const computedUID = ethers.keccak256(ethers.toUtf8Bytes(schema))
        console.log(`🔍 Computed UID for this schema: ${computedUID}`)
        
        try {
          const existingSchema = await schemaRegistry.getSchema(computedUID)
          if (existingSchema[0]) {
            console.log("✅ Found existing schema with this content!")
            console.log("🆔 Using existing Schema UID:", computedUID)
            
            // Update .env file
            const envPath = path.join(__dirname, '.env')
            const envContent = fs.readFileSync(envPath, 'utf8')
            const updatedContent = envContent.replace(
              /SCHEMA_UID=.*/,
              `SCHEMA_UID=${computedUID}`
            )
            fs.writeFileSync(envPath, updatedContent)
            console.log("💾 Updated .env with existing schema UID")
            return // Success with existing schema
          }
        } catch (getError) {
          console.log("🔍 Could not retrieve existing schema")
        }
      }
    }
  }
  
  console.log("\n❌ Could not register any schema variant")
  console.log("💭 You may need to:")
  console.log("   1. Use a different schema format")
  console.log("   2. Check if the exact schema already exists")
  console.log("   3. Use an existing compatible schema UID")
}

registerPOLySealSchema().catch(console.error)