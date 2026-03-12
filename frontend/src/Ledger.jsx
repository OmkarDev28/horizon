import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  ArrowLeft,
  BookOpen,
  Activity,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  BarChart3,
  Users,
  TrendingUp,
  Zap,
  RefreshCw,
  Filter,
  Clock,
} from "lucide-react";

const API_BASE = "https://intuitional-accustomably-ross.ngrok-free.dev";

const TRADERS = [
  { name: "Retail Trader", address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", accent: "#34d399" },
  { name: "Institutional Fund", address: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", accent: "#fbbf24" },
  { name: "Clearing Corp", address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", accent: "#38bdf8" },
];

const ledgerStyles = `
  .ledger-wrap {
    min-height: 100vh;
    background-color: #080c0a;
    background-image:
      linear-gradient(rgba(52,211,153,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(52,211,153,0.04) 1px, transparent 1px);
    background-size: 40px 40px;
    padding: 1.5rem;
    font-family: 'Syne', sans-serif;
    color: #e8f5f0;
  }

  .ledger-container { max-width: 1280px; margin: 0 auto; }

  .ledger-header {
    background: linear-gradient(135deg, #111a14 0%, #162019 100%);
    border: 1px solid rgba(52,211,153,0.15);
    border-radius: 16px;
    padding: 1.5rem 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    position: relative;
    overflow: hidden;
    margin-bottom: 1.25rem;
  }
  .ledger-header::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, #34d399, transparent);
  }

  .back-btn {
    display: flex; align-items: center; gap: 7px;
    padding: 9px 16px;
    border: 1px solid rgba(52,211,153,0.15);
    border-radius: 8px;
    background: transparent;
    color: #8aab96;
    font-family: 'Syne', sans-serif;
    font-size: 0.82rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }
  .back-btn:hover { border-color: #34d399; color: #34d399; background: rgba(52,211,153,0.06); }

  .refresh-btn {
    display: flex; align-items: center; gap: 7px;
    padding: 9px 16px;
    border: 1px solid rgba(52,211,153,0.15);
    border-radius: 8px;
    background: transparent;
    color: #8aab96;
    font-family: 'Syne', sans-serif;
    font-size: 0.82rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }
  .refresh-btn:hover { border-color: #34d399; color: #34d399; background: rgba(52,211,153,0.06); }
  .refresh-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
    margin-bottom: 1.25rem;
  }
  @media (max-width: 900px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
  @media (max-width: 500px) { .stats-grid { grid-template-columns: 1fr; } }

  .stat-card {
    background: #111a14;
    border: 1px solid rgba(52,211,153,0.08);
    border-radius: 14px;
    padding: 1.25rem 1.5rem;
    position: relative;
    overflow: hidden;
    transition: border-color 0.2s;
  }
  .stat-card:hover { border-color: rgba(52,211,153,0.2); }
  .stat-card-line { position: absolute; top: 0; left: 0; right: 0; height: 2px; }
  .stat-label { font-family: 'JetBrains Mono', monospace; font-size: 0.65rem; color: #4a6657; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px; display: flex; align-items: center; gap: 5px; }
  .stat-value { font-family: 'JetBrains Mono', monospace; font-size: 1.4rem; font-weight: 700; }
  .stat-sub { font-family: 'JetBrains Mono', monospace; font-size: 0.7rem; color: #4a6657; margin-top: 4px; }

  .filter-bar {
    background: #111a14;
    border: 1px solid rgba(52,211,153,0.08);
    border-radius: 12px;
    padding: 1rem 1.5rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
    flex-wrap: wrap;
  }

  .filter-label { font-family: 'JetBrains Mono', monospace; font-size: 0.7rem; color: #4a6657; text-transform: uppercase; letter-spacing: 0.1em; display: flex; align-items: center; gap: 5px; }

  .filter-select {
    padding: 7px 12px;
    background: #080c0a;
    border: 1px solid rgba(52,211,153,0.1);
    border-radius: 8px;
    color: #8aab96;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.78rem;
    cursor: pointer;
    outline: none;
    transition: border-color 0.2s;
  }
  .filter-select:focus { border-color: rgba(52,211,153,0.3); }

  .tx-count { font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; color: #4a6657; margin-left: auto; }

  .tx-table-wrap {
    background: #111a14;
    border: 1px solid rgba(52,211,153,0.08);
    border-radius: 16px;
    overflow: hidden;
    position: relative;
  }
  .tx-table-wrap::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(52,211,153,0.2), transparent);
  }

  .tx-table { width: 100%; border-collapse: collapse; }

  .tx-thead th {
    padding: 1rem 1.25rem;
    text-align: left;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.62rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: #4a6657;
    border-bottom: 1px solid rgba(52,211,153,0.06);
    background: rgba(8,12,10,0.5);
    white-space: nowrap;
  }

  .tx-row {
    border-bottom: 1px solid rgba(52,211,153,0.04);
    transition: background 0.15s;
    cursor: default;
  }
  .tx-row:last-child { border-bottom: none; }
  .tx-row:hover { background: rgba(52,211,153,0.03); }

  .tx-cell {
    padding: 1rem 1.25rem;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.8rem;
    color: #8aab96;
    vertical-align: middle;
    white-space: nowrap;
  }

  .tx-hash {
    color: #34d399;
    display: flex; align-items: center; gap: 6px;
    text-decoration: none;
    transition: opacity 0.2s;
  }
  .tx-hash:hover { opacity: 0.7; }

  .address-chip {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 3px 8px;
    border-radius: 6px;
    font-size: 0.72rem;
    font-family: 'JetBrains Mono', monospace;
  }

  .status-pill {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 4px 10px;
    border-radius: 100px;
    font-size: 0.68rem;
    font-weight: 700;
    font-family: 'JetBrains Mono', monospace;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
  .status-pill.confirmed { background: rgba(52,211,153,0.1); color: #34d399; border: 1px solid rgba(52,211,153,0.25); }
  .status-pill.failed { background: rgba(248,113,113,0.1); color: #f87171; border: 1px solid rgba(248,113,113,0.25); }

  .amount-value { color: #e8f5f0; font-weight: 600; }
  .price-value { color: #fbbf24; font-weight: 600; }

  .empty-state {
    padding: 4rem 2rem;
    text-align: center;
    color: #4a6657;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.85rem;
  }

  .loading-row td {
    padding: 3rem 1.25rem;
    text-align: center;
  }

  .spin { animation: spin 1s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }

  .ledger-section-label {
    font-size: 0.65rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    color: #4a6657;
    font-family: 'JetBrains Mono', monospace;
    margin-bottom: 0.75rem;
    padding-left: 2px;
  }
`;

function shortAddr(addr) {
  if (!addr) return "—";
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function shortHash(hash) {
  if (!hash) return "—";
  return `${hash.slice(0, 10)}…${hash.slice(-6)}`;
}

function getTrader(addr) {
  return TRADERS.find((t) => t.address.toLowerCase() === addr?.toLowerCase());
}

function formatINR(num) {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(Number(num) || 0);
}

function formatTimestamp(ts) {
  if (!ts) return "—";
  const d = new Date(ts);
  return d.toLocaleString("en-IN", { dateStyle: "short", timeStyle: "medium" });
}

export default function Ledger({ onBack }) {
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterAddress, setFilterAddress] = useState("all");

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = filterAddress !== "all" ? { address: filterAddress } : {};
      const [txRes, statsRes] = await Promise.all([
        axios.get(`${API_BASE}/transactions`, { params }),
        axios.get(`${API_BASE}/stats`),
      ]);
      setTransactions(txRes.data);
      setStats(statsRes.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [filterAddress]);

  return (
    <>
      <style>{ledgerStyles}</style>
      <div className="ledger-wrap">
        <div className="ledger-container">
          {/* Header */}
          <header className="ledger-header">
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", position: "relative", zIndex: 1 }}>
              <button className="back-btn" onClick={onBack}>
                <ArrowLeft size={14} /> Dashboard
              </button>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <BookOpen size={20} color="#34d399" />
                <div>
                  <div style={{ fontSize: "1.1rem", fontWeight: 800, letterSpacing: "-0.01em", color: "#e8f5f0" }}>
                    Transaction Ledger
                  </div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.7rem", color: "#34d399", opacity: 0.8 }}>
                    On-chain DvP Settlement Records
                  </div>
                </div>
              </div>
            </div>
            <button className="refresh-btn" onClick={fetchData} disabled={loading} style={{ position: "relative", zIndex: 1 }}>
              <RefreshCw size={14} className={loading ? "spin" : ""} /> Refresh
            </button>
          </header>

          {/* Stats */}
          {stats && (
            <>
              <div className="ledger-section-label">System Statistics</div>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-card-line" style={{ background: "linear-gradient(90deg, #34d399, transparent)" }} />
                  <div className="stat-label"><Activity size={10} /> Total Settlements</div>
                  <div className="stat-value" style={{ color: "#34d399" }}>{stats.totalSettlements}</div>
                  <div className="stat-sub">atomic swaps executed</div>
                </div>
                <div className="stat-card">
                  <div className="stat-card-line" style={{ background: "linear-gradient(90deg, #fbbf24, transparent)" }} />
                  <div className="stat-label"><TrendingUp size={10} /> Total Volume</div>
                  <div className="stat-value" style={{ color: "#fbbf24", fontSize: "1.1rem" }}>₹{formatINR(stats.totalVolume)}</div>
                  <div className="stat-sub">INR settled on-chain</div>
                </div>
                <div className="stat-card">
                  <div className="stat-card-line" style={{ background: "linear-gradient(90deg, #38bdf8, transparent)" }} />
                  <div className="stat-label"><Users size={10} /> Participants</div>
                  <div className="stat-value" style={{ color: "#38bdf8" }}>{stats.uniqueParticipants}</div>
                  <div className="stat-sub">unique addresses</div>
                </div>
                <div className="stat-card">
                  <div className="stat-card-line" style={{ background: "linear-gradient(90deg, #a78bfa, transparent)" }} />
                  <div className="stat-label"><BarChart3 size={10} /> RELIANCE Supply</div>
                  <div className="stat-value" style={{ color: "#a78bfa" }}>{stats.relianceTotalSupply}</div>
                  <div className="stat-sub">tokenized shares</div>
                </div>
              </div>
            </>
          )}

          {/* Filter */}
          <div className="filter-bar">
            <span className="filter-label"><Filter size={10} /> Filter by Participant</span>
            <select
              className="filter-select"
              value={filterAddress}
              onChange={(e) => setFilterAddress(e.target.value)}
            >
              <option value="all">All Participants</option>
              {TRADERS.map((t) => (
                <option key={t.address} value={t.address}>
                  {t.name} ({shortAddr(t.address)})
                </option>
              ))}
            </select>
            {!loading && (
              <span className="tx-count">{transactions.length} record{transactions.length !== 1 ? "s" : ""}</span>
            )}
          </div>

          {/* Table */}
          <div className="ledger-section-label">Settlement Records</div>
          <div className="tx-table-wrap">
            {error ? (
              <div className="empty-state">
                <AlertTriangle size={24} color="#f87171" style={{ margin: "0 auto 0.75rem", display: "block" }} />
                <div style={{ color: "#f87171" }}>Failed to load: {error}</div>
              </div>
            ) : (
              <table className="tx-table">
                <thead className="tx-thead">
                  <tr>
                    <th>Tx Hash</th>
                    <th>Time</th>
                    <th>Seller</th>
                    <th>Buyer</th>
                    <th>Shares</th>
                    <th>Value (INR)</th>
                    <th>Block</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr className="loading-row">
                      <td colSpan={8}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", color: "#4a6657", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.8rem" }}>
                          <Activity size={16} color="#38bdf8" className="spin" /> Loading transactions…
                        </div>
                      </td>
                    </tr>
                  ) : transactions.length === 0 ? (
                    <tr>
                      <td colSpan={8}>
                        <div className="empty-state">
                          <Zap size={22} color="#4a6657" style={{ margin: "0 auto 0.75rem", display: "block" }} />
                          No settlement records found.
                          {filterAddress !== "all" && " Try removing the participant filter."}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    transactions.map((tx) => {
                      const seller = getTrader(tx.seller);
                      const buyer = getTrader(tx.buyer);
                      return (
                        <tr key={tx.txHash} className="tx-row">
                          <td className="tx-cell">
                            <a
                              className="tx-hash"
                              href={`https://etherscan.io/tx/${tx.txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title={tx.txHash}
                            >
                              {shortHash(tx.txHash)}
                              <ExternalLink size={11} />
                            </a>
                          </td>
                          <td className="tx-cell">
                            <div style={{ display: "flex", alignItems: "center", gap: "5px", color: "#4a6657" }}>
                              <Clock size={11} />
                              {formatTimestamp(tx.timestamp)}
                            </div>
                          </td>
                          <td className="tx-cell">
                            <span
                              className="address-chip"
                              style={{
                                background: seller ? `${seller.accent}15` : "rgba(74,102,87,0.15)",
                                color: seller ? seller.accent : "#4a6657",
                                border: `1px solid ${seller ? seller.accent + "30" : "rgba(74,102,87,0.2)"}`,
                              }}
                            >
                              {seller ? seller.name : shortAddr(tx.seller)}
                            </span>
                          </td>
                          <td className="tx-cell">
                            <span
                              className="address-chip"
                              style={{
                                background: buyer ? `${buyer.accent}15` : "rgba(74,102,87,0.15)",
                                color: buyer ? buyer.accent : "#4a6657",
                                border: `1px solid ${buyer ? buyer.accent + "30" : "rgba(74,102,87,0.2)"}`,
                              }}
                            >
                              {buyer ? buyer.name : shortAddr(tx.buyer)}
                            </span>
                          </td>
                          <td className="tx-cell">
                            <span className="amount-value">{tx.amount}</span>
                            <span style={{ color: "#4a6657", marginLeft: "4px", fontSize: "0.7rem" }}>RLNC</span>
                          </td>
                          <td className="tx-cell">
                            <span className="price-value">₹{formatINR(tx.totalValue)}</span>
                          </td>
                          <td className="tx-cell" style={{ color: "#4a6657" }}>
                            #{tx.blockNumber}
                          </td>
                          <td className="tx-cell">
                            <span className="status-pill confirmed">
                              <CheckCircle2 size={10} /> Settled
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            )}
          </div>

          <div style={{ textAlign: "center", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.7rem", color: "#4a6657", padding: "1.5rem 0 0.5rem", borderTop: "1px solid rgba(52,211,153,0.06)", marginTop: "1.25rem" }}>
            Built for Horizon 1.0 &nbsp;•&nbsp; Vidyavardhini's College of Engineering and Technology
          </div>
        </div>
      </div>
    </>
  );
}