import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  CreditCard,
  Wallet,
  Calendar,
  X,
  ArrowLeft,
} from "lucide-react";

/* ─── Styles ─── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&family=Syne:wght@700;800&family=DM+Mono:wght@400;500&display=swap');

  @keyframes hv-fade-up {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .hv-root * { box-sizing: border-box; margin: 0; padding: 0; }

  .hv-page {
    font-family: 'DM Sans', sans-serif;
    min-height: 100svh;
    background: #09090b;
    background-image:
      radial-gradient(ellipse 70% 50% at 20% -5%, rgba(29,78,216,0.09) 0%, transparent 65%),
      radial-gradient(ellipse 50% 40% at 85% 85%, rgba(29,78,216,0.05) 0%, transparent 60%);
    color: #ffffff;
    padding: 28px 24px 48px;
    animation: hv-fade-up 0.45s cubic-bezier(.22,1,.36,1) both;
  }

  /* ── Top bar ── */
  .hv-topbar {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 28px;
  }
  .hv-topbar-left { display: flex; flex-direction: column; gap: 4px; }
  .hv-section-label {
    font-size: 11px; font-weight: 500; letter-spacing: 0.14em;
    text-transform: uppercase; color: rgba(255,255,255,0.3);
  }
  .hv-title {
    font-family: 'Syne', sans-serif;
    font-size: 22px; font-weight: 800; letter-spacing: 0.03em;
  }
  .hv-title span { color: #fbcfe8; }
  .hv-back-btn {
    width: 40px; height: 40px; border-radius: 12px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: background 0.2s, color 0.2s;
    color: rgba(255,255,255,0.4);
  }
  .hv-back-btn:hover { background: rgba(255,255,255,0.08); color: #ffffff; }

  /* ── Summary strip ── */
  .hv-summary {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    margin-bottom: 24px;
  }
  @media (max-width: 480px) {
    .hv-summary { grid-template-columns: 1fr; }
  }
  .hv-sum-card {
    background: #18181b;
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 16px;
    padding: 16px;
    display: flex; flex-direction: column; gap: 6px;
  }
  .hv-sum-label {
    font-size: 10px; font-weight: 500; letter-spacing: 0.12em;
    text-transform: uppercase; color: rgba(255,255,255,0.3);
  }
  .hv-sum-val {
    font-family: 'Syne', sans-serif;
    font-size: 16px; font-weight: 700;
  }
  .hv-sum-val.neutral { color: #ffffff; }
  .hv-sum-val.income  { color: #10b981; }
  .hv-sum-val.expense { color: #f9a8d4; }

  /* ── Filter bar ── */
  .hv-filter {
    display: flex; align-items: center; gap: 10px;
    margin-bottom: 20px; flex-wrap: wrap;
  }
  .hv-filter-group {
    display: flex; align-items: center; gap: 8px;
    background: #18181b;
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px; padding: 9px 14px;
    flex: 1; min-width: 160px;
    transition: border-color 0.2s;
  }
  .hv-filter-group:focus-within { border-color: rgba(251,207,232,0.4); }
  .hv-filter-icon { color: rgba(255,255,255,0.3); flex-shrink: 0; }
  .hv-filter-group input[type="date"] {
    background: transparent; border: none; outline: none;
    color: #ffffff;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px; width: 100%; cursor: pointer;
    color-scheme: dark;
  }
  .hv-filter-sep { color: rgba(255,255,255,0.2); font-size: 13px; flex-shrink: 0; }
  .hv-clear-btn {
    width: 38px; height: 38px; border-radius: 10px;
    background: rgba(251,207,232,0.08);
    border: 1px solid rgba(251,207,232,0.15);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; color: #f9a8d4; flex-shrink: 0;
    transition: background 0.2s;
  }
  .hv-clear-btn:hover { background: rgba(251,207,232,0.18); }

  /* ── Tabs ── */
  .hv-tabs { display: flex; gap: 6px; margin-bottom: 20px; }
  .hv-tab {
    padding: 7px 16px; border-radius: 10px;
    font-size: 12px; font-weight: 500; letter-spacing: 0.02em;
    cursor: pointer; border: 1px solid rgba(255,255,255,0.08);
    background: #18181b; color: rgba(255,255,255,0.4);
    transition: all 0.2s;
  }
  .hv-tab:hover:not(.active) { background: rgba(255,255,255,0.08); color: #ffffff; }
  .hv-tab.active {
    background: rgba(251,207,232,0.15);
    border-color: rgba(251,207,232,0.25);
    color: #f9a8d4;
  }

  /* ── Group ── */
  .hv-group { margin-bottom: 20px; }
  .hv-group-title {
    font-size: 11px; font-weight: 500; letter-spacing: 0.14em;
    text-transform: uppercase; color: rgba(255,255,255,0.3);
    margin-bottom: 10px; padding-left: 4px;
  }

  /* ── Transaction list ── */
  .hv-tx-wrap {
    background: #18181b;
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 16px; overflow: hidden;
  }
  .hv-tx-item {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 16px; cursor: pointer;
    transition: background 0.2s;
    border-bottom: 1px solid rgba(255,255,255,0.04);
  }
  .hv-tx-item:last-child { border-bottom: none; }
  .hv-tx-item:hover { background: rgba(255,255,255,0.04); }

  .hv-tx-left { display: flex; align-items: center; gap: 12px; }
  .hv-tx-icon {
    width: 38px; height: 38px; border-radius: 11px;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .hv-tx-icon.in      { background: rgba(74,222,128,0.09);  color: #10b981; }
  .hv-tx-icon.out     { background: rgba(251,207,232,0.10);   color: #f9a8d4; }
  .hv-tx-icon.payment { background: rgba(96,165,250,0.09);  color: #60a5fa; }

  .hv-tx-name {
    font-size: 13px; font-weight: 500;
    color: #ffffff; margin-bottom: 2px;
  }
  .hv-tx-date {
    font-size: 11px; color: rgba(255,255,255,0.3);
    font-family: 'DM Mono', monospace; letter-spacing: 0.03em;
  }

  .hv-tx-right { text-align: right; }
  .hv-tx-amount {
    font-family: 'Syne', sans-serif;
    font-size: 13px; font-weight: 700;
  }
  .hv-tx-amount.in  { color: #10b981; }
  .hv-tx-amount.out { color: rgba(255,255,255,0.65); }

  .hv-tx-badge {
    font-size: 10px; font-weight: 500; letter-spacing: 0.06em;
    padding: 2px 7px; border-radius: 6px; margin-top: 4px;
    display: inline-block;
  }
  .hv-tx-badge.payment  { background: rgba(96,165,250,0.10);  color: #60a5fa; border: 1px solid rgba(96,165,250,0.15); }
  .hv-tx-badge.topup    { background: rgba(74,222,128,0.08);  color: #10b981; border: 1px solid rgba(74,222,128,0.13); }
  .hv-tx-badge.transfer { background: rgba(192,132,252,0.08); color: #c084fc; border: 1px solid rgba(192,132,252,0.13); }

  /* ── Empty state ── */
  .hv-empty {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; padding: 64px 24px;
    color: rgba(255,255,255,0.2); gap: 12px; text-align: center;
  }
  .hv-empty p { font-size: 13px; }
  .hv-empty-reset {
    font-size: 12px; color: #f9a8d4; background: none;
    border: none; cursor: pointer; margin-top: 4px; transition: color 0.15s;
  }
  .hv-empty-reset:hover { color: #fca5a5; }
`;

function StyleTag() {
  return <style dangerouslySetInnerHTML={{ __html: styles }} />;
}

/* ─── Helpers ─── */
const MONTHS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];
const MONTHS_SHT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agt",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

function fmtMonthYear(d) {
  const dt = new Date(d);
  return `${MONTHS[dt.getMonth()]} ${dt.getFullYear()}`;
}
function fmtDateTime(d) {
  const dt = new Date(d);
  const day = String(dt.getDate()).padStart(2, "0");
  return `${day} ${MONTHS_SHT[dt.getMonth()]} ${dt.getFullYear()} · ${dt.toTimeString().slice(0, 5)} WIB`;
}
function fmtRp(n) {
  return "Rp " + n.toLocaleString("id-ID");
}

function TxIcon({ type, category }) {
  if (type === "incoming")
    return (
      <div className="hv-tx-icon in">
        <Wallet size={16} strokeWidth={1.75} />
      </div>
    );
  if (category === "payment")
    return (
      <div className="hv-tx-icon payment">
        <CreditCard size={16} strokeWidth={1.75} />
      </div>
    );
  return (
    <div className="hv-tx-icon out">
      <ArrowUpRight size={16} strokeWidth={1.75} />
    </div>
  );
}

/* ─── Data ─── */
const ALL_TRANSACTIONS = [
  {
    id: 1,
    type: "outgoing",
    title: "Pembayaran ke MRT Jakarta",
    date: "2023-01-11T08:27:17",
    amount: 5000,
    category: "payment",
  },
  {
    id: 2,
    type: "incoming",
    title: "Top-up",
    date: "2023-01-10T15:27:17",
    amount: 300000,
    category: "topup",
  },
  {
    id: 3,
    type: "outgoing",
    title: "Pembayaran ke MRT Jakarta",
    date: "2023-01-04T18:27:17",
    amount: 11000,
    category: "payment",
  },
  {
    id: 4,
    type: "outgoing",
    title: "Pembayaran",
    date: "2023-01-04T15:27:17",
    amount: 5000,
    category: "payment",
  },
  {
    id: 5,
    type: "incoming",
    title: "Top-up",
    date: "2023-01-04T16:00:00",
    amount: 20000,
    category: "topup",
  },
  {
    id: 6,
    type: "outgoing",
    title: "Pembayaran ke MRT Jakarta",
    date: "2023-01-04T07:30:17",
    amount: 5000,
    category: "payment",
  },
  {
    id: 7,
    type: "outgoing",
    title: "Transfer ke Budi",
    date: "2023-02-15T10:00:00",
    amount: 50000,
    category: "transfer",
  },
  {
    id: 8,
    type: "incoming",
    title: "Terima Dana",
    date: "2023-02-10T09:15:00",
    amount: 150000,
    category: "topup",
  },
  {
    id: 9,
    type: "outgoing",
    title: "Pembayaran Listrik",
    date: "2026-05-10T08:00:00",
    amount: 250000,
    category: "payment",
  },
];

const TABS = [
  { key: "all", label: "Semua" },
  { key: "incoming", label: "Masuk" },
  { key: "outgoing", label: "Keluar" },
];

/* ─── Main Component ─── */
export default function HistoryPage() {
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const filtered = useMemo(() => {
    return ALL_TRANSACTIONS.filter((t) => {
      if (activeTab !== "all" && t.type !== activeTab) return false;
      if (!startDate && !endDate) return true;
      const ts = new Date(t.date).getTime();
      const s = startDate ? new Date(startDate).setHours(0, 0, 0, 0) : 0;
      const e = endDate
        ? new Date(endDate).setHours(23, 59, 59, 999)
        : Infinity;
      return ts >= s && ts <= e;
    });
  }, [startDate, endDate, activeTab]);

  const totalIn = filtered
    .filter((t) => t.type === "incoming")
    .reduce((a, b) => a + b.amount, 0);
  const totalOut = filtered
    .filter((t) => t.type === "outgoing")
    .reduce((a, b) => a + b.amount, 0);

  const grouped = filtered.reduce((acc, t) => {
    const key = fmtMonthYear(t.date);
    if (!acc[key]) acc[key] = [];
    acc[key].push(t);
    return acc;
  }, {});

  const clearFilter = () => {
    setStartDate("");
    setEndDate("");
  };
  const hasFilter = startDate || endDate;

  return (
    <div className="hv-root">
      <StyleTag />
      <div className="hv-page">
        {/* Top bar */}
        <div className="hv-topbar">
          <div className="hv-topbar-left">
            <span className="hv-section-label">Rekening aktif</span>
            <span className="hv-title">
              Riwayat<span>.</span>
            </span>
          </div>
          <button
            className="hv-back-btn"
            onClick={() => navigate(-1)}
            aria-label="Kembali"
          >
            <ArrowLeft size={18} strokeWidth={1.75} />
          </button>
        </div>

        {/* Summary strip */}
        <div className="hv-summary">
          <div className="hv-sum-card">
            <span className="hv-sum-label">Total transaksi</span>
            <span className="hv-sum-val neutral">{filtered.length}</span>
          </div>
          <div className="hv-sum-card">
            <span className="hv-sum-label">Total masuk</span>
            <span className="hv-sum-val income">{fmtRp(totalIn)}</span>
          </div>
          <div className="hv-sum-card">
            <span className="hv-sum-label">Total keluar</span>
            <span className="hv-sum-val expense">{fmtRp(totalOut)}</span>
          </div>
        </div>

        {/* Filter bar */}
        <div className="hv-filter">
          <div className="hv-filter-group">
            <Calendar size={14} className="hv-filter-icon" strokeWidth={1.75} />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              title="Dari tanggal"
            />
          </div>
          <span className="hv-filter-sep">—</span>
          <div className="hv-filter-group">
            <Calendar size={14} className="hv-filter-icon" strokeWidth={1.75} />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              title="Sampai tanggal"
            />
          </div>
          {hasFilter && (
            <button
              className="hv-clear-btn"
              onClick={clearFilter}
              aria-label="Hapus filter"
            >
              <X size={15} strokeWidth={2} />
            </button>
          )}
        </div>

        {/* Type tabs */}
        <div className="hv-tabs">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              className={`hv-tab${activeTab === tab.key ? " active" : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Transaction list */}
        {Object.keys(grouped).length === 0 ? (
          <div className="hv-empty">
            <p>Tidak ada transaksi ditemukan.</p>
            {hasFilter && (
              <button className="hv-empty-reset" onClick={clearFilter}>
                Hapus filter
              </button>
            )}
          </div>
        ) : (
          Object.keys(grouped).map((month) => (
            <div key={month} className="hv-group">
              <p className="hv-group-title">{month}</p>
              <div className="hv-tx-wrap">
                {grouped[month].map((t) => (
                  <div key={t.id} className="hv-tx-item">
                    <div className="hv-tx-left">
                      <TxIcon type={t.type} category={t.category} />
                      <div>
                        <p className="hv-tx-name">{t.title}</p>
                        <p className="hv-tx-date">{fmtDateTime(t.date)}</p>
                      </div>
                    </div>
                    <div className="hv-tx-right">
                      <p
                        className={`hv-tx-amount ${t.type === "incoming" ? "in" : "out"}`}
                      >
                        {t.type === "incoming" ? "+" : "−"} {fmtRp(t.amount)}
                      </p>
                      <span className={`hv-tx-badge ${t.category}`}>
                        {t.category}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
