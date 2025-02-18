import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy TipflowFactory
  const TipflowFactory = await ethers.getContractFactory("TipflowFactory");
  const factory = await TipflowFactory.deploy();
  await factory.waitForDeployment(); // Updated for ethers v6

  const factoryAddress = await factory.getAddress(); // Updated for ethers v6
  console.log("TipflowFactory deployed to:", factoryAddress);

  // Deploy a Tipflow instance
  const username = "test_creator";
  const tx = await factory.deployContract(username);
  const receipt = await tx.wait(1); // ethers v6

  if (receipt?.status === 1) {
    console.log(`Successfully deployed Tipflow contract for username: ${username}`);

    // Get the contract instance to parse logs correctly
    const tipflowFactory = await ethers.getContractAt("TipflowFactory", factoryAddress);
    const contractDeployedEvent = receipt.logs.find(log => {
      try {
        const parsedLog = tipflowFactory.interface.decodeEventLog(
          "ContractDeployed",
          log.data,
          log.topics
        );
        return parsedLog !== null;
      } catch {
        return false;
      }
    });

    if (contractDeployedEvent) {
      try {
        const parsedLog = tipflowFactory.interface.decodeEventLog(
          "ContractDeployed",
          contractDeployedEvent.data,
          contractDeployedEvent.topics
        );
        console.log("Creator Address:", parsedLog[0]);
        console.log("Tipflow Contract Address:", parsedLog[1]);
      } catch (error) {
        console.error("Failed to parse ContractDeployed event log:", error);
      }
    } else {
      console.log("No ContractDeployed event found in transaction logs.");
    }
  } else {
    console.error("Deployment transaction failed.");
  }
}

// Run the script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
