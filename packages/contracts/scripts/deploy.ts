import { readFileSync, writeFileSync } from "fs";
import hre from "hardhat";
import { join } from "path";

const { ethers } = hre;

async function main() {
  console.log("🚀 Deploying POLySeal contracts to Polygon Amoy...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "POL");

  // Deploy MockUSDC
  console.log("\n📄 Deploying MockUSDC...");
  const MockUSDC = await ethers.getContractFactory("MockUSDC");
  const mockUSDC = await MockUSDC.deploy();
  await mockUSDC.waitForDeployment();
  const mockUSDCAddress = await mockUSDC.getAddress();
  console.log("✅ MockUSDC deployed to:", mockUSDCAddress);

  // Mint initial supply to deployer (25 USDC = 25 * 10^6)
  console.log("💰 Minting 25 USDC to deployer...");
  const mintTx = await mockUSDC.mint(deployer.address, 25_000_000); // 25 * 10^6
  await mintTx.wait();
  console.log("✅ Minted 25 USDC to deployer");

  // Deploy SessionPay
  console.log("\n📄 Deploying SessionPay...");
  const SessionPay = await ethers.getContractFactory("SessionPay");
  const sessionPay = await SessionPay.deploy(deployer.address);
  await sessionPay.waitForDeployment();
  const sessionPayAddress = await sessionPay.getAddress();
  console.log("✅ SessionPay deployed to:", sessionPayAddress);

  // Log final addresses
  console.log("\n🎉 Deployment complete!");
  console.log("📝 Contract Addresses:");
  console.log("   MockUSDC:", mockUSDCAddress);
  console.log("   SessionPay:", sessionPayAddress);

  // Update .env file with contract addresses
  try {
    const envPath = join(process.cwd(), "../../../.env");
    const envContent = readFileSync(envPath, "utf8");
    
    let updatedContent = envContent;
    
    // Update or add MOCKUSDC_ADDRESS
    if (updatedContent.includes("MOCKUSDC_ADDRESS=")) {
      updatedContent = updatedContent.replace(
        /MOCKUSDC_ADDRESS=.*/,
        `MOCKUSDC_ADDRESS=${mockUSDCAddress}`
      );
    } else {
      updatedContent += `\nMOCKUSDC_ADDRESS=${mockUSDCAddress}`;
    }
    
    // Update or add SESSIONPAY_ADDRESS
    if (updatedContent.includes("SESSIONPAY_ADDRESS=")) {
      updatedContent = updatedContent.replace(
        /SESSIONPAY_ADDRESS=.*/,
        `SESSIONPAY_ADDRESS=${sessionPayAddress}`
      );
    } else {
      updatedContent += `\nSESSIONPAY_ADDRESS=${sessionPayAddress}`;
    }

    writeFileSync(envPath, updatedContent);
    console.log("✅ Updated .env file with contract addresses");
  } catch (error) {
    console.warn("⚠️ Could not update .env file:", error);
    console.log("📝 Please manually add these to your .env file:");
    console.log(`MOCKUSDC_ADDRESS=${mockUSDCAddress}`);
    console.log(`SESSIONPAY_ADDRESS=${sessionPayAddress}`);
  }

  console.log("\n🔗 Polygon Amoy Explorer Links:");
  console.log(`   MockUSDC: https://amoy.polygonscan.com/address/${mockUSDCAddress}`);
  console.log(`   SessionPay: https://amoy.polygonscan.com/address/${sessionPayAddress}`);
  
  console.log("\n⚡ Next Steps:");
  console.log("1. Run verification: npm run verify");
  console.log("2. Register EAS schema: npm run register:schema");
  console.log("3. Start the backend server");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });