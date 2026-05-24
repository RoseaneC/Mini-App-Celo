const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  if (!deployer) {
    throw new Error("Missing deployer. Set CELO_MAINNET_PRIVATE_KEY first.");
  }

  console.log("Deploying InapayRegistry with:", deployer.address);

  const InapayRegistry = await hre.ethers.getContractFactory("InapayRegistry");
  const registry = await InapayRegistry.deploy();

  await registry.waitForDeployment();

  const address = await registry.getAddress();
  console.log("InapayRegistry deployed to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
