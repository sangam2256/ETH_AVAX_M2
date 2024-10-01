const { ethers } = require("hardhat");

async function main() {
  try {
    // Fetch the contract factory for AdvancedBikeSharingSystem
    const AdvancedBikeSharingSystemFactory = await ethers.getContractFactory("AdvancedBikeSharingSystem");

    // Deploy the contract
    const advancedBikeSharingSystem = await AdvancedBikeSharingSystemFactory.deploy();
    
    // Wait until the contract is deployed
    await advancedBikeSharingSystem.deployed();

    // Log the address of the deployed contract
    console.log(`AdvancedBikeSharingSystem deployed to: ${advancedBikeSharingSystem.address}`);
  } catch (error) {
    console.error("Error during deployment:", error);
    process.exit(1);
  }
}

// Run the deployment script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
