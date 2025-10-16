import { EAS, NO_EXPIRATION, SchemaEncoder } from "@ethereum-attestation-service/eas-sdk"
import dotenv from 'dotenv'
import { ethers } from "ethers"

dotenv.config()

async function testAttestation() {
  console.log("🧪 Testing POLySeal Attestation")
  console.log("==============================")
  
  const provider = new ethers.JsonRpcProvider("https://rpc-amoy.polygon.technology/")
  const wallet = new ethers.Wallet(process.env.PROVIDER_PRIVATE_KEY!, provider)
  
  const EAS_ADDRESS = "0xb101275a60d8bfb14529C421899aD7CA1Ae5B5Fc"
  const SCHEMA_UID = process.env.SCHEMA_UID!
  
  console.log("👤 Attester:", wallet.address)
  console.log("📍 EAS Address:", EAS_ADDRESS)
  console.log("🆔 Schema UID:", SCHEMA_UID)
  console.log()
  
  // Initialize EAS
  const eas = new EAS(EAS_ADDRESS)
  eas.connect(wallet)
  
  // Schema: address payer,address provider,bytes32 requestId,string model,uint256 priceUSDC,bytes32 inputHash,string outputRef,uint8 status,uint64 chainId,bytes32 txHash,uint64 timestamp
  const schemaEncoder = new SchemaEncoder(
    "address payer,address provider,bytes32 requestId,string model,uint256 priceUSDC,bytes32 inputHash,string outputRef,uint8 status,uint64 chainId,bytes32 txHash,uint64 timestamp"
  )
  
  // Test data
  const testData = [
    { name: "payer", value: "0x1234567890123456789012345678901234567890", type: "address" },
    { name: "provider", value: wallet.address, type: "address" },
    { name: "requestId", value: ethers.keccak256(ethers.toUtf8Bytes("test-request-1")), type: "bytes32" },
    { name: "model", value: "gpt-4o-mini", type: "string" },
    { name: "priceUSDC", value: 1000000, type: "uint256" }, // $1 in USDC (6 decimals)
    { name: "inputHash", value: ethers.keccak256(ethers.toUtf8Bytes("test input prompt")), type: "bytes32" },
    { name: "outputRef", value: "https://example.com/output/123", type: "string" },
    { name: "status", value: 1, type: "uint8" }, // 1 = completed
    { name: "chainId", value: 80002, type: "uint64" }, // Polygon Amoy
    { name: "txHash", value: ethers.keccak256(ethers.toUtf8Bytes("mock-tx-hash")), type: "bytes32" },
    { name: "timestamp", value: Math.floor(Date.now() / 1000), type: "uint64" }
  ]
  
  console.log("📋 Test attestation data:")
  testData.forEach(({ name, value, type }) => {
    console.log(`   ${name} (${type}): ${value}`)
  })
  console.log()
  
  try {
    console.log("🔧 Encoding attestation data...")
    const encodedData = schemaEncoder.encodeData(testData)
    console.log("✅ Data encoded successfully")
    console.log("📦 Encoded data:", encodedData)
    console.log()
    
    console.log("🚀 Creating attestation...")
    const transaction = await eas.attest({
      schema: SCHEMA_UID,
      data: {
        recipient: wallet.address, // Attest to ourselves for testing
        expirationTime: NO_EXPIRATION,
        revocable: true,
        data: encodedData,
      },
    })
    
    console.log("📤 Transaction object type:", typeof transaction)
    console.log("📤 Transaction keys:", Object.keys(transaction))
    
    const newAttestationUID = await transaction.wait()
    console.log("✅ Attestation created successfully!")
    console.log("🆔 Attestation UID:", newAttestationUID)
    
    if (typeof newAttestationUID === 'string' && newAttestationUID.length === 66) {
      console.log(`🔗 View on EAS Scan: https://polygon-amoy.easscan.org/attestation/view/${newAttestationUID}`)
    }
    
    // Try to retrieve the attestation
    console.log("\n🔍 Retrieving attestation...")
    try {
      const attestation = await eas.getAttestation(newAttestationUID as string)
      console.log("✅ Attestation retrieved:")
      console.log("   UID:", attestation.uid)
      console.log("   Schema:", attestation.schema)
      console.log("   Attester:", attestation.attester)
      console.log("   Recipient:", attestation.recipient)
      console.log("   Time:", new Date(Number(attestation.time) * 1000).toISOString())
      console.log("   Revocable:", attestation.revocable)
      console.log("   Data:", attestation.data)
    } catch (retrieveError) {
      console.log("⚠️ Could not retrieve attestation:", retrieveError)
    }
    
    console.log("\n🎉 POLySeal EAS integration test successful!")
    
  } catch (error: any) {
    console.error("❌ Attestation failed:", error.message || error)
    
    if (error.data) {
      console.error("📊 Error data:", error.data)
    }
    
    console.log("\n💭 Possible issues:")
    console.log("   1. Schema UID doesn't match the schema format")
    console.log("   2. Data encoding mismatch")
    console.log("   3. Network or gas issues")
    console.log("   4. Insufficient balance")
  }
}

testAttestation().catch(console.error)