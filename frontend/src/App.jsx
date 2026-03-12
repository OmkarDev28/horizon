import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  Activity, ShieldCheck, Wallet, ArrowRightLeft, TrendingUp, 
  Info, Cpu, BarChart3, Clock, Zap, CheckCircle2, AlertTriangle,
  ExternalLink, Hash, Layers, Timer, History, ChevronRight
} from 'lucide-react';

const API_BASE = "http://localhost:5001";

const COMPANIES = [
  { symbol: "RELIANCE", name: "Reliance Industries", address: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0", sector: "Energy", price: 2500, color: "#06b6d4" },
  { symbol: "TCS",      name: "Tata Consultancy Services", address: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9", sector: "IT", price: 3800, color: "#8b5cf6" },
  { symbol: "INFY",     name: "Infosys Limited", address: "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9", sector: "IT", price: 1750, color: "#3b82f6" },
  { symbol: "HDFC",     name: "HDFC Bank", address: "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707", sector: "Banking", price: 1600, color: "#10b981" },
  { symbol: "WIPRO",    name: "Wipro Limited", address: "0x0165878A594ca255338adfa4d48449f69242Eb8F", sector: "IT", price: 480, color: "#f59e0b" },
  { symbol: "BAJFIN",   name: "Bajaj Finance", address: "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853", sector: "NBFC", price: 7200, color: "#ef4444" },
  { symbol: "TATASTL",  name: "Tata Steel", address: "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6", sector: "Metals", price: 145, color: "#6366f1" },
  { symbol: "ONGC",     name: "Oil & Natural Gas Corp", address: "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318", sector: "Energy", price: 265, color: "#f97316" },
];

const RELIANCE_ADDRESS = COMPANIES[0].address;

const TRADERS = [
  { name: "Retail Trader", role: "Buyer", address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", color: "text-brand-cyan", bg: "bg-brand-cyan/10", border: "border-brand-cyan/30" },
  { name: "Institutional Fund", role: "Seller", address: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", color: "text-brand-accent", bg: "bg-brand-accent/10", border: "border-brand-accent/30" },
  { name: "Clearing Corp", role: "Admin", address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", color: "text-brand-green", bg: "bg-brand-green/10", border: "border-brand-green/30" }
];

const SETTLEMENT_STEPS = [
  { id: 1, label: "Initiating Atomic Swap", icon: "⚡" },
  { id: 2, label: "Submitting to Blockchain", icon: "📡" },
  { id: 3, label: "Transaction Mined", icon: "⛏️" },
  { id: 4, label: "Shares Transferred", icon: "📦" },
  { id: 5, label: "INR Transferred", icon: "💰" },
  { id: 6, label: "Settlement Complete", icon: "✅" },
];

function BalanceBadge({ value, prev, symbol }) {
  const [flash, setFlash] = useState(null);
  const prevRef = useRef(prev);

  useEffect(() => {
    const current = parseFloat(value) || 0;
    const previous = parseFloat(prevRef.current) || 0;
    if (previous !== 0 && current !== previous) {
      setFlash(current > previous ? 'up' : 'down');
      setTimeout(() => setFlash(null), 1500);
    }
    prevRef.current = value;
  }, [value]);

  const formatNumber = (num) => new Intl.NumberFormat('en-IN').format(Number(num) || 0);

  return (
    <span
      className="font-mono font-bold text-lg transition-all duration-500"
      style={{
        color: flash === 'up' ? '#22c55e' : flash === 'down' ? '#f97316' : 'white',
        textShadow: flash ? `0 0 12px ${flash === 'up' ? '#22c55e88' : '#f9731688'}` : 'none',
      }}
    >
      {symbol}{formatNumber(value)}
      {flash === 'up' && <span className="text-xs ml-1 text-green-400 animate-bounce">▲</span>}
      {flash === 'down' && <span className="text-xs ml-1 text-orange-400 animate-bounce">▼</span>}
    </span>
  );
}

function SettlementTimeline({ steps, currentStep, isActive }) {
  if (!isActive && currentStep === 0) return null;

  return (
    <div className="glass-panel p-6 border border-brand-blue/20 bg-brand-blue/5">
      <h3 className="text-sm font-bold text-brand-blue mb-4 flex items-center gap-2 uppercase tracking-widest">
        <Activity size={14} className={currentStep < 6 && isActive ? "animate-spin" : ""} /> 
        Settlement Timeline
      </h3>
      <div className="space-y-2">
        {SETTLEMENT_STEPS.map((step) => {
          const isDone = currentStep >= step.id;
          const isRunning = currentStep === step.id - 1 && isActive;
          return (
            <div
              key={step.id}
              className="flex items-center gap-3 transition-all duration-500"
              style={{ opacity: isDone || isRunning ? 1 : 0.3 }}
            >
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 transition-all duration-500"
                style={{
                  background: isDone ? '#22c55e22' : isRunning ? '#3b82f622' : '#ffffff11',
                  border: `1px solid ${isDone ? '#22c55e' : isRunning ? '#3b82f6' : '#ffffff22'}`,
                }}
              >
                {isDone ? '✓' : isRunning ? <span className="animate-pulse">●</span> : step.id}
              </div>
              <span
                className="text-sm font-mono"
                style={{ color: isDone ? '#22c55e' : isRunning ? '#60a5fa' : '#94a3b8' }}
              >
                {step.icon} {step.label}
              </span>
              {isDone && (
                <span className="text-xs text-slate-500 ml-auto">
                  {(Math.random() * 0.4 + 0.1).toFixed(2)}s
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TxCard({ txHash, blockNumber, confirmationTime }) {
  if (!txHash) return null;
  const short = `${txHash.slice(0, 10)}...${txHash.slice(-8)}`;

  return (
    <div className="glass-panel p-5 border border-brand-green/30 bg-brand-green/5">
      <h3 className="text-xs font-bold text-brand-green uppercase tracking-widest mb-3 flex items-center gap-2">
        <Hash size={12} /> Transaction Proof
      </h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400 flex items-center gap-1"><ExternalLink size={10} /> TX Hash</span>
          <span className="font-mono text-xs text-brand-cyan bg-brand-cyan/10 px-2 py-1 rounded border border-brand-cyan/20">
            {short}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400 flex items-center gap-1"><Layers size={10} /> Block</span>
          <span className="font-mono text-xs text-white">#{blockNumber}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400 flex items-center gap-1"><Clock size={10} /> Confirmed In</span>
          <span className="font-mono text-xs text-brand-green font-bold">{confirmationTime}s</span>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-white/5">
        <div className="w-full bg-dark-900 rounded-full h-1.5 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-brand-cyan to-brand-green rounded-full w-full animate-pulse" />
        </div>
        <p className="text-xs text-slate-500 mt-1 text-center">Finalized on-chain</p>
      </div>
    </div>
  );
}

function T0Timer({ settlementTime, isSettling }) {
  const [t1Elapsed, setT1Elapsed] = useState(0);
  const [t0Done, setT0Done] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isSettling) {
      setT1Elapsed(0);
      setT0Done(null);
      const start = Date.now();
      timerRef.current = setInterval(() => {
        setT1Elapsed(Date.now() - start);
      }, 100);
    } else {
      clearInterval(timerRef.current);
      if (settlementTime) setT0Done(settlementTime);
    }
    return () => clearInterval(timerRef.current);
  }, [isSettling, settlementTime]);

  const T1_HOURS = 24 * 60 * 60 * 1000;
  const t1Pct = Math.min((t1Elapsed / 2000) * 3, 100); // visual exaggeration for demo

  return (
    <div className="glass-panel p-6 border border-white/10">
      <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-5 flex items-center gap-2">
        <Timer size={14} className="text-brand-accent" /> T+1 vs T+0 Comparison
      </h3>
      <div className="grid grid-cols-2 gap-4">
        {/* T+1 side */}
        <div className="bg-dark-900/60 rounded-xl p-4 border border-red-500/20">
          <p className="text-xs text-red-400 font-mono uppercase mb-2">Legacy T+1</p>
          <p className="text-2xl font-bold font-mono text-red-400 line-through">24:00:00</p>
          <div className="mt-3 w-full bg-dark-900 rounded-full h-2">
            <div
              className="h-full bg-red-500/50 rounded-full transition-all duration-200"
              style={{ width: `${isSettling ? t1Pct : (t0Done ? 100 : 0)}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-2">Capital locked for 24 hours</p>
        </div>

        {/* T+0 side */}
        <div className="bg-dark-900/60 rounded-xl p-4 border border-brand-green/30 relative overflow-hidden">
          {t0Done && (
            <div className="absolute inset-0 bg-brand-green/5 animate-pulse rounded-xl" />
          )}
          <p className="text-xs text-brand-green font-mono uppercase mb-2">BharatSettlement T+0</p>
          <p className="text-2xl font-bold font-mono text-brand-green">
            {t0Done ? `${(t0Done / 1000).toFixed(2)}s` : isSettling ? `${(t1Elapsed / 1000).toFixed(1)}s…` : '< 5s'}
          </p>
          <div className="mt-3 w-full bg-dark-900 rounded-full h-2">
            <div
              className="h-full bg-brand-green rounded-full transition-all duration-500"
              style={{ width: t0Done ? '100%' : isSettling ? `${(t1Elapsed / 3000) * 100}%` : '0%' }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {t0Done ? `🚀 ${(86400 / (t0Done / 1000)).toFixed(0)}× faster than T+1` : 'Instant capital reuse'}
          </p>
        </div>
      </div>
    </div>
  );
}

function SettlementHistory({ history }) {
  const formatNumber = (num) => new Intl.NumberFormat('en-IN').format(Number(num) || 0);

  const COLUMNS = [
    { label: '#',        key: 'index' },
    { label: 'Asset',    key: 'symbol' },
    { label: 'Qty',      key: 'amount' },
    { label: 'Price (₹)',key: 'price' },
    { label: 'Total (₹)',key: 'total' },
    { label: 'Buyer',    key: 'buyer' },
    { label: 'Seller',   key: 'seller' },
    { label: 'Time',     key: 'time' },
    { label: 'TX Hash',  key: 'txHash' },
    { label: 'Block',    key: 'block' },
    { label: 'Status',   key: 'status' },
  ];

  return (
    <div className="glass-panel overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-white/10 flex items-center justify-between">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <History size={16} className="text-brand-cyan" /> Settlement History
          <span className="text-xs text-slate-500 font-normal font-mono ml-1">— persisted across sessions</span>
        </h2>
        <div className="flex items-center gap-3">
          {history.length > 0 && (
            <span className="text-xs font-mono text-slate-400">
              Total volume: <span className="text-brand-green font-bold">
                ₹{formatNumber(history.reduce((s, r) => s + Number(r.total), 0))}
              </span>
            </span>
          )}
          <span className={`text-xs font-mono px-2 py-1 rounded-full border ${
            history.length > 0
              ? 'text-brand-green bg-brand-green/10 border-brand-green/20'
              : 'text-slate-500 bg-white/5 border-white/10'
          }`}>
            {history.length} settlement{history.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Empty state */}
      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <History size={20} className="text-slate-600" />
          </div>
          <p className="text-slate-500 font-mono text-sm">No settlements yet</p>
          <p className="text-slate-600 text-xs mt-1">Execute an atomic swap above to see records here</p>
          <p className="text-slate-700 text-xs mt-1">All records are saved to SQLite and will persist after restart</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.01]">
                {COLUMNS.map(col => (
                  <th key={col.key} className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {history.map((row, i) => (
                <tr
                  key={row.txHash}
                  className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group"
                  style={{ animation: i === 0 ? 'fadeInRow 0.6s ease' : 'none' }}
                >
                  {/* # */}
                  <td className="px-4 py-3 text-slate-600 font-mono text-xs">{history.length - i}</td>

                  {/* Asset */}
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded"
                      style={{
                        color: '#06b6d4',
                        background: 'rgba(6,182,212,0.1)',
                        border: '1px solid rgba(6,182,212,0.2)'
                      }}>
                      {row.symbol}/INR
                    </span>
                  </td>

                  {/* Qty */}
                  <td className="px-4 py-3 font-mono font-bold text-white">{row.amount}</td>

                  {/* Price */}
                  <td className="px-4 py-3 font-mono text-slate-300 whitespace-nowrap">
                    {formatNumber(row.price)}
                  </td>

                  {/* Total */}
                  <td className="px-4 py-3 font-mono text-brand-green font-bold whitespace-nowrap">
                    {formatNumber(row.total)}
                  </td>

                  {/* Buyer */}
                  <td className="px-4 py-3 font-mono text-xs text-brand-cyan whitespace-nowrap">
                    {row.buyer}
                  </td>

                  {/* Seller */}
                  <td className="px-4 py-3 font-mono text-xs text-brand-accent whitespace-nowrap">
                    {row.seller}
                  </td>

                  {/* Time */}
                  <td className="px-4 py-3 font-mono text-xs text-slate-500 whitespace-nowrap">
                    {row.time}
                  </td>

                  {/* TX Hash */}
                  <td className="px-4 py-3">
                    <span
                      className="font-mono text-xs px-2 py-0.5 rounded border cursor-pointer hover:opacity-80 transition-opacity"
                      style={{ color: '#60a5fa', background: 'rgba(96,165,250,0.08)', borderColor: 'rgba(96,165,250,0.2)' }}
                      title={row.txHash}
                      onClick={() => navigator.clipboard?.writeText(row.txHash)}
                    >
                      {row.txHash.slice(0, 8)}…{row.txHash.slice(-6)}
                    </span>
                  </td>

                  {/* Block */}
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">
                    {row.blockNumber ? `#${row.blockNumber}` : '—'}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1.5 text-xs font-medium text-brand-green whitespace-nowrap">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-green inline-block"></span>
                      Confirmed
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function CompanySelector({ selected, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="input-field flex items-center justify-between gap-3 cursor-pointer hover:border-brand-cyan/40 transition-colors min-w-[220px]"
      >
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: selected.color, boxShadow: `0 0 6px ${selected.color}88` }}
          />
          <span className="font-bold text-white">{selected.symbol}</span>
          <span className="text-slate-400 text-sm truncate">{selected.name}</span>
        </div>
        <ChevronRight
          size={14}
          className="text-slate-500 flex-shrink-0 transition-transform duration-200"
          style={{ transform: open ? 'rotate(90deg)' : 'rotate(0deg)' }}
        />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 w-full min-w-[300px] z-50 glass-panel border border-white/10 shadow-2xl overflow-hidden">
          <div className="p-2 border-b border-white/5">
            <p className="text-xs text-slate-500 px-2 uppercase tracking-widest font-medium">NSE Listed Securities</p>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {COMPANIES.map((co) => (
              <button
                key={co.symbol}
                onClick={() => { onChange(co); setOpen(false); }}
                className={`w-full flex items-center justify-between px-3 py-2.5 hover:bg-white/5 transition-colors text-left group ${selected.symbol === co.symbol ? 'bg-white/[0.04]' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: co.color, boxShadow: `0 0 6px ${co.color}66` }}
                  />
                  <div>
                    <span className="font-bold text-white text-sm">{co.symbol}</span>
                    <span className="text-slate-400 text-xs ml-2">{co.name}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-slate-500 bg-white/5 px-1.5 py-0.5 rounded">{co.sector}</span>
                  <span className="font-mono text-xs text-brand-green">₹{co.price.toLocaleString('en-IN')}</span>
                  {selected.symbol === co.symbol && (
                    <CheckCircle2 size={12} className="text-brand-cyan" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  const [selectedCompany, setSelectedCompany] = useState(COMPANIES[0]);
  const [balances, setBalances] = useState({});
  const [prevBalances, setPrevBalances] = useState({});
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: 'info', message: "System Ready: Select a Buyer and Seller to begin." });
  const [tradeDetails, setTradeDetails] = useState({ amount: 10, price: 2500 });

  // Buyer / Seller selection
  const [selectedBuyer, setSelectedBuyer] = useState(null);
  const [selectedSeller, setSelectedSeller] = useState(null);

  // Sync price when company changes
  useEffect(() => {
    setTradeDetails(d => ({ ...d, price: selectedCompany.price }));
  }, [selectedCompany]);

  // Feature 2: TX info
  const [lastTx, setLastTx] = useState(null);

  // Feature 3: Timeline
  const [timelineStep, setTimelineStep] = useState(0);
  const [timelineActive, setTimelineActive] = useState(false);

  // Feature 4: Timer
  const [isSettling, setIsSettling] = useState(false);
  const [settlementTime, setSettlementTime] = useState(null);

  // Feature 5: History (persisted via SQLite)
  const [settlementHistory, setSettlementHistory] = useState([]);

  useEffect(() => {
    refreshBalances();
    loadHistory();
    const interval = setInterval(refreshBalances, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadHistory = async () => {
    try {
      const res = await axios.get(`${API_BASE}/history`);
      const rows = res.data.map(r => ({
        txHash:      r.txHash,
        symbol:      r.symbol,
        amount:      r.amount,
        price:       r.price,
        total:       r.totalValue,
        buyer:       `${r.buyer.slice(0, 6)}…${r.buyer.slice(-4)}`,
        seller:      `${r.seller.slice(0, 6)}…${r.seller.slice(-4)}`,
        time:        new Date(r.settledAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        blockNumber: r.blockNumber,
      }));
      setSettlementHistory(rows);
    } catch (err) {
      console.error('History load error', err);
    }
  };

  const refreshBalances = async () => {
    const newBalances = {};
    for (const trader of TRADERS) {
      try {
        const res = await axios.get(`${API_BASE}/balances/${trader.address}`);
        newBalances[trader.address] = res.data;
      } catch (err) {
        console.error("Balance fetch error", err);
      }
    }
    setPrevBalances(prev => ({ ...prev, ...balances }));
    setBalances(newBalances);
  };

  const advanceTimeline = (step) => {
    return new Promise(resolve => {
      setTimeout(() => {
        setTimelineStep(step);
        resolve();
      }, 400);
    });
  };

  const handleAction = async (actionFn, loadingMsg, successMsg) => {
    setLoading(true);
    setStatus({ type: 'info', message: loadingMsg });
    try {
      const result = await actionFn();
      await refreshBalances();
      setStatus({ type: 'success', message: successMsg });
      return result;
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.error || err.message });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = (address, amount) =>
    handleAction(
      () => axios.post(`${API_BASE}/fiat-deposit`, { address, amount }),
      "Bridging UPI to Blockchain (Minting INR)...",
      `Successfully minted ₹${amount} INR on-chain.`
    );

  const handleMintSecurities = (address, amount) =>
    handleAction(
      () => axios.post(`${API_BASE}/mint-securities`, { address, amount }),
      "Tokenizing Demat Shares (Minting RELIANCE)...",
      `Successfully tokenized ${amount} RELIANCE shares.`
    );

  const handleSettle = async () => {
    if (!selectedBuyer || !selectedSeller) {
      setStatus({ type: 'error', message: 'Please select a Buyer and a Seller from the participant cards above.' });
      return;
    }
    if (selectedBuyer.address === selectedSeller.address) {
      setStatus({ type: 'error', message: 'Buyer and Seller must be different participants.' });
      return;
    }
    const seller = selectedSeller.address;
    const buyer = selectedBuyer.address;
    const totalPrice = tradeDetails.amount * tradeDetails.price;

    setLoading(true);
    setLastTx(null);
    setSettlementTime(null);
    setTimelineActive(true);
    setTimelineStep(0);
    setIsSettling(true);

    const startTime = Date.now();
    setStatus({ type: 'info', message: "Initiating Atomic Swap (DvP)..." });

    try {
      await advanceTimeline(1);
      await advanceTimeline(2);

      const res = await axios.post(`${API_BASE}/settle`, {
        seller, buyer, security: selectedCompany.address,
        amount: tradeDetails.amount,
        price: totalPrice,
        symbol: selectedCompany.symbol,
      });

      await advanceTimeline(3);
      await advanceTimeline(4);
      await advanceTimeline(5);
      await advanceTimeline(6);

      const elapsed = Date.now() - startTime;
      setIsSettling(false);
      setSettlementTime(elapsed);
      setTimelineActive(false);

      // Feature 2: TX hash + block
      const txHash = res.data.txHash;
      try {
        const txInfo = await axios.get(`${API_BASE}/transactions/${txHash}`);
        setLastTx({
          txHash,
          blockNumber: txInfo.data.blockNumber,
          confirmationTime: (elapsed / 1000).toFixed(2),
        });
      } catch {
        setLastTx({ txHash, blockNumber: '—', confirmationTime: (elapsed / 1000).toFixed(2) });
      }

      // Feature 5: Add to history
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setSettlementHistory(prev => [{
        txHash,
        symbol:      selectedCompany.symbol,
        amount:      tradeDetails.amount,
        price:       tradeDetails.price,
        total:       totalPrice,
        buyer:       selectedBuyer.name,
        seller:      selectedSeller.name,
        time:        timeStr,
        blockNumber: res.data.blockNumber,
      }, ...prev]);

      await refreshBalances();
      setStatus({ type: 'success', message: `T+0 SETTLEMENT SUCCESS: ${tradeDetails.amount} shares ↔ ₹${totalPrice.toLocaleString('en-IN')} swapped in ${(elapsed / 1000).toFixed(2)}s` });
    } catch (err) {
      setIsSettling(false);
      setTimelineActive(false);
      setStatus({ type: 'error', message: err.response?.data?.error || err.message });
    }

    setLoading(false);
  };

  const formatNumber = (num) => new Intl.NumberFormat('en-IN').format(Number(num) || 0);

  return (
    <div className="min-h-screen p-4 md:p-8">
      <style>{`
        @keyframes fadeInRow {
          from { opacity: 0; background: rgba(34,197,94,0.1); }
          to   { opacity: 1; background: transparent; }
        }
      `}</style>
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <header className="glass-panel p-6 flex flex-col md:flex-row justify-between items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
          <div className="flex items-center gap-4 z-10">
            <div className="p-3 bg-brand-blue/20 rounded-xl border border-brand-blue/30">
              <ShieldCheck size={32} className="text-brand-blue" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                BharatSettlement Layer
              </h1>
              <p className="text-brand-cyan/80 font-mono text-sm mt-1 flex items-center gap-2">
                <Zap size={14} /> Atomic T+0 DvP Protocol
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-dark-900/80 px-4 py-2 rounded-full border border-white/5 z-10 shadow-inner">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-green opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-green"></span>
            </span>
            <span className="text-sm font-medium text-slate-300">SEBI Sandbox Node</span>
            <span className="text-xs text-slate-500 font-mono ml-2 border-l border-white/10 pl-2">Latency: 45ms</span>
          </div>
        </header>

        {/* Status Bar */}
        <div className={`glass-panel p-4 flex items-center gap-4 transition-all duration-500 ${
          status.type === 'error' ? 'border-red-500/30 bg-red-500/5' :
          status.type === 'success' ? 'border-brand-green/30 bg-brand-green/5' :
          'border-brand-blue/30 bg-brand-blue/5'
        }`}>
          {loading ? <Activity className="text-brand-blue animate-spin flex-shrink-0" /> :
           status.type === 'error' ? <AlertTriangle className="text-red-400 flex-shrink-0" /> :
           status.type === 'success' ? <CheckCircle2 className="text-brand-green flex-shrink-0" /> :
           <Info className="text-brand-blue flex-shrink-0" />}
          <p className={`font-mono text-sm flex-1 ${
            status.type === 'error' ? 'text-red-300' :
            status.type === 'success' ? 'text-brand-green' :
            'text-brand-blue'
          }`}>
            {status.message}
          </p>
        </div>

        {/* Network Participants — Buyer/Seller Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TRADERS.map((trader) => {
            const isBuyer  = selectedBuyer?.address  === trader.address;
            const isSeller = selectedSeller?.address === trader.address;
            const isSelected = isBuyer || isSeller;

            const canBeBuyer  = !isSeller && selectedSeller?.address !== trader.address || isBuyer;
            const canBeSeller = !isBuyer  && selectedBuyer?.address  !== trader.address || isSeller;

            const handleSelectBuyer = () => {
              if (isBuyer) { setSelectedBuyer(null); return; }
              if (selectedSeller?.address === trader.address) return;
              setSelectedBuyer(trader);
            };
            const handleSelectSeller = () => {
              if (isSeller) { setSelectedSeller(null); return; }
              if (selectedBuyer?.address === trader.address) return;
              setSelectedSeller(trader);
            };

            return (
              <div
                key={trader.address}
                className="glass-card p-6 flex flex-col h-full relative group transition-all duration-300"
                style={{
                  borderColor: isBuyer ? '#06b6d4' : isSeller ? '#f97316' : undefined,
                  boxShadow: isBuyer ? '0 0 20px rgba(6,182,212,0.15)' : isSeller ? '0 0 20px rgba(249,115,22,0.15)' : undefined,
                }}
              >
                {/* Selected role badge top-right */}
                {isSelected && (
                  <div className={`absolute top-3 right-3 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 ${
                    isBuyer ? 'bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/40' : 'bg-brand-accent/20 text-brand-accent border border-brand-accent/40'
                  }`}>
                    {isBuyer ? '🟢 BUYER' : '🔴 SELLER'}
                  </div>
                )}

                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Wallet size={18} className={trader.color} /> {trader.name}
                    </h3>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full mt-2 inline-block ${trader.bg} ${trader.color}`}>
                      {trader.role}
                    </span>
                  </div>
                </div>

                {/* Balances */}
                <div className="space-y-3 mb-5 flex-1">
                  <div className="bg-dark-900/60 p-3 rounded-lg border border-white/5 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-slate-400">
                      <span className="text-lg font-mono">₹</span> INR
                    </div>
                    <BalanceBadge value={balances[trader.address]?.inr} prev={prevBalances[trader.address]?.inr} symbol="₹" />
                  </div>
                  <div className="bg-dark-900/60 p-3 rounded-lg border border-white/5 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-slate-400">
                      <BarChart3 size={16} /> {selectedCompany.symbol}
                    </div>
                    <BalanceBadge value={balances[trader.address]?.reliance} prev={prevBalances[trader.address]?.reliance} symbol="" />
                  </div>
                </div>

                {/* Role selector buttons */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <button
                    onClick={handleSelectBuyer}
                    disabled={loading || selectedSeller?.address === trader.address}
                    className={`text-xs py-2 px-3 rounded-lg font-bold border transition-all duration-200 ${
                      isBuyer
                        ? 'bg-brand-cyan/20 border-brand-cyan text-brand-cyan'
                        : selectedSeller?.address === trader.address
                        ? 'opacity-30 cursor-not-allowed border-white/10 text-slate-600'
                        : 'border-white/10 text-slate-400 hover:border-brand-cyan/50 hover:text-brand-cyan hover:bg-brand-cyan/5'
                    }`}
                  >
                    {isBuyer ? '✓ Buyer' : 'Set as Buyer'}
                  </button>
                  <button
                    onClick={handleSelectSeller}
                    disabled={loading || selectedBuyer?.address === trader.address}
                    className={`text-xs py-2 px-3 rounded-lg font-bold border transition-all duration-200 ${
                      isSeller
                        ? 'bg-brand-accent/20 border-brand-accent text-brand-accent'
                        : selectedBuyer?.address === trader.address
                        ? 'opacity-30 cursor-not-allowed border-white/10 text-slate-600'
                        : 'border-white/10 text-slate-400 hover:border-brand-accent/50 hover:text-brand-accent hover:bg-brand-accent/5'
                    }`}
                  >
                    {isSeller ? '✓ Seller' : 'Set as Seller'}
                  </button>
                </div>

                {/* Mint buttons */}
                <div className="grid grid-cols-2 gap-2 mt-auto">
                  <button
                    onClick={() => handleDeposit(trader.address, 100000)}
                    disabled={loading}
                    className="btn-secondary text-xs flex justify-center items-center gap-1 py-2"
                  >
                    + ₹1L INR
                  </button>
                  <button
                    onClick={() => handleMintSecurities(trader.address, 50)}
                    disabled={loading}
                    className="btn-secondary text-xs flex justify-center items-center gap-1 py-2"
                  >
                    + 50 Sh.
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Trade summary strip — shows selected buyer → seller */}
        {(selectedBuyer || selectedSeller) && (
          <div className="glass-panel px-6 py-4 flex items-center gap-4 border border-white/10 bg-white/[0.02]">
            <div className="flex items-center gap-3 flex-1">
              <div className={`text-sm font-mono ${selectedBuyer ? 'text-brand-cyan' : 'text-slate-600'}`}>
                {selectedBuyer ? `🟢 ${selectedBuyer.name}` : '— Select Buyer'}
              </div>
              <ArrowRightLeft size={16} className="text-slate-600 flex-shrink-0" />
              <div className={`text-sm font-mono ${selectedSeller ? 'text-brand-accent' : 'text-slate-600'}`}>
                {selectedSeller ? `🔴 ${selectedSeller.name}` : '— Select Seller'}
              </div>
            </div>
            {selectedBuyer && selectedSeller && (
              <span className="text-xs text-brand-green font-mono bg-brand-green/10 px-3 py-1 rounded-full border border-brand-green/20">
                ✓ Ready to settle
              </span>
            )}
            {(!selectedBuyer || !selectedSeller) && (
              <span className="text-xs text-slate-500 font-mono">
                Select both to enable swap
              </span>
            )}
          </div>
        )}

        {/* Execution Engine */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass-panel p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-brand-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
              <Cpu className="text-brand-accent" /> Algorithmic Matching & Execution
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 relative z-10">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">Asset Pair</label>
                <CompanySelector selected={selectedCompany} onChange={setSelectedCompany} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">Quantity (Shares)</label>
                <input
                  type="number"
                  value={tradeDetails.amount}
                  onChange={(e) => setTradeDetails({ ...tradeDetails, amount: e.target.value })}
                  className="input-field text-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">Execution Price (₹)</label>
                <input
                  type="number"
                  value={tradeDetails.price}
                  onChange={(e) => setTradeDetails({ ...tradeDetails, price: e.target.value })}
                  className="input-field text-xl text-brand-green"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-white/10 pt-8 mt-4">
              <div className="space-y-1">
                <div className="text-slate-400 text-sm">
                  Total Transaction Value:{' '}
                  <span className="text-xl font-bold text-white font-mono ml-2">
                    ₹{formatNumber(tradeDetails.amount * tradeDetails.price)}
                  </span>
                </div>
                {selectedBuyer && selectedSeller ? (
                  <div className="text-xs font-mono text-slate-500 flex items-center gap-2">
                    <span className="text-brand-cyan">{selectedBuyer.name}</span>
                    <span className="text-slate-600">buys from</span>
                    <span className="text-brand-accent">{selectedSeller.name}</span>
                  </div>
                ) : (
                  <div className="text-xs font-mono text-slate-600">
                    ↑ Select Buyer & Seller from the cards above
                  </div>
                )}
              </div>
              <button
                onClick={handleSettle}
                disabled={loading || !selectedBuyer || !selectedSeller}
                className={`btn-primary w-full sm:w-auto text-lg py-4 px-12 flex items-center justify-center gap-3 group transition-all duration-300 ${
                  (!selectedBuyer || !selectedSeller) ? 'opacity-40 cursor-not-allowed' : ''
                }`}
              >
                {loading ? (
                  <>Processing <Activity className="animate-spin" size={20} /></>
                ) : (
                  <>Execute Atomic Swap <ArrowRightLeft className="group-hover:rotate-180 transition-transform duration-500" size={20} /></>
                )}
              </button>
            </div>
          </div>

          <div className="glass-panel p-6 bg-gradient-to-b from-dark-800/80 to-dark-900/80">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <TrendingUp className="text-brand-cyan" size={20} /> Impact Analysis
            </h2>
            <div className="space-y-5">
              <div className="bg-dark-900/50 p-4 rounded-xl border border-white/5 relative overflow-hidden group hover:border-brand-blue/30 transition-colors">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-blue"></div>
                <p className="text-xs text-slate-400 mb-2 flex items-center gap-1"><Clock size={12} /> Settlement Speed</p>
                <div className="flex justify-between items-end">
                  <div className="line-through text-slate-600 font-mono text-sm">T+1 (24 Hrs)</div>
                  <div className="text-brand-blue font-bold text-lg font-mono">&lt; 2 Seconds</div>
                </div>
              </div>
              <div className="bg-dark-900/50 p-4 rounded-xl border border-white/5 relative overflow-hidden group hover:border-brand-green/30 transition-colors">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-green"></div>
                <p className="text-xs text-slate-400 mb-2 flex items-center gap-1"><Zap size={12} /> Capital Efficiency</p>
                <div className="text-brand-green font-bold text-lg">100% Instantly Freed</div>
                <p className="text-xs text-slate-500 mt-1">Solves the ₹6L Cr frozen capital issue.</p>
              </div>
              <div className="bg-dark-900/50 p-4 rounded-xl border border-white/5 relative overflow-hidden group hover:border-brand-accent/30 transition-colors">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-accent"></div>
                <p className="text-xs text-slate-400 mb-2 flex items-center gap-1"><ShieldCheck size={12} /> Counterparty Risk</p>
                <div className="text-brand-accent font-bold text-lg">Mathematically Zero</div>
                <p className="text-xs text-slate-500 mt-1">DvP ensures assets swap simultaneously.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Features 3, 2, 4 — Timeline + TX Card + Timer */}
        {(timelineActive || timelineStep > 0 || lastTx || isSettling || settlementTime) && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <SettlementTimeline steps={SETTLEMENT_STEPS} currentStep={timelineStep} isActive={timelineActive} />
            </div>
            <div className="lg:col-span-1">
              <TxCard
                txHash={lastTx?.txHash}
                blockNumber={lastTx?.blockNumber}
                confirmationTime={lastTx?.confirmationTime}
              />
            </div>
            <div className="lg:col-span-1">
              <T0Timer settlementTime={settlementTime} isSettling={isSettling} />
            </div>
          </div>
        )}

        {/* Feature 5 — Settlement History Table */}
        <SettlementHistory history={settlementHistory} />

        <footer className="text-center text-slate-600 text-sm font-mono py-4 border-t border-white/5">
          Built for Horizon 1.0 • Vidyavardhini's College of Engineering and Technology
        </footer>
      </div>
    </div>
  );
}

export default App;