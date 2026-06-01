import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mic, Send, History, QrCode, PlusCircle,
  PiggyBank, CreditCard, Bell, User, Eye, EyeOff,
  ArrowUpRight, ArrowDownRight, ChevronRight, Volume2
} from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../hooks/useAuth';
import { getBalance, getTransactions } from '../services/transactionService';
import { sendVoiceCommand } from '../services/voiceService';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { tts } from '../services/ttsService';

/* ─── Icon color map ─── */
const actionMeta = {
  Transfer:    { bg: 'rgba(59,130,246,0.12)',  color: '#60a5fa' },
  Riwayat:     { bg: 'rgba(168,85,247,0.12)', color: '#c084fc' },
  QRIS:        { bg: 'rgba(16,185,129,0.12)', color: '#34d399' },
  'Top Up':    { bg: 'rgba(245,158,11,0.12)', color: '#fbbf24' },
  Tabung:      { bg: 'rgba(236,72,153,0.12)', color: '#f472b6' },
  Bayar:       { bg: 'rgba(99,102,241,0.12)', color: '#818cf8' },
  Bantuan:     { bg: 'rgba(249,115,22,0.12)', color: '#fb923c' },
  Profil:      { bg: 'rgba(255,255,255,0.08)', color: '#fbcfe8' },
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { user: authUser } = useAuth();
  const [showBalance, setShowBalance] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const [voiceProcessing, setVoiceProcessing] = useState(false);

  const user = authUser || { name: 'Pengguna' };
  const accountNumberRaw = user?.id
    ? String(1000000000 + (user.id * 12345) % 9000000000).replace(/(\d{3})(\d{4})(\d{3,})/, '$1 $2 $3')
    : '••• •••• ••••';
  const [balance, setBalance] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState([]);

  const firstName = user?.name?.split(' ')[0] || 'Pengguna';

  const { recording, audioBlob, startRecording, stopRecording } = useAudioRecorder();

  // Fetch balance + transactions saat mount
  useEffect(() => {
    getBalance()
      .then(d => setBalance(d.balance))
      .catch(() => {});
    getTransactions()
      .then(txs => {
        const last3 = txs.slice(0, 3).map(tx => ({
          title: tx.type === 'transfer'
            ? `Transfer ke ${tx.target_user || 'Penerima'}`
            : 'Tabungan',
          amount: tx.amount,
          type: tx.type === 'tabung' ? 'in' : 'out',
          date: new Date(tx.created_at).toLocaleString('id-ID', {
            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
          }),
        }));
        setRecentTransactions(last3);
      })
      .catch(() => {});
  }, []);

  // TTS announce halaman dashboard pas balance ter-load
  useEffect(() => {
    if (balance > 0 && authUser) {
      tts.speak(
        `Halaman utama. Selamat datang ${authUser.name}. Saldo Anda Rp ${balance.toLocaleString('id-ID')}. ` +
        `Tekan tombol mikrofon atau spasi untuk memulai perintah suara.`
      );
    }
  }, [balance, authUser]);

  // Voice routing handler — sesuai 5 intent model
  const handleVoiceResult = (data) => {
    const { intent, confidence } = data;

    if (confidence < 0.6) {
      tts.error('Maaf, perintah tidak terdeteksi dengan jelas. Silakan ulangi.');
      return;
    }

    tts.intentDetected(intent, confidence);

    setTimeout(() => {
      switch (intent) {
        case 'TRANSFER':
          tts.speak('Membuka halaman transfer.');
          navigate('/transfer');
          break;
        case 'CEK_SALDO':
          tts.balance(balance.toLocaleString('id-ID'));
          break;
        case 'RIWAYAT':
          tts.speak('Membuka riwayat transaksi.');
          navigate('/history');
          break;
        case 'TABUNG':
          tts.speak('Membuka halaman menabung.');
          navigate('/savings');
          break;
        case 'BANTUAN':
          tts.speak('Membuka halaman bantuan.');
          navigate('/help');
          break;
        default:
          tts.error('Intent tidak dikenali.');
      }
    }, 2500);
  };

  // Toggle voice button: mulai/stop rekam
  const handleToggleVoice = () => {
    if ('vibrate' in navigator) navigator.vibrate([80, 40, 80]);
    if (recording) {
      stopRecording();
      tts.recordingStop();
      setVoiceText('Memproses rekaman...');
    } else {
      tts.recordingStart();
      setVoiceText('Mendengarkan...');
      startRecording();
    }
  };

  // Setelah audioBlob siap, kirim ke backend
  useEffect(() => {
    if (!audioBlob) return;
    let cancelled = false;
    setVoiceProcessing(true);
    sendVoiceCommand(audioBlob)
      .then(data => {
        if (cancelled) return;
        setVoiceText(`"${data.intent}" (${(data.confidence * 100).toFixed(0)}%)`);
        handleVoiceResult(data);
      })
      .catch(err => {
        if (cancelled) return;
        const msg = err.response?.data?.detail || 'Gagal memproses perintah suara';
        setVoiceText('Gagal memproses');
        tts.error(msg);
      })
      .finally(() => {
        if (!cancelled) setVoiceProcessing(false);
      });
    return () => { cancelled = true; };
  }, [audioBlob]);

  // Listen Balance: bacakan saldo via TTS
  const handleListenBalance = () => {
    tts.balance(balance.toLocaleString('id-ID'));
  };

  // Keyboard shortcut: Spasi = mic
  useEffect(() => {
    const handleKey = (e) => {
      if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        handleToggleVoice();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [recording]);

  const isListening = recording || voiceProcessing;

  const quickMenus = [
    { title: 'Transfer',   icon: Send,       path: '/transfer' },
    { title: 'Riwayat',    icon: History,    path: '/history' },
    { title: 'QRIS',       icon: QrCode,     path: '/coming-soon' },
    { title: 'Top Up',     icon: PlusCircle, path: '/coming-soon' },
    { title: 'Tabung',     icon: PiggyBank,  path: '/savings' },
    { title: 'Bayar',      icon: CreditCard, path: '/coming-soon' },
    { title: 'Bantuan',    icon: Bell,       path: '/help' },
    { title: 'Profil',     icon: User,       path: '/profile' },
  ];

  return (
    <div className="min-h-screen bg-[#f4f4f5] dark:bg-[#09090b] bg-[radial-gradient(ellipse_70%_50%_at_30%_-5%,rgba(99,102,241,0.05)_0%,transparent_65%),radial-gradient(ellipse_50%_40%_at_80%_80%,rgba(244,114,182,0.04)_0%,transparent_60%)] dark:bg-[radial-gradient(ellipse_70%_50%_at_30%_-5%,rgba(29,78,216,0.10)_0%,transparent_65%),radial-gradient(ellipse_50%_40%_at_80%_80%,rgba(29,78,216,0.06)_0%,transparent_60%)] text-zinc-800 dark:text-white p-6 pb-12 animate-fade-up font-sans selection:bg-pink-500/10 dark:selection:bg-[#fbcfe8]/30">
      
      {/* Top bar */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-medium tracking-[0.14em] uppercase text-zinc-400 dark:text-white/30">Selamat datang kembali</span>
          <span className="font-syne text-[22px] font-extrabold text-zinc-800 dark:text-white tracking-[0.04em]">
            {firstName.toUpperCase()}<span className="text-pink-500 dark:text-[#fbcfe8]">.</span>
          </span>
        </div>
        <button className="w-11 h-11 rounded-[14px] bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 dark:bg-white/4 dark:border-white/8 flex items-center justify-center cursor-pointer transition-colors dark:hover:bg-white/8" onClick={() => navigate('/profile')} aria-label="Profil">
          <User size={18} className="text-zinc-500 dark:text-white/50" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_380px]">

        {/* ── LEFT ── */}
        <div className="flex flex-col gap-5">

          {/* Balance card */}
          <div>
            <p className="text-[11px] font-medium tracking-[0.14em] uppercase text-zinc-400 dark:text-white/30 mb-3.5">Saldo rekening</p>
            <div className="relative shadow-md dark:shadow-none bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-white/8 rounded-[20px] p-7 overflow-hidden before:absolute before:-top-[60px] before:-right-[60px] before:w-[200px] before:h-[200px] before:rounded-full before:bg-[radial-gradient(circle,rgba(251,207,232,0.15)_0%,transparent_70%)] before:pointer-events-none">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-[11px] font-medium tracking-[0.14em] uppercase text-zinc-400 dark:text-white/30 mb-2.5">Saldo aktif</p>
                  <div className="flex items-center gap-3">
                    <span className="font-syne text-[32px] font-extrabold text-zinc-800 dark:text-white tracking-[-0.01em]">
                      {showBalance
                        ? `Rp ${balance.toLocaleString('id-ID')}`
                        : 'Rp ••••••••'}
                    </span>
                    <button
                      className="w-8 h-8 rounded-[10px] bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 dark:bg-white/4 dark:border-white/8 flex items-center justify-center cursor-pointer transition-colors flex-shrink-0 text-zinc-400 dark:text-white/40 dark:hover:bg-white/12 dark:hover:text-white"
                      onClick={() => setShowBalance(p => !p)}
                      aria-label={showBalance ? 'Sembunyikan saldo' : 'Tampilkan saldo'}
                    >
                      {showBalance
                        ? <EyeOff size={14} />
                        : <Eye size={14} />}
                    </button>
                    <button
                      className="w-8 h-8 rounded-[10px] bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 dark:bg-white/4 dark:border-white/8 flex items-center justify-center cursor-pointer transition-colors flex-shrink-0 text-zinc-400 dark:text-white/40 dark:hover:bg-white/12 dark:hover:text-white"
                      onClick={handleListenBalance}
                      aria-label="Dengarkan saldo"
                    >
                      <Volume2 size={14} />
                    </button>
                  </div>
                </div>
                <span className="font-syne text-[10px] font-bold tracking-[0.16em] px-2.5 py-1.5 rounded-lg bg-pink-500/10 border border-pink-500/25 text-pink-600 dark:bg-[#fbcfe8]/15 dark:border-[#fbcfe8]/20 dark:text-[#f9a8d4]">VOICEBANK</span>
              </div>

              <div className="flex justify-between items-end pt-5 border-t border-zinc-100 dark:border-white/8">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-medium tracking-[0.12em] uppercase text-zinc-400 dark:text-white/30">Pemilik</span>
                  <span className="text-[13px] font-medium text-zinc-700 dark:text-white">{user?.name}</span>
                </div>
                <div className="flex flex-col gap-1 text-right">
                  <span className="text-[10px] font-medium tracking-[0.12em] uppercase text-zinc-400 dark:text-white/30">No. Rekening</span>
                  <span className="text-[13px] font-medium text-zinc-700 dark:text-white font-mono tracking-[0.06em]">{accountNumberRaw}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div>
            <p className="text-[11px] font-medium tracking-[0.14em] uppercase text-zinc-400 dark:text-white/30 mb-3.5">Aksi cepat</p>
            <div className="grid grid-cols-4 gap-2.5">
              {quickMenus.map((menu) => {
                const meta = actionMeta[menu.title] || { bg: 'rgba(255,255,255,0.04)', color: '#ffffff' };
                return (
                  <button
                    key={menu.title}
                    className="group bg-white border border-zinc-200 hover:bg-zinc-50 dark:bg-[#18181b] dark:border-white/8 rounded-2xl py-4 px-2 flex flex-col items-center gap-2.5 cursor-pointer transition-all dark:hover:bg-white/8 dark:hover:border-white/12 active:scale-96 shadow-sm dark:shadow-none"
                    onClick={() => navigate(menu.path)}
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: meta.bg }}>
                      <menu.icon size={18} color={meta.color} strokeWidth={1.75} />
                    </div>
                    <span className="text-[11px] font-medium text-zinc-500 dark:text-white/50 text-center leading-tight transition-colors group-hover:text-zinc-800 dark:group-hover:text-white">{menu.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* ── RIGHT ── */}
        <div className="flex flex-col gap-5">

          {/* Voice assistant */}
          <div>
            <p className="text-[11px] font-medium tracking-[0.14em] uppercase text-zinc-400 dark:text-white/30 mb-3.5">Asisten suara</p>
            <div className="bg-white border border-zinc-200 dark:bg-[#18181b] dark:border-white/8 rounded-[20px] p-7 flex flex-col items-center relative overflow-hidden shadow-md dark:shadow-none">
              <div className="text-[13px] font-medium text-zinc-500 dark:text-white/50 flex items-center gap-1.5 mb-6 self-start tracking-[0.02em]">
                <span className="w-1.5 h-1.5 rounded-full bg-pink-500 dark:bg-[#fbcfe8]" />
                Perintah suara aktif
              </div>

              <div className="relative mb-6">
                {isListening && (
                  <>
                    <div className="absolute inset-[-12px] rounded-full bg-pink-500/15 dark:bg-[#fbcfe8]/20 animate-ping" />
                    <div className="absolute inset-[-6px] rounded-full border border-pink-500/15 dark:border-[#fbcfe8]/20 animate-ping" />
                  </>
                )}
                <button
                  className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center cursor-pointer border-none transition-all hover:scale-106 active:scale-97 ${isListening ? 'bg-[#fbcfe8] shadow-[0_0_32px_rgba(251,207,232,0.4)]' : 'bg-zinc-100 border border-zinc-200 dark:bg-white/4 dark:border-white/12'}`}
                  onClick={handleToggleVoice}
                  aria-label={isListening ? 'Hentikan perekaman' : 'Mulai perintah suara'}
                >
                  <Mic
                    size={28}
                    color={isListening ? '#09090b' : (theme === 'dark' ? 'rgba(251,207,232,0.8)' : '#ec4899')}
                    strokeWidth={1.75}
                  />
                </button>
              </div>

              {isListening
                ? (
                  <div className="flex items-center gap-1 h-6 mb-4">
                    <div className="w-[3px] rounded-full bg-pink-500/70 dark:bg-[#fbcfe8]/70 h-2 animate-wave" />
                    <div className="w-[3px] rounded-full bg-pink-500/70 dark:bg-[#fbcfe8]/70 h-4 animate-[wave_0.9s_0.1s_ease-in-out_infinite]" />
                    <div className="w-[3px] rounded-full bg-pink-500/70 dark:bg-[#fbcfe8]/70 h-5.5 animate-[wave_0.9s_0.2s_ease-in-out_infinite]" />
                    <div className="w-[3px] rounded-full bg-pink-500/70 dark:bg-[#fbcfe8]/70 h-3.5 animate-[wave_0.9s_0.3s_ease-in-out_infinite]" />
                    <div className="w-[3px] rounded-full bg-pink-500/70 dark:bg-[#fbcfe8]/70 h-5 animate-[wave_0.9s_0.15s_ease-in-out_infinite]" />
                    <div className="w-[3px] rounded-full bg-pink-500/70 dark:bg-[#fbcfe8]/70 h-2.5 animate-[wave_0.9s_0.25s_ease-in-out_infinite]" />
                    <div className="w-[3px] rounded-full bg-pink-500/70 dark:bg-[#fbcfe8]/70 h-4.5 animate-[wave_0.9s_0.05s_ease-in-out_infinite]" />
                  </div>
                )
                : <div className="h-6 mb-4" />
              }

              <div className="w-full bg-zinc-50 border border-zinc-200 dark:bg-[#18181b] dark:border-white/8 rounded-xl px-4 py-3.5 min-h-[52px] flex items-center justify-center">
                <p className={`text-[13px] italic text-center leading-normal ${isListening ? 'text-zinc-900 dark:text-white not-italic' : 'text-zinc-400 dark:text-white/30'}`}>
                  {isListening
                    ? voiceText
                    : 'Ketuk untuk mulai — coba "Transfer 50 ribu ke Budi"'}
                </p>
              </div>
            </div>
          </div>

          {/* Recent transactions */}
          <div className="bg-white border border-zinc-200 dark:bg-[#18181b] dark:border-white/8 rounded-[20px] p-6 flex-1 flex flex-col justify-between shadow-md dark:shadow-none">
            <div className="flex justify-between items-center mb-4">
              <p className="text-[11px] font-medium tracking-[0.14em] uppercase text-zinc-400 dark:text-white/30" style={{ marginBottom: 0 }}>Transaksi terakhir</p>
              <button className="text-xs font-medium text-pink-600 hover:text-pink-700 dark:text-[#f9a8d4] bg-none border-none cursor-pointer flex items-center gap-0.5 transition-colors dark:hover:text-[#fca5a5]" onClick={() => navigate('/history')}>
                Semua <ChevronRight size={12} />
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {recentTransactions.map((item, i) => (
                <div key={i} className="flex items-center justify-between py-3 px-3.5 rounded-xl bg-zinc-50/50 border border-zinc-100 hover:bg-zinc-100/50 hover:border-zinc-200 dark:bg-white/4 dark:border-white/4 cursor-pointer transition-all dark:hover:bg-white/4 dark:hover:border-white/12" onClick={() => navigate('/history')}>
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0 ${item.type === 'in' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-500' : 'bg-pink-500/10 text-pink-600 dark:text-[#f9a8d4]'}`}>
                      {item.type === 'in'
                        ? <ArrowDownRight size={16} strokeWidth={2} />
                        : <ArrowUpRight   size={16} strokeWidth={2} />}
                    </div>
                    <div>
                      <p className="text-[13px] font-medium text-zinc-800 dark:text-white mb-0.5">{item.title}</p>
                      <p className="text-[11px] text-zinc-400 dark:text-white/30">{item.date}</p>
                    </div>
                  </div>
                  <span className={`text-[13px] font-medium ${item.type === 'in' ? 'text-emerald-600 dark:text-emerald-500' : 'text-zinc-500 dark:text-white/60'}`}>
                    {item.type === 'in' ? '+' : '−'} Rp {item.amount.toLocaleString('id-ID')}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}