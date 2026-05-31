import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mic } from 'lucide-react';
import PopupMessage from '../components/PopupMessage';

function RegisterPage() {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');

  const handleRegister = (e) => {
    e.preventDefault();

    setNameError('');
    setEmailError('');

    const nameRegex = /^[A-Za-z\s]+$/;

    if (!nameRegex.test(name)) {
        setNameError('Nama hanya berupa huruf');
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
        setEmailError('Masukkan email yang valid');
        return;
    }

    const userData = {
        name,
        email,
        password,
    };

    localStorage.setItem( 
        'registeredUser',
        JSON.stringify(userData)
    );

    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-8 animate-fadeIn">
        
        {/* Header Logo */}
        <div className="flex flex-col items-center mb-8">
           <div className="p-3 bg-red-600/10 rounded-2xl border border-red-500/20 mb-4">
              <Mic className="w-8 h-8 text-red-500" />
           </div>
           <h1 className="text-3xl font-bold text-white tracking-wide">Register</h1>
           <p className="text-gray-400 mt-2 text-sm text-center">Buat akun VoiceBank baru</p>
        </div>

        <form onSubmit={handleRegister} noValidate className="space-y-5">
          <div className="space-y-1">
            <input
              type="text"
              placeholder="Nama"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all font-medium"
            />
            <PopupMessage message={nameError} />
          </div>

          <div className="space-y-1">
            <input
              type="text"
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
          </div>

          <button 
            type="submit"
            className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-red-900/30 active:scale-95 mt-6"
          >
            Register
          </button>
        </form>

        <p className="text-center text-gray-400 mt-8 text-sm">
          Sudah punya akun?{' '}
          <Link to="/" className="text-red-500 font-bold hover:text-red-400 transition-colors">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;