Problem Statement
Indian stock markets currently operate on **T+1 settlement**, locking up over **₹6 lakh crore daily** in clearing corporations. This creates counterparty risk, high margin requirements, and frozen capital for 24 hours.

## 🚀 The Solution
The **BharatSettlement Layer** is a blockchain-based protocol that enables **Atomic Delivery vs. Payment (DvP)**. It reduces settlement time from 24 hours (T+1) to **under 5 seconds (T+0)** using smart contracts.

---

 Architecture
- **Solidity Smart Contracts:** 
  - `INR.sol`: Digital Rupee (ERC20) for instant payments.
  - `SecurityToken.sol`: Tokenized Equity Shares (ERC20).
  - `AtomicSettlement.sol`: The DvP engine for simultaneous swaps.
- **Node.js/Express Backend:** Acts as the Clearing Corporation interface & UPI/RTGS bridge.
- **React Frontend:** Real-time dashboard for traders and settlement monitoring.

---

 How It Works (The Atomic Flow)
1. **Tokenization:** Fiat (INR) and Securities (Reliance/TCS) are tokenized on-chain.
2. **Matching:** The system matches a Buyer and Seller.
3. **Atomic Swap:** The `AtomicSettlement` contract executes a **single transaction** that transfers shares to the buyer and money to the seller simultaneously.
4. **Reversion Safety:** If either party lacks the assets, the transaction fails completely, ensuring **Zero Counterparty Risk**.

---

Cost-Benefit Analysis: T+1 vs. T+0

| Feature | Traditional (T+1) | BharatSettlement (T+0) |
|---------|-------------------|------------------------|
| **Settlement Time** | 24 - 48 Hours | < 5 Seconds |
| **Counterparty Risk** | High (24h window) | **Zero** (Atomic) |
| **Capital Efficiency** | Locked for 1 day | **100% Instant Reuse** |

---

##  Setup & Installation

### 1. Blockchain (Hardhat)
```bash
cd blockchain
npm install
npx hardhat node
npx hardhat run scripts/deploy.js --network localhost
```

### 2. Backend (Express)
```bash
cd backend
npm install
node index.js
```

### 3. Frontend (React/Vite)
```bash
cd frontend
npm install
npm run dev
```

