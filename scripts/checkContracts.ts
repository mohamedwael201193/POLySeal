import dotenv from 'dotenv'
import { ethers } from "ethers"

dotenv.config()

async function checkContracts() {
  console.log("🔍 EAS Contract Verification on Polygon Amoy")
  console.log("=============================================")
  
  const provider = new ethers.JsonRpcProvider("https://rpc-amoy.polygon.technology/")
  
  // Contract addresses from official EAS docs
  const EAS_ADDRESS = "0xb101275a60d8bfb14529C421899aD7CA1Ae5B5Fc"
  const SCHEMA_REGISTRY_ADDRESS = "0x23c5701A1BDa89C61d181BD79E5203c730708AE7"
  
  console.log("📍 EAS Address:", EAS_ADDRESS)
  console.log("📍 Schema Registry Address:", SCHEMA_REGISTRY_ADDRESS)
  console.log()
  
  try {
    // Check if contracts have code
    const easCode = await provider.getCode(EAS_ADDRESS)
    const schemaCode = await provider.getCode(SCHEMA_REGISTRY_ADDRESS)
    
    console.log("🏗️ EAS contract has code:", easCode !== "0x")
    console.log("🏗️ Schema Registry has code:", schemaCode !== "0x")
    console.log()
    
    if (easCode === "0x") {
      console.log("❌ EAS contract not found!")
      return
    }
    
    if (schemaCode === "0x") {
      console.log("❌ Schema Registry contract not found!")
      return
    }
    
    // Test a simple call to Schema Registry
    const schemaRegistryAbi = [
      "function getSchemaCounter() external view returns (uint256)"
    ]
    
    const schemaRegistry = new ethers.Contract(
      SCHEMA_REGISTRY_ADDRESS,
      schemaRegistryAbi,
      provider
    )
    
    try {
      const schemaCount = await schemaRegistry.getSchemaCounter()
      console.log("📊 Total schemas registered:", schemaCount.toString())
      console.log("✅ Schema Registry is responding correctly!")
    } catch (error) {
      console.log("⚠️ Schema Registry call failed:", error)
    }
    
  } catch (error) {
    console.error("❌ Error checking contracts:", error)
  }
}

checkContracts().catch(console.error)