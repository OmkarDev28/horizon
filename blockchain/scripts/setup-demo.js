import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
  const [admin, trader1, trader2] = await ethers.getSigners();
  
  const inrAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const settlementAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  const relianceAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

  const inr = await ethers.getContractAt("INR", inrAddress);
  const reliance = await ethers.getContractAt("SecurityToken", relianceAddress);

  console.log("Setting up pre-approvals for demo...");

  // Trader 1 (Buyer) approves settlement contract to spend INR
  await inr.connect(trader1).approve(settlementAddress, ethers.MaxUint256);
  console.log("Trader 1 approved INR for Settlement");

  // Trader 2 (Seller) approves settlement contract to spend RELIANCE
  await reliance.connect(trader2).approve(settlementAddress, ethers.MaxUint256);
  console.log("Trader 2 approved RELIANCE for Settlement");

  console.log("Demo setup complete.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
