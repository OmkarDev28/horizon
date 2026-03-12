import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Activity, ShieldCheck, Wallet, ArrowRightLeft, TrendingUp,
  Info, Cpu, BarChart3, Clock, Zap, CheckCircle2, AlertTriangle,
  ExternalLink, Hash, Layers, Timer, History, ChevronRight,
  ChevronDown, IndianRupee, Users, ArrowRight, Sparkles,
  Eye, EyeOff, CircleCheck, Loader2, BadgeCheck, BookOpen,
} from 'lucide-react';

const API_BASE = "http://localhost:5001";

const COMPANIES = [
  { symbol: "RELIANCE", name: "Reliance Industries", address: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0", sector: "Energy", price: 2500, color: "#34d399" },
  { symbol: "TCS", name: "Tata Consultancy Services", address: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9", sector: "IT", price: 3800, color: "#38bdf8" },
  { symbol: "INFY", name: "Infosys Limited", address: "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9", sector: "IT", price: 1750, color: "#818cf8" },
  { symbol: "HDFC", name: "HDFC Bank", address: "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707", sector: "Banking", price: 1600, color: "#34d399" },
  { symbol: "WIPRO", name: "Wipro Limited", address: "0x0165878A594ca255338adfa4d48449f69242Eb8F", sector: "IT", price: 480, color: "#fbbf24" },
  { symbol: "BAJFIN", name: "Bajaj Finance", address: "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853", sector: "NBFC", price: 7200, color: "#f87171" },
  { symbol: "TATASTL", name: "Tata Steel", address: "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6", sector: "Metals", price: 145, color: "#818cf8" },
  { symbol: "ONGC", name: "Oil & Natural Gas Corp", address: "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318", sector: "Energy", price: 265, color: "#fb923c" },
];

const TRADERS = [
  { name: "Retail Trader", role: "Buyer", address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", accent: "#34d399", accentDim: "#1a6644", initials: "RT" },
  { name: "Institutional Fund", role: "Seller", address: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", accent: "#fbbf24", accentDim: "#7a5a0a", initials: "IF" },
  { name: "Clearing Corp", role: "Admin", address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", accent: "#38bdf8", accentDim: "#0c4a6e", initials: "CC" },
];

const PROGRESS_STEPS = [
  { id: 1, label: "Trade Requested", desc: "Order submitted" },
  { id: 2, label: "Processing", desc: "Verifying on-chain" },
  { id: 3, label: "Assets Exchanged", desc: "Shares & cash swapped" },
  { id: 4, label: "Completed", desc: "Settlement confirmed" },
];

const fmt = (num) => new Intl.NumberFormat('en-IN').format(Number(num) || 0);

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=JetBrains+Mono:wght@300;400;500;600&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg-base: #080c0a;
    --bg-surface: #0d1410;
    --bg-card: #111a14;
    --bg-elevated: #162019;
    --border-subtle: rgba(52,211,153,0.08);
    --border-mid: rgba(52,211,153,0.15);
    --border-strong: rgba(52,211,153,0.3);
    --text-primary: #e8f5f0;
    --text-secondary: #8aab96;
    --text-muted: #4a6657;
    --emerald: #34d399;
    --emerald-dim: #1a6644;
    --gold: #fbbf24;
    --sky: #38bdf8;
    --red: #f87171;
    --orange: #fb923c;
    --grid-line: rgba(52,211,153,0.04);
  }

  body { font-family: 'Syne', sans-serif; background: var(--bg-base); color: var(--text-primary); min-height: 100vh; }
  .mono { font-family: 'JetBrains Mono', monospace !important; }

  .app-bg {
    min-height: 100vh;
    background-color: var(--bg-base);
    background-image:
      linear-gradient(var(--grid-line) 1px, transparent 1px),
      linear-gradient(90deg, var(--grid-line) 1px, transparent 1px);
    background-size: 40px 40px;
    padding: 1.5rem;
  }

  .container { max-width: 1280px; margin: 0 auto; }

  /* ── Header ── */
  .header {
    background: linear-gradient(135deg, var(--bg-card), var(--bg-elevated));
    border: 1px solid var(--border-mid);
    border-radius: 16px;
    padding: 1.25rem 2rem;
    display: flex; justify-content: space-between; align-items: center; gap: 1rem;
    position: relative; overflow: hidden;
    margin-bottom: 1.25rem;
  }
  .header::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, var(--emerald), transparent);
  }
  .header-glow {
    position: absolute; top: -60px; right: -60px;
    width: 200px; height: 200px;
    background: radial-gradient(circle, rgba(52,211,153,0.12) 0%, transparent 70%);
    pointer-events: none;
  }
  .logo-icon {
    width: 44px; height: 44px;
    background: linear-gradient(135deg, rgba(52,211,153,0.2), rgba(52,211,153,0.05));
    border: 1px solid var(--border-strong);
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
  }
  .header-title {
    font-size: 1.6rem; font-weight: 800; letter-spacing: -0.02em;
    background: linear-gradient(135deg, #e8f5f0 30%, var(--emerald));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  }
  .header-subtitle {
    font-family: 'JetBrains Mono', monospace; font-size: 0.72rem;
    color: var(--emerald); display: flex; align-items: center; gap: 6px;
    margin-top: 2px; opacity: 0.8;
  }

  /* ── Nav btn ── */
  .nav-btn {
    display: flex; align-items: center; gap: 7px;
    padding: 8px 14px; border: 1px solid var(--border-mid);
    border-radius: 8px; background: transparent; color: var(--text-secondary);
    font-family: 'Syne', sans-serif; font-size: 0.8rem; font-weight: 600; cursor: pointer;
    transition: all 0.2s;
  }
  .nav-btn:hover { border-color: var(--emerald); color: var(--emerald); background: rgba(52,211,153,0.06); }

  /* ── Ping ── */
  .status-badge {
    display: flex; align-items: center; gap: 10px;
    background: var(--bg-base); border: 1px solid var(--border-subtle);
    border-radius: 100px; padding: 7px 14px;
  }
  .ping-dot { position: relative; display: flex; width: 10px; height: 10px; }
  .ping-outer {
    position: absolute; inset: 0; border-radius: 50%;
    background: var(--emerald); opacity: 0.4;
    animation: ping 1.5s ease-in-out infinite;
  }
  .ping-inner { width: 10px; height: 10px; border-radius: 50%; background: var(--emerald); position: relative; z-index: 1; }
  @keyframes ping { 0%,100%{transform:scale(1);opacity:0.4} 50%{transform:scale(1.8);opacity:0} }

  /* ── Status bar ── */
  .status-bar {
    border-radius: 12px; padding: 0.9rem 1.4rem;
    display: flex; align-items: center; gap: 12px;
    border: 1px solid; transition: all 0.4s ease; margin-bottom: 1.25rem;
  }
  .status-bar.info  { border-color: rgba(56,189,248,0.25); background: rgba(56,189,248,0.05); }
  .status-bar.success { border-color: rgba(52,211,153,0.3); background: rgba(52,211,153,0.06); }
  .status-bar.error { border-color: rgba(248,113,113,0.3); background: rgba(248,113,113,0.06); }
  .status-text { font-family: 'JetBrains Mono', monospace; font-size: 0.78rem; flex: 1; }
  .status-text.info { color: var(--sky); }
  .status-text.success { color: var(--emerald); }
  .status-text.error { color: var(--red); }

  /* ── Section label ── */
  .section-label {
    font-size: 0.62rem; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.15em; color: var(--text-muted);
    font-family: 'JetBrains Mono', monospace;
    margin-bottom: 0.75rem; padding-left: 2px;
  }

  /* ── Demo banner ── */
  .demo-banner {
    background: linear-gradient(135deg, rgba(52,211,153,0.07), rgba(52,211,153,0.03));
    border: 1px solid var(--border-mid); border-radius: 14px;
    padding: 1rem 1.4rem; margin-bottom: 1.25rem;
    display: flex; align-items: flex-start; gap: 12px;
  }
  .demo-banner-icon {
    width: 32px; height: 32px; flex-shrink: 0;
    background: rgba(52,211,153,0.12); border: 1px solid var(--border-mid);
    border-radius: 8px; display: flex; align-items: center; justify-content: center;
  }
  .demo-step {
    font-family: 'JetBrains Mono', monospace; font-size: 0.7rem;
    color: var(--text-secondary); background: rgba(52,211,153,0.07);
    border: 1px solid var(--border-subtle); border-radius: 100px;
    padding: 4px 12px; white-space: nowrap;
  }
  .demo-close {
    margin-left: auto; background: none; border: none; color: var(--text-muted);
    cursor: pointer; font-size: 1.1rem; line-height: 1; padding: 2px 6px;
    border-radius: 4px; transition: color 0.2s;
  }
  .demo-close:hover { color: var(--text-secondary); }

  /* ── Trader cards ── */
  .trader-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 1.25rem; margin-bottom: 1.25rem; }
  @media(max-width:768px) { .trader-grid { grid-template-columns: 1fr; } }

  .trader-card {
    background: var(--bg-card); border: 1px solid var(--border-subtle);
    border-radius: 16px; padding: 1.4rem;
    display: flex; flex-direction: column;
    position: relative; overflow: hidden;
    transition: border-color 0.3s, transform 0.2s;
  }
  .trader-card:hover { transform: translateY(-2px); }
  .trader-card-accent { position: absolute; top: 0; left: 0; right: 0; height: 2px; }

  .trader-avatar {
    width: 38px; height: 38px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-family: 'JetBrains Mono', monospace; font-weight: 600; font-size: 0.8rem;
    flex-shrink: 0;
  }
  .trader-name { font-size: 0.95rem; font-weight: 700; color: var(--text-primary); }
  .trader-role-badge {
    display: inline-block; font-size: 0.62rem; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.08em;
    padding: 3px 9px; border-radius: 100px; margin-top: 5px;
    font-family: 'JetBrains Mono', monospace;
  }
  .selected-badge {
    font-family: 'JetBrains Mono', monospace; font-size: 0.62rem; font-weight: 700;
    padding: 3px 10px; border-radius: 100px; text-transform: uppercase; letter-spacing: 0.06em;
  }

  .balance-row {
    background: var(--bg-base); border: 1px solid var(--border-subtle);
    border-radius: 10px; padding: 10px 13px;
    display: flex; justify-content: space-between; align-items: center;
    transition: border-color 0.2s;
  }
  .balance-row:hover { border-color: var(--border-mid); }
  .balance-label { font-size: 0.75rem; color: var(--text-muted); display: flex; align-items: center; gap: 5px; }
  .balance-value { font-family: 'JetBrains Mono', monospace; font-weight: 600; font-size: 1rem; color: var(--text-primary); transition: color 0.4s; }
  .balance-value.flash-up { color: var(--emerald); }
  .balance-value.flash-down { color: var(--orange); }

  .role-btn-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 12px; }
  .role-btn {
    padding: 8px 10px; border-radius: 8px; border: 1px solid var(--border-mid);
    background: transparent; font-family: 'Syne', sans-serif;
    font-size: 0.72rem; font-weight: 700; cursor: pointer; transition: all 0.2s;
    color: var(--text-muted);
  }
  .role-btn:hover:not(:disabled) { border-color: currentColor; }
  .role-btn:disabled { opacity: 0.3; cursor: not-allowed; }
  .role-btn.buyer-active { background: rgba(52,211,153,0.12); border-color: var(--emerald); color: var(--emerald); }
  .role-btn.seller-active { background: rgba(251,191,36,0.12); border-color: var(--gold); color: var(--gold); }
  .role-btn.buyer-idle:not(:disabled):hover { color: var(--emerald); border-color: rgba(52,211,153,0.4); background: rgba(52,211,153,0.06); }
  .role-btn.seller-idle:not(:disabled):hover { color: var(--gold); border-color: rgba(251,191,36,0.4); background: rgba(251,191,36,0.06); }

  .btn-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 10px; }
  .btn-outline {
    padding: 8px 10px; border-radius: 8px; border: 1px solid var(--border-subtle);
    background: transparent; color: var(--text-muted);
    font-family: 'Syne', sans-serif; font-size: 0.72rem; font-weight: 600; cursor: pointer;
    transition: all 0.2s;
  }
  .btn-outline:hover:not(:disabled) { border-color: var(--border-mid); color: var(--text-secondary); }
  .btn-outline:disabled { opacity: 0.4; cursor: not-allowed; }

  /* ── Trade flow strip ── */
  .trade-flow {
    background: var(--bg-card); border: 1px solid var(--border-subtle);
    border-radius: 12px; padding: 1rem 1.5rem;
    display: flex; align-items: center; justify-content: center; gap: 16px; flex-wrap: wrap;
    margin-bottom: 1.25rem;
  }
  .flow-pill {
    display: flex; align-items: center; gap: 8px;
    padding: 8px 16px; border-radius: 8px; border: 1px solid;
    font-size: 0.82rem; font-weight: 600;
  }
  .flow-pill.buyer { border-color: rgba(52,211,153,0.3); background: rgba(52,211,153,0.06); color: var(--emerald); }
  .flow-pill.seller { border-color: rgba(251,191,36,0.3); background: rgba(251,191,36,0.06); color: var(--gold); }
  .flow-pill.empty { border-color: var(--border-subtle); border-style: dashed; color: var(--text-muted); }
  .flow-center { text-align: center; }
  .flow-center-symbol { font-family: 'JetBrains Mono', monospace; font-size: 0.78rem; color: var(--text-secondary); }
  .flow-center-desc { font-family: 'JetBrains Mono', monospace; font-size: 0.65rem; color: var(--text-muted); }

  /* ── Main panels grid ── */
  .bottom-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 1.25rem; margin-bottom: 1.25rem; }
  @media(max-width:1024px) { .bottom-grid { grid-template-columns: 1fr; } }

  .panel {
    background: var(--bg-card); border: 1px solid var(--border-subtle);
    border-radius: 16px; padding: 1.75rem;
    position: relative; overflow: hidden;
  }
  .panel::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(52,211,153,0.2), transparent);
  }
  .panel-glow {
    position: absolute; top: -80px; right: -80px; width: 240px; height: 240px;
    background: radial-gradient(circle, rgba(251,191,36,0.06) 0%, transparent 70%);
    pointer-events: none;
  }
  .panel-title {
    font-size: 1rem; font-weight: 700; color: var(--text-primary);
    display: flex; align-items: center; gap: 10px; margin-bottom: 1.5rem;
  }

  /* ── Company selector ── */
  .selector-btn {
    width: 100%; background: var(--bg-base); border: 1px solid var(--border-subtle);
    border-radius: 10px; padding: 11px 13px; display: flex; align-items: center;
    justify-content: space-between; gap: 8px; cursor: pointer;
    transition: border-color 0.2s; color: var(--text-primary);
    font-family: 'Syne', sans-serif;
  }
  .selector-btn:hover { border-color: var(--border-strong); }
  .selector-dropdown {
    position: absolute; top: 100%; left: 0; right: 0; margin-top: 4px;
    background: var(--bg-elevated); border: 1px solid var(--border-mid);
    border-radius: 12px; z-index: 50; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.6);
  }
  .selector-option {
    width: 100%; display: flex; align-items: center; justify-content: space-between;
    padding: 10px 14px; background: none; border: none; cursor: pointer;
    transition: background 0.15s; color: var(--text-primary); font-family: 'Syne', sans-serif;
    text-align: left;
  }
  .selector-option:hover { background: rgba(52,211,153,0.06); }
  .selector-option.selected { background: rgba(52,211,153,0.04); }

  /* ── Form ── */
  .form-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 1rem; margin-bottom: 1.5rem; }
  @media(max-width:640px) { .form-grid { grid-template-columns: 1fr; } }
  .form-group label {
    display: block; font-size: 0.62rem; font-weight: 600;
    text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-muted);
    margin-bottom: 7px; font-family: 'JetBrains Mono', monospace;
  }
  .form-input {
    width: 100%; padding: 11px 13px;
    background: var(--bg-base); border: 1px solid var(--border-subtle);
    border-radius: 10px; color: var(--text-primary);
    font-family: 'JetBrains Mono', monospace; font-size: 0.95rem; font-weight: 500;
    outline: none; transition: border-color 0.2s, box-shadow 0.2s;
  }
  .form-input:focus { border-color: var(--border-strong); box-shadow: 0 0 0 3px rgba(52,211,153,0.08); }
  .form-input.gold { color: var(--gold); }

  /* ── Trade footer ── */
  .trade-footer {
    border-top: 1px solid var(--border-subtle); padding-top: 1.4rem;
    display: flex; justify-content: space-between; align-items: center; gap: 1rem; flex-wrap: wrap;
  }
  .trade-total-label { font-size: 0.75rem; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
  .trade-total-value { font-family: 'JetBrains Mono', monospace; font-size: 1.4rem; font-weight: 700; color: var(--text-primary); }

  .btn-execute {
    padding: 13px 36px;
    background: linear-gradient(135deg, #1a6644, #0d3d28);
    border: 1px solid var(--border-strong); border-radius: 10px;
    color: var(--emerald); font-family: 'Syne', sans-serif; font-size: 0.95rem; font-weight: 700;
    cursor: pointer; display: flex; align-items: center; gap: 10px;
    transition: all 0.25s; position: relative; overflow: hidden; white-space: nowrap;
  }
  .btn-execute::before {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(135deg, rgba(52,211,153,0.15), transparent);
    opacity: 0; transition: opacity 0.25s;
  }
  .btn-execute:hover:not(:disabled)::before { opacity: 1; }
  .btn-execute:hover:not(:disabled) { box-shadow: 0 0 24px rgba(52,211,153,0.2); transform: translateY(-1px); }
  .btn-execute:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }
  .btn-execute.not-ready { opacity: 0.35; cursor: not-allowed; }

  /* ── Metric cards ── */
  .metric-card {
    background: var(--bg-base); border: 1px solid var(--border-subtle);
    border-radius: 12px; padding: 1rem 1.1rem;
    position: relative; overflow: hidden; transition: border-color 0.2s;
  }
  .metric-card:hover { border-color: var(--border-mid); }
  .metric-card-accent { position: absolute; left: 0; top: 0; bottom: 0; width: 3px; border-radius: 0 2px 2px 0; }
  .metric-label { font-size: 0.68rem; color: var(--text-muted); display: flex; align-items: center; gap: 5px; margin-bottom: 8px; font-family: 'JetBrains Mono', monospace; }
  .metric-old { text-decoration: line-through; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; font-size: 0.78rem; }
  .metric-new { font-family: 'JetBrains Mono', monospace; font-weight: 700; font-size: 1rem; }
  .metric-desc { font-size: 0.68rem; color: var(--text-muted); margin-top: 3px; }

  /* ── Progress / Timeline ── */
  .progress-panel {
    background: var(--bg-card); border: 1px solid var(--border-subtle);
    border-radius: 16px; padding: 1.5rem;
  }
  .progress-steps { display: flex; align-items: flex-start; gap: 0; }
  .progress-step { flex: 1; display: flex; flex-direction: column; align-items: center; position: relative; }
  .progress-step:not(:last-child)::after {
    content: ''; position: absolute; top: 15px; left: 50%; right: -50%;
    height: 1px; background: var(--border-subtle); z-index: 0;
    transition: background 0.5s;
  }
  .progress-step.done:not(:last-child)::after { background: var(--emerald); }
  .step-circle {
    width: 30px; height: 30px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-family: 'JetBrains Mono', monospace; font-size: 0.7rem; font-weight: 600;
    position: relative; z-index: 1; border: 1px solid; transition: all 0.4s;
  }
  .step-circle.done { background: rgba(52,211,153,0.15); border-color: var(--emerald); color: var(--emerald); }
  .step-circle.active { background: rgba(56,189,248,0.15); border-color: var(--sky); color: var(--sky); }
  .step-circle.idle { background: var(--bg-base); border-color: var(--border-subtle); color: var(--text-muted); }
  .step-label { margin-top: 8px; font-size: 0.68rem; font-weight: 600; text-align: center; padding: 0 4px; transition: color 0.4s; }
  .step-desc { font-family: 'JetBrains Mono', monospace; font-size: 0.6rem; color: var(--text-muted); text-align: center; margin-top: 2px; }

  /* ── Blockchain confirmation ── */
  .confirm-panel {
    background: var(--bg-card); border: 1px solid var(--border-subtle);
    border-radius: 16px; overflow: hidden;
  }
  .confirm-header {
    width: 100%; display: flex; align-items: center; justify-content: space-between;
    padding: 1.1rem 1.4rem; background: none; border: none; cursor: pointer;
    transition: background 0.2s; color: inherit; font-family: 'Syne', sans-serif;
  }
  .confirm-header:hover { background: rgba(52,211,153,0.03); }
  .confirm-icon { width: 32px; height: 32px; background: rgba(52,211,153,0.1); border: 1px solid var(--border-mid); border-radius: 8px; display: flex; align-items: center; justify-content: center; }
  .confirm-body { border-top: 1px solid var(--border-subtle); padding: 1rem 1.4rem; }
  .confirm-row { display: flex; align-items: center; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border-subtle); }
  .confirm-row:last-child { border-bottom: none; }
  .confirm-key { font-family: 'JetBrains Mono', monospace; font-size: 0.7rem; color: var(--text-muted); }
  .confirm-val { font-family: 'JetBrains Mono', monospace; font-size: 0.72rem; }

  /* ── T+0 comparison ── */
  .compare-panel { background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 16px; padding: 1.4rem; }
  .compare-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .compare-card { border-radius: 10px; padding: 1rem; border: 1px solid; }
  .compare-card.legacy { border-color: rgba(248,113,113,0.2); background: rgba(248,113,113,0.04); }
  .compare-card.t0 { border-color: rgba(52,211,153,0.25); background: rgba(52,211,153,0.05); position: relative; overflow: hidden; }

  /* ── History ── */
  .history-panel { background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 16px; overflow: hidden; margin-bottom: 1.25rem; }
  .history-header { padding: 1.1rem 1.4rem; border-bottom: 1px solid var(--border-subtle); display: flex; align-items: center; justify-content: space-between; }
  .history-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 4rem 0; }
  .history-table { width: 100%; font-size: 0.8rem; border-collapse: collapse; }
  .history-table th {
    text-align: left; padding: 10px 14px;
    font-family: 'JetBrains Mono', monospace; font-size: 0.62rem; font-weight: 600;
    text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-muted);
    background: rgba(52,211,153,0.02); border-bottom: 1px solid var(--border-subtle);
    white-space: nowrap;
  }
  .history-table td { padding: 10px 14px; border-bottom: 1px solid var(--border-subtle); white-space: nowrap; vertical-align: middle; }
  .history-table tr:hover td { background: rgba(52,211,153,0.02); }
  .history-table tr:last-child td { border-bottom: none; }

  .tag { display: inline-block; font-family: 'JetBrains Mono', monospace; font-size: 0.65rem; font-weight: 600; padding: 3px 9px; border-radius: 100px; border: 1px solid; }

  /* ── Footer ── */
  .footer {
    text-align: center; font-family: 'JetBrains Mono', monospace; font-size: 0.68rem;
    color: var(--text-muted); padding: 1.25rem 0 0.5rem;
    border-top: 1px solid var(--border-subtle); margin-top: 0.5rem;
  }

  .spin { animation: spin 1s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeInRow { from { opacity: 0; background: rgba(52,211,153,0.05); } to { opacity: 1; background: transparent; } }
`;

/* ── Animated Balance ── */
function BalanceBadge({ value, prev }) {
  const [flash, setFlash] = useState(null);
  const prevRef = useRef(prev);
  useEffect(() => {
    const cur = parseFloat(value) || 0, old = parseFloat(prevRef.current) || 0;
    if (old !== 0 && cur !== old) { setFlash(cur > old ? 'up' : 'down'); setTimeout(() => setFlash(null), 1500); }
    prevRef.current = value;
  }, [value]);
  return (
    <span className={`balance-value ${flash === 'up' ? 'flash-up' : flash === 'down' ? 'flash-down' : ''}`}>
      {fmt(value)}{flash === 'up' ? ' ▲' : flash === 'down' ? ' ▼' : ''}
    </span>
  );
}

/* ── Company Selector ── */
function CompanySelector({ selected, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h);
  }, []);
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button className="selector-btn" onClick={() => setOpen(o => !o)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: selected.color, flexShrink: 0 }} />
          <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{selected.symbol}</span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{selected.name}</span>
        </div>
        <ChevronDown size={13} color="var(--text-muted)" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>
      {open && (
        <div className="selector-dropdown">
          <div style={{ padding: '8px 14px', borderBottom: '1px solid var(--border-subtle)' }}>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>NSE Securities</span>
          </div>
          <div style={{ maxHeight: 220, overflowY: 'auto' }}>
            {COMPANIES.map(co => (
              <button key={co.symbol} className={`selector-option ${selected.symbol === co.symbol ? 'selected' : ''}`} onClick={() => { onChange(co); setOpen(false); }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: co.color }} />
                  <span style={{ fontWeight: 700, fontSize: '0.82rem' }}>{co.symbol}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{co.name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.62rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.04)', padding: '2px 7px', borderRadius: 4 }}>{co.sector}</span>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', color: 'var(--emerald)' }}>₹{co.price.toLocaleString('en-IN')}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Trade Progress ── */
function TradeProgress({ currentStep, isActive }) {
  if (!isActive && currentStep === 0) return null;
  return (
    <div className="progress-panel">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.25rem' }}>
        <Activity size={14} color={isActive ? 'var(--sky)' : 'var(--emerald)'} className={isActive ? 'spin' : ''} />
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>Trade Progress</span>
      </div>
      <div className="progress-steps">
        {PROGRESS_STEPS.map((step, i) => {
          const done = currentStep >= (i + 1) * 1.5;
          const active = isActive && currentStep >= i * 1.5 && !done;
          return (
            <div key={step.id} className={`progress-step ${done ? 'done' : ''}`}>
              <div className={`step-circle ${done ? 'done' : active ? 'active' : 'idle'}`}>
                {done ? '✓' : active ? <Loader2 size={12} className="spin" /> : step.id}
              </div>
              <p className="step-label" style={{ color: done ? 'var(--emerald)' : active ? 'var(--sky)' : 'var(--text-muted)' }}>{step.label}</p>
              <p className="step-desc">{step.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Blockchain Confirmation ── */
function BlockchainConfirmation({ txHash, blockNumber, confirmationTime }) {
  const [open, setOpen] = useState(false);
  if (!txHash) return null;
  return (
    <div className="confirm-panel">
      <button className="confirm-header" onClick={() => setOpen(o => !o)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="confirm-icon"><BadgeCheck size={15} color="var(--emerald)" /></div>
          <div style={{ textAlign: 'left' }}>
            <p style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>Trade Confirmed</p>
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.66rem', color: 'var(--text-muted)', marginTop: 2 }}>Settled in {confirmationTime}s · On-chain proof</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: 'var(--text-muted)' }}>{open ? 'Hide' : 'View'}</span>
          <ChevronDown size={13} color="var(--text-muted)" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
        </div>
      </button>
      {open && (
        <div className="confirm-body">
          <div className="confirm-row">
            <span className="confirm-key">Transaction ID</span>
            <span className="confirm-val" style={{ color: 'var(--sky)', cursor: 'pointer' }} onClick={() => navigator.clipboard?.writeText(txHash)} title="Click to copy">
              {txHash.slice(0, 10)}…{txHash.slice(-8)}
            </span>
          </div>
          <div className="confirm-row">
            <span className="confirm-key">Block Number</span>
            <span className="confirm-val" style={{ color: 'var(--text-secondary)' }}>#{blockNumber}</span>
          </div>
          <div className="confirm-row">
            <span className="confirm-key">Settlement Time</span>
            <span className="confirm-val" style={{ color: 'var(--emerald)', fontWeight: 600 }}>{confirmationTime}s</span>
          </div>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.62rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: 10 }}>Permanently stored · Cannot be altered</p>
        </div>
      )}
    </div>
  );
}

/* ── Settlement Comparison ── */
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
    <div className="compare-panel">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem' }}>
        <Timer size={14} color="var(--gold)" />
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>Why This Matters</span>
      </div>
      <div className="compare-grid">
        <div className="compare-card legacy">
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.62rem', color: 'var(--red)', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase' }}>Old T+1</p>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.3rem', fontWeight: 700, color: 'var(--red)', textDecoration: 'line-through' }}>24 hrs</p>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.62rem', color: 'var(--text-muted)', marginTop: 5 }}>Capital locked all day</p>
        </div>
        <div className="compare-card t0">
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.62rem', color: 'var(--emerald)', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', position: 'relative' }}>This System</p>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.3rem', fontWeight: 700, color: 'var(--emerald)', position: 'relative' }}>
            {done ? `${(done / 1000).toFixed(2)}s` : isSettling ? `${(elapsed / 1000).toFixed(1)}s` : '< 5s'}
          </p>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.62rem', color: 'var(--text-muted)', marginTop: 5, position: 'relative' }}>
            {done ? `${(86400 / (done / 1000)).toFixed(0)}× faster` : 'Money freed instantly'}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Settlement History ── */
function SettlementHistory({ history }) {
  const [expandedRow, setExpandedRow] = useState(null);
  return (
    <div className="history-panel">
      <div className="history-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <History size={15} color="var(--sky)" />
          <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Trade History</span>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.62rem', color: 'var(--text-muted)' }}>— persisted across sessions</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {history.length > 0 && (
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Volume: <span style={{ color: 'var(--emerald)', fontWeight: 600 }}>₹{fmt(history.reduce((s, r) => s + Number(r.total), 0))}</span>
            </span>
          )}
          <span className="tag" style={{ color: history.length > 0 ? 'var(--emerald)' : 'var(--text-muted)', borderColor: history.length > 0 ? 'rgba(52,211,153,0.3)' : 'var(--border-subtle)', background: history.length > 0 ? 'rgba(52,211,153,0.07)' : 'transparent' }}>
            {history.length} trade{history.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
      {history.length === 0 ? (
        <div className="history-empty">
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--bg-base)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <History size={18} color="var(--text-muted)" />
          </div>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.78rem', color: 'var(--text-muted)' }}>No trades yet</p>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.68rem', color: 'var(--text-muted)', opacity: 0.6, marginTop: 4 }}>Execute a trade above to see records here</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="history-table">
            <thead>
              <tr>{['Time', 'Asset', 'Qty', 'Price (₹)', 'Total (₹)', 'Buyer', 'Seller', 'Status', ''].map(h => <th key={h}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {history.map((row, i) => (
                <React.Fragment key={row.txHash}>
                  <tr style={{ animation: i === 0 ? 'fadeInRow 0.5s ease' : 'none' }}>
                    <td style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-muted)', fontSize: '0.72rem' }}>{row.time}</td>
                    <td><span className="tag" style={{ color: 'var(--sky)', borderColor: 'rgba(56,189,248,0.3)', background: 'rgba(56,189,248,0.07)' }}>{row.symbol}</span></td>
                    <td style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, color: 'var(--text-primary)' }}>{row.amount}</td>
                    <td style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-secondary)' }}>{fmt(row.price)}</td>
                    <td style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: 'var(--emerald)' }}>{fmt(row.total)}</td>
                    <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.72rem', color: 'var(--emerald)' }}>{row.buyer}</td>
                    <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.72rem', color: 'var(--gold)' }}>{row.seller}</td>
                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', color: 'var(--emerald)', fontWeight: 600 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--emerald)', display: 'inline-block' }} /> Settled
                      </span>
                    </td>
                    <td>
                      <button onClick={() => setExpandedRow(expandedRow === row.txHash ? null : row.txHash)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: 'var(--text-muted)', transition: 'color 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.color = 'var(--sky)'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                        {expandedRow === row.txHash ? <EyeOff size={11} /> : <Eye size={11} />}
                        {expandedRow === row.txHash ? 'Hide' : 'Details'}
                      </button>
                    </td>
                  </tr>
                  {expandedRow === row.txHash && (
                    <tr>
                      <td colSpan={9} style={{ background: 'rgba(52,211,153,0.03)', padding: '10px 14px' }}>
                        <div style={{ display: 'flex', gap: 32 }}>
                          <div>
                            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.62rem', color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}>Transaction ID</span>
                            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.72rem', color: 'var(--sky)', cursor: 'pointer' }} onClick={() => navigator.clipboard?.writeText(row.txHash)}>
                              {row.txHash?.slice(0, 14)}…{row.txHash?.slice(-10)} <span style={{ color: 'var(--text-muted)' }}>(click to copy)</span>
                            </span>
                          </div>
                          <div>
                            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.62rem', color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}>Block</span>
                            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{row.blockNumber ? `#${row.blockNumber}` : '—'}</span>
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

/* ── Main App ── */
export default function App() {
  const [selectedCompany, setSelectedCompany] = useState(COMPANIES[0]);
  const [balances, setBalances] = useState({});
  const [prevBalances, setPrevBalances] = useState({});
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: 'info', message: 'System Ready: Select a Buyer and Seller to begin.' });
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
    refreshBalances(); loadHistory();
    const iv = setInterval(refreshBalances, 5000);
    return () => clearInterval(iv);
  }, []);

  const loadHistory = async () => {
    try {
      const res = await axios.get(`${API_BASE}/history`);
      setSettlementHistory(res.data.map(r => ({
        txHash: r.txHash, symbol: r.symbol, amount: r.amount, price: r.price, total: r.totalValue,
        buyer: `${r.buyer.slice(0, 6)}…${r.buyer.slice(-4)}`, seller: `${r.seller.slice(0, 6)}…${r.seller.slice(-4)}`,
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
    handleAction(() => axios.post(`${API_BASE}/fiat-deposit`, { address, amount }), 'Adding demo funds…', `₹${fmt(amount)} added successfully.`);

  const handleMintSecurities = (address, amount) =>
    handleAction(() => axios.post(`${API_BASE}/mint-securities`, { address, amount }), 'Adding demo shares…', `${amount} shares added successfully.`);

  const handleSettle = async () => {
    if (!selectedBuyer || !selectedSeller) { setStatus({ type: 'error', message: 'Please select a Buyer and a Seller from the cards above.' }); return; }
    if (selectedBuyer.address === selectedSeller.address) { setStatus({ type: 'error', message: 'Buyer and Seller must be different participants.' }); return; }
    const total = tradeDetails.amount * tradeDetails.price;
    setLoading(true); setLastTx(null); setSettlementTime(null);
    setTimelineActive(true); setTimelineStep(0); setIsSettling(true);
    const start = Date.now();
    setStatus({ type: 'info', message: 'Processing instant trade settlement…' });
    try {
      await advance(1); await advance(2);
      const res = await axios.post(`${API_BASE}/settle`, {
        seller: selectedSeller.address, buyer: selectedBuyer.address,
        security: selectedCompany.address, amount: tradeDetails.amount, price: total, symbol: selectedCompany.symbol,
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
        txHash, symbol: selectedCompany.symbol, amount: tradeDetails.amount, price: tradeDetails.price, total,
        buyer: selectedBuyer.name, seller: selectedSeller.name,
        time: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        blockNumber: res.data.blockNumber,
      }, ...prev]);
      await refreshBalances();
      setStatus({ type: 'success', message: `Trade settled! ${tradeDetails.amount} ${selectedCompany.symbol} shares ↔ ₹${fmt(total)} in ${(elapsed / 1000).toFixed(2)}s` });
    } catch (e) {
      setIsSettling(false); setTimelineActive(false);
      setStatus({ type: 'error', message: e.response?.data?.error || e.message });
    }
    setLoading(false);
  };

  const total = tradeDetails.amount * tradeDetails.price;
  const readyToTrade = selectedBuyer && selectedSeller;

  return (
    <>
      <style>{styles}</style>
      <div className="app-bg">
        <div className="container">

          {/* Header */}
          <header className="header">
            <div className="header-glow" />
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative', zIndex: 1 }}>
              <div className="logo-icon"><ShieldCheck size={22} color="var(--emerald)" /></div>
              <div>
                <h1 className="header-title">BharatSettle</h1>
                <p className="header-subtitle"><Zap size={11} /> Instant Trade Settlement Platform</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative', zIndex: 1 }}>
              <div className="status-badge">
                <div className="ping-dot"><div className="ping-outer" /><div className="ping-inner" /></div>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>SEBI Sandbox</span>
                <span className="mono" style={{ fontSize: '0.68rem', color: 'var(--text-muted)', borderLeft: '1px solid var(--border-subtle)', paddingLeft: 10, marginLeft: 4 }}>45ms</span>
              </div>
            </div>
          </header>

          {/* Status */}
          <div className={`status-bar ${status.type}`}>
            {loading ? <Activity size={16} color="var(--sky)" className="spin" /> :
             status.type === 'error' ? <AlertTriangle size={16} color="var(--red)" /> :
             status.type === 'success' ? <CheckCircle2 size={16} color="var(--emerald)" /> :
             <Info size={16} color="var(--sky)" />}
            <p className={`status-text ${status.type}`}>{status.message}</p>
          </div>

          {/* Demo Banner */}
          {!bannerDismissed && (
            <div className="demo-banner">
              <div className="demo-banner-icon"><Sparkles size={14} color="var(--emerald)" /></div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>How to run a demo trade</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {['1. Add Demo Money to Buyer', '2. Add Demo Shares to Seller', '3. Select Buyer & Seller', '4. Execute Instant Trade'].map(s => (
                    <span key={s} className="demo-step">{s}</span>
                  ))}
                </div>
              </div>
              <button className="demo-close" onClick={() => setBannerDismissed(true)}>×</button>
            </div>
          )}

          {/* Participants */}
          <div className="section-label">Market Participants</div>
          <div className="trader-grid">
            {TRADERS.map(trader => {
              const isBuyer = selectedBuyer?.address === trader.address;
              const isSeller = selectedSeller?.address === trader.address;
              return (
                <div key={trader.address} className="trader-card"
                  style={{ borderColor: isBuyer ? 'rgba(52,211,153,0.4)' : isSeller ? 'rgba(251,191,36,0.4)' : undefined, boxShadow: isBuyer ? '0 0 24px rgba(52,211,153,0.08)' : isSeller ? '0 0 24px rgba(251,191,36,0.08)' : undefined }}>
                  <div className="trader-card-accent" style={{ background: `linear-gradient(90deg, ${trader.accent}, transparent)` }} />
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="trader-avatar" style={{ background: `${trader.accent}18`, border: `1px solid ${trader.accent}30`, color: trader.accent }}>
                        {trader.initials}
                      </div>
                      <div>
                        <p className="trader-name">{trader.name}</p>
                        <span className="trader-role-badge" style={{ background: `${trader.accent}15`, color: trader.accent, border: `1px solid ${trader.accent}35` }}>{trader.role}</span>
                      </div>
                    </div>
                    {(isBuyer || isSeller) && (
                      <span className="selected-badge" style={{ background: isBuyer ? 'rgba(52,211,153,0.12)' : 'rgba(251,191,36,0.12)', color: isBuyer ? 'var(--emerald)' : 'var(--gold)', border: `1px solid ${isBuyer ? 'rgba(52,211,153,0.3)' : 'rgba(251,191,36,0.3)'}` }}>
                        {isBuyer ? 'Buyer' : 'Seller'}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                    <div className="balance-row">
                      <div className="balance-label"><span className="mono" style={{ fontSize: '0.9rem' }}>₹</span> Cash Balance</div>
                      <BalanceBadge value={balances[trader.address]?.inr} prev={prevBalances[trader.address]?.inr} />
                    </div>
                    <div className="balance-row">
                      <div className="balance-label"><BarChart3 size={12} /> {selectedCompany.symbol} Shares</div>
                      <BalanceBadge value={balances[trader.address]?.reliance} prev={prevBalances[trader.address]?.reliance} />
                    </div>
                  </div>
                  <div className="role-btn-grid">
                    <button onClick={() => { if (isBuyer) { setSelectedBuyer(null); return; } if (selectedSeller?.address === trader.address) return; setSelectedBuyer(trader); }}
                      disabled={loading || selectedSeller?.address === trader.address}
                      className={`role-btn ${isBuyer ? 'buyer-active' : 'buyer-idle'}`}>
                      {isBuyer ? '✓ Buyer' : 'Set as Buyer'}
                    </button>
                    <button onClick={() => { if (isSeller) { setSelectedSeller(null); return; } if (selectedBuyer?.address === trader.address) return; setSelectedSeller(trader); }}
                      disabled={loading || selectedBuyer?.address === trader.address}
                      className={`role-btn ${isSeller ? 'seller-active' : 'seller-idle'}`}>
                      {isSeller ? '✓ Seller' : 'Set as Seller'}
                    </button>
                  </div>
                  <div className="btn-grid">
                    <button className="btn-outline" onClick={() => handleDeposit(trader.address, 100000)} disabled={loading}>+ ₹1L Demo</button>
                    <button className="btn-outline" onClick={() => handleMintSecurities(trader.address, 50)} disabled={loading}>+ 50 Shares</button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Trade Flow Strip */}
          {(selectedBuyer || selectedSeller) && (
            <div className="trade-flow">
              <div className={`flow-pill ${selectedBuyer ? 'buyer' : 'empty'}`}>
                {selectedBuyer ? selectedBuyer.name : '— Select Buyer'}
                <span style={{ fontSize: '0.68rem', opacity: 0.6 }}>buys</span>
              </div>
              <ArrowRight size={16} color="var(--text-muted)" />
              <div className="flow-center">
                <p className="flow-center-symbol">{selectedCompany.symbol}</p>
                <p className="flow-center-desc">instant swap</p>
              </div>
              <ArrowRight size={16} color="var(--text-muted)" />
              <div className={`flow-pill ${selectedSeller ? 'seller' : 'empty'}`}>
                <span style={{ fontSize: '0.68rem', opacity: 0.6 }}>from</span>
                {selectedSeller ? selectedSeller.name : 'Select Seller —'}
              </div>
              {readyToTrade && (
                <span className="tag" style={{ color: 'var(--emerald)', borderColor: 'rgba(52,211,153,0.3)', background: 'rgba(52,211,153,0.07)', marginLeft: 8 }}>✓ Ready</span>
              )}
            </div>
          )}

          {/* Execution + Impact */}
          <div className="section-label">Trade Execution</div>
          <div className="bottom-grid">
            <div className="panel">
              <div className="panel-glow" />
              <div className="panel-title"><TrendingUp size={17} color="var(--gold)" /> Configure Your Trade</div>
              <div className="form-grid">
                <div className="form-group">
                  <label>Stock</label>
                  <CompanySelector selected={selectedCompany} onChange={setSelectedCompany} />
                </div>
                <div className="form-group">
                  <label>Quantity (Shares)</label>
                  <input type="number" className="form-input" value={tradeDetails.amount} onChange={e => setTradeDetails({ ...tradeDetails, amount: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Price per Share (₹)</label>
                  <input type="number" className="form-input gold" value={tradeDetails.price} onChange={e => setTradeDetails({ ...tradeDetails, price: e.target.value })} />
                </div>
              </div>
              <div className="trade-footer">
                <div>
                  <p className="trade-total-label">Total Transaction Value</p>
                  <p className="trade-total-value">₹{fmt(total)}</p>
                  {readyToTrade && (
                    <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 4 }}>
                      <span style={{ color: 'var(--emerald)' }}>{selectedBuyer.name}</span> <span>buys from</span> <span style={{ color: 'var(--gold)' }}>{selectedSeller.name}</span>
                    </p>
                  )}
                  {!readyToTrade && <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 4 }}>↑ Select Buyer & Seller from the cards above</p>}
                </div>
                <button className={`btn-execute ${!readyToTrade ? 'not-ready' : ''}`} onClick={handleSettle} disabled={loading || !readyToTrade}>
                  {loading ? <><Activity size={17} className="spin" /> Processing…</> : <><Zap size={17} /> Execute Instant Trade</>}
                </button>
              </div>
            </div>

            <div className="panel" style={{ background: 'var(--bg-surface)' }}>
              <div className="panel-title"><TrendingUp size={17} color="var(--sky)" /> Why T+0 Matters</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { accent: 'var(--sky)', icon: <Clock size={11} />, label: 'Settlement Speed', old: 'T+1 (24 Hours)', now: '< 2 Seconds', color: 'var(--sky)' },
                  { accent: 'var(--emerald)', icon: <Zap size={11} />, label: 'Capital Efficiency', now: '100% Instantly Freed', desc: 'Solves ₹6L Cr frozen capital issue', color: 'var(--emerald)' },
                  { accent: 'var(--gold)', icon: <ShieldCheck size={11} />, label: 'Counterparty Risk', now: 'Zero Risk', desc: 'Shares & cash swap simultaneously', color: 'var(--gold)' },
                ].map(m => (
                  <div key={m.label} className="metric-card">
                    <div className="metric-card-accent" style={{ background: m.accent }} />
                    <div className="metric-label">{m.icon} {m.label}</div>
                    {m.old && <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}><span className="metric-old">{m.old}</span><span className="metric-new" style={{ color: m.color }}>{m.now}</span></div>}
                    {!m.old && <div className="metric-new" style={{ color: m.color }}>{m.now}</div>}
                    {m.desc && <div className="metric-desc">{m.desc}</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Progress panels */}
          {(timelineActive || timelineStep > 0 || lastTx || isSettling || settlementTime) && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1.25rem', marginBottom: '1.25rem' }}>
              <TradeProgress currentStep={timelineStep} isActive={timelineActive} />
              <BlockchainConfirmation txHash={lastTx?.txHash} blockNumber={lastTx?.blockNumber} confirmationTime={lastTx?.confirmationTime} />
              <SettlementComparison settlementTime={settlementTime} isSettling={isSettling} />
            </div>
          )}

          {/* History */}
          <div className="section-label">Trade History</div>
          <SettlementHistory history={settlementHistory} />

          <footer className="footer">Built for Horizon 1.0 &nbsp;•&nbsp; Vidyavardhini's College of Engineering and Technology</footer>
        </div>
      </div>
    </>
  );
}