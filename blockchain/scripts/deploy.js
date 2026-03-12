import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // 1. Deploy INR
  const INR = await ethers.getContractFactory("INR");
  const inr = await INR.deploy();
  await inr.waitForDeployment();
  const inrAddress = await inr.getAddress();
  console.log("INR deployed to:", inrAddress);

  // 2. Deploy AtomicSettlement
  const AtomicSettlement = await ethers.getContractFactory("AtomicSettlement");
  const settlement = await AtomicSettlement.deploy(inrAddress);
  await settlement.waitForDeployment();
  const settlementAddress = await settlement.getAddress();
  console.log("AtomicSettlement deployed to:", settlementAddress);

  // 3. Deploy a mock Security Token (e.g., RELIANCE)
  const SecurityToken = await ethers.getContractFactory("SecurityToken");
  const reliance = await SecurityToken.deploy("Reliance Industries", "RELIANCE", "INE002A01018");
  await reliance.waitForDeployment();
  const relianceAddress = await reliance.getAddress();
  console.log("RELIANCE Security Token deployed to:", relianceAddress);

  // 4. Approve RELIANCE in the Settlement contract
  await settlement.approveSecurity(relianceAddress);
  console.log("RELIANCE approved in Settlement contract");

  // Output addresses for the backend/frontend to use
  console.log("\nCopy these addresses for your .env file:");
  console.log(`INR_ADDRESS=${inrAddress}`);
  console.log(`SETTLEMENT_ADDRESS=${settlementAddress}`);
  console.log(`RELIANCE_ADDRESS=${relianceAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
