import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mic } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { loginUser } from '../services/userService';
import { tts } from '../services/ttsService';

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 2600);
    return () => clearTimeout(t);
  }, []);

  // TTS announce halaman login saat splash selesai (a11y untuk tunanetra)
  useEffect(() => {
    if (!showSplash) {
      tts.speak('Halaman login VoiceBank. Silakan masukkan email dan password Anda.');
    }
  }, [showSplash]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setEmailError('');
    setPasswordError('');
    setLoading(true);
    try {
      const data = await loginUser({ email, password });
      login(data.access_token, data.user);
      tts.welcome(data.user.name);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.detail || 'Login gagal';
      if (msg.toLowerCase().includes('email') || msg.toLowerCase().includes('password')) {
        setEmailError(msg);
      } else {
        setEmailError(msg);
      }
      tts.loginError();
    } finally {
      setLoading(false);
    }
  };

  /* ── Splash Screen ── */
  if (showSplash) {
    return (
      <div className="
        min-h-screen min-h-dvh
        bg-[#f4f4f5] dark:bg-[#09090b]
        flex flex-col items-center justify-center gap-6 sm:gap-7
        text-zinc-900 dark:text-white font-sans
        selection:bg-pink-500/10 dark:selection:bg-[#fbcfe8]/30
        px-4
      ">
        <div className="
          w-20 h-20 sm:w-24 sm:h-24
          rounded-[24px] sm:rounded-[28px]
          bg-gradient-to-br from-pink-50 to-pink-100 dark:from-[#1a0d0d] dark:to-[#3d0f0f]
          border border-pink-500/30 dark:border-[#fbcfe8]/30
          flex items-center justify-center
          animate-scale-in
          shadow-[0_0_0_0_rgba(236,72,153,0.35)] dark:shadow-[0_0_0_0_rgba(251,207,232,0.35)]
          animate-pulse-ring
        ">
          <Mic size={30} className="sm:hidden text-pink-600 dark:text-[#fbcfe8]" strokeWidth={1.5} />
          <Mic size={36} className="hidden sm:block text-pink-600 dark:text-[#fbcfe8]" strokeWidth={1.5} />
        </div>
        <div className="font-syne text-[26px] sm:text-[32px] font-extrabold tracking-[0.18em] text-zinc-800 dark:text-white animate-fade-up">
          VOICE<span className="text-pink-600 dark:text-[#fbcfe8]">BANK</span>
          <span className="inline-block w-[3px] h-[1em] bg-pink-500 dark:bg-[#fbcfe8] align-text-bottom ml-0.5 animate-blink" />
        </div>
      </div>
    );
  }

  /* ── Login Form ── */
  return (
    <div className="
      min-h-screen min-h-dvh
      bg-[#f4f4f5] dark:bg-[#09090b]
      bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(99,102,241,0.08)_0%,transparent_70%)]
      dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(29,78,216,0.12)_0%,transparent_70%)]
      flex items-center justify-center
      p-4 sm:p-6
      selection:bg-pink-500/10 dark:selection:bg-[#fbcfe8]/30
      font-sans
    ">
      {/*
        Card: full-bleed on mobile (no rounded corners, no shadow gap),
        card-style on sm and up.
      */}
      <div className="
        relative w-full
        max-w-none sm:max-w-[420px] md:max-w-[440px]
        bg-white dark:bg-[#18181b]
        border-0 sm:border border-zinc-200 dark:border-white/8
        rounded-none sm:rounded-[24px]
        px-5 py-8 sm:px-9 sm:py-10
        shadow-none sm:shadow-xl dark:shadow-none
        backdrop-blur-[20px]
        animate-fade-up
      ">

        {/* Decorative corners — only visible on sm+ where border is shown */}
        <div className="hidden sm:block absolute w-6 h-6 border-pink-500/30 dark:border-[#fbcfe8]/30 border-solid top-[-1px] left-[-1px] border-t border-l rounded-tl-[24px]" />
        <div className="hidden sm:block absolute w-6 h-6 border-pink-500/30 dark:border-[#fbcfe8]/30 border-solid bottom-[-1px] right-[-1px] border-b border-r rounded-br-[24px]" />

        {/* Brand */}
        <div className="flex flex-col items-center gap-3 sm:gap-3.5 mb-8 sm:mb-9">
          <div className="
            w-12 h-12 sm:w-14 sm:h-14
            rounded-xl sm:rounded-2xl
            bg-gradient-to-br from-pink-50 to-pink-100 dark:from-[#1c0808] dark:to-[#3d0f0f]
            border border-pink-500/20 dark:border-[#fbcfe8]/25
            flex items-center justify-center
          ">
            <Mic size={20} className="sm:hidden text-pink-600 dark:text-[#fbcfe8]" strokeWidth={1.5} />
            <Mic size={24} className="hidden sm:block text-pink-600 dark:text-[#fbcfe8]" strokeWidth={1.5} />
          </div>
          <div className="font-syne text-[20px] sm:text-[22px] font-extrabold text-zinc-800 dark:text-white tracking-[0.12em]">
            VOICE<span className="text-pink-600 dark:text-[#fbcfe8]">BANK</span>
          </div>
          <p className="text-[12px] sm:text-[13px] font-light text-zinc-400 dark:text-white/38 text-center tracking-[0.01em] mt-[-4px] sm:mt-[-6px]">
            Masuk ke akun Anda untuk melanjutkan
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin}>
          <p className="text-[10px] sm:text-[11px] font-medium tracking-[0.14em] uppercase text-zinc-400 dark:text-white/30 mb-4">
            Kredensial
          </p>

          <div className="flex flex-col gap-3 mb-5 sm:mb-6">
            {/* Email */}
            <div className="flex flex-col gap-1">
              <label
                htmlFor="vb-email"
                className="text-[10px] sm:text-[11px] font-medium tracking-[0.1em] uppercase text-zinc-500 dark:text-white/40 pl-0.5"
              >
                Email
              </label>
              <input
                id="vb-email"
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`
                  w-full
                  bg-zinc-50 dark:bg-white/4
                  border rounded-xl
                  px-4 py-3 sm:py-3.5
                  font-sans text-sm font-normal
                  text-zinc-900 dark:text-white
                  outline-none transition-all
                  placeholder-zinc-400 dark:placeholder-white/20
                  hover:border-zinc-300 dark:hover:border-white/20
                  focus:border-pink-500/55 dark:focus:border-[#fbcfe8]/55
                  focus:bg-pink-50/20 dark:focus:bg-[#fbcfe8]/4
                  /* Larger touch target on mobile */
                  min-h-[48px] sm:min-h-0
                  ${emailError
                    ? 'border-pink-500/55 dark:border-[#fbcfe8]/55'
                    : 'border-zinc-200 dark:border-white/8'
                  }
                `}
                autoComplete="email"
                inputMode="email"
              />
              {emailError && (
                <span className="text-xs font-normal text-pink-500 dark:text-pink-300 pl-1 min-h-[16px]">
                  {emailError}
                </span>
              )}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1">
              <label
                htmlFor="vb-password"
                className="text-[10px] sm:text-[11px] font-medium tracking-[0.1em] uppercase text-zinc-500 dark:text-white/40 pl-0.5"
              >
                Password
              </label>
              <input
                id="vb-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`
                  w-full
                  bg-zinc-50 dark:bg-white/4
                  border rounded-xl
                  px-4 py-3 sm:py-3.5
                  font-sans text-sm font-normal
                  text-zinc-900 dark:text-white
                  outline-none transition-all
                  placeholder-zinc-400 dark:placeholder-white/20
                  hover:border-zinc-300 dark:hover:border-white/20
                  focus:border-pink-500/55 dark:focus:border-[#fbcfe8]/55
                  focus:bg-pink-50/20 dark:focus:bg-[#fbcfe8]/4
                  min-h-[48px] sm:min-h-0
                  ${passwordError
                    ? 'border-pink-500/55 dark:border-[#fbcfe8]/55'
                    : 'border-zinc-200 dark:border-white/8'
                  }
                `}
                autoComplete="current-password"
              />
              {passwordError && (
                <span className="text-xs font-normal text-pink-500 dark:text-pink-300 pl-1 min-h-[16px]">
                  {passwordError}
                </span>
              )}
            </div>
          </div>

          {/* Submit button — taller on mobile for easier tapping */}
          <button
            type="submit"
            disabled={loading}
            className="
              w-full
              min-h-[52px] sm:min-h-0 p-[15px]
              rounded-xl border-none cursor-pointer
              font-sans text-sm font-medium tracking-[0.05em]
              text-[#09090b]
              bg-gradient-to-br from-[#fbcfe8] to-[#f472b6]
              transition-all hover:opacity-88 active:scale-[0.98]
              relative overflow-hidden
              after:absolute after:inset-0 after:bg-gradient-to-b after:from-white/8 after:to-transparent after:pointer-events-none
            "
          >
            {loading ? 'Memproses...' : 'Masuk sekarang'}
          </button>
        </form>

        <div className="h-[1px] bg-zinc-200 dark:bg-white/8 my-6 sm:my-7" />

        <p className="text-center text-[13px] font-light text-zinc-400 dark:text-white/30">
          Belum punya akun?{' '}
          <Link
            to="/register"
            className="text-pink-600 dark:text-pink-300 font-medium no-underline transition-colors hover:text-pink-700 dark:hover:text-red-300"
          >
            Daftar gratis
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;