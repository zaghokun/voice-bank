import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Mic, 
  Send, 
  History, 
  QrCode, 
  PlusCircle, 
  PiggyBank, 
  CreditCard, 
  Bell, 
  User, 
  Eye, 
  EyeOff,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

function DashboardPage() {
  const navigate = useNavigate();

  // SYSTEM STATES
  const [showBalance, setShowBalance] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceText, setVoiceText] = useState('');

  // MOCK DATA (Gunakan localStorage di implementasi aslinya)
  const user = JSON.parse(localStorage.getItem('registeredUser')) || { name: 'Dzu Sunan' };
  const accountNumberRaw = localStorage.getItem('accountNumber') || '82938102938';
  const balance = 12500000;

  // Format Account Number
  const displayedAccount = accountNumberRaw;

  const quickMenus = [
    { title: 'Transfer', icon: Send, path: '/transfer', color: 'text-blue-500' },
    { title: 'Riwayat', icon: History, path: '/history', color: 'text-purple-500' },
    { title: 'QRIS', icon: QrCode, path: '/qris', color: 'text-emerald-500' },
    { title: 'Top Up', icon: PlusCircle, path: '/topup', color: 'text-amber-500' },
    { title: 'Tabung', icon: PiggyBank, path: '/savings', color: 'text-pink-500' },
    { title: 'Bayar', icon: CreditCard, path: '/payment', color: 'text-indigo-500' },
    { title: 'Notifikasi', icon: Bell, path: '/notifications', color: 'text-orange-500' },
    { title: 'Profil', icon: User, path: '/profile', color: 'text-gray-400' },
  ];

  const recentTransactions = [
    { title: 'Transfer ke Budi', amount: 50000, type: 'out', date: 'Hari ini, 10:24' },
    { title: 'Terima Dana (Top Up)', amount: 250000, type: 'in', date: 'Kemarin, 14:10' },
    { title: 'Bayar Listrik', amount: 100000, type: 'out', date: '12 Mei, 09:00' },
  ];

  // Fungsi toggle Voice dengan Haptic Feedback
  const handleToggleVoice = () => {
    // Memberikan getaran pada perangkat yang mendukung (Haptic Feedback)
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100]); 
    }
    setIsListening(!isListening);
  };

  // Simulasi asisten suara merespons
  useEffect(() => {
    let timer;
    if (isListening) {
      setVoiceText('Mendengarkan perintah...');
      timer = setTimeout(() => {
        setVoiceText('"Cek saldo saya"');
      }, 2000);
    } else {
      setVoiceText('');
    }
    return () => clearTimeout(timer);
  }, [isListening]);

  return (
    <div className="w-full flex-1 flex flex-col bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 p-8 transition-all duration-300 overflow-y-auto">
      
      {/* HEADER */}
      <div className="flex items-center justify-between pb-6 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-wide">Dashboard</h1>
          <p className="text-gray-400 mt-1">Selamat datang kembali, <span className="text-white font-semibold">{user?.name}</span></p>
        </div>
        <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
          <User className="w-6 h-6 text-gray-400" />
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 xl:grid-cols-12 gap-8 items-start animate-fadeIn">
        
        {/* KOLOM KIRI (Saldo & Quick Actions) */}
        <div className="xl:col-span-7 space-y-8 flex flex-col">
          
          {/* BALANCE CARD */}
          <div className="bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 p-8 rounded-2xl shadow-lg relative overflow-hidden group">
            {/* Dekorasi Background */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

            <div className="flex justify-between items-start mb-8 relative z-10">
              <div>
                <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Saldo Aktif</p>
                <div className="flex items-center space-x-4">
                  <h2 className="text-4xl font-extrabold text-white tracking-tight">
                    Rp {showBalance ? balance.toLocaleString('id-ID') : '••••••••'}
                  </h2>
                  <button 
                    onClick={() => setShowBalance(!showBalance)}
                    className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-gray-400 transition"
                    aria-label={showBalance ? "Sembunyikan Saldo" : "Tampilkan Saldo"}
                  >
                    {showBalance ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div className="px-3 py-1 bg-red-600/10 border border-red-500/20 rounded-full text-red-500 text-xs font-bold tracking-wider">
                VOICEBANK
              </div>
            </div>

            <div className="flex justify-between items-end border-t border-slate-800 pt-6 relative z-10">
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Pemilik Rekening</p>
                <h3 className="text-base font-bold text-white">{user?.name}</h3>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Nomor Rekening</p>
                <h3 className="text-base font-mono text-gray-300">{displayedAccount}</h3>
              </div>
            </div>
          </div>

          {/* QUICK ACTIONS GRID */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider pl-1">Aksi Cepat</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {quickMenus.map((menu) => (
                <button
                  key={menu.title}
                  onClick={() => navigate(menu.path)}
                  className="bg-slate-950 border border-slate-800 hover:bg-slate-800 hover:border-slate-700 p-5 rounded-2xl flex flex-col items-center justify-center gap-3 transition active:scale-[0.98] group"
                >
                  <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <menu.icon className={`w-6 h-6 ${menu.color}`} />
                  </div>
                  <span className="text-sm font-semibold text-gray-300 group-hover:text-white transition-colors">{menu.title}</span>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* KOLOM KANAN (Voice Assistant & Riwayat) */}
        <div className="xl:col-span-5 space-y-8 flex flex-col h-full">
          
          {/* VOICE ASSISTANT CARD (Primary Feature) */}
          <div className="bg-slate-950 border border-slate-800 p-8 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden flex-shrink-0">
            <h2 className="text-xl font-bold text-white mb-2 relative z-10 flex items-center gap-2">
              <Mic className="w-5 h-5 text-red-500" />
              Asisten Suara
            </h2>
            <p className="text-sm text-gray-500 mb-8 text-center relative z-10">
              Ketuk tombol mikrofon di bawah untuk memberikan perintah perbankan melalui suara.
            </p>

            {/* Giant Mic Button with Pulse */}
            <div className="relative my-4 mb-10">
              {isListening && (
                <>
                  <div className="absolute inset-0 rounded-full bg-red-600/20 animate-ping duration-1500" />
                  <div className="absolute -inset-8 rounded-full border border-red-500/20 animate-pulse pointer-events-none" />
                </>
              )}
              <button
                onClick={handleToggleVoice}
                className={`w-32 h-32 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 z-10 relative ${
                  isListening 
                    ? 'bg-red-600 shadow-red-900/50 ring-4 ring-red-500/30 scale-105' 
                    : 'bg-slate-900 border-2 border-slate-700 hover:border-red-500/50 hover:bg-slate-800 text-red-500 active:scale-95'
                }`}
                aria-label={isListening ? "Hentikan perekaman" : "Mulai merekam perintah suara"}
              >
                <Mic className={`w-14 h-14 ${isListening ? 'text-white' : 'text-red-500'}`} />
              </button>
            </div>

            {/* Transcript/Hint Box */}
            <div className="w-full bg-slate-900 border border-slate-800 p-4 rounded-xl min-h-[80px] flex items-center justify-center text-center mt-auto z-10">
               <p className={`text-sm font-medium transition-colors ${isListening ? 'text-white italic' : 'text-gray-500'}`}>
                 {isListening ? voiceText : 'Coba sebutkan: "Transfer 50 ribu ke Budi"'}
               </p>
            </div>
          </div>

          {/* RECENT TRANSACTIONS */}
          <div className="bg-slate-950 border border-slate-800 p-8 rounded-2xl flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Transaksi Terakhir</h2>
              <button onClick={() => navigate('/history')} className="text-xs text-red-500 font-bold hover:text-red-400 transition">Lihat Semua</button>
            </div>

            <div className="space-y-4 flex-1">
              {recentTransactions.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-slate-900 rounded-xl border border-slate-800 hover:bg-slate-800/50 transition cursor-pointer">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.type === 'in' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                      {item.type === 'in' ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{item.title}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">{item.date}</p>
                    </div>
                  </div>
                  <div className={`text-sm font-bold ${item.type === 'in' ? 'text-emerald-500' : 'text-white'}`}>
                    {item.type === 'in' ? '+' : '-'} Rp {item.amount.toLocaleString('id-ID')}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
