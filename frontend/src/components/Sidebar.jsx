import { NavLink, useNavigate } from "react-router-dom";
import { Home, Send, Clock, Bell, User, LogOut, Mic } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

/* ─── Styles ─── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&family=Syne:wght@700;800&family=DM+Mono:wght@400;500&display=swap');

  @keyframes sb-fade-in {
    from { opacity: 0; transform: translateX(-12px); }
    to   { opacity: 1; transform: translateX(0); }
  }

  .sb-root * { box-sizing: border-box; margin: 0; padding: 0; }

  .sb-aside {
    font-family: 'DM Sans', sans-serif;
    width: 240px;
    height: 100%;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    background: #09090b;
    border-right: 1px solid rgba(255,255,255,0.08);
    position: relative;
    z-index: 20;
    animation: sb-fade-in 0.4s cubic-bezier(.22,1,.36,1) both;
  }

  /* subtle red ambient top-left */
  .sb-aside::before {
    content: '';
    position: absolute;
    top: -40px; left: -40px;
    width: 200px; height: 200px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(251,207,232,0.07) 0%, transparent 70%);
    pointer-events: none;
  }

  /* ── Brand ── */
  .sb-brand {
    height: 80px;
    display: flex; align-items: center;
    padding: 0 20px;
    border-bottom: 1px solid rgba(255,255,255,0.08);
    flex-shrink: 0;
    gap: 12px;
  }
  .sb-brand-icon {
    width: 36px; height: 36px; border-radius: 11px;
    background: #fbcfe8;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    box-shadow: 0 4px 16px rgba(251,207,232,0.3);
  }
  .sb-brand-name {
    font-family: 'Syne', sans-serif;
    font-size: 17px; font-weight: 800;
    color: #ffffff; letter-spacing: 0.04em;
  }
  .sb-brand-name span { color: #fbcfe8; }

  /* ── Nav ── */
  .sb-nav {
    flex: 1;
    padding: 20px 12px;
    display: flex; flex-direction: column; gap: 4px;
    overflow-y: auto;
  }
  .sb-nav::-webkit-scrollbar { width: 0; }

  .sb-nav-label {
    font-size: 10px; font-weight: 500; letter-spacing: 0.14em;
    text-transform: uppercase; color: rgba(255,255,255,0.2);
    padding: 0 8px; margin: 8px 0 6px;
  }

  .sb-link {
    display: flex; align-items: center; gap: 12px;
    padding: 11px 12px; border-radius: 12px;
    font-size: 13px; font-weight: 500;
    color: rgba(255,255,255,0.4);
    border: 1px solid transparent;
    text-decoration: none;
    transition: background 0.2s, color 0.2s, border-color 0.2s;
    position: relative;
    cursor: pointer;
  }
  .sb-link:hover {
    background: rgba(255,255,255,0.04);
    color: #ffffff;
  }
  .sb-link.active {
    background: rgba(251,207,232,0.10);
    border-color: rgba(251,207,232,0.20);
    color: #f9a8d4;
  }
  .sb-link-icon {
    width: 32px; height: 32px; border-radius: 9px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    background: rgba(255,255,255,0.04);
    transition: background 0.2s;
  }
  .sb-link.active .sb-link-icon {
    background: rgba(251,207,232,0.15);
  }
  .sb-link:hover .sb-link-icon {
    background: rgba(255,255,255,0.08);
  }
  /* active left accent bar */
  .sb-link.active::before {
    content: '';
    position: absolute; left: -12px; top: 50%;
    transform: translateY(-50%);
    width: 3px; height: 18px; border-radius: 0 3px 3px 0;
    background: #fbcfe8;
  }

  /* ── User strip ── */
  .sb-user {
    margin: 0 12px 16px;
    background: #18181b;
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 14px;
    padding: 12px;
    display: flex; align-items: center; gap: 10px;
  }
  .sb-user-avatar {
    width: 34px; height: 34px; border-radius: 10px;
    background: rgba(251,207,232,0.15);
    border: 1px solid rgba(251,207,232,0.2);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; color: #f9a8d4;
  }
  .sb-user-name {
    font-size: 13px; font-weight: 500;
    color: #ffffff;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    flex: 1;
  }
  .sb-user-role {
    font-size: 10px; font-weight: 500; letter-spacing: 0.08em;
    color: rgba(255,255,255,0.3); margin-top: 1px;
  }

  /* ── Logout ── */
  .sb-footer {
    padding: 0 12px 20px;
    flex-shrink: 0;
    border-top: 1px solid rgba(255,255,255,0.08);
    padding-top: 16px;
  }
  .sb-logout {
    width: 100%;
    display: flex; align-items: center; gap: 10px;
    padding: 11px 14px; border-radius: 12px;
    font-size: 13px; font-weight: 500;
    color: rgba(255,255,255,0.3);
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    cursor: pointer;
    transition: background 0.2s, color 0.2s, border-color 0.2s;
    font-family: 'DM Sans', sans-serif;
  }
  .sb-logout:hover {
    background: rgba(251,207,232,0.10);
    border-color: rgba(251,207,232,0.20);
    color: #f9a8d4;
  }
  .sb-logout:active { transform: scale(0.98); }
  .sb-logout-icon {
    width: 28px; height: 28px; border-radius: 8px;
    background: rgba(255,255,255,0.04);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; transition: background 0.2s;
  }
  .sb-logout:hover .sb-logout-icon { background: rgba(251,207,232,0.15); }
  
  /* ── Responsive Mobile (Bottom Nav) ── */
  @media (max-width: 768px) {
    .sb-aside {
      width: 100%; height: auto; flex-direction: row;
      border-right: none; border-top: 1px solid rgba(255,255,255,0.08);
      padding: 8px; justify-content: space-around;
      z-index: 50;
    }
    .sb-brand, .sb-nav-label, .sb-footer, .sb-user { display: none !important; }
    .sb-nav {
      flex-direction: row; justify-content: space-around;
      align-items: center; width: 100%; padding: 0;
    }
    .sb-link {
      flex-direction: column; gap: 4px; padding: 4px 12px; font-size: 10px;
    }
    .sb-link.active::before { display: none; }
    .sb-link-icon { width: 28px; height: 28px; }
  }
`;

function StyleTag() {
  return <style dangerouslySetInnerHTML={{ __html: styles }} />;
}

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", Icon: Home },
  { to: "/transfer", label: "Transfer", Icon: Send },
  { to: "/history", label: "Riwayat", Icon: Clock },
  { to: "/profile", label: "Profil", Icon: User },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const user = JSON.parse(localStorage.getItem("registeredUser")) || {
    name: "Pengguna",
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="sb-root">
      <StyleTag />
      <aside className="sb-aside">
        {/* Brand */}
        <div className="sb-brand">
          <div className="sb-brand-icon">
            <Mic size={18} color="#09090b" strokeWidth={1.75} />
          </div>
          <span className="sb-brand-name">
            Voice<span>Bank</span>
          </span>
        </div>

        {/* Nav */}
        <nav className="sb-nav">
          <p className="sb-nav-label">Menu</p>
          {NAV_ITEMS.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `sb-link${isActive ? " active" : ""}`
              }
            >
              <div className="sb-link-icon">
                <Icon size={15} strokeWidth={1.75} />
              </div>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer / logout */}
        <div className="sb-footer">
          <button className="sb-logout" onClick={handleLogout}>
            <div className="sb-logout-icon">
              <LogOut size={14} strokeWidth={1.75} />
            </div>
            Keluar
          </button>
        </div>
      </aside>
    </div>
  );
}
