import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
  const [admin] = await ethers.getSigners();
  const settlementAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  const inrAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const trader3 = "0x90F79bf6EB2c4f870365E785982E1f101E93b906"; // Third trader account

  const settlement = await ethers.getContractAt("AtomicSettlement", settlementAddress);
  const inr = await ethers.getContractAt("INR", inrAddress);

  console.log("--- ADMIN ACTION 1: WHITELISTING ---");
  const SecurityToken = await ethers.getContractFactory("SecurityToken");
  const tcs = await SecurityToken.deploy("Tata Consultancy Services", "TCS", "INE467B01029");
  await tcs.waitForDeployment();
  const tcsAddress = await tcs.getAddress();
  console.log(`Admin deployed new Security: TCS at ${tcsAddress}`);

  await settlement.approveSecurity(tcsAddress);
  console.log("Admin approved TCS in AtomicSettlement engine.");

  console.log("\n--- ADMIN ACTION 2: FIAT MINTING (UPI BRIDGE) ---");
  const depositAmount = ethers.parseUnits("500000", 18);
  await inr.mint(trader3, depositAmount);
  console.log(`Admin confirmed UPI deposit and minted 500,000 INR for Trader 3 (${trader3})`);

  console.log("\n--- ADMIN ACTION 3: SETTLEMENT TRIGGER ---");
  // Only the Admin (Clearing Corp) has the 'owner' key to call the 'settle' function.
  // This prevents malicious actors from triggering unauthorized trades.
  console.log("Admin (Clearing Corp) is now authorized to trigger instant settlements for TCS trades.");
}

main().catch(console.error);
