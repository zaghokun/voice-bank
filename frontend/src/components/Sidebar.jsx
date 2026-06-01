import { NavLink, useNavigate } from "react-router-dom";
import { Home, Send, Clock, User, LogOut, Mic } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", Icon: Home },
  { to: "/transfer", label: "Transfer", Icon: Send },
  { to: "/history", label: "Riwayat", Icon: Clock },
  { to: "/profile", label: "Profil", Icon: User },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <aside className="font-sans w-[240px] h-full flex-shrink-0 flex flex-col bg-white dark:bg-[#09090b] border-r border-zinc-200 dark:border-white/8 relative z-20 animate-fade-up max-md:w-full max-md:h-auto max-md:flex-row max-md:border-r-0 max-md:border-t max-md:border-zinc-200 dark:max-md:border-white/8 max-md:p-2 max-md:justify-around max-md:z-50 selection:bg-[#fbcfe8]/30 before:absolute before:-top-10 before:-left-10 before:w-[200px] before:h-[200px] before:rounded-full before:bg-[radial-gradient(circle,rgba(251,207,232,0.07)_0%,transparent_70%)] before:pointer-events-none max-md:before:hidden">
      {/* Brand */}
      <div className="h-20 flex items-center px-5 border-b border-zinc-200 dark:border-white/8 flex-shrink-0 gap-3 max-md:hidden">
        <div className="w-9 h-9 rounded-[11px] bg-pink-500/10 dark:bg-[#fbcfe8] flex items-center justify-center flex-shrink-0 shadow-[0_4px_16px_rgba(236,72,153,0.15)] dark:shadow-[0_4px_16px_rgba(251,207,232,0.3)]">
          <Mic size={18} className="text-pink-600 dark:text-[#09090b]" strokeWidth={1.75} />
        </div>
        <span className="font-syne text-[17px] font-extrabold text-zinc-800 dark:text-white tracking-[0.04em]">
          Voice<span className="text-pink-500 dark:text-[#fbcfe8]">Bank</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-5 px-3 flex flex-col gap-1 overflow-y-auto no-scrollbar max-md:flex-row max-md:justify-around max-md:items-center max-md:w-full max-md:p-0">
        <p className="text-[10px] font-medium tracking-[0.14em] uppercase text-zinc-400 dark:text-white/20 px-2 my-2 mb-1.5 max-md:hidden">Menu</p>
        {NAV_ITEMS.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `group flex items-center gap-3 py-[11px] px-3 rounded-xl text-[13px] font-medium transition-all duration-200 relative cursor-pointer border max-md:flex-col max-md:gap-1 max-md:p-1 max-md:px-3 max-md:text-[10px] ${
                isActive
                  ? "bg-pink-50 border-pink-100 text-pink-600 before:absolute before:-left-3 before:top-1/2 before:-translate-y-1/2 before:w-[3px] before:h-[18px] before:rounded-r-[3px] before:bg-pink-500 dark:bg-[#fbcfe8]/10 dark:border-[#fbcfe8]/20 dark:text-[#f9a8d4] dark:before:bg-[#fbcfe8] max-md:before:hidden"
                  : "text-zinc-500 border-transparent hover:bg-zinc-100/50 hover:text-zinc-800 dark:text-white/40 dark:hover:bg-white/4 dark:hover:text-white"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className={`w-8 h-8 rounded-[9px] flex items-center justify-center flex-shrink-0 transition-colors max-md:w-7 max-md:h-7 ${
                    isActive ? "bg-pink-500/10 dark:bg-[#fbcfe8]/15" : "bg-zinc-100 dark:bg-white/4 group-hover:bg-zinc-200/80 dark:group-hover:bg-white/8"
                  }`}
                >
                  <Icon size={15} strokeWidth={1.75} />
                </div>
                {label}
              </>
            )}
          </NavLink>
        ))}

        {/* Logout Button (Mobile Only) */}
        <button
          onClick={handleLogout}
          className="group flex items-center gap-3 py-[11px] px-3 rounded-xl text-[13px] font-medium transition-all duration-200 relative cursor-pointer border text-zinc-500 border-transparent hover:bg-zinc-100/50 hover:text-zinc-800 dark:text-white/40 dark:hover:bg-white/4 dark:hover:text-white md:hidden max-md:flex max-md:flex-col max-md:gap-1 max-md:p-1 max-md:px-3 max-md:text-[10px] active:scale-95"
        >
          <div className="w-8 h-8 rounded-[9px] flex items-center justify-center flex-shrink-0 transition-colors max-md:w-7 max-md:h-7 bg-zinc-100 dark:bg-white/4 group-hover:bg-zinc-200/80 dark:group-hover:bg-white/8">
            <LogOut size={15} strokeWidth={1.75} />
          </div>
          Keluar
        </button>
      </nav>

      {/* Footer / logout */}
      <div className="px-3 pb-5 flex-shrink-0 border-t border-zinc-200 dark:border-white/8 pt-4 max-md:hidden">
        <button className="group w-full flex items-center gap-2.5 py-[11px] px-3.5 rounded-xl text-[13px] font-medium text-zinc-600 bg-zinc-100/50 border border-zinc-200 cursor-pointer transition-all duration-200 font-sans hover:bg-pink-500/5 hover:border-pink-500/20 hover:text-pink-600 dark:text-white/30 dark:bg-white/4 dark:border-white/8 dark:hover:bg-[#fbcfe8]/10 dark:hover:border-[#fbcfe8]/20 dark:hover:text-[#f9a8d4] active:scale-98" onClick={handleLogout}>
          <div className="w-7 h-7 rounded-lg bg-zinc-200/50 dark:bg-white/4 flex items-center justify-center flex-shrink-0 transition-colors group-hover:bg-pink-500/10 dark:group-hover:bg-[#fbcfe8]/15">
            <LogOut size={14} strokeWidth={1.75} />
          </div>
          Keluar
        </button>
      </div>
    </aside>
  );
}
