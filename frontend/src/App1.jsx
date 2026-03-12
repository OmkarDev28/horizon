import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Activity, ShieldCheck, Wallet, ArrowRightLeft, TrendingUp,
  Info, Cpu, BarChart3, Clock, Zap, CheckCircle2, AlertTriangle,
  ExternalLink, Hash, Layers, Timer, History, ChevronRight,
  ChevronDown, IndianRupee, Users, ArrowRight, Sparkles,
  HelpCircle, Eye, EyeOff, CircleCheck, Loader2, BadgeCheck
} from 'lucide-react';

const API_BASE = "http://localhost:5001";

const COMPANIES = [
  { symbol: "RELIANCE", name: "Reliance Industries", address: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0", sector: "Energy", price: 2500, color: "#06b6d4" },
  { symbol: "TCS", name: "Tata Consultancy Services", address: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9", sector: "IT", price: 3800, color: "#8b5cf6" },
  { symbol: "INFY", name: "Infosys Limited", address: "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9", sector: "IT", price: 1750, color: "#3b82f6" },
  { symbol: "HDFC", name: "HDFC Bank", address: "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707", sector: "Banking", price: 1600, color: "#10b981" },
  { symbol: "WIPRO", name: "Wipro Limited", address: "0x0165878A594ca255338adfa4d48449f69242Eb8F", sector: "IT", price: 480, color: "#f59e0b" },
  { symbol: "BAJFIN", name: "Bajaj Finance", address: "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853", sector: "NBFC", price: 7200, color: "#ef4444" },
  { symbol: "TATASTL", name: "Tata Steel", address: "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6", sector: "Metals", price: 145, color: "#6366f1" },
  { symbol: "ONGC", name: "Oil & Natural Gas Corp", address: "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318", sector: "Energy", price: 265, color: "#f97316" },
];

const TRADERS = [
  { name: "Retail Trader", role: "Buyer", address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", avatar: "RT", avatarBg: "#dbeafe", avatarColor: "#1d4ed8" },
  { name: "Institutional Fund", role: "Seller", address: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", avatar: "IF", avatarBg: "#fff7ed", avatarColor: "#c2410c" },
  { name: "Clearing Corp", role: "Admin", address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", avatar: "CC", avatarBg: "#f0fdf4", avatarColor: "#15803d" },
];

const PROGRESS_STEPS = [
  { id: 1, label: "Trade Requested", desc: "Order submitted" },
  { id: 2, label: "Processing", desc: "Blockchain verifying" },
  { id: 3, label: "Assets Exchanged", desc: "Shares & money swapped" },
  { id: 4, label: "Trade Completed", desc: "Settlement confirmed" },
];

const fmt = (num) => new Intl.NumberFormat('en-IN').format(Number(num) || 0);

/* ─── Animated balance ─── */
function BalanceBadge({ value, prev, symbol }) {
  const [flash, setFlash] = useState(null);
  const prevRef = useRef(prev);
  useEffect(() => {
    const cur = parseFloat(value) || 0, old = parseFloat(prevRef.current) || 0;
    if (old !== 0 && cur !== old) {
      setFlash(cur > old ? 'up' : 'down');
      setTimeout(() => setFlash(null), 1500);
    }
    prevRef.current = value;
  }, [value]);
  return (
    <span className={`font-semibold tabular-nums transition-colors duration-500 ${flash === 'up' ? 'text-emerald-600' : flash === 'down' ? 'text-orange-500' : 'text-gray-900'}`}>
      {symbol}{fmt(value)}
      {flash === 'up' && <span className="text-xs ml-1 text-emerald-500">▲</span>}
      {flash === 'down' && <span className="text-xs ml-1 text-orange-400">▼</span>}
    </span>
  );
}

/* ─── Trade Progress Steps ─── */
function TradeProgress({ currentStep, isActive }) {
  if (!isActive && currentStep === 0) return null;
  const mapped = Math.ceil(currentStep / 1.5);
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-5 flex items-center gap-2">
        <Activity size={15} className={isActive ? "animate-spin text-blue-500" : "text-emerald-500"} />
        Trade Progress
      </h3>
      <div className="flex items-start gap-0">
        {PROGRESS_STEPS.map((step, i) => {
          const done = currentStep >= (i + 1) * 1.5;
          const active = isActive && currentStep >= i * 1.5 && !done;
          const last = i === PROGRESS_STEPS.length - 1;
          return (
            <div key={step.id} className="flex-1 flex flex-col items-center relative">
              {!last && (
                <div className="absolute top-4 left-1/2 right-0 h-0.5 z-0"
                  style={{ background: done ? '#10b981' : '#e5e7eb' }} />
              )}
              <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${done ? 'bg-emerald-500 text-white' : active ? 'bg-blue-500 text-white ring-4 ring-blue-100' : 'bg-gray-100 text-gray-400'}`}>
                {done ? <CircleCheck size={16} /> : active ? <Loader2 size={14} className="animate-spin" /> : step.id}
              </div>
              <p className={`mt-2 text-xs font-medium text-center px-1 ${done ? 'text-emerald-600' : active ? 'text-blue-600' : 'text-gray-400'}`}>{step.label}</p>
              <p className="text-[10px] text-gray-400 text-center px-1">{step.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Blockchain Confirmation (collapsible) ─── */
function BlockchainConfirmation({ txHash, blockNumber, confirmationTime }) {
  const [open, setOpen] = useState(false);
  if (!txHash) return null;
  const short = `${txHash.slice(0, 10)}...${txHash.slice(-8)}`;
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-50 rounded-full flex items-center justify-center">
            <BadgeCheck size={16} className="text-emerald-600" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-gray-800">Trade Confirmed on Blockchain</p>
            <p className="text-xs text-gray-400">Settled in {confirmationTime}s · Tamper-proof record</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">{open ? 'Hide' : 'View'} Details</span>
          <ChevronDown size={14} className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>
      {open && (
        <div className="px-5 pb-5 space-y-3 border-t border-gray-50">
          <div className="flex items-center justify-between py-2">
            <span className="text-xs text-gray-500">Transaction ID</span>
            <span className="font-mono text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded cursor-pointer hover:bg-blue-100 transition-colors"
              onClick={() => navigator.clipboard?.writeText(txHash)} title="Click to copy">{short}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-t border-gray-50">
            <span className="text-xs text-gray-500">Block Number</span>
            <span className="font-mono text-xs text-gray-700">#{blockNumber}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-t border-gray-50">
            <span className="text-xs text-gray-500">Settlement Time</span>
            <span className="text-xs font-semibold text-emerald-600">{confirmationTime}s</span>
          </div>
          <p className="text-xs text-gray-400 text-center pt-1">This record is permanently stored and cannot be altered</p>
        </div>
      )}
    </div>
  );
}

/* ─── T+0 vs T+1 comparison ─── */
function SettlementComparison({ settlementTime, isSettling }) {
  const [elapsed, setElapsed] = useState(0);
  const [done, setDone] = useState(null);
  const ref = useRef(null);
  useEffect(() => {
    if (isSettling) { setElapsed(0); setDone(null); const s = Date.now(); ref.current = setInterval(() => setElapsed(Date.now() - s), 100); }
    else { clearInterval(ref.current); if (settlementTime) setDone(settlementTime); }
    return () => clearInterval(ref.current);
  }, [isSettling, settlementTime]);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
        <Timer size={15} className="text-orange-500" /> Why This Matters
      </h3>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-red-50 rounded-xl p-4 border border-red-100">
          <p className="text-xs font-medium text-red-500 mb-1">Old System (T+1)</p>
          <p className="text-xl font-bold text-red-400 line-through font-mono">24 hrs</p>
          <p className="text-xs text-gray-500 mt-1">Your money locked all day</p>
        </div>
        <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100 relative overflow-hidden">
          {done && <div className="absolute inset-0 bg-emerald-100/40 animate-pulse rounded-xl" />}
          <p className="text-xs font-medium text-emerald-600 mb-1 relative">This System (T+0)</p>
          <p className="text-xl font-bold text-emerald-600 font-mono relative">
            {done ? `${(done / 1000).toFixed(2)}s` : isSettling ? `${(elapsed / 1000).toFixed(1)}s` : '< 5s'}
          </p>
          <p className="text-xs text-gray-500 mt-1 relative">
            {done ? `${(86400 / (done / 1000)).toFixed(0)}× faster` : 'Money freed instantly'}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── Company Selector ─── */
function CompanySelector({ selected, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(o => !o)}
        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between gap-2 hover:border-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-100">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: selected.color }} />
          <span className="font-semibold text-gray-900">{selected.symbol}</span>
          <span className="text-gray-500 text-sm truncate hidden sm:inline">{selected.name}</span>
        </div>
        <ChevronDown size={14} className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 w-full min-w-[280px] z-50 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
          <p className="text-xs text-gray-400 px-3 py-2 border-b border-gray-100 uppercase tracking-wider font-medium">NSE Listed Securities</p>
          <div className="max-h-60 overflow-y-auto">
            {COMPANIES.map(co => (
              <button key={co.symbol} onClick={() => { onChange(co); setOpen(false); }}
                className={`w-full flex items-center justify-between px-3 py-2.5 hover:bg-gray-50 transition-colors ${selected.symbol === co.symbol ? 'bg-blue-50' : ''}`}>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: co.color }} />
                  <span className="font-semibold text-sm text-gray-800">{co.symbol}</span>
                  <span className="text-gray-400 text-xs">{co.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{co.sector}</span>
                  <span className="text-xs font-semibold text-gray-700">₹{co.price.toLocaleString('en-IN')}</span>
                  {selected.symbol === co.symbol && <CheckCircle2 size={12} className="text-blue-500" />}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Settlement History ─── */
function SettlementHistory({ history }) {
  const [expandedRow, setExpandedRow] = useState(null);
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <History size={16} className="text-blue-500" /> Trade History
        </h2>
        <div className="flex items-center gap-3">
          {history.length > 0 && (
            <span className="text-sm text-gray-500">
              Total: <span className="font-semibold text-gray-800">₹{fmt(history.reduce((s, r) => s + Number(r.total), 0))}</span>
            </span>
          )}
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${history.length > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-400'}`}>
            {history.length} trade{history.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
            <History size={20} className="text-gray-300" />
          </div>
          <p className="text-gray-400 text-sm font-medium">No trades yet</p>
          <p className="text-gray-300 text-xs mt-1">Complete your first instant trade to see it here</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50 bg-gray-50/50">
                {['Time', 'Asset', 'Qty', 'Price (₹)', 'Total (₹)', 'Buyer', 'Seller', 'Status', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {history.map((row, i) => (
                <React.Fragment key={row.txHash}>
                  <tr className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                    style={{ animation: i === 0 ? 'fadeInRow 0.5s ease' : 'none' }}>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{row.time}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ color: '#0369a1', background: '#e0f2fe' }}>{row.symbol}</span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-800">{row.amount}</td>
                    <td className="px-4 py-3 text-gray-600 tabular-nums">{fmt(row.price)}</td>
                    <td className="px-4 py-3 font-semibold text-emerald-600 tabular-nums">{fmt(row.total)}</td>
                    <td className="px-4 py-3 text-blue-600 text-xs">{row.buyer}</td>
                    <td className="px-4 py-3 text-orange-500 text-xs">{row.seller}</td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 whitespace-nowrap">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span> Settled
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => setExpandedRow(expandedRow === row.txHash ? null : row.txHash)}
                        className="text-xs text-gray-400 hover:text-blue-500 flex items-center gap-1 transition-colors whitespace-nowrap">
                        {expandedRow === row.txHash ? <EyeOff size={11} /> : <Eye size={11} />}
                        {expandedRow === row.txHash ? 'Hide' : 'Details'}
                      </button>
                    </td>
                  </tr>
                  {expandedRow === row.txHash && (
                    <tr className="bg-blue-50/50 border-b border-gray-100">
                      <td colSpan={9} className="px-4 py-3">
                        <div className="flex flex-wrap gap-6 text-xs">
                          <div>
                            <span className="text-gray-400 block">Transaction ID</span>
                            <span className="font-mono text-blue-600 cursor-pointer hover:text-blue-700" onClick={() => navigator.clipboard?.writeText(row.txHash)}>
                              {row.txHash?.slice(0, 14)}…{row.txHash?.slice(-10)} <span className="text-gray-300">(click to copy)</span>
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400 block">Block Number</span>
                            <span className="font-mono text-gray-700">{row.blockNumber ? `#${row.blockNumber}` : '—'}</span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ─── Demo Helper Banner ─── */
function DemoBanner({ dismissed, onDismiss }) {
  if (dismissed) return null;
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <Sparkles size={15} className="text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-blue-800 mb-2">How to run a demo trade</p>
            <div className="flex flex-wrap gap-2">
              {['1. Add Demo Money to Buyer', '2. Add Demo Shares to Seller', '3. Select Buyer & Seller', '4. Click Execute Instant Trade'].map((s, i) => (
                <span key={i} className="text-xs bg-white border border-blue-100 text-blue-700 px-3 py-1.5 rounded-full font-medium shadow-sm">{s}</span>
              ))}
            </div>
          </div>
        </div>
        <button onClick={onDismiss} className="text-blue-300 hover:text-blue-500 transition-colors flex-shrink-0 text-lg leading-none">×</button>
      </div>
    </div>
  );
}

/* ─── Main App ─── */
export default function App() {
  const [selectedCompany, setSelectedCompany] = useState(COMPANIES[0]);
  const [balances, setBalances] = useState({});
  const [prevBalances, setPrevBalances] = useState({});
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: 'info', message: "Ready to trade. Select a buyer and seller to get started." });
  const [tradeDetails, setTradeDetails] = useState({ amount: 10, price: 2500 });
  const [selectedBuyer, setSelectedBuyer] = useState(null);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [lastTx, setLastTx] = useState(null);
  const [timelineStep, setTimelineStep] = useState(0);
  const [timelineActive, setTimelineActive] = useState(false);
  const [isSettling, setIsSettling] = useState(false);
  const [settlementTime, setSettlementTime] = useState(null);
  const [settlementHistory, setSettlementHistory] = useState([]);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  useEffect(() => { setTradeDetails(d => ({ ...d, price: selectedCompany.price })); }, [selectedCompany]);

  useEffect(() => {
    refreshBalances();
    loadHistory();
    const iv = setInterval(refreshBalances, 5000);
    return () => clearInterval(iv);
  }, []);

  const loadHistory = async () => {
    try {
      const res = await axios.get(`${API_BASE}/history`);
      setSettlementHistory(res.data.map(r => ({
        txHash: r.txHash, symbol: r.symbol, amount: r.amount, price: r.price,
        total: r.totalValue,
        buyer: `${r.buyer.slice(0, 6)}…${r.buyer.slice(-4)}`,
        seller: `${r.seller.slice(0, 6)}…${r.seller.slice(-4)}`,
        time: new Date(r.settledAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        blockNumber: r.blockNumber,
      })));
    } catch (e) { console.error(e); }
  };

  const refreshBalances = async () => {
    const nb = {};
    for (const t of TRADERS) {
      try { const r = await axios.get(`${API_BASE}/balances/${t.address}`); nb[t.address] = r.data; } catch (e) { console.error(e); }
    }
    setPrevBalances(prev => ({ ...prev, ...balances }));
    setBalances(nb);
  };

  const advance = (step) => new Promise(r => setTimeout(() => { setTimelineStep(step); r(); }, 400));

  const handleAction = async (fn, loadMsg, okMsg) => {
    setLoading(true); setStatus({ type: 'info', message: loadMsg });
    try { const r = await fn(); await refreshBalances(); setStatus({ type: 'success', message: okMsg }); return r; }
    catch (e) { setStatus({ type: 'error', message: e.response?.data?.error || e.message }); return null; }
    finally { setLoading(false); }
  };

  const handleDeposit = (address, amount) =>
    handleAction(() => axios.post(`${API_BASE}/fiat-deposit`, { address, amount }), "Adding demo money…", `₹${fmt(amount)} added successfully.`);

  const handleMintSecurities = (address, amount) =>
    handleAction(() => axios.post(`${API_BASE}/mint-securities`, { address, amount }), "Adding demo shares…", `${amount} shares added successfully.`);

  const handleSettle = async () => {
    if (!selectedBuyer || !selectedSeller) { setStatus({ type: 'error', message: 'Please select a Buyer and a Seller from the cards above.' }); return; }
    if (selectedBuyer.address === selectedSeller.address) { setStatus({ type: 'error', message: 'Buyer and Seller must be different participants.' }); return; }
    const total = tradeDetails.amount * tradeDetails.price;
    setLoading(true); setLastTx(null); setSettlementTime(null);
    setTimelineActive(true); setTimelineStep(0); setIsSettling(true);
    const start = Date.now();
    setStatus({ type: 'info', message: "Processing instant trade…" });
    try {
      await advance(1); await advance(2);
      const res = await axios.post(`${API_BASE}/settle`, {
        seller: selectedSeller.address, buyer: selectedBuyer.address,
        security: selectedCompany.address, amount: tradeDetails.amount,
        price: total, symbol: selectedCompany.symbol,
      });
      await advance(3); await advance(4); await advance(5); await advance(6);
      const elapsed = Date.now() - start;
      setIsSettling(false); setSettlementTime(elapsed); setTimelineActive(false);
      const txHash = res.data.txHash;
      try {
        const ti = await axios.get(`${API_BASE}/transactions/${txHash}`);
        setLastTx({ txHash, blockNumber: ti.data.blockNumber, confirmationTime: (elapsed / 1000).toFixed(2) });
      } catch { setLastTx({ txHash, blockNumber: '—', confirmationTime: (elapsed / 1000).toFixed(2) }); }
      const now = new Date();
      setSettlementHistory(prev => [{
        txHash, symbol: selectedCompany.symbol, amount: tradeDetails.amount,
        price: tradeDetails.price, total,
        buyer: selectedBuyer.name, seller: selectedSeller.name,
        time: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        blockNumber: res.data.blockNumber,
      }, ...prev]);
      await refreshBalances();
      setStatus({ type: 'success', message: `Trade settled! ${tradeDetails.amount} ${selectedCompany.symbol} shares exchanged for ₹${fmt(total)} in ${(elapsed / 1000).toFixed(2)}s` });
    } catch (e) {
      setIsSettling(false); setTimelineActive(false);
      setStatus({ type: 'error', message: e.response?.data?.error || e.message });
    }
    setLoading(false);
  };

  const total = tradeDetails.amount * tradeDetails.price;
  const readyToTrade = selectedBuyer && selectedSeller;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        * { font-family: 'DM Sans', sans-serif; }
        .font-mono { font-family: 'DM Mono', monospace !important; }
        @keyframes fadeInRow { from { opacity:0; background:#f0fdf4; } to { opacity:1; background:transparent; } }
        @keyframes slideIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        .slide-in { animation: slideIn 0.4s ease; }
      `}</style>

      {/* Top Nav */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
              <Zap size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-none">BharatSettle</h1>
              <p className="text-xs text-gray-400 leading-none mt-0.5">Instant Trade Settlement</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-emerald-50 text-emerald-700 text-xs font-medium px-3 py-1.5 rounded-full border border-emerald-100">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              SEBI Sandbox · Live
            </div>
            <div className="text-xs text-gray-400 font-mono hidden sm:block">45ms latency</div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* Status Bar */}
        <div className={`rounded-xl p-4 flex items-center gap-3 transition-all duration-500 text-sm font-medium ${
          status.type === 'error' ? 'bg-red-50 border border-red-100 text-red-700' :
          status.type === 'success' ? 'bg-emerald-50 border border-emerald-100 text-emerald-700' :
          'bg-blue-50 border border-blue-100 text-blue-700'}`}>
          {loading ? <Loader2 size={16} className="animate-spin flex-shrink-0" /> :
           status.type === 'error' ? <AlertTriangle size={16} className="flex-shrink-0" /> :
           status.type === 'success' ? <CheckCircle2 size={16} className="flex-shrink-0" /> :
           <Info size={16} className="flex-shrink-0" />}
          {status.message}
        </div>

        {/* Demo Banner */}
        <DemoBanner dismissed={bannerDismissed} onDismiss={() => setBannerDismissed(true)} />

        {/* Participant Cards */}
        <div>
          <h2 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Users size={16} className="text-gray-400" /> Market Participants
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {TRADERS.map((trader) => {
              const isBuyer = selectedBuyer?.address === trader.address;
              const isSeller = selectedSeller?.address === trader.address;
              const isSelected = isBuyer || isSeller;
              return (
                <div key={trader.address}
                  className={`bg-white rounded-2xl border-2 p-5 transition-all duration-300 ${
                    isBuyer ? 'border-blue-400 shadow-md shadow-blue-50' :
                    isSeller ? 'border-orange-400 shadow-md shadow-orange-50' :
                    'border-gray-100 hover:border-gray-200 shadow-sm'}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                        style={{ background: trader.avatarBg, color: trader.avatarColor }}>
                        {trader.avatar}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{trader.name}</p>
                        <p className="text-xs text-gray-400">{trader.role}</p>
                      </div>
                    </div>
                    {isSelected && (
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${isBuyer ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                        {isBuyer ? 'Buyer' : 'Seller'}
                      </span>
                    )}
                  </div>

                  {/* Balances */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2.5">
                      <span className="text-xs text-gray-500 flex items-center gap-1.5"><IndianRupee size={11} /> Cash Balance</span>
                      <BalanceBadge value={balances[trader.address]?.inr} prev={prevBalances[trader.address]?.inr} symbol="₹" />
                    </div>
                    <div className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2.5">
                      <span className="text-xs text-gray-500 flex items-center gap-1.5"><BarChart3 size={11} /> {selectedCompany.symbol} Shares</span>
                      <BalanceBadge value={balances[trader.address]?.reliance} prev={prevBalances[trader.address]?.reliance} symbol="" />
                    </div>
                  </div>

                  {/* Role selection */}
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <button onClick={() => {
                      if (isBuyer) { setSelectedBuyer(null); return; }
                      if (selectedSeller?.address === trader.address) return;
                      setSelectedBuyer(trader);
                    }}
                      disabled={loading || selectedSeller?.address === trader.address}
                      className={`text-xs py-2 rounded-xl font-semibold border transition-all duration-200 ${
                        isBuyer ? 'bg-blue-500 border-blue-500 text-white' :
                        selectedSeller?.address === trader.address ? 'opacity-30 cursor-not-allowed border-gray-100 text-gray-300 bg-gray-50' :
                        'border-blue-200 text-blue-600 hover:bg-blue-50'}`}>
                      {isBuyer ? '✓ Buyer' : 'Set as Buyer'}
                    </button>
                    <button onClick={() => {
                      if (isSeller) { setSelectedSeller(null); return; }
                      if (selectedBuyer?.address === trader.address) return;
                      setSelectedSeller(trader);
                    }}
                      disabled={loading || selectedBuyer?.address === trader.address}
                      className={`text-xs py-2 rounded-xl font-semibold border transition-all duration-200 ${
                        isSeller ? 'bg-orange-500 border-orange-500 text-white' :
                        selectedBuyer?.address === trader.address ? 'opacity-30 cursor-not-allowed border-gray-100 text-gray-300 bg-gray-50' :
                        'border-orange-200 text-orange-600 hover:bg-orange-50'}`}>
                      {isSeller ? '✓ Seller' : 'Set as Seller'}
                    </button>
                  </div>

                  {/* Demo money/shares */}
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => handleDeposit(trader.address, 100000)} disabled={loading}
                      className="text-xs py-2 rounded-xl font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40">
                      + ₹1L Demo
                    </button>
                    <button onClick={() => handleMintSecurities(trader.address, 50)} disabled={loading}
                      className="text-xs py-2 rounded-xl font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40">
                      + 50 Shares
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Trade Flow Indicator */}
        {(selectedBuyer || selectedSeller) && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 slide-in">
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold ${selectedBuyer ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-gray-50 text-gray-400 border border-dashed border-gray-200'}`}>
                {selectedBuyer ? `${selectedBuyer.name}` : 'Select Buyer'}
                <span className="text-xs font-normal opacity-60">buys</span>
              </div>
              <ArrowRight size={18} className="text-gray-300 flex-shrink-0" />
              <div className="flex flex-col items-center">
                <span className="text-xs text-gray-400 font-medium">{selectedCompany.symbol}</span>
                <span className="text-xs text-gray-300">instant swap</span>
              </div>
              <ArrowRight size={18} className="text-gray-300 flex-shrink-0" />
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold ${selectedSeller ? 'bg-orange-50 text-orange-700 border border-orange-100' : 'bg-gray-50 text-gray-400 border border-dashed border-gray-200'}`}>
                <span className="text-xs font-normal opacity-60">from</span>
                {selectedSeller ? `${selectedSeller.name}` : 'Select Seller'}
              </div>
              {readyToTrade && <span className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full font-medium ml-2">✓ Ready</span>}
            </div>
          </div>
        )}

        {/* Trade Execution Panel */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-bold text-gray-900 mb-5 flex items-center gap-2">
            <TrendingUp size={16} className="text-blue-500" /> Configure Your Trade
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Stock</label>
              <CompanySelector selected={selectedCompany} onChange={setSelectedCompany} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Quantity (Shares)</label>
              <input type="number" value={tradeDetails.amount}
                onChange={e => setTradeDetails({ ...tradeDetails, amount: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Price per Share (₹)</label>
              <input type="number" value={tradeDetails.price}
                onChange={e => setTradeDetails({ ...tradeDetails, price: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-emerald-600 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-400 transition-colors" />
            </div>
          </div>

          {/* Summary + CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50 rounded-2xl p-5 border border-gray-100">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Total Transaction Value</p>
              <p className="text-2xl font-bold text-gray-900">₹{fmt(total)}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {tradeDetails.amount} {selectedCompany.symbol} shares × ₹{fmt(tradeDetails.price)}
              </p>
              {selectedBuyer && selectedSeller && (
                <p className="text-xs text-blue-600 mt-1">
                  {selectedBuyer.name} <span className="text-gray-400">buys from</span> {selectedSeller.name}
                </p>
              )}
            </div>
            <button onClick={handleSettle}
              disabled={loading || !readyToTrade}
              className={`w-full sm:w-auto px-10 py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-3 transition-all duration-300 ${
                readyToTrade && !loading
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200 hover:shadow-blue-300 active:scale-95'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
              {loading ? <><Loader2 size={18} className="animate-spin" /> Processing…</> :
               <><Zap size={18} /> Execute Instant Trade</>}
            </button>
          </div>

          {!readyToTrade && !loading && (
            <p className="text-xs text-center text-gray-400 mt-3">
              ↑ Select a Buyer and a Seller from the cards above to enable the trade button
            </p>
          )}
        </div>

        {/* Right-hand panels: Progress + Confirmation + Comparison */}
        {(timelineActive || timelineStep > 0 || lastTx || isSettling || settlementTime) && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 slide-in">
            <TradeProgress currentStep={timelineStep} isActive={timelineActive} />
            <BlockchainConfirmation txHash={lastTx?.txHash} blockNumber={lastTx?.blockNumber} confirmationTime={lastTx?.confirmationTime} />
            <SettlementComparison settlementTime={settlementTime} isSettling={isSettling} />
          </div>
        )}

        {/* Impact Stats — always visible */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: <Clock size={18} className="text-blue-500" />, label: 'Settlement Speed', old: '24 Hours', now: '< 2 Seconds', color: 'blue' },
            { icon: <Zap size={18} className="text-emerald-500" />, label: 'Capital Freed', old: 'Locked for a day', now: '100% Instantly', color: 'emerald' },
            { icon: <ShieldCheck size={18} className="text-purple-500" />, label: 'Counterparty Risk', old: 'Possible default', now: 'Zero Risk', color: 'purple' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-3">{s.icon}<span className="text-sm font-semibold text-gray-700">{s.label}</span></div>
              <p className="text-sm text-gray-300 line-through mb-1">{s.old}</p>
              <p className={`text-lg font-bold text-${s.color}-600`}>{s.now}</p>
            </div>
          ))}
        </div>

        {/* History Table */}
        <SettlementHistory history={settlementHistory} />

        <footer className="text-center text-gray-300 text-xs py-6 border-t border-gray-100">
          Built for Horizon 1.0 · Vidyavardhini's College of Engineering and Technology
        </footer>
      </div>
    </div>
  );
}