import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import PopupMessage from '../components/PopupMessage';

function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();

    setEmailError('');
    setPasswordError('');

    // AMBIL DATA USER DARI LOCAL STORAGE
    const storedUser = JSON.parse(
        localStorage.getItem('registeredUser')
    );

    // JIKA BELUM ADA USER
    if (!storedUser) {
        setEmailError('Email belum terdaftar');
        return;
    }

    // VALIDASI EMAIL
    if (email !== storedUser.email) {
        setEmailError('Email belum terdaftar');
        return;
    }

    // VALIDASI PASSWORD
    if (password !== storedUser.password) {
        setPasswordError('Password salah');
        return;
    }

    // LOGIN SUCCESS
    navigate('/dashboard');
 };

  return (
    <div className="auth-container">
      <h1>Login</h1>

      <form onSubmit={handleLogin}>
        <div className="input-group">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <PopupMessage message={emailError} />
        </div>

        <div className="input-group">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <PopupMessage message={passwordError} />
        </div>

        <button type="submit">
          Login
        </button>
      </form>

      <p>
        Belum punya akun?{' '}
        <Link to="/register">
          Register
        </Link>
      </p>
    </div>
  );
}

export default LoginPage;