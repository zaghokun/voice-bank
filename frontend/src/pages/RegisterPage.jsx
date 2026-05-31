import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mic } from 'lucide-react';

/* ─── Shared style tag (same design system as LoginPage) ─── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&family=Syne:wght@700;800&display=swap');

  @keyframes vb-fade-up {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes vb-blink {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0; }
  }

  .vb-root * { box-sizing: border-box; }

  /* ── Page shell ── */
  .vb-page {
    font-family: 'DM Sans', sans-serif;
    min-height: 100svh;
    background: #09090b;
    background-image:
      radial-gradient(ellipse 80% 60% at 50% -10%, rgba(29,78,216,0.12) 0%, transparent 70%);
    display: flex; align-items: center; justify-content: center;
    padding: 24px;
  }

  /* ── Card ── */
  .vb-card {
    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03);
    width: 100%; max-width: 420px;
    position: relative;
    background: #18181b;
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 24px;
    padding: 40px 36px 36px;
    backdrop-filter: blur(20px);
    animation: vb-fade-up 0.6s cubic-bezier(.22,1,.36,1) both;
  }

  /* ── Decorative corners ── */
  .vb-corner {
    position: absolute; width: 24px; height: 24px;
    border-color: rgba(251,207,232,0.3); border-style: solid;
  }
  .vb-corner-tl { top: -1px; left: -1px; border-width: 1px 0 0 1px; border-radius: 24px 0 0 0; }
  .vb-corner-br { bottom: -1px; right: -1px; border-width: 0 1px 1px 0; border-radius: 0 0 24px 0; }

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
    border: 1px solid rgba(251,207,232,0.25);
    display: flex; align-items: center; justify-content: center;
  }
  .vb-wordmark {
    font-family: 'Syne', sans-serif;
    font-size: 22px; font-weight: 800;
    color: #ffffff; letter-spacing: 0.12em;
  }
  .vb-wordmark span { color: #fbcfe8; }
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
    color: rgba(255,255,255,0.3);
    margin-bottom: 18px;
  }

  /* ── Field group ── */
  .vb-field-group { display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px; }
  .vb-field { display: flex; flex-direction: column; gap: 4px; }
  .vb-field label {
    font-size: 11px; font-weight: 500;
    letter-spacing: 0.1em; text-transform: uppercase;
    color: rgba(255,255,255,0.4);
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
    color: #ffffff; outline: none;
    transition: border-color 0.2s, background 0.2s;
    caret-color: #fbcfe8;
  }
  .vb-input::placeholder { color: rgba(255,255,255,0.2); }
  .vb-input:hover  { border-color: rgba(255,255,255,0.2); }
  .vb-input:focus  {
    border-color: rgba(251,207,232,0.55);
    background: rgba(251,207,232,0.04);
  }
  .vb-input.vb-error { border-color: rgba(251,207,232,0.55); }

  /* ── Password strength bar ── */
  .vb-strength-wrap {
    display: flex; gap: 4px; margin-top: 6px;
  }
  .vb-strength-seg {
    flex: 1; height: 3px; border-radius: 99px;
    background: rgba(255,255,255,0.08);
    transition: background 0.3s;
  }
  .vb-strength-seg.active-weak   { background: #fbcfe8; }
  .vb-strength-seg.active-fair   { background: #f59e0b; }
  .vb-strength-seg.active-strong { background: #22c55e; }
  .vb-strength-label {
    font-size: 11px; color: rgba(255,255,255,0.3);
    margin-top: 4px; padding-left: 2px;
    transition: color 0.3s;
  }
  .vb-strength-label.weak   { color: #f9a8d4; }
  .vb-strength-label.fair   { color: #fbbf24; }
  .vb-strength-label.strong { color: #10b981; }

  /* ── Error msg ── */
  .vb-error-msg {
    font-size: 12px; font-weight: 400;
    color: #f9a8d4; padding-left: 4px;
  }

  /* ── Divider ── */
  .vb-divider {
    height: 1px; background: rgba(255,255,255,0.08);
    margin: 28px 0;
  }

  /* ── Submit button ── */
  .vb-btn {
    width: 100%; padding: 15px;
    border-radius: 12px; border: none; cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px; font-weight: 500; letter-spacing: 0.06em;
    color: #ffffff;
    background: linear-gradient(135deg, #fbcfe8 0%, #f472b6 100%);
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
    margin-top: 22px; text-align: center;
    font-size: 13px; font-weight: 300;
    color: rgba(255,255,255,0.3);
  }
  .vb-footer a {
    color: #f9a8d4; font-weight: 500;
    text-decoration: none; transition: color 0.15s;
  }
  .vb-footer a:hover { color: #fca5a5; }

  /* ── Terms note ── */
  .vb-terms {
    margin-top: 12px; text-align: center;
    font-size: 11px; font-weight: 300;
    color: rgba(255,255,255,0.2);
    line-height: 1.6;
  }
  .vb-terms a { color: rgba(255,255,255,0.4); text-decoration: underline; text-underline-offset: 2px; }
`;

function StyleTag() {
  return <style dangerouslySetInnerHTML={{ __html: styles }} />;
}

function getStrength(pw) {
  if (!pw) return { level: 0, label: '', cls: '' };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { level: 1, label: 'Lemah', cls: 'weak' };
  if (score <= 2) return { level: 2, label: 'Cukup', cls: 'fair' };
  return { level: 3, label: 'Kuat', cls: 'strong' };
}

function RegisterPage() {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');

  const strength = getStrength(password);

  const handleRegister = (e) => {
    e.preventDefault();
    setNameError('');
    setEmailError('');

    const nameRegex = /^[A-Za-z\s]+$/;
    if (!nameRegex.test(name)) { setNameError('Nama hanya berupa huruf'); return; }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) { setEmailError('Masukkan email yang valid'); return; }

    localStorage.setItem('registeredUser', JSON.stringify({ name, email, password }));
    navigate('/');
  };

  const segClass = (i) => {
    if (!password || strength.level < i) return 'vb-strength-seg';
    const map = { 1: 'active-weak', 2: 'active-fair', 3: 'active-strong' };
    return `vb-strength-seg ${map[strength.level]}`;
  };

  return (
    <div className="vb-root">
      <StyleTag />
      <div className="vb-page">
        <div className="vb-card">
          <div className="vb-corner vb-corner-tl" />
          <div className="vb-corner vb-corner-br" />

          {/* Brand */}
          <div className="vb-brand">
            <div className="vb-icon-wrap">
              <Mic size={24} color="#fbcfe8" strokeWidth={1.5} />
            </div>
            <div className="vb-wordmark">VOICE<span>BANK</span></div>
            <p className="vb-tagline">Buat akun baru Anda</p>
          </div>

          {/* Form */}
          <form onSubmit={handleRegister} noValidate>
            <p className="vb-section-label">Informasi Akun</p>

            <div className="vb-field-group">
              {/* Name */}
              <div className="vb-field">
                <label htmlFor="vb-name">Nama lengkap</label>
                <input
                  id="vb-name"
                  type="text"
                  placeholder="Nama Anda"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`vb-input${nameError ? ' vb-error' : ''}`}
                  autoComplete="name"
                />
                {nameError && <span className="vb-error-msg">{nameError}</span>}
              </div>

              {/* Email */}
              <div className="vb-field">
                <label htmlFor="vb-email">Email</label>
                <input
                  id="vb-email"
                  type="text"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`vb-input${emailError ? ' vb-error' : ''}`}
                  autoComplete="email"
                />
                {emailError && <span className="vb-error-msg">{emailError}</span>}
              </div>

              {/* Password */}
              <div className="vb-field">
                <label htmlFor="vb-password">Password</label>
                <input
                  id="vb-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="vb-input"
                  autoComplete="new-password"
                />
                {/* Strength indicator */}
                {password && (
                  <>
                    <div className="vb-strength-wrap">
                      <div className={segClass(1)} />
                      <div className={segClass(2)} />
                      <div className={segClass(3)} />
                    </div>
                    <span className={`vb-strength-label ${strength.cls}`}>
                      Keamanan password: {strength.label}
                    </span>
                  </>
                )}
              </div>
            </div>

            <button type="submit" className="vb-btn">
              Buat akun
            </button>
          </form>

          <p className="vb-terms">
            Dengan mendaftar, Anda menyetujui{' '}
            <a href="#">Syarat &amp; Ketentuan</a> kami.
          </p>

          <div className="vb-divider" />

          <p className="vb-footer">
            Sudah punya akun?{' '}
            <Link to="/">Masuk di sini</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;