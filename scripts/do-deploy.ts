import { spawn } from 'child_process'
import { existsSync } from 'fs'

function run(command: string, cwd?: string): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log(`📦 Running: ${command}`)
    const child = spawn(command, [], {
      shell: true,
      stdio: 'inherit',
      cwd: cwd || process.cwd()
    })
    
    child.on('close', (code) => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`Command failed with code ${code}`))
      }
    })
  })
}

async function main() {
  console.log("🚀 POLySeal Deployment Pipeline")
  console.log("==============================")
  
  try {
    // Check if .env exists
    if (!existsSync('.env')) {
      console.error("❌ .env file not found")
      process.exit(1)
    }
    
    console.log("\n1️⃣ Building contracts...")
    await run('npm run build', 'packages/contracts')
    
    console.log("\n2️⃣ Running contract tests...")
    await run('npm test', 'packages/contracts')
    
    console.log("\n3️⃣ Deploying contracts...")
    await run('npm run deploy:amoy', 'packages/contracts')
    
    console.log("\n4️⃣ Building SDK...")
    await run('npm run build', 'packages/sdk')
    
    console.log("\n5️⃣ Installing scripts dependencies...")
    await run('npm install', 'scripts')
    
    console.log("\n6️⃣ Registering EAS schema...")
    await run('npm run register-schema', 'scripts')
    
    console.log("\n7️⃣ Testing attestation creation...")
    await run('npm run demo-attest', 'scripts')
    
    console.log("\n🎉 Deployment completed successfully!")
    console.log("✅ Contracts deployed and verified")
    console.log("✅ SDK built and ready")
    console.log("✅ EAS schema registered")
    console.log("✅ Attestation system tested")
    
  } catch (error: any) {
    console.error("\n❌ Deployment failed:", error.message)
    process.exit(1)
  }
}

main()