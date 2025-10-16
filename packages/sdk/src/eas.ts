import { EAS, SchemaEncoder, SchemaRegistry } from "@ethereum-attestation-service/eas-sdk"
import { ethers } from "ethers"
import { AMOY_CONFIG, PAID_INFERENCE_SCHEMA } from './constants.js'
import type { AttestationData } from './types.js'

export class POLySealEAS {
  private eas: EAS
  private schemaRegistry: SchemaRegistry
  private signer: ethers.Signer

  constructor(signer: ethers.Signer) {
    this.signer = signer
    this.eas = new EAS(AMOY_CONFIG.easAddress)
    this.schemaRegistry = new SchemaRegistry(AMOY_CONFIG.schemaRegistryAddress)
    this.eas.connect(signer)
    this.schemaRegistry.connect(signer)
  }

  async registerSchema(): Promise<string> {
    console.log("Registering paid_inference schema...")
    console.log("Schema:", PAID_INFERENCE_SCHEMA)
    
    const transaction = await this.schemaRegistry.register({
      schema: PAID_INFERENCE_SCHEMA,
      resolverAddress: ethers.ZeroAddress,
      revocable: false,
    })

    const receipt = await transaction.wait()
    if (!receipt) throw new Error('Transaction failed')
    
    // Extract schema UID from logs - properly type the receipt
    const logs = (receipt as any).logs
    const schemaUID = logs?.[0]?.topics?.[1] || ''
    console.log("Schema UID:", schemaUID)
    
    return schemaUID
  }

  async attestPaidInference(data: AttestationData, schemaUID: string): Promise<string> {
    const schemaEncoder = new SchemaEncoder(PAID_INFERENCE_SCHEMA)
    const encodedData = schemaEncoder.encodeData([
      { name: "payer", value: data.payer, type: "address" },
      { name: "provider", value: data.provider, type: "address" },
      { name: "requestId", value: data.requestId, type: "bytes32" },
      { name: "model", value: data.model, type: "string" },
      { name: "priceUSDC", value: data.priceUSDC.toString(), type: "uint256" },
      { name: "inputHash", value: data.inputHash, type: "bytes32" },
      { name: "outputRef", value: data.outputRef, type: "string" },
      { name: "status", value: data.status, type: "uint8" },
      { name: "chainId", value: data.chainId, type: "uint64" },
      { name: "txHash", value: data.txHash, type: "bytes32" },
      { name: "timestamp", value: data.timestamp, type: "uint64" }
    ])

    console.log("Creating attestation...")
    
    const tx = await this.eas.attest({
      schema: schemaUID,
      data: {
        recipient: data.payer,
        expirationTime: 0n,
        revocable: false,
        data: encodedData,
      },
    })

    const receipt = await tx.wait()
    if (!receipt) throw new Error('Attestation failed')
    
    // Extract attestation UID from logs - properly type the receipt
    const logs = (receipt as any).logs
    const attestationUID = logs?.[0]?.topics?.[1] || ''
    console.log("Attestation UID:", attestationUID)
    console.log("View: https://polygon-amoy.easscan.org/attestation/" + attestationUID)
    
    return attestationUID
  }

  generateEASScanLink(attestationUID: string): string {
    return `https://polygon-amoy.easscan.org/attestation/${attestationUID}`
  }
}