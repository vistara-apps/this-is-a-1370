const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Starting FilePay contract deployment...");

  // Get the contract factory
  const FilePay = await ethers.getContractFactory("FilePay");

  // Base network USDC address
  const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"; // Base mainnet USDC
  
  // Fee recipient address (should be the platform's treasury)
  const FEE_RECIPIENT = process.env.FEE_RECIPIENT_ADDRESS || "0x..."; // Replace with actual address

  console.log("📋 Deployment parameters:");
  console.log("- USDC Token Address:", USDC_ADDRESS);
  console.log("- Fee Recipient:", FEE_RECIPIENT);

  // Deploy the contract
  console.log("⏳ Deploying FilePay contract...");
  const filePay = await FilePay.deploy(USDC_ADDRESS, FEE_RECIPIENT);

  // Wait for deployment to complete
  await filePay.waitForDeployment();

  const contractAddress = await filePay.getAddress();
  console.log("✅ FilePay contract deployed to:", contractAddress);

  // Verify contract on Basescan (if not local network)
  if (network.name !== "hardhat" && network.name !== "localhost") {
    console.log("⏳ Waiting for block confirmations...");
    await filePay.deploymentTransaction().wait(6);

    console.log("🔍 Verifying contract on Basescan...");
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [USDC_ADDRESS, FEE_RECIPIENT],
      });
      console.log("✅ Contract verified on Basescan");
    } catch (error) {
      console.log("❌ Verification failed:", error.message);
    }
  }

  // Display deployment summary
  console.log("\n📊 Deployment Summary:");
  console.log("=".repeat(50));
  console.log("Contract Address:", contractAddress);
  console.log("Network:", network.name);
  console.log("Deployer:", (await ethers.getSigners())[0].address);
  console.log("USDC Token:", USDC_ADDRESS);
  console.log("Fee Recipient:", FEE_RECIPIENT);
  console.log("=".repeat(50));

  // Save deployment info to file
  const fs = require("fs");
  const deploymentInfo = {
    contractAddress,
    network: network.name,
    deployer: (await ethers.getSigners())[0].address,
    usdcToken: USDC_ADDRESS,
    feeRecipient: FEE_RECIPIENT,
    deployedAt: new Date().toISOString(),
    blockNumber: await ethers.provider.getBlockNumber(),
  };

  fs.writeFileSync(
    `deployments/${network.name}-deployment.json`,
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log(`💾 Deployment info saved to deployments/${network.name}-deployment.json`);

  // Update environment variables template
  console.log("\n🔧 Environment Variables:");
  console.log("Add this to your .env file:");
  console.log(`VITE_FILEPAY_CONTRACT_ADDRESS=${contractAddress}`);
  console.log(`VITE_USDC_CONTRACT_ADDRESS=${USDC_ADDRESS}`);

  console.log("\n🎉 Deployment completed successfully!");
}

// Handle errors
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
