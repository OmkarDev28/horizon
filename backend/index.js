//require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { ethers } = require('ethers');
const Database = require('better-sqlite3');
const path = require('path');

require('dotenv').config({ path: require('path').join(__dirname, '.env') });

if (!process.env.PRIVATE_KEY) {
    console.error('❌ PRIVATE_KEY missing — check your backend/.env file');
    process.exit(1);
}

// ABIs
const INR_ABI = require('./abis/INR.json').abi;
const SECURITY_TOKEN_ABI = require('./abis/SecurityToken.json').abi;
const SETTLEMENT_ABI = require('./abis/AtomicSettlement.json').abi;

const app = express();
app.use(cors());
app.use(express.json());

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Contracts
const inrContract = new ethers.Contract(process.env.INR_ADDRESS, INR_ABI, wallet);
const settlementContract = new ethers.Contract(process.env.SETTLEMENT_ADDRESS, SETTLEMENT_ABI, wallet);
const relianceContract = new ethers.Contract(process.env.RELIANCE_ADDRESS, SECURITY_TOKEN_ABI, wallet);

// ─────────────────────────────────────────────
// DATABASE SETUP (SQLite)
// ─────────────────────────────────────────────

const db = new Database(path.join(__dirname, 'settlements.db'));

// Create tables on startup if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS settlements (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    tx_hash     TEXT    NOT NULL UNIQUE,
    block_number INTEGER,
    symbol      TEXT    NOT NULL DEFAULT 'RELIANCE',
    amount      TEXT    NOT NULL,
    price       TEXT    NOT NULL,
    total_value TEXT    NOT NULL,
    buyer       TEXT    NOT NULL,
    seller      TEXT    NOT NULL,
    security    TEXT    NOT NULL,
    settled_at  INTEGER NOT NULL  -- Unix ms timestamp
  );

  CREATE INDEX IF NOT EXISTS idx_settlements_buyer  ON settlements(buyer);
  CREATE INDEX IF NOT EXISTS idx_settlements_seller ON settlements(seller);
  CREATE INDEX IF NOT EXISTS idx_settlements_time   ON settlements(settled_at DESC);
`);

// Prepared statements for performance
const insertSettlement = db.prepare(`
  INSERT OR IGNORE INTO settlements
    (tx_hash, block_number, symbol, amount, price, total_value, buyer, seller, security, settled_at)
  VALUES
    (@tx_hash, @block_number, @symbol, @amount, @price, @total_value, @buyer, @seller, @security, @settled_at)
`);

const getAllSettlements = db.prepare(`
  SELECT * FROM settlements ORDER BY settled_at DESC
`);

const getSettlementsByAddress = db.prepare(`
  SELECT * FROM settlements
  WHERE LOWER(buyer) = LOWER(@address) OR LOWER(seller) = LOWER(@address)
  ORDER BY settled_at DESC
`);

const getSettlementByHash = db.prepare(`
  SELECT * FROM settlements WHERE tx_hash = @tx_hash
`);

console.log('✅ SQLite database ready at settlements.db');

// ─────────────────────────────────────────────
// EXISTING ROUTES
// ─────────────────────────────────────────────

app.get('/balances/:address', async (req, res) => {
    try {
        const address = req.params.address;
        const inrBalance = await inrContract.balanceOf(address);
        const relianceBalance = await relianceContract.balanceOf(address);
        res.json({
            inr: ethers.formatUnits(inrBalance, 18),
            reliance: relianceBalance.toString()
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/fiat-deposit', async (req, res) => {
    try {
        const { address, amount } = req.body;
        const tx = await inrContract.mint(address, ethers.parseUnits(amount.toString(), 18));
        await tx.wait();
        res.json({ success: true, txHash: tx.hash });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/mint-securities', async (req, res) => {
    try {
        const { address, amount } = req.body;
        const tx = await relianceContract.mint(address, amount);
        await tx.wait();
        res.json({ success: true, txHash: tx.hash });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/approve', async (req, res) => {
    try {
        const { userAddress, userPrivateKey } = req.body;
        
        // Create a wallet for this specific user
        const userWallet = new ethers.Wallet(userPrivateKey, provider);
        
        const MAX = ethers.MaxUint256;
        const settlementAddr = process.env.SETTLEMENT_ADDRESS;

        // User approves settlement contract to spend their INR
        const inrUser = new ethers.Contract(process.env.INR_ADDRESS, INR_ABI, userWallet);
        const tx1 = await inrUser.approve(settlementAddr, MAX);
        await tx1.wait();

        // User approves settlement contract to spend their security tokens
        const secUser = new ethers.Contract(process.env.RELIANCE_ADDRESS, SECURITY_TOKEN_ABI, userWallet);
        const tx2 = await secUser.approve(settlementAddr, MAX);
        await tx2.wait();

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/settle', async (req, res) => {
    try {
        const { seller, buyer, security, amount, price, symbol = 'RELIANCE' } = req.body;

        const tx = await settlementContract.settle(
            seller, buyer, security, amount,
            ethers.parseUnits(price.toString(), 18)
        );
        const receipt = await tx.wait();

        // ── Persist to SQLite ──────────────────────────────────────────
        const block = await provider.getBlock(receipt.blockNumber);
        insertSettlement.run({
            tx_hash:      tx.hash,
            block_number: receipt.blockNumber,
            symbol:       symbol.toUpperCase(),
            amount:       amount.toString(),
            price:        price.toString(),
            total_value:  price.toString(),
            buyer,
            seller,
            security,
            settled_at:   block ? block.timestamp * 1000 : Date.now(),
        });
        // ──────────────────────────────────────────────────────────────

        res.json({ success: true, txHash: tx.hash, blockNumber: receipt.blockNumber });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─────────────────────────────────────────────
// HISTORY ROUTES  (SQLite-backed)
// ─────────────────────────────────────────────

// GET /history
// Returns all persisted settlements, newest first.
// Optional: ?address=0x... to filter by participant.
app.get('/history', (req, res) => {
    try {
        const { address } = req.query;
        const rows = address
            ? getSettlementsByAddress.all({ address })
            : getAllSettlements.all();

        const settlements = rows.map(r => ({
            id:          r.id,
            txHash:      r.tx_hash,
            blockNumber: r.block_number,
            symbol:      r.symbol,
            amount:      r.amount,
            price:       r.price,
            totalValue:  r.total_value,
            buyer:       r.buyer,
            seller:      r.seller,
            security:    r.security,
            settledAt:   r.settled_at,
        }));

        res.json(settlements);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /history/:txHash
// Returns a single settlement record by TX hash.
app.get('/history/:txHash', (req, res) => {
    try {
        const row = getSettlementByHash.get({ tx_hash: req.params.txHash });
        if (!row) return res.status(404).json({ error: 'Settlement not found' });
        res.json({
            id:          row.id,
            txHash:      row.tx_hash,
            blockNumber: row.block_number,
            symbol:      row.symbol,
            amount:      row.amount,
            price:       row.price,
            totalValue:  row.total_value,
            buyer:       row.buyer,
            seller:      row.seller,
            security:    row.security,
            settledAt:   row.settled_at,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─────────────────────────────────────────────
// LEDGER ROUTES  (on-chain event queries — kept for compatibility)
// ─────────────────────────────────────────────

app.get('/transactions', async (req, res) => {
    try {
        const { address } = req.query;
        const filter = settlementContract.filters.DvPSettled();
        const events = await settlementContract.queryFilter(filter, 0, 'latest');

        const transactions = await Promise.all(
            events.map(async (event) => {
                const block = await provider.getBlock(event.blockNumber);
                const { seller, buyer, security, amount, price } = event.args;
                return {
                    txHash:      event.transactionHash,
                    blockNumber: event.blockNumber,
                    timestamp:   block ? block.timestamp * 1000 : null,
                    seller, buyer, security,
                    amount:      amount.toString(),
                    price:       ethers.formatUnits(price, 18),
                    totalValue:  ethers.formatUnits(price, 18),
                };
            })
        );

        const filtered = address
            ? transactions.filter(tx =>
                tx.seller.toLowerCase() === address.toLowerCase() ||
                tx.buyer.toLowerCase() === address.toLowerCase()
              )
            : transactions;

        res.json(filtered.reverse());
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/transactions/:txHash', async (req, res) => {
    try {
        const { txHash } = req.params;
        const receipt = await provider.getTransactionReceipt(txHash);
        if (!receipt) return res.status(404).json({ error: 'Transaction not found' });

        const block = await provider.getBlock(receipt.blockNumber);
        const latestBlock = await provider.getBlockNumber();

        res.json({
            txHash,
            status:        receipt.status === 1 ? 'confirmed' : 'failed',
            blockNumber:   receipt.blockNumber,
            confirmations: latestBlock - receipt.blockNumber,
            timestamp:     block ? block.timestamp * 1000 : null,
            gasUsed:       receipt.gasUsed.toString(),
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/stats', async (req, res) => {
    try {
        const filter = settlementContract.filters.DvPSettled();
        const events = await settlementContract.queryFilter(filter, 0, 'latest');

        let totalVolume = BigInt(0);
        const participants = new Set();

        for (const event of events) {
            const { seller, buyer, price } = event.args;
            totalVolume += price;
            participants.add(seller.toLowerCase());
            participants.add(buyer.toLowerCase());
        }

        const inrSupply = await inrContract.totalSupply();
        const relianceSupply = await relianceContract.totalSupply();

        res.json({
            totalSettlements:    events.length,
            totalVolume:         ethers.formatUnits(totalVolume, 18),
            uniqueParticipants:  participants.size,
            inrTotalSupply:      ethers.formatUnits(inrSupply, 18),
            relianceTotalSupply: relianceSupply.toString(),
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Auto-approve all traders on startup
const TRADER_KEYS = [
    "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d", // Account #1 - Retail Trader
    "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a", // Account #2 - Institutional Fund
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", // Account #0 - Clearing Corp
];

async function approveAllTraders() {
    console.log('⏳ Checking trader approvals...');
    const MAX = ethers.MaxUint256;
    const settlementAddr = process.env.SETTLEMENT_ADDRESS;

    const TRADER_KEYS = [
        "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
        "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a",
        "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
    ];

    for (const key of TRADER_KEYS) {
        const userWallet = new ethers.Wallet(key, provider);
        const addr = userWallet.address;
        const inrUser = new ethers.Contract(process.env.INR_ADDRESS, INR_ABI, userWallet);
        const secUser = new ethers.Contract(process.env.RELIANCE_ADDRESS, SECURITY_TOKEN_ABI, userWallet);

        try {
            // Only approve if allowance is zero
            const inrAllowance = await inrUser.allowance(addr, settlementAddr);
            if (inrAllowance === 0n) {
                const tx1 = await inrUser.approve(settlementAddr, MAX);
                await tx1.wait();
                console.log(`✅ INR approved for ${addr}`);
            } else {
                console.log(`⏭️  INR already approved for ${addr}`);
            }

            const secAllowance = await secUser.allowance(addr, settlementAddr);
            if (secAllowance === 0n) {
                const tx2 = await secUser.approve(settlementAddr, MAX);
                await tx2.wait();
                console.log(`✅ Security approved for ${addr}`);
            } else {
                console.log(`⏭️  Security already approved for ${addr}`);
            }
        } catch (e) {
            console.error(`❌ Failed for ${addr}:`, e.message);
        }
    }
    console.log('✅ Approval check complete — ready to settle');
}

const PORT = process.env.PORT || 5001;
app.listen(PORT, async () => {
    console.log(`🚀 Backend server running on port ${PORT}`);
    await approveAllTraders();
});

// ─────────────────────────────────────────────

app.listen(PORT, () => {
    console.log(`🚀 Backend server running on port ${PORT}`);
});