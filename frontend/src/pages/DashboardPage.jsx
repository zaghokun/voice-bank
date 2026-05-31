import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mic, Send, History, QrCode, PlusCircle,
  PiggyBank, CreditCard, Bell, User, Eye, EyeOff,
  ArrowUpRight, ArrowDownRight, ChevronRight
} from 'lucide-react';

/* ─── Styles ─── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;1,400&family=Syne:wght@700;800&family=DM+Mono:wght@400;500&display=swap');

  @keyframes vb-fade-up {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes vb-ping {
    75%, 100% { transform: scale(2.2); opacity: 0; }
  }
  @keyframes vb-wave {
    0%, 100% { transform: scaleY(0.4); }
    50%       { transform: scaleY(1); }
  }
  @keyframes vb-shimmer {
    from { background-position: -400px 0; }
    to   { background-position: 400px 0; }
  }

  .vb-root * { box-sizing: border-box; margin: 0; padding: 0; }

  /* ── Shell ── */
  .vb-dash {
    font-family: 'DM Sans', sans-serif;
    min-height: 100svh;
    background: #080b10;
    background-image:
      radial-gradient(ellipse 70% 50% at 30% -5%, rgba(185,28,28,0.10) 0%, transparent 65%),
      radial-gradient(ellipse 50% 40% at 80% 80%, rgba(185,28,28,0.06) 0%, transparent 60%);
    color: #fff;
    padding: 28px 24px 48px;
    animation: vb-fade-up 0.5s cubic-bezier(.22,1,.36,1) both;
  }

  /* ── Top bar ── */
  .vb-topbar {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 32px;
  }
  .vb-topbar-left { display: flex; flex-direction: column; gap: 4px; }
  .vb-greeting-label {
    font-size: 11px; font-weight: 500; letter-spacing: 0.14em;
    text-transform: uppercase; color: rgba(255,255,255,0.25);
  }
  .vb-greeting-name {
    font-family: 'Syne', sans-serif;
    font-size: 22px; font-weight: 800;
    color: #fff; letter-spacing: 0.04em;
  }
  .vb-greeting-name span { color: #dc2626; }
  .vb-avatar {
    width: 44px; height: 44px; border-radius: 14px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.08);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: background 0.2s;
  }
  .vb-avatar:hover { background: rgba(255,255,255,0.08); }

  /* ── Grid ── */
  .vb-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 20px;
  }
  @media (min-width: 1024px) {
    .vb-grid { grid-template-columns: 1fr 380px; }
  }
  .vb-left  { display: flex; flex-direction: column; gap: 20px; }
  .vb-right { display: flex; flex-direction: column; gap: 20px; }

  /* ── Section label ── */
  .vb-section-label {
    font-size: 11px; font-weight: 500;
    letter-spacing: 0.14em; text-transform: uppercase;
    color: rgba(255,255,255,0.25);
    margin-bottom: 14px;
  }

  /* ── Balance card ── */
  .vb-balance-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 20px;
    padding: 28px;
    position: relative; overflow: hidden;
  }
  .vb-balance-card::before {
    content: '';
    position: absolute; top: -60px; right: -60px;
    width: 200px; height: 200px; border-radius: 50%;
    background: radial-gradient(circle, rgba(220,38,38,0.12) 0%, transparent 70%);
    pointer-events: none;
  }
  .vb-balance-top {
    display: flex; justify-content: space-between; align-items: flex-start;
    margin-bottom: 24px;
  }
  .vb-balance-label {
    font-size: 11px; font-weight: 500; letter-spacing: 0.14em;
    text-transform: uppercase; color: rgba(255,255,255,0.3);
    margin-bottom: 10px;
  }
  .vb-balance-row { display: flex; align-items: center; gap: 12px; }
  .vb-balance-amount {
    font-family: 'Syne', sans-serif;
    font-size: 32px; font-weight: 800;
    color: #fff; letter-spacing: -0.01em;
  }
  .vb-eye-btn {
    width: 32px; height: 32px; border-radius: 10px;
    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: background 0.2s; flex-shrink: 0;
    color: rgba(255,255,255,0.4);
  }
  .vb-eye-btn:hover { background: rgba(255,255,255,0.09); color: #fff; }
  .vb-badge {
    font-family: 'Syne', sans-serif;
    font-size: 10px; font-weight: 700; letter-spacing: 0.16em;
    padding: 5px 10px; border-radius: 8px;
    background: rgba(220,38,38,0.12);
    border: 1px solid rgba(220,38,38,0.2);
    color: #f87171;
  }
  .vb-balance-bottom {
    display: flex; justify-content: space-between; align-items: flex-end;
    padding-top: 20px;
    border-top: 1px solid rgba(255,255,255,0.06);
  }
  .vb-balance-meta { display: flex; flex-direction: column; gap: 3px; }
  .vb-meta-label {
    font-size: 10px; font-weight: 500; letter-spacing: 0.12em;
    text-transform: uppercase; color: rgba(255,255,255,0.25);
  }
  .vb-meta-value { font-size: 13px; font-weight: 500; color: rgba(255,255,255,0.7); }
  .vb-meta-value.mono { font-family: 'DM Mono', monospace; font-size: 12px; letter-spacing: 0.06em; }

  /* ── Quick actions ── */
  .vb-actions-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
  }
  @media (max-width: 480px) {
    .vb-actions-grid { grid-template-columns: repeat(4, 1fr); }
  }
  .vb-action-btn {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 16px;
    padding: 16px 8px;
    display: flex; flex-direction: column; align-items: center; gap: 10px;
    cursor: pointer;
    transition: background 0.2s, border-color 0.2s, transform 0.15s;
  }
  .vb-action-btn:hover {
    background: rgba(255,255,255,0.06);
    border-color: rgba(255,255,255,0.12);
  }
  .vb-action-btn:active { transform: scale(0.96); }
  .vb-action-icon {
    width: 40px; height: 40px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .vb-action-title {
    font-size: 11px; font-weight: 500;
    color: rgba(255,255,255,0.5);
    text-align: center; line-height: 1.3;
  }
  .vb-action-btn:hover .vb-action-title { color: rgba(255,255,255,0.85); }

  /* ── Voice card ── */
  .vb-voice-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 20px;
    padding: 28px;
    display: flex; flex-direction: column; align-items: center;
    position: relative; overflow: hidden;
  }
  .vb-voice-title {
    font-size: 13px; font-weight: 500;
    color: rgba(255,255,255,0.5);
    display: flex; align-items: center; gap: 6px;
    margin-bottom: 24px; align-self: flex-start;
    letter-spacing: 0.02em;
  }
  .vb-voice-title-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: #dc2626;
  }
  /* Mic ring */
  .vb-mic-wrap { position: relative; margin-bottom: 24px; }
  .vb-mic-ping {
    position: absolute; inset: -12px; border-radius: 50%;
    background: rgba(220,38,38,0.2);
    animation: vb-ping 1.4s cubic-bezier(0,0,.2,1) infinite;
  }
  .vb-mic-ring {
    position: absolute; inset: -6px; border-radius: 50%;
    border: 1px solid rgba(220,38,38,0.2);
    animation: vb-ping 1.8s 0.4s cubic-bezier(0,0,.2,1) infinite;
  }
  .vb-mic-btn {
    position: relative; z-index: 1;
    width: 80px; height: 80px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
    border: none;
  }
  .vb-mic-btn.idle {
    background: rgba(255,255,255,0.05);
    border: 1.5px solid rgba(255,255,255,0.1);
    box-shadow: none;
  }
  .vb-mic-btn.active {
    background: #dc2626;
    box-shadow: 0 0 32px rgba(220,38,38,0.4);
  }
  .vb-mic-btn:hover { transform: scale(1.06); }
  .vb-mic-btn:active { transform: scale(0.97); }

  /* Waveform bars */
  .vb-wave-wrap {
    display: flex; align-items: center; gap: 3px; height: 24px;
    margin-bottom: 16px;
  }
  .vb-wave-bar {
    width: 3px; border-radius: 99px;
    background: rgba(220,38,38,0.7);
  }
  .vb-wave-bar:nth-child(1) { height: 8px;  animation: vb-wave 0.9s 0.0s ease-in-out infinite; }
  .vb-wave-bar:nth-child(2) { height: 16px; animation: vb-wave 0.9s 0.1s ease-in-out infinite; }
  .vb-wave-bar:nth-child(3) { height: 22px; animation: vb-wave 0.9s 0.2s ease-in-out infinite; }
  .vb-wave-bar:nth-child(4) { height: 14px; animation: vb-wave 0.9s 0.3s ease-in-out infinite; }
  .vb-wave-bar:nth-child(5) { height: 20px; animation: vb-wave 0.9s 0.15s ease-in-out infinite; }
  .vb-wave-bar:nth-child(6) { height: 10px; animation: vb-wave 0.9s 0.25s ease-in-out infinite; }
  .vb-wave-bar:nth-child(7) { height: 18px; animation: vb-wave 0.9s 0.05s ease-in-out infinite; }

  /* Transcript box */
  .vb-transcript {
    width: 100%;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 12px;
    padding: 14px 16px;
    min-height: 52px;
    display: flex; align-items: center; justify-content: center;
  }
  .vb-transcript p {
    font-size: 13px; font-style: italic;
    color: rgba(255,255,255,0.3);
    text-align: center; line-height: 1.5;
  }
  .vb-transcript p.active { color: rgba(255,255,255,0.75); font-style: normal; }

  /* ── Transactions ── */
  .vb-tx-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 20px;
    padding: 24px;
    flex: 1;
  }
  .vb-tx-header {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 16px;
  }
  .vb-tx-see-all {
    font-size: 12px; font-weight: 500; color: #f87171;
    background: none; border: none; cursor: pointer;
    display: flex; align-items: center; gap: 2px;
    transition: color 0.15s;
  }
  .vb-tx-see-all:hover { color: #fca5a5; }
  .vb-tx-list { display: flex; flex-direction: column; gap: 8px; }
  .vb-tx-item {
    display: flex; align-items: center; justify-content: space-between;
    padding: 12px 14px; border-radius: 12px;
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.05);
    cursor: pointer; transition: background 0.2s, border-color 0.2s;
  }
  .vb-tx-item:hover {
    background: rgba(255,255,255,0.05);
    border-color: rgba(255,255,255,0.09);
  }
  .vb-tx-left { display: flex; align-items: center; gap: 12px; }
  .vb-tx-icon {
    width: 36px; height: 36px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .vb-tx-icon.out { background: rgba(220,38,38,0.1); color: #f87171; }
  .vb-tx-icon.in  { background: rgba(34,197,94,0.1);  color: #4ade80; }
  .vb-tx-title { font-size: 13px; font-weight: 500; color: rgba(255,255,255,0.8); margin-bottom: 2px; }
  .vb-tx-date  { font-size: 11px; color: rgba(255,255,255,0.28); }
  .vb-tx-amount { font-size: 13px; font-weight: 500; }
  .vb-tx-amount.out { color: rgba(255,255,255,0.6); }
  .vb-tx-amount.in  { color: #4ade80; }
`;

function StyleTag() {
  return <style dangerouslySetInnerHTML={{ __html: styles }} />;
}

/* ── Icon color map ── */
const actionMeta = {
  Transfer:    { bg: 'rgba(59,130,246,0.12)',  color: '#60a5fa' },
  Riwayat:     { bg: 'rgba(168,85,247,0.12)', color: '#c084fc' },
  QRIS:        { bg: 'rgba(16,185,129,0.12)', color: '#34d399' },
  'Top Up':    { bg: 'rgba(245,158,11,0.12)', color: '#fbbf24' },
  Tabung:      { bg: 'rgba(236,72,153,0.12)', color: '#f472b6' },
  Bayar:       { bg: 'rgba(99,102,241,0.12)', color: '#818cf8' },
  Notifikasi:  { bg: 'rgba(249,115,22,0.12)', color: '#fb923c' },
  Profil:      { bg: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.45)' },
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const [showBalance, setShowBalance] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceText, setVoiceText] = useState('');

  const user = JSON.parse(localStorage.getItem('registeredUser')) || { name: 'Pengguna' };
  const accountNumberRaw = localStorage.getItem('accountNumber') || '829 3810 2938';
  const balance = 12500000;

  const firstName = user?.name?.split(' ')[0] || 'Pengguna';

  const quickMenus = [
    { title: 'Transfer',   icon: Send,       path: '/transfer' },
    { title: 'Riwayat',    icon: History,    path: '/history' },
    { title: 'QRIS',       icon: QrCode,     path: '/qris' },
    { title: 'Top Up',     icon: PlusCircle, path: '/topup' },
    { title: 'Tabung',     icon: PiggyBank,  path: '/savings' },
    { title: 'Bayar',      icon: CreditCard, path: '/payment' },
    { title: 'Notifikasi', icon: Bell,       path: '/notifications' },
    { title: 'Profil',     icon: User,       path: '/profile' },
  ];

  const recentTransactions = [
    { title: 'Transfer ke Budi',      amount: 50000,  type: 'out', date: 'Hari ini, 10:24' },
    { title: 'Terima Dana (Top Up)',  amount: 250000, type: 'in',  date: 'Kemarin, 14:10' },
    { title: 'Bayar Listrik',         amount: 100000, type: 'out', date: '12 Mei, 09:00' },
  ];

  const handleToggleVoice = () => {
    if ('vibrate' in navigator) navigator.vibrate([80, 40, 80]);
    setIsListening(p => !p);
  };

  useEffect(() => {
    let t;
    if (isListening) {
      setVoiceText('Mendengarkan…');
      t = setTimeout(() => setVoiceText('"Cek saldo saya"'), 2000);
    } else {
      setVoiceText('');
    }
    return () => clearTimeout(t);
  }, [isListening]);

  return (
    <div className="vb-root">
      <StyleTag />
      <div className="vb-dash">

        {/* Top bar */}
        <div className="vb-topbar">
          <div className="vb-topbar-left">
            <span className="vb-greeting-label">Selamat datang kembali</span>
            <span className="vb-greeting-name">
              {firstName.toUpperCase()}<span>.</span>
            </span>
          </div>
          <button className="vb-avatar" onClick={() => navigate('/profile')} aria-label="Profil">
            <User size={18} color="rgba(255,255,255,0.45)" />
          </button>
        </div>

        <div className="vb-grid">

          {/* ── LEFT ── */}
          <div className="vb-left">

            {/* Balance card */}
            <div>
              <p className="vb-section-label">Saldo rekening</p>
              <div className="vb-balance-card">
                <div className="vb-balance-top">
                  <div>
                    <p className="vb-balance-label">Saldo aktif</p>
                    <div className="vb-balance-row">
                      <span className="vb-balance-amount">
                        {showBalance
                          ? `Rp ${balance.toLocaleString('id-ID')}`
                          : 'Rp ••••••••'}
                      </span>
                      <button
                        className="vb-eye-btn"
                        onClick={() => setShowBalance(p => !p)}
                        aria-label={showBalance ? 'Sembunyikan saldo' : 'Tampilkan saldo'}
                      >
                        {showBalance
                          ? <EyeOff size={14} />
                          : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                  <span className="vb-badge">VOICEBANK</span>
                </div>

                <div className="vb-balance-bottom">
                  <div className="vb-balance-meta">
                    <span className="vb-meta-label">Pemilik</span>
                    <span className="vb-meta-value">{user?.name}</span>
                  </div>
                  <div className="vb-balance-meta" style={{ textAlign: 'right' }}>
                    <span className="vb-meta-label">No. Rekening</span>
                    <span className="vb-meta-value mono">{accountNumberRaw}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick actions */}
            <div>
              <p className="vb-section-label">Aksi cepat</p>
              <div className="vb-actions-grid">
                {quickMenus.map((menu) => {
                  const meta = actionMeta[menu.title] || { bg: 'rgba(255,255,255,0.05)', color: '#fff' };
                  return (
                    <button
                      key={menu.title}
                      className="vb-action-btn"
                      onClick={() => navigate(menu.path)}
                    >
                      <div className="vb-action-icon" style={{ background: meta.bg }}>
                        <menu.icon size={18} color={meta.color} strokeWidth={1.75} />
                      </div>
                      <span className="vb-action-title">{menu.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* ── RIGHT ── */}
          <div className="vb-right">

            {/* Voice assistant */}
            <div>
              <p className="vb-section-label">Asisten suara</p>
              <div className="vb-voice-card">
                <div className="vb-voice-title">
                  <span className="vb-voice-title-dot" />
                  Perintah suara aktif
                </div>

                <div className="vb-mic-wrap">
                  {isListening && (
                    <>
                      <div className="vb-mic-ping" />
                      <div className="vb-mic-ring" />
                    </>
                  )}
                  <button
                    className={`vb-mic-btn ${isListening ? 'active' : 'idle'}`}
                    onClick={handleToggleVoice}
                    aria-label={isListening ? 'Hentikan perekaman' : 'Mulai perintah suara'}
                  >
                    <Mic
                      size={28}
                      color={isListening ? '#fff' : 'rgba(220,38,38,0.8)'}
                      strokeWidth={1.75}
                    />
                  </button>
                </div>

                {isListening
                  ? (
                    <div className="vb-wave-wrap">
                      {[1,2,3,4,5,6,7].map(i => <div key={i} className="vb-wave-bar" />)}
                    </div>
                  )
                  : <div style={{ height: 24, marginBottom: 16 }} />
                }

                <div className="vb-transcript">
                  <p className={isListening ? 'active' : ''}>
                    {isListening
                      ? voiceText
                      : 'Ketuk untuk mulai — coba "Transfer 50 ribu ke Budi"'}
                  </p>
                </div>
              </div>
            </div>

            {/* Recent transactions */}
            <div className="vb-tx-card">
              <div className="vb-tx-header">
                <p className="vb-section-label" style={{ marginBottom: 0 }}>Transaksi terakhir</p>
                <button className="vb-tx-see-all" onClick={() => navigate('/history')}>
                  Semua <ChevronRight size={12} />
                </button>
              </div>
              <div className="vb-tx-list">
                {recentTransactions.map((item, i) => (
                  <div key={i} className="vb-tx-item" onClick={() => navigate('/history')}>
                    <div className="vb-tx-left">
                      <div className={`vb-tx-icon ${item.type}`}>
                        {item.type === 'in'
                          ? <ArrowDownRight size={16} strokeWidth={2} />
                          : <ArrowUpRight   size={16} strokeWidth={2} />}
                      </div>
                      <div>
                        <p className="vb-tx-title">{item.title}</p>
                        <p className="vb-tx-date">{item.date}</p>
                      </div>
                    </div>
                    <span className={`vb-tx-amount ${item.type}`}>
                      {item.type === 'in' ? '+' : '−'} Rp {item.amount.toLocaleString('id-ID')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}