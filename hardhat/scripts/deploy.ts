import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy TipflowFactory first
  const TipflowFactory = await ethers.getContractFactory("TipflowFactory");
  const factory = await TipflowFactory.deploy();
  await factory.waitForDeployment();

  const factoryAddress = await factory.getAddress();
  console.log("TipflowFactory deployed to:", factoryAddress);

  // For testing, deploy a Tipflow instance
  const username = "test_creator";
  const tx = await factory.deployContract(username);
  const receipt = await tx.wait();

  if (receipt?.status === 1) {
    console.log(`Successfully deployed Tipflow contract for username: ${username}`);
    
    // Get the deployed Tipflow contract address from events
    const event = receipt.logs.find(
      (log) => log.fragment?.name === "ContractDeployed"
    );
    
    if (event && 'args' in event) {
      const [creatorAddress, contractAddress] = event.args;
      console.log("Creator Address:", creatorAddress);
      console.log("Tipflow Contract Address:", contractAddress);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
