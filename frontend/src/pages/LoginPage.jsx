import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mic } from 'lucide-react';

/* ─── Keyframe styles injected once ─── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&family=Syne:wght@700;800&display=swap');

  @keyframes vb-fade-up {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes vb-scale-in {
    from { opacity: 0; transform: scale(0.88); }
    to   { opacity: 1; transform: scale(1); }
  }
  @keyframes vb-pulse-ring {
    0%, 100% { box-shadow: 0 0 0 0 rgba(220,38,38,0.35); }
    50%       { box-shadow: 0 0 0 14px rgba(220,38,38,0); }
  }
  @keyframes vb-spin-slow {
    to { transform: rotate(360deg); }
  }
  @keyframes vb-blink {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0; }
  }

  .vb-root * { box-sizing: border-box; }

  /* ── Splash ── */
  .vb-splash {
    font-family: 'DM Sans', sans-serif;
    min-height: 100svh;
    background: #080b10;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    gap: 28px;
  }
  .vb-splash-ring {
    width: 96px; height: 96px;
    border-radius: 28px;
    background: linear-gradient(135deg, #1a0d0d 0%, #3d0f0f 100%);
    border: 1px solid rgba(220,38,38,0.3);
    display: flex; align-items: center; justify-content: center;
    animation: vb-scale-in 0.5s cubic-bezier(.22,1,.36,1) both,
               vb-pulse-ring 2s ease-in-out 0.5s infinite;
  }
  .vb-splash-wordmark {
    font-family: 'Syne', sans-serif;
    font-size: 32px; font-weight: 800;
    letter-spacing: 0.18em;
    color: #fff;
    animation: vb-fade-up 0.6s 0.3s cubic-bezier(.22,1,.36,1) both;
  }
  .vb-splash-wordmark span { color: #dc2626; }
  .vb-splash-cursor {
    display: inline-block; width: 3px; height: 1em;
    background: #dc2626; vertical-align: text-bottom; margin-left: 2px;
    animation: vb-blink 1s 0.8s step-end infinite;
  }

  /* ── Page shell ── */
  .vb-page {
    font-family: 'DM Sans', sans-serif;
    min-height: 100svh;
    background: #080b10;
    display: flex; align-items: center; justify-content: center;
    padding: 24px;
    /* Subtle radial glow */
    background-image:
      radial-gradient(ellipse 80% 60% at 50% -10%, rgba(185,28,28,0.12) 0%, transparent 70%);
  }

  /* ── Card ── */
  .vb-card {
    width: 100%; max-width: 420px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 24px;
    padding: 40px 36px 36px;
    backdrop-filter: blur(20px);
    animation: vb-fade-up 0.6s cubic-bezier(.22,1,.36,1) both;
  }

  /* ── Brand header ── */
  .vb-brand {
    display: flex; flex-direction: column;
    align-items: center; gap: 14px;
    margin-bottom: 36px;
  }
  .vb-icon-wrap {
    width: 56px; height: 56px;
    border-radius: 16px;
    background: linear-gradient(145deg, #1c0808 0%, #3d0f0f 100%);
    border: 1px solid rgba(220,38,38,0.25);
    display: flex; align-items: center; justify-content: center;
  }
  .vb-wordmark {
    font-family: 'Syne', sans-serif;
    font-size: 22px; font-weight: 800;
    color: #fff; letter-spacing: 0.12em;
  }
  .vb-wordmark span { color: #dc2626; }
  .vb-tagline {
    font-size: 13px; font-weight: 300;
    color: rgba(255,255,255,0.38);
    text-align: center; letter-spacing: 0.01em;
    margin-top: -6px;
  }

  /* ── Section label ── */
  .vb-section-label {
    font-size: 11px; font-weight: 500;
    letter-spacing: 0.14em; text-transform: uppercase;
    color: rgba(255,255,255,0.25);
    margin-bottom: 18px;
  }

  /* ── Field group ── */
  .vb-field-group { display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px; }
  .vb-field { display: flex; flex-direction: column; gap: 4px; }
  .vb-field label {
    font-size: 11px; font-weight: 500;
    letter-spacing: 0.1em; text-transform: uppercase;
    color: rgba(255,255,255,0.35);
    padding-left: 2px;
  }
  .vb-input {
    width: 100%;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px;
    padding: 14px 16px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px; font-weight: 400;
    color: #fff;
    outline: none;
    transition: border-color 0.2s, background 0.2s;
    caret-color: #dc2626;
  }
  .vb-input::placeholder { color: rgba(255,255,255,0.2); }
  .vb-input:hover  { border-color: rgba(255,255,255,0.15); }
  .vb-input:focus  {
    border-color: rgba(220,38,38,0.55);
    background: rgba(220,38,38,0.04);
  }
  .vb-input.vb-error { border-color: rgba(220,38,38,0.55); }

  /* ── Error msg ── */
  .vb-error-msg {
    font-size: 12px; font-weight: 400;
    color: #f87171;
    padding-left: 4px;
    min-height: 16px;
  }

  /* ── Divider ── */
  .vb-divider {
    height: 1px; background: rgba(255,255,255,0.07);
    margin: 28px 0;
  }

  /* ── Submit button ── */
  .vb-btn {
    width: 100%;
    padding: 15px;
    border-radius: 12px;
    border: none; cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px; font-weight: 500;
    letter-spacing: 0.06em;
    color: #fff;
    background: #b91c1c;
    background-image: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
    transition: opacity 0.2s, transform 0.15s;
    position: relative; overflow: hidden;
  }
  .vb-btn::after {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 100%);
    pointer-events: none;
  }
  .vb-btn:hover  { opacity: 0.88; }
  .vb-btn:active { transform: scale(0.98); opacity: 1; }

  /* ── Footer ── */
  .vb-footer {
    margin-top: 22px;
    text-align: center;
    font-size: 13px; font-weight: 300;
    color: rgba(255,255,255,0.3);
  }
  .vb-footer a {
    color: #f87171; font-weight: 500;
    text-decoration: none;
    transition: color 0.15s;
  }
  .vb-footer a:hover { color: #fca5a5; }

  /* ── Decorative corner lines ── */
  .vb-corner {
    position: absolute; width: 24px; height: 24px;
    border-color: rgba(220,38,38,0.3);
    border-style: solid;
  }
  .vb-corner-tl { top: -1px; left: -1px; border-width: 1px 0 0 1px; border-radius: 24px 0 0 0; }
  .vb-corner-br { bottom: -1px; right: -1px; border-width: 0 1px 1px 0; border-radius: 0 0 24px 0; }
`;

function StyleTag() {
  return <style dangerouslySetInnerHTML={{ __html: styles }} />;
}

function LoginPage() {
  const navigate = useNavigate();
  const [showSplash, setShowSplash] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 2600);
    return () => clearTimeout(t);
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    setEmailError('');
    setPasswordError('');

    const storedUser = JSON.parse(localStorage.getItem('registeredUser'));
    if (!storedUser) { setEmailError('Email belum terdaftar'); return; }
    if (email !== storedUser.email) { setEmailError('Email belum terdaftar'); return; }
    if (password !== storedUser.password) { setPasswordError('Password salah'); return; }
    navigate('/dashboard');
  };

  /* ── Splash Screen ── */
  if (showSplash) {
    return (
      <div className="vb-root">
        <StyleTag />
        <div className="vb-splash">
          <div className="vb-splash-ring">
            <Mic size={36} color="#dc2626" strokeWidth={1.5} />
          </div>
          <div className="vb-splash-wordmark">
            VOICE<span>BANK</span>
            <span className="vb-splash-cursor" />
          </div>
        </div>
      </div>
    );
  }

  /* ── Login Form ── */
  return (
    <div className="vb-root">
      <StyleTag />
      <div className="vb-page">
        <div className="vb-card" style={{ position: 'relative' }}>

          {/* Decorative corners */}
          <div className="vb-corner vb-corner-tl" />
          <div className="vb-corner vb-corner-br" />

          {/* Brand */}
          <div className="vb-brand">
            <div className="vb-icon-wrap">
              <Mic size={24} color="#dc2626" strokeWidth={1.5} />
            </div>
            <div className="vb-wordmark">VOICE<span>BANK</span></div>
            <p className="vb-tagline">Masuk ke akun Anda untuk melanjutkan</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin}>
            <p className="vb-section-label">Kredensial</p>

            <div className="vb-field-group">
              <div className="vb-field">
                <label htmlFor="vb-email">Email</label>
                <input
                  id="vb-email"
                  type="email"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`vb-input${emailError ? ' vb-error' : ''}`}
                  autoComplete="email"
                />
                {emailError && <span className="vb-error-msg">{emailError}</span>}
              </div>

              <div className="vb-field">
                <label htmlFor="vb-password">Password</label>
                <input
                  id="vb-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`vb-input${passwordError ? ' vb-error' : ''}`}
                  autoComplete="current-password"
                />
                {passwordError && <span className="vb-error-msg">{passwordError}</span>}
              </div>
            </div>

            <button type="submit" className="vb-btn">
              Masuk sekarang
            </button>
          </form>

          <div className="vb-divider" />

          <p className="vb-footer">
            Belum punya akun?{' '}
            <Link to="/register">Daftar gratis</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;