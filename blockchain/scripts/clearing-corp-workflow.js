import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
  const [clearingCorp, buyer, seller] = await ethers.getSigners();
  
  const settlementAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  const inrAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const relianceAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

  const settlement = await ethers.getContractAt("AtomicSettlement", settlementAddress);
  const inr = await ethers.getContractAt("INR", inrAddress);
  const reliance = await ethers.getContractAt("SecurityToken", relianceAddress);

  console.log("--- CLEARING CORP WORKFLOW START ---");

  // 1. Validation Logic
  console.log("Step 1: Validating Buyer (Trader 1) INR balance...");
  const buyerInr = await inr.balanceOf(buyer.address);
  console.log(`   Buyer has ₹${ethers.formatUnits(buyerInr, 18)}`);

  console.log("Step 2: Validating Seller (Trader 2) Security balance...");
  const sellerShares = await reliance.balanceOf(seller.address);
  console.log(`   Seller has ${sellerShares.toString()} RELIANCE shares`);

  // 2. Execution Logic (The CC's unique power)
  const tradeAmount = 20n;
  const tradePrice = ethers.parseUnits("50000", 18); // ₹50,000 total

  if (buyerInr >= tradePrice && sellerShares >= tradeAmount) {
    console.log("Step 3: Risk Checks Passed. CC Triggering Atomic Settlement...");
    
    // The CC (clearingCorp) calls the settle function
    const tx = await settlement.connect(clearingCorp).settle(
      seller.address, 
      buyer.address, 
      relianceAddress, 
      tradeAmount, 
      tradePrice
    );
    await tx.wait();
    
    console.log("Step 4: SETTLEMENT GUARANTEED. Transaction Hash:", tx.hash);
    console.log("   Status: Shares and Payment swapped in ONE block.");
  } else {
    console.error("Step 3: Risk Check FAILED. Trade Rejected by Clearing Corp.");
  }

  console.log("--- CLEARING CORP WORKFLOW COMPLETE ---");
}

main().catch(console.error);
