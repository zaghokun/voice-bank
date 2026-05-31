import { useNavigate } from 'react-router-dom';
import { Bell, User as UserIcon, Sun, Moon } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

function generateAccountNumber() {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString();
}

export default function Header() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const user          = JSON.parse(localStorage.getItem('registeredUser')) || { name: 'Pengguna' };
  const accountNumber = localStorage.getItem('accountNumber') || (() => {
    const n = generateAccountNumber();
    localStorage.setItem('accountNumber', n);
    return n;
  })();

  /* Format account: 829 3810 2938 style */
  const fmtAccount = accountNumber.replace(/(\d{3})(\d{4})(\d{3,})/, '$1 $2 $3');

  return (
    <header className="font-sans h-[72px] bg-white/92 dark:bg-[#09090b]/92 backdrop-blur-md border-b border-zinc-200 dark:border-white/8 px-6 flex items-center justify-end gap-2.5 flex-shrink-0 sticky top-0 z-10 animate-fade-down selection:bg-[#fbcfe8]/30">

      {/* Right */}
      <div className="flex items-center gap-2.5">

        {/* Account pill */}
        <div className="flex flex-col items-end px-3.5 py-1.5 bg-zinc-50 dark:bg-[#18181b] border border-zinc-200 dark:border-white/8 rounded-xl gap-0.5 max-sm:hidden">
          <span className="text-xs font-medium text-zinc-800 dark:text-white">{user?.name}</span>
          <span className="font-mono text-[10px] tracking-[0.08em] text-zinc-400 dark:text-white/30">{fmtAccount}</span>
        </div>

        <div className="w-[1px] h-7 bg-zinc-200 dark:bg-white/8 max-sm:hidden" />

        {/* Theme Switcher Button */}
        <button
          className="w-[38px] h-[38px] rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-center cursor-pointer text-zinc-600 transition-all hover:bg-zinc-100 hover:text-zinc-900 dark:bg-[#18181b] dark:border-white/8 dark:text-white/40 dark:hover:bg-white/8 dark:hover:text-white active:scale-95"
          onClick={toggleTheme}
          aria-label="Ubah tema"
        >
          {theme === 'dark' ? <Sun size={15} strokeWidth={1.75} /> : <Moon size={15} strokeWidth={1.75} />}
        </button>

        {/* Bell */}
        <button
          className="relative w-[38px] h-[38px] rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-center cursor-pointer text-zinc-600 transition-all hover:bg-zinc-100 hover:text-zinc-900 dark:bg-[#18181b] dark:border-white/8 dark:text-white/40 dark:hover:bg-white/8 dark:hover:text-white active:scale-95"
          onClick={() => navigate('/history')}
          aria-label="Riwayat"
        >
          <Bell size={15} strokeWidth={1.75} />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-pink-400 border border-white dark:border-[#09090b] animate-pulse" />
        </button>

        {/* Avatar */}
        <div
          className="w-[38px] h-[38px] rounded-xl bg-pink-500/5 border border-pink-500/20 flex items-center justify-center cursor-pointer text-pink-600 overflow-hidden transition-all hover:bg-pink-500/10 dark:bg-[#fbcfe8]/8 dark:border-[#fbcfe8]/18 dark:text-[#f9a8d4] dark:hover:bg-[#fbcfe8]/15 dark:hover:border-[#fbcfe8]/35 active:scale-95"
          onClick={() => navigate('/profile')}
          role="button"
          aria-label="Profil"
        >
          {user?.avatar
            ? <img src={user.avatar} alt="Foto profil" className="w-full h-full object-cover" />
            : <UserIcon size={16} strokeWidth={1.75} />
          }
        </div>

      </div>
    </header>
  );
}