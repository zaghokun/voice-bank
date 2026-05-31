import { useState } from 'react';
import { ArrowUpRight, ArrowDownLeft, Calendar, CreditCard, Wallet, Search, X } from 'lucide-react';

function HistoryPage() {
  // State untuk Range Tanggal
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // DATA TIRUAN (Berdasarkan gambar referensi & tambahan untuk filter uji coba)
  const transactions = [
    { id: 1, type: 'outgoing', title: 'Pembayaran ke MRT Jakarta', date: '2023-01-11T08:27:17', amount: 5000, category: 'payment' },
    { id: 2, type: 'incoming', title: 'Top-up', date: '2023-01-10T15:27:17', amount: 300000, category: 'topup' },
    { id: 3, type: 'outgoing', title: 'Pembayaran ke MRT Jakarta', date: '2023-01-04T18:27:17', amount: 11000, category: 'payment' },
    { id: 4, type: 'outgoing', title: 'Pembayaran', date: '2023-01-04T15:27:17', amount: 5000, category: 'payment' },
    { id: 5, type: 'incoming', title: 'Top-up', date: '2023-01-04T16:00:00', amount: 20000, category: 'topup' },
    { id: 6, type: 'outgoing', title: 'Pembayaran ke MRT Jakarta', date: '2023-01-04T07:30:17', amount: 5000, category: 'payment' },
    
    // Data tambahan untuk mengetes rentang waktu
    { id: 7, type: 'outgoing', title: 'Transfer ke Budi', date: '2023-02-15T10:00:00', amount: 50000, category: 'transfer' },
    { id: 8, type: 'incoming', title: 'Terima Dana', date: '2023-02-10T09:15:00', amount: 150000, category: 'topup' },
    { id: 9, type: 'outgoing', title: 'Pembayaran Listrik', date: '2026-05-10T08:00:00', amount: 250000, category: 'payment' },
  ];

  // Helper Pemformatan Tanggal & Bulan
  const formatMonthYear = (dateStr) => {
    const date = new Date(dateStr);
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const formatDateTime = (dateStr) => {
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const time = date.toTimeString().split(' ')[0]; // Mendapatkan format HH:MM:SS
    return `${day} ${month} ${year} • ${time} WIB`;
  };

  // Logika Filter Rentang Tanggal (Date Range)
  const filteredTransactions = transactions.filter(t => {
    if (!startDate && !endDate) return true; // Jika tidak ada filter, tampilkan semua

    const trxDate = new Date(t.date).getTime();
    
    // Setel awal hari (00:00:00) untuk Start Date dan akhir hari (23:59:59) untuk End Date
    const start = startDate ? new Date(startDate).setHours(0, 0, 0, 0) : 0;
    const end = endDate ? new Date(endDate).setHours(23, 59, 59, 999) : Infinity;

    return trxDate >= start && trxDate <= end;
  });

  // Logika Grouping berdasarkan Bulan dan Tahun
  const groupedTransactions = filteredTransactions.reduce((acc, curr) => {
    const groupKey = formatMonthYear(curr.date);
    if (!acc[groupKey]) {
      acc[groupKey] = [];
    }
    acc[groupKey].push(curr);
    return acc;
  }, {});

  // Penentuan Ikon berdasarkan Kategori Transaksi
  const renderIcon = (type, category) => {
    if (type === 'incoming') {
      return <Wallet className="w-5 h-5 text-emerald-500" />;
    }
    if (category === 'payment') {
      return <CreditCard className="w-5 h-5 text-blue-500" />;
    }
    return <ArrowUpRight className="w-5 h-5 text-red-500" />;
  };

  const renderIconBg = (type, category) => {
    if (type === 'incoming') return 'bg-emerald-500/10 border-emerald-500/20';
    if (category === 'payment') return 'bg-blue-500/10 border-blue-500/20';
    return 'bg-red-500/10 border-red-500/20';
  };

  return (
    <div className="w-full flex-1 flex flex-col bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 p-8 transition-all duration-300 overflow-y-auto">
      
      {/* HEADER & FILTER RANGE TANGGAL */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-6 mb-6 border-b border-slate-800 gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-wide">Riwayat Transaksi</h1>
          <p className="text-gray-400 mt-1">Pantau seluruh aktivitas pengeluaran dan pemasukan Anda</p>
        </div>

        {/* Filter Rentang Tanggal Kalender */}
        <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-950/80 border border-slate-800 p-2 rounded-xl shadow-inner">
           
           {/* Dari Tanggal */}
           <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-700 hover:border-slate-500 rounded-lg focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500 transition-all w-full sm:w-auto">
             <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
             <input 
               type="date" 
               value={startDate}
               onChange={(e) => setStartDate(e.target.value)}
               className="bg-transparent text-sm text-white focus:outline-none w-full sm:w-auto cursor-pointer"
               style={{ colorScheme: 'dark' }} // Memaksa popup kalender browser ke dark mode
               title="Pilih tanggal awal"
             />
           </div>
           
           <span className="text-gray-500 font-medium hidden sm:block">-</span>
           
           {/* Sampai Tanggal */}
           <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-700 hover:border-slate-500 rounded-lg focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500 transition-all w-full sm:w-auto">
             <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
             <input 
               type="date" 
               value={endDate}
               onChange={(e) => setEndDate(e.target.value)}
               className="bg-transparent text-sm text-white focus:outline-none w-full sm:w-auto cursor-pointer"
               style={{ colorScheme: 'dark' }}
               title="Pilih tanggal akhir"
             />
           </div>

           {/* Tombol Clear Filter (Tampil jika filter sedang aktif) */}
           {(startDate || endDate) && (
             <button 
                onClick={() => { setStartDate(''); setEndDate(''); }}
                className="p-2 ml-1 text-gray-500 hover:text-white bg-slate-800 hover:bg-red-600 rounded-lg transition-all shadow-sm active:scale-95 flex items-center justify-center shrink-0"
                title="Hapus Filter Kalender"
             >
               <X className="w-4 h-4" />
             </button>
           )}
        </div>
      </div>

      {/* TRANSACTION LIST */}
      <div className="flex-1 space-y-8 animate-fadeIn pb-8">
        {Object.keys(groupedTransactions).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <Search className="w-12 h-12 mb-4 opacity-50" />
            <p>Tidak ada transaksi pada rentang tanggal tersebut.</p>
            {(startDate || endDate) && (
              <button 
                onClick={() => { setStartDate(''); setEndDate(''); }}
                className="mt-4 text-red-500 hover:text-red-400 font-medium transition-colors"
              >
                Hapus Filter
              </button>
            )}
          </div>
        ) : (
          Object.keys(groupedTransactions).map(monthGroup => (
            <div key={monthGroup} className="space-y-4">
              
              {/* Group Title (e.g. Januari 2023) */}
              <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-3 mb-4 sticky top-0 bg-slate-900/90 backdrop-blur-sm z-10 py-2">
                {monthGroup}
              </h2>

              {/* Items Card Container */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden flex flex-col shadow-lg">
                {groupedTransactions[monthGroup].map((trx, index) => (
                  <div 
                    key={trx.id} 
                    className={`flex items-center justify-between p-5 hover:bg-slate-800/80 transition cursor-pointer group ${index !== groupedTransactions[monthGroup].length - 1 ? 'border-b border-slate-800/50' : ''}`}
                  >
                    
                    {/* Left Section: Icon + Details */}
                    <div className="flex items-center gap-5">
                      <div className={`w-12 h-12 rounded-xl border flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform ${renderIconBg(trx.type, trx.category)}`}>
                        {renderIcon(trx.type, trx.category)}
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-white mb-1 tracking-tight group-hover:text-red-100 transition-colors">{trx.title}</h4>
                        <p className="text-xs text-gray-400 font-medium">{formatDateTime(trx.date)}</p>
                      </div>
                    </div>
                    
                    {/* Right Section: Amount */}
                    <div className="text-right">
                      <div className={`text-base font-bold tracking-wide ${trx.type === 'incoming' ? 'text-emerald-500' : 'text-white'}`}>
                        {trx.type === 'incoming' ? '+' : '-'} Rp {trx.amount.toLocaleString('id-ID')}
                      </div>
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

export default HistoryPage;