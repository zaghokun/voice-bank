import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  CreditCard,
  Wallet,
  Calendar,
  X,
  ArrowLeft,
} from "lucide-react";
import { getTransactions } from "../services/transactionService";
import { tts } from "../services/ttsService";

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
      <div className="w-[38px] h-[38px] rounded-xl flex items-center justify-center flex-shrink-0 bg-emerald-500/10 text-emerald-600 dark:text-emerald-500">
        <Wallet size={16} strokeWidth={1.75} />
      </div>
    );
  if (category === "payment")
    return (
      <div className="w-[38px] h-[38px] rounded-xl flex items-center justify-center flex-shrink-0 bg-blue-500/10 text-blue-500 dark:text-blue-400">
        <CreditCard size={16} strokeWidth={1.75} />
      </div>
    );
  return (
    <div className="w-[38px] h-[38px] rounded-xl flex items-center justify-center flex-shrink-0 bg-pink-500/10 dark:bg-[#fbcfe8]/10 text-pink-600 dark:text-[#f9a8d4]">
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

export default function HistoryPage() {
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTransactions()
      .then(txs => {
        // Map API response ke format yang dipakai komponen
        const mapped = txs.map(tx => ({
          id: tx.id,
          type: tx.type === 'tabung' ? 'incoming' : 'outgoing',
          title: tx.type === 'transfer'
            ? `Transfer ke ${tx.target_user || 'Penerima'}`
            : tx.type === 'tabung'
              ? 'Tabungan'
              : tx.type,
          date: tx.created_at,
          amount: tx.amount,
          category: tx.type === 'transfer' ? 'transfer' : tx.type === 'tabung' ? 'topup' : 'payment',
        }));
        setTransactions(mapped);
        tts.speak(`Riwayat transaksi. ${mapped.length} transaksi ditemukan.`);
      })
      .catch(() => tts.error('Gagal memuat riwayat transaksi'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (activeTab !== "all" && t.type !== activeTab) return false;
      if (!startDate && !endDate) return true;
      const ts = new Date(t.date).getTime();
      const s = startDate ? new Date(startDate).setHours(0, 0, 0, 0) : 0;
      const e = endDate
        ? new Date(endDate).setHours(23, 59, 59, 999)
        : Infinity;
      return ts >= s && ts <= e;
    });
  }, [transactions, startDate, endDate, activeTab]);

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
    <div className="min-h-screen bg-[#f4f4f5] dark:bg-[#09090b] bg-[radial-gradient(ellipse_70%_50%_at_20%_-5%,rgba(99,102,241,0.05)_0%,transparent_65%),radial-gradient(ellipse_50%_40%_at_85%_85%,rgba(244,114,182,0.04)_0%,transparent_60%)] dark:bg-[radial-gradient(ellipse_70%_50%_at_20%_-5%,rgba(29,78,216,0.09)_0%,transparent_65%),radial-gradient(ellipse_50%_40%_at_85%_85%,rgba(29,78,216,0.05)_0%,transparent_60%)] text-zinc-800 dark:text-white p-6 pb-12 animate-fade-up font-sans selection:bg-pink-500/10 dark:selection:bg-[#fbcfe8]/30">
      
      {/* Top bar */}
      <div className="flex items-center justify-between mb-7">
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-medium tracking-[0.14em] uppercase text-zinc-400 dark:text-white/30">Rekening aktif</span>
          <span className="font-syne text-[22px] font-extrabold tracking-[0.03em] text-zinc-800 dark:text-white">
            Riwayat<span className="text-pink-500 dark:text-[#fbcfe8]">.</span>
          </span>
        </div>
        <button
          className="w-10 h-10 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-800 dark:bg-white/4 dark:border-white/8 flex items-center justify-center cursor-pointer transition-colors dark:text-white/40 dark:hover:bg-white/8 dark:hover:text-white"
          onClick={() => navigate(-1)}
          aria-label="Kembali"
        >
          <ArrowLeft size={18} strokeWidth={1.75} />
        </button>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-6">
        <div className="bg-white border border-zinc-200 dark:bg-[#18181b] dark:border-white/8 rounded-2xl p-4 flex flex-col gap-1.5 shadow-sm dark:shadow-none">
          <span className="text-[10px] font-medium tracking-[0.12em] uppercase text-zinc-400 dark:text-white/30">Total transaksi</span>
          <span className="font-syne text-base font-bold text-zinc-800 dark:text-white">{filtered.length}</span>
        </div>
        <div className="bg-white border border-zinc-200 dark:bg-[#18181b] dark:border-white/8 rounded-2xl p-4 flex flex-col gap-1.5 shadow-sm dark:shadow-none">
          <span className="text-[10px] font-medium tracking-[0.12em] uppercase text-zinc-400 dark:text-white/30">Total masuk</span>
          <span className="font-syne text-base font-bold text-emerald-600 dark:text-emerald-500">{fmtRp(totalIn)}</span>
        </div>
        <div className="bg-white border border-zinc-200 dark:bg-[#18181b] dark:border-white/8 rounded-2xl p-4 flex flex-col gap-1.5 shadow-sm dark:shadow-none">
          <span className="text-[10px] font-medium tracking-[0.12em] uppercase text-zinc-400 dark:text-white/30">Total keluar</span>
          <span className="font-syne text-base font-bold text-pink-600 dark:text-[#f9a8d4]">{fmtRp(totalOut)}</span>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2.5 mb-5 flex-wrap">
        <div className="flex items-center gap-2 bg-white border border-zinc-200 dark:bg-[#18181b] dark:border-white/8 rounded-xl px-3.5 py-2.5 flex-1 min-w-[160px] transition-colors focus-within:border-pink-500/40 dark:focus-within:border-[#fbcfe8]/40 shadow-sm dark:shadow-none">
          <Calendar size={14} className="text-zinc-400 dark:text-white/30 flex-shrink-0" strokeWidth={1.75} />
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            title="Dari tanggal"
            className="bg-transparent border-none outline-none text-zinc-800 dark:text-white font-sans text-xs w-full cursor-pointer color-scheme-light dark:color-scheme-dark"
          />
        </div>
        <span className="text-zinc-300 dark:text-white/20 text-xs flex-shrink-0">—</span>
        <div className="flex items-center gap-2 bg-white border border-zinc-200 dark:bg-[#18181b] dark:border-white/8 rounded-xl px-3.5 py-2.5 flex-1 min-w-[160px] transition-colors focus-within:border-pink-500/40 dark:focus-within:border-[#fbcfe8]/40 shadow-sm dark:shadow-none">
          <Calendar size={14} className="text-zinc-400 dark:text-white/30 flex-shrink-0" strokeWidth={1.75} />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            title="Sampai tanggal"
            className="bg-transparent border-none outline-none text-zinc-800 dark:text-white font-sans text-xs w-full cursor-pointer color-scheme-light dark:color-scheme-dark"
          />
        </div>
        {hasFilter && (
          <button
            className="w-[38px] h-[38px] rounded-[10px] bg-pink-500/10 border border-pink-500/20 hover:bg-pink-500/20 text-pink-600 dark:bg-[#fbcfe8]/8 dark:border-[#fbcfe8]/15 dark:text-[#f9a8d4] dark:hover:bg-[#fbcfe8]/18 flex items-center justify-center cursor-pointer flex-shrink-0 transition-colors"
            onClick={clearFilter}
            aria-label="Hapus filter"
          >
            <X size={15} strokeWidth={2} />
          </button>
        )}
      </div>

      {/* Type tabs */}
      <div className="flex gap-1.5 mb-5">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`px-4 py-1.5 rounded-[10px] text-xs font-medium tracking-[0.02em] cursor-pointer border bg-white dark:bg-[#18181b] transition-all duration-200 ${activeTab === tab.key ? 'border-pink-500/20 bg-pink-500/10 text-pink-600 dark:border-[#fbcfe8]/25 dark:bg-[#fbcfe8]/15 dark:text-[#f9a8d4]' : 'border-zinc-200 text-zinc-400 dark:border-white/8 dark:text-white/40 hover:bg-zinc-50 dark:hover:bg-white/8 hover:text-zinc-700 dark:hover:text-white'}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Transaction list */}
      {Object.keys(grouped).length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-zinc-400 dark:text-white/20 gap-3 text-center">
          <p className="text-sm">Tidak ada transaksi ditemukan.</p>
          {hasFilter && (
            <button className="text-xs text-pink-600 hover:text-pink-700 dark:text-[#f9a8d4] bg-none border-none cursor-pointer mt-1 transition-colors dark:hover:text-[#fca5a5]" onClick={clearFilter}>
              Hapus filter
            </button>
          )}
        </div>
      ) : (
        Object.keys(grouped).map((month) => (
          <div key={month} className="mb-5">
            <p className="text-[11px] font-medium tracking-[0.14em] uppercase text-zinc-400 dark:text-white/30 mb-2.5 pl-1">{month}</p>
            <div className="bg-white border border-zinc-200 dark:bg-[#18181b] dark:border-white/8 rounded-2xl overflow-hidden shadow-sm dark:shadow-none">
              {grouped[month].map((t) => (
                <div key={t.id} className="flex items-center justify-between py-3.5 px-4 cursor-pointer transition-colors border-b border-zinc-100 dark:border-b-white/4 last:border-b-0 hover:bg-zinc-50/50 dark:hover:bg-white/4">
                  <div className="flex items-center gap-3">
                    <TxIcon type={t.type} category={t.category} />
                    <div>
                      <p className="text-[13px] font-medium text-zinc-800 dark:text-white mb-0.5">{t.title}</p>
                      <p className="text-[11px] text-zinc-400 dark:text-white/30 font-mono tracking-[0.03em]">{fmtDateTime(t.date)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-syne text-[13px] font-bold ${t.type === "incoming" ? "text-emerald-600" : "text-zinc-500 dark:text-white/65"}`}>
                      {t.type === "incoming" ? "+" : "−"} {fmtRp(t.amount)}
                    </p>
                    <span className={`text-[10px] font-medium tracking-[0.06em] px-1.5 py-0.5 rounded-md mt-1 inline-block border ${t.category === 'payment' ? 'bg-blue-500/10 text-blue-600 border-blue-500/15 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/15' : t.category === 'topup' ? 'bg-emerald-500/5 text-emerald-600 border-emerald-500/13 dark:bg-emerald-500/8 dark:text-emerald-500 dark:border-emerald-500/13' : 'bg-purple-500/5 text-purple-600 border-purple-500/13 dark:bg-purple-500/8 dark:text-purple-400 dark:border-purple-500/13'}`}>
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
  );
}
