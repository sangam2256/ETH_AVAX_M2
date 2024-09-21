const { ethers } = require("hardhat");

async function main() {
  // Get the contract factory for BikeSharingSystem
  const BikeSharingSystem = await ethers.getContractFactory("BikeSharingSystem");
  
  // Deploy the contract
  const bikeSharingSystem = await BikeSharingSystem.deploy();  
  await bikeSharingSystem.deployed();  // Wait for the deployment to be mined

  // Output the deployed contract address
  console.log(`BikeSharingSystem deployed to: ${bikeSharingSystem.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
