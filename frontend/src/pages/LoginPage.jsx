import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import PopupMessage from '../components/PopupMessage';
import { loginUser } from '../services/userService';
import { useAuth } from '../hooks/useAuth';
import { tts } from '../services/ttsService';

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await loginUser({ email, password });
      login(data.access_token, data.user);
      tts.welcome(data.user.name);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login gagal');
      tts.loginError();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container" role="main" aria-label="Halaman login">
      <h1>Login</h1>

      <form onSubmit={handleLogin} aria-label="Form login">
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

        <button type="submit" disabled={loading} aria-label={loading ? 'Sedang memproses login' : 'Login'}>
          {loading ? 'Loading...' : 'Login'}
        </button>
      </form>

      <p>
        Belum punya akun?{' '}
        <Link to="/register">Register</Link>
      </p>
    </div>
  );
}

export default LoginPage;