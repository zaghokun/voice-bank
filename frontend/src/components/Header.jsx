import { useNavigate } from 'react-router-dom';
import { Bell, User as UserIcon } from 'lucide-react';

/* ─── Styles ─── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&family=Syne:wght@700;800&family=DM+Mono:wght@400;500&display=swap');

  @keyframes hd-fade-down {
    from { opacity: 0; transform: translateY(-8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes hd-pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.4; }
  }

  .hd-root * { box-sizing: border-box; margin: 0; padding: 0; }

  .hd-header {
    font-family: 'DM Sans', sans-serif;
    height: 72px;
    background: rgba(9,9,11,0.92);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(255,255,255,0.08);
    padding: 0 24px;
    display: flex; align-items: center; justify-content: space-between;
    flex-shrink: 0;
    position: sticky; top: 0; z-index: 10;
    animation: hd-fade-down 0.4s cubic-bezier(.22,1,.36,1) both;
  }

  /* ── Left: greeting ── */
  .hd-left { display: flex; flex-direction: column; gap: 3px; }
  .hd-greeting {
    font-size: 10px; font-weight: 500; letter-spacing: 0.14em;
    text-transform: uppercase; color: rgba(255,255,255,0.3);
  }
  .hd-name {
    font-family: 'Syne', sans-serif;
    font-size: 17px; font-weight: 800; letter-spacing: 0.02em; color: #ffffff;
  }
  .hd-name span { color: #fbcfe8; }

  /* ── Right: actions ── */
  .hd-right { display: flex; align-items: center; gap: 10px; }

  /* Account info pill */
  .hd-account {
    display: flex; flex-direction: column; align-items: flex-end;
    padding: 7px 14px;
    background: #18181b;
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px;
    gap: 2px;
  }
  @media (max-width: 600px) { .hd-account { display: none; } }
  .hd-account-name {
    font-size: 12px; font-weight: 500; color: #ffffff;
  }
  .hd-account-num {
    font-family: 'DM Mono', monospace;
    font-size: 10px; letter-spacing: 0.08em; color: rgba(255,255,255,0.3);
  }

  /* Divider */
  .hd-divider {
    width: 1px; height: 28px;
    background: rgba(255,255,255,0.08);
  }
  @media (max-width: 600px) { .hd-divider { display: none; } }

  /* Bell button */
  .hd-bell {
    position: relative;
    width: 38px; height: 38px; border-radius: 11px;
    background: #18181b;
    border: 1px solid rgba(255,255,255,0.08);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; color: rgba(255,255,255,0.4);
    transition: background 0.2s, color 0.2s, border-color 0.2s;
  }
  .hd-bell:hover {
    background: rgba(255,255,255,0.08);
    border-color: rgba(255,255,255,0.12);
    color: #ffffff;
  }
  .hd-bell:active { transform: scale(0.95); }
  .hd-bell-dot {
    position: absolute; top: 8px; right: 8px;
    width: 7px; height: 7px; border-radius: 50%;
    background: #fbcfe8;
    border: 1.5px solid #09090b;
    animation: hd-pulse 2s ease-in-out infinite;
  }

  /* Avatar */
  .hd-avatar {
    width: 38px; height: 38px; border-radius: 11px;
    background: rgba(251,207,232,0.08);
    border: 1px solid rgba(251,207,232,0.18);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; color: #f9a8d4; overflow: hidden;
    transition: background 0.2s, border-color 0.2s;
  }
  .hd-avatar:hover {
    background: rgba(251,207,232,0.15);
    border-color: rgba(251,207,232,0.35);
  }
  .hd-avatar:active { transform: scale(0.95); }
  .hd-avatar img { width: 100%; height: 100%; object-fit: cover; }
`;

function StyleTag() {
  return <style dangerouslySetInnerHTML={{ __html: styles }} />;
}

function generateAccountNumber() {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString();
}

export default function Header() {
  const navigate = useNavigate();

  const user          = JSON.parse(localStorage.getItem('registeredUser')) || { name: 'Pengguna' };
  const accountNumber = localStorage.getItem('accountNumber') || (() => {
    const n = generateAccountNumber();
    localStorage.setItem('accountNumber', n);
    return n;
  })();

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Selamat Pagi' :
    hour < 18 ? 'Selamat Siang' :
                'Selamat Malam';

  const firstName = user?.name?.split(' ')[0] || 'Pengguna';

  /* Format account: 829 3810 2938 style */
  const fmtAccount = accountNumber.replace(/(\d{3})(\d{4})(\d{3,})/, '$1 $2 $3');

  return (
    <div className="hd-root">
      <StyleTag />
      <header className="hd-header">

        {/* Left */}
        <div className="hd-left">
          <span className="hd-greeting">{greeting}</span>
          <span className="hd-name">{firstName.toUpperCase()}<span>.</span></span>
        </div>

        {/* Right */}
        <div className="hd-right">

          {/* Account pill */}
          <div className="hd-account">
            <span className="hd-account-name">{user?.name}</span>
            <span className="hd-account-num">{fmtAccount}</span>
          </div>

          <div className="hd-divider" />

          {/* Bell */}
          <button
            className="hd-bell"
            onClick={() => navigate('/history')}
            aria-label="Riwayat"
          >
            <Bell size={15} strokeWidth={1.75} />
            <span className="hd-bell-dot" />
          </button>

          {/* Avatar */}
          <div
            className="hd-avatar"
            onClick={() => navigate('/profile')}
            role="button"
            aria-label="Profil"
          >
            {user?.avatar
              ? <img src={user.avatar} alt="Foto profil" />
              : <UserIcon size={16} strokeWidth={1.75} />
            }
          </div>

        </div>
      </header>
    </div>
  );
}