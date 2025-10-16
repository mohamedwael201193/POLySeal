import hre from "hardhat";

async function main() {
  console.log("🔍 Verifying contracts on Polygon Amoy...");

  if (!process.env.POLYGONSCAN_API_KEY) {
    console.warn("⚠️ POLYGONSCAN_API_KEY not set, skipping verification");
    return;
  }

  if (!process.env.MOCKUSDC_ADDRESS || !process.env.SESSIONPAY_ADDRESS) {
    console.error("❌ Contract addresses not found in .env file");
    console.log("Please deploy contracts first: npm run deploy");
    return;
  }

  const mockUSDCAddress = process.env.MOCKUSDC_ADDRESS;
  const sessionPayAddress = process.env.SESSIONPAY_ADDRESS;
  const [deployer] = await hre.ethers.getSigners();

  console.log("📄 Verifying MockUSDC...");
  try {
    await hre.run("verify:verify", {
      address: mockUSDCAddress,
      constructorArguments: [],
    });
    console.log("✅ MockUSDC verified successfully");
  } catch (error: any) {
    if (error.message.includes("already verified")) {
      console.log("ℹ️ MockUSDC already verified");
    } else {
      console.error("❌ MockUSDC verification failed:", error.message);
    }
  }

  console.log("\n📄 Verifying SessionPay...");
  try {
    await hre.run("verify:verify", {
      address: sessionPayAddress,
      constructorArguments: [deployer.address],
    });
    console.log("✅ SessionPay verified successfully");
  } catch (error: any) {
    if (error.message.includes("already verified")) {
      console.log("ℹ️ SessionPay already verified");
    } else {
      console.error("❌ SessionPay verification failed:", error.message);
    }
  }

  console.log("\n🎉 Verification complete!");
  console.log("🔗 View contracts on Polygon Amoy:");
  console.log(`   MockUSDC: https://amoy.polygonscan.com/address/${mockUSDCAddress}`);
  console.log(`   SessionPay: https://amoy.polygonscan.com/address/${sessionPayAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Verification failed:", error);
    process.exit(1);
  });