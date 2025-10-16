import { EAS, SchemaEncoder } from "@ethereum-attestation-service/eas-sdk"
import { Command } from 'commander'
import dotenv from 'dotenv'
import { ethers } from "ethers"

dotenv.config()

const EAS_ADDRESS = "0xb101275a60d8bfb14529C421899aD7CA1Ae5B5Fc"
const PAID_INFERENCE_SCHEMA = "address payer,address provider,bytes32 requestId,string model,uint256 priceUSDC,bytes32 inputHash,string outputRef,uint8 status,uint64 chainId,bytes32 txHash,uint64 timestamp"

const program = new Command()
program
  .name('polyseal-attest')
  .description('Create POLySeal attestations on EAS')
  .version('1.0.0')

program
  .command('create')
  .description('Create a paid inference attestation')
  .requiredOption('-p, --payer <address>', 'Payer address')
  .requiredOption('-r, --provider <address>', 'Provider address') 
  .requiredOption('-i, --requestId <hash>', 'Request ID (bytes32)')
  .requiredOption('-m, --model <name>', 'AI model name')
  .requiredOption('-a, --amount <usdc>', 'Price in USDC')
  .requiredOption('-h, --inputHash <hash>', 'Input hash (bytes32)')
  .requiredOption('-o, --outputRef <ref>', 'Output reference URL')
  .requiredOption('-s, --status <number>', 'Status (1=success)')
  .requiredOption('-t, --txHash <hash>', 'Settlement transaction hash')
  .action(createAttestation)

program
  .command('demo')
  .description('Create a demo attestation')
  .action(createDemoAttestation)

async function createAttestation(options: any) {
  console.log("🔄 POLySeal Attestation Creation")
  console.log("=================================")
  
  if (!process.env.PROVIDER_PRIVATE_KEY) {
    throw new Error("❌ PROVIDER_PRIVATE_KEY not set")
  }
  if (!process.env.AMOY_RPC) {
    throw new Error("❌ AMOY_RPC not set")
  }
  if (!process.env.SCHEMA_UID) {
    throw new Error("❌ SCHEMA_UID not set. Run: npm run register-schema")
  }

  const provider = new ethers.JsonRpcProvider(process.env.AMOY_RPC)
  const wallet = new ethers.Wallet(process.env.PROVIDER_PRIVATE_KEY, provider)
  
  console.log("👤 Attester:", wallet.address)
  
  const eas = new EAS(EAS_ADDRESS)
  eas.connect(wallet)
  
  const attestationData = {
    payer: options.payer,
    provider: options.provider,
    requestId: options.requestId,
    model: options.model,
    priceUSDC: options.amount,
    inputHash: options.inputHash,
    outputRef: options.outputRef,
    status: parseInt(options.status),
    chainId: 80002,
    txHash: options.txHash,
    timestamp: Math.floor(Date.now() / 1000)
  }
  
  console.log("\n📊 Attestation Data:")
  console.log("   Payer:", attestationData.payer)
  console.log("   Provider:", attestationData.provider) 
  console.log("   Model:", attestationData.model)
  console.log("   Price:", attestationData.priceUSDC, "USDC")
  
  const schemaEncoder = new SchemaEncoder(PAID_INFERENCE_SCHEMA)
  const encodedData = schemaEncoder.encodeData([
    { name: "payer", value: attestationData.payer, type: "address" },
    { name: "provider", value: attestationData.provider, type: "address" },
    { name: "requestId", value: attestationData.requestId, type: "bytes32" },
    { name: "model", value: attestationData.model, type: "string" },
    { name: "priceUSDC", value: attestationData.priceUSDC, type: "uint256" },
    { name: "inputHash", value: attestationData.inputHash, type: "bytes32" },
    { name: "outputRef", value: attestationData.outputRef, type: "string" },
    { name: "status", value: attestationData.status, type: "uint8" },
    { name: "chainId", value: attestationData.chainId, type: "uint64" },
    { name: "txHash", value: attestationData.txHash, type: "bytes32" },
    { name: "timestamp", value: attestationData.timestamp, type: "uint64" }
  ])

  console.log("\n🚀 Creating attestation...")
  
  try {
    const tx = await eas.attest({
      schema: process.env.SCHEMA_UID,
      data: {
        recipient: attestationData.payer,
        expirationTime: 0n,
        revocable: false,
        data: encodedData,
      },
    })

    console.log("📤 Transaction hash:", (tx as any).hash)
    const newAttestationUID = await tx
    
    console.log("\n🎉 Attestation created successfully!")
    console.log("🆔 Attestation UID:", newAttestationUID)
    console.log("🔗 View on EASScan:", `https://polygon-amoy.easscan.org/attestation/${newAttestationUID}`)
    
  } catch (error: any) {
    console.error("❌ Attestation failed:", error.message)
    process.exit(1)
  }
}

async function createDemoAttestation() {
  const demoOptions = {
    payer: "0x1234567890123456789012345678901234567890",
    provider: "0x0987654321098765432109876543210987654321",
    requestId: "0x1111111111111111111111111111111111111111111111111111111111111111",
    model: "gpt-4o-mini",
    amount: "1000000", // 1 USDC in 6 decimal format
    inputHash: "0x2222222222222222222222222222222222222222222222222222222222222222",
    outputRef: "https://demo.example.com/output/123",
    status: "1",
    txHash: "0x3333333333333333333333333333333333333333333333333333333333333333"
  }
  
  console.log("🎮 Creating demo attestation...")
  await createAttestation(demoOptions)
}

program.parse()