import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mic } from 'lucide-react';
import PopupMessage from '../components/PopupMessage';

function LoginPage() {
  const navigate = useNavigate();

  // State untuk Splash Screen
  const [showSplash, setShowSplash] = useState(true);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();

    setEmailError('');
    setPasswordError('');

    const storedUser = JSON.parse(
        localStorage.getItem('registeredUser')
    );

    if (!storedUser) {
        setEmailError('Email belum terdaftar');
        return;
    }

    if (email !== storedUser.email) {
        setEmailError('Email belum terdaftar');
        return;
    }

    if (password !== storedUser.password) {
        setPasswordError('Password salah');
        return;
    }

    navigate('/dashboard');
  };

  if (showSplash) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <div className="animate-bounce">
          <div className="p-8 bg-red-600 rounded-3xl shadow-[0_0_80px_rgba(220,38,38,0.4)]">
             <Mic className="w-20 h-20 text-white" />
          </div>
        </div>
        <h1 className="mt-8 text-4xl font-extrabold text-white tracking-widest animate-pulse">
          VOICEBANK
        </h1>
      </div>
    );
  }

  // Render Form Login Utama
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-8 animate-fadeIn">
        
        {/* Header Logo */}
        <div className="flex flex-col items-center mb-8">
           <div className="p-3 bg-red-600/10 rounded-2xl border border-red-500/20 mb-4">
              <Mic className="w-8 h-8 text-red-500" />
           </div>
           <h1 className="text-3xl font-bold text-white tracking-wide">Login</h1>
           <p className="text-gray-400 mt-2 text-sm text-center">Masuk ke akun VoiceBank Anda untuk melanjutkan</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all font-medium"
            />
            <PopupMessage message={emailError} />
          </div>

          <div className="space-y-1">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all font-medium"
            />
            <PopupMessage message={passwordError} />
          </div>

          <button 
            type="submit"
            className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-red-900/30 active:scale-95 mt-6"
          >
            Login
          </button>
        </form>

        <p className="text-center text-gray-400 mt-8 text-sm">
          Belum punya akun?{' '}
          <Link to="/register" className="text-red-500 font-bold hover:text-red-400 transition-colors">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;