import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import PopupMessage from '../components/PopupMessage';
import { registerUser } from '../services/userService';
import { useAuth } from '../hooks/useAuth';
import { tts } from '../services/ttsService';

function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    const nameRegex = /^[A-Za-z\s]+$/;
    if (!nameRegex.test(name)) {
      setError('Nama hanya berupa huruf');
      return;
    }

    setLoading(true);
    try {
      const data = await registerUser({ name, email, password });
      login(data.access_token, data.user);
      tts.registerSuccess(data.user.name);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registrasi gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container" role="main" aria-label="Halaman registrasi">
      <h1>Register</h1>

      <form onSubmit={handleRegister} noValidate aria-label="Form registrasi">
        <div className="input-group">
          <input
            type="text"
            placeholder="Nama"
            aria-label="Nama lengkap"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <input
            type="email"
            placeholder="Email"
            aria-label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <input
            type="password"
            placeholder="Password"
            aria-label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div aria-live="polite">
          <PopupMessage message={error} />
        </div>

        <button type="submit" disabled={loading} aria-label={loading ? 'Sedang memproses registrasi' : 'Daftar akun baru'}>
          {loading ? 'Loading...' : 'Register'}
        </button>
      </form>

      <p>
        Sudah punya akun?{' '}
        <Link to="/">Login</Link>
      </p>
    </div>
  );
}

export default RegisterPage;