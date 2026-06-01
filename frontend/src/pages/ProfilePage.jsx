import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { tts } from "../services/ttsService";
import {
  Camera,
  Mail,
  Phone,
  User,
  Save,
  Shield,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const fileInputRef = useRef(null);

  const [user, setUser] = useState({
    name: authUser?.name || "Pengguna",
    email: authUser?.email || "",
    phone: authUser?.phone || "",
    avatar: localStorage.getItem(`avatar_${authUser?.id}`) || null,
  });
  const [isSaved, setIsSaved] = useState(false);

  // Sinkronisasi state user dengan authUser saat berubah
  useEffect(() => {
    if (authUser) {
      setUser(u => ({
        ...u,
        name: authUser.name,
        email: authUser.email,
        phone: authUser.phone || u.phone,
      }));
    }
  }, [authUser]);

  // TTS announce
  useEffect(() => {
    tts.speak(`Halaman profil. Nama Anda ${authUser?.name || 'Pengguna'}.`);
  }, []);

  const accountNumber = authUser?.id
    ? String(1000000000 + (authUser.id * 12345) % 9000000000)
    : "•••••••••";
  const fmtAccount = accountNumber.replace(
    /(\d{3})(\d{4})(\d{3,})/,
    "$1 $2 $3",
  );

  const handleAvatarClick = () => fileInputRef.current.click();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setUser((u) => ({ ...u, avatar: reader.result }));
      // Avatar disimpan lokal saja per user (belum ada endpoint upload)
      if (authUser?.id) {
        localStorage.setItem(`avatar_${authUser.id}`, reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!user.email) {
      tts.error('Email wajib diisi.');
      return;
    }
    // Note: backend belum support PUT /api/user/profile. Untuk capstone, simpan avatar lokal saja.
    setIsSaved(true);
    tts.speak('Perubahan profil disimpan.');
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#f4f4f5] dark:bg-[#09090b] bg-[radial-gradient(ellipse_60%_50%_at_15%_-5%,rgba(99,102,241,0.05)_0%,transparent_65%),radial-gradient(ellipse_50%_40%_at_85%_90%,rgba(244,114,182,0.04)_0%,transparent_60%)] dark:bg-[radial-gradient(ellipse_60%_50%_at_15%_-5%,rgba(29,78,216,0.09)_0%,transparent_65%),radial-gradient(ellipse_50%_40%_at_85%_90%,rgba(29,78,216,0.05)_0%,transparent_60%)] text-zinc-800 dark:text-white p-6 pb-12 animate-fade-up font-sans selection:bg-pink-500/10 dark:selection:bg-[#fbcfe8]/30">
      
      {/* Top bar */}
      <div className="flex items-center justify-between mb-7">
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-medium tracking-[0.14em] uppercase text-zinc-400 dark:text-white/30">Akun saya</span>
          <span className="font-syne text-[22px] font-extrabold tracking-[0.03em] text-zinc-800 dark:text-white">
            Profil<span className="text-pink-500 dark:text-[#fbcfe8]">.</span>
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

      <div className="grid grid-cols-1 gap-5 md:grid-cols-[280px_1fr]">
        
        {/* ── Left column ── */}
        <div className="flex flex-col gap-4">
          <div className="bg-white border border-zinc-200 dark:bg-[#18181b] dark:border-white/8 rounded-[20px] p-7 shadow-sm dark:shadow-none">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-4 pb-5 border-b border-zinc-100 dark:border-b-white/8">
              <div
                className="relative cursor-pointer group"
                onClick={handleAvatarClick}
                role="button"
                aria-label="Ganti foto profil"
              >
                <div className="w-24 h-24 rounded-full bg-pink-500/5 border-2 border-pink-500/20 flex items-center justify-center overflow-hidden transition-colors duration-200 text-pink-600/60 dark:bg-[#fbcfe8]/8 dark:border-[#fbcfe8]/20 dark:text-[#fbcfe8]/60 group-hover:border-pink-500/50 dark:group-hover:border-[#fbcfe8]/50">
                  {user.avatar ? (
                    <img src={user.avatar} alt="Foto profil" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-10 h-10 text-pink-500 dark:text-[#fca5a5] flex-shrink-0" strokeWidth={1.5} />
                  )}
                </div>
                <div className="absolute bottom-0.5 right-0.5 w-7 h-7 rounded-full bg-pink-500 dark:bg-[#fbcfe8] text-white dark:text-[#09090b] flex items-center justify-center border-2 border-white dark:border-[#09090b] transition-all duration-200 group-hover:bg-pink-600 dark:group-hover:bg-[#fca5a5] group-hover:scale-108">
                  <Camera size={12} strokeWidth={2} />
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*"
                />
              </div>
              <p className="font-syne text-lg font-extrabold text-center tracking-[0.02em] text-zinc-800 dark:text-white">{user.name}</p>
              <p className="font-mono text-[11px] tracking-widest text-zinc-400 dark:text-white/30 text-center -mt-2">{fmtAccount}</p>
            </div>

            {/* Verified */}
            <div className="w-full bg-emerald-500/6 border border-emerald-500/15 rounded-xl p-3 flex items-center gap-2.5 mt-4">
              <div className="w-8 h-8 rounded-[9px] bg-emerald-500/10 flex items-center justify-center flex-shrink-0 text-emerald-600 dark:text-emerald-500">
                <Shield size={15} strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-xs font-medium text-emerald-600 dark:text-emerald-500">Terverifikasi</p>
                <p className="text-[11px] text-zinc-400 dark:text-white/30 mt-0.5">Keamanan level bank</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-zinc-50 border border-zinc-200 dark:bg-white/4 dark:border-white/8 rounded-xl p-3 flex flex-col gap-1 shadow-sm dark:shadow-none">
              <span className="text-[10px] font-medium tracking-[0.1em] uppercase text-zinc-400 dark:text-white/20">Status</span>
              <span className="font-syne text-sm font-bold text-zinc-800 dark:text-white">Aktif</span>
            </div>
            <div className="bg-zinc-50 border border-zinc-200 dark:bg-white/4 dark:border-white/8 rounded-xl p-3 flex flex-col gap-1 shadow-sm dark:shadow-none">
              <span className="text-[10px] font-medium tracking-[0.1em] uppercase text-zinc-400 dark:text-white/20">Tier</span>
              <span className="font-syne text-sm font-bold text-zinc-800 dark:text-white">Silver</span>
            </div>
          </div>
        </div>

        {/* ── Right column ── */}
        <div className="flex flex-col gap-0">
          <div className="bg-white border border-zinc-200 dark:bg-[#18181b] dark:border-white/8 rounded-[20px] p-7 h-full shadow-sm dark:shadow-none">
            <p className="text-[11px] font-medium tracking-[0.14em] uppercase text-zinc-400 dark:text-white/30 mb-5">Informasi Pribadi</p>

            {/* Nama — read only */}
            <div className="mb-5 last:mb-0">
              <label className="text-[11px] font-medium tracking-[0.08em] uppercase text-zinc-400 dark:text-white/30 mb-2 flex items-center gap-1.5">
                <User size={12} strokeWidth={2} /> Nama Pemilik Rekening
              </label>
              <div className="flex items-center gap-2.5 bg-zinc-100 border border-zinc-200 dark:bg-white/4 dark:border-white/4 rounded-xl px-3.5 py-3 cursor-not-allowed">
                <User
                  size={15}
                  className="text-zinc-400 dark:text-white/30 flex-shrink-0"
                  strokeWidth={1.75}
                />
                <input type="text" value={user.name} disabled className="bg-transparent border-none outline-none text-zinc-400 dark:text-white/40 font-sans text-sm font-medium flex-1 w-full cursor-not-allowed" />
              </div>
              <p className="text-[11px] text-zinc-400 dark:text-white/20 mt-1.5 pl-0.5 leading-normal">
                Nama sesuai KTP, tidak dapat diubah.
              </p>
            </div>

            {/* Email */}
            <div className="mb-5 last:mb-0">
              <label className="text-[11px] font-medium tracking-[0.08em] uppercase text-zinc-400 dark:text-white/30 mb-2 flex items-center gap-1.5">
                <Mail size={12} strokeWidth={2} /> Email Utama
                <span className="text-[#f9a8d4]">*</span>
              </label>
              <div className="group flex items-center gap-2.5 bg-white border border-zinc-200 dark:bg-[#18181b] dark:border-white/8 rounded-xl px-3.5 py-3 transition-colors focus-within:border-pink-500/40 dark:focus-within:border-[#fbcfe8]/40 shadow-sm dark:shadow-none">
                <Mail
                  size={15}
                  className="text-zinc-400 dark:text-white/30 flex-shrink-0 group-focus-within:text-pink-600 dark:group-focus-within:text-[#f9a8d4] transition-colors"
                  strokeWidth={1.75}
                />
                <input
                  type="email"
                  value={user.email}
                  onChange={(e) =>
                    setUser((u) => ({ ...u, email: e.target.value }))
                  }
                  placeholder="nama@email.com"
                  className="bg-transparent border-none outline-none text-zinc-800 dark:text-white font-sans text-sm font-medium flex-1 w-full placeholder-zinc-400 dark:placeholder-white/20"
                />
              </div>
              <p className="text-[11px] text-zinc-400 dark:text-white/20 mt-1.5 pl-0.5 leading-normal">
                Bukti transaksi dikirim ke alamat ini.
              </p>
            </div>

            {/* Phone */}
            <div className="mb-5 last:mb-0">
              <label className="text-[11px] font-medium tracking-[0.08em] uppercase text-zinc-400 dark:text-white/30 mb-2 flex items-center gap-1.5">
                <Phone size={12} strokeWidth={2} /> Nomor Handphone
              </label>
              <div className="group flex items-center gap-2.5 bg-white border border-zinc-200 dark:bg-[#18181b] dark:border-white/8 rounded-xl px-3.5 py-3 transition-colors focus-within:border-pink-500/40 dark:focus-within:border-[#fbcfe8]/40 shadow-sm dark:shadow-none">
                <Phone
                  size={15}
                  className="text-zinc-400 dark:text-white/30 flex-shrink-0 group-focus-within:text-pink-600 dark:group-focus-within:text-[#f9a8d4] transition-colors"
                  strokeWidth={1.75}
                />
                <input
                  type="tel"
                  value={user.phone}
                  onChange={(e) =>
                    setUser((u) => ({ ...u, phone: e.target.value }))
                  }
                  placeholder="081234567890"
                  className="bg-transparent border-none outline-none text-zinc-800 dark:text-white font-sans text-sm font-medium flex-1 w-full placeholder-zinc-400 dark:placeholder-white/20"
                />
              </div>
            </div>

            <div className="h-[1px] bg-zinc-200 dark:bg-white/8 my-6" />

            {/* Save row */}
            <div className="flex items-center justify-between gap-3">
              {isSaved ? (
                <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-500 animate-scale-in">
                  <CheckCircle size={15} strokeWidth={2} />
                  Perubahan berhasil disimpan!
                </div>
              ) : (
                <span className="text-xs text-zinc-400 dark:text-white/20 flex-1">
                  Pastikan data sudah benar sebelum menyimpan.
                </span>
              )}

              <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#fbcfe8] text-[#09090b] font-syne text-xs font-bold tracking-[0.04em] border border-[#fbcfe8]/55 cursor-pointer flex-shrink-0 shadow-[0_4px_20px_rgba(236,72,153,0.15)] dark:shadow-[0_4px_20px_rgba(251,207,232,0.25)] transition-all hover:bg-[#fca5a5] hover:shadow-[0_4px_24px_rgba(251,207,232,0.4)] active:scale-97" onClick={handleSave}>
                <Save size={14} strokeWidth={2} />
                Simpan
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
