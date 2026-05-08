import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

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
    <div className="auth-container">
      <h1>Register</h1>

      <form onSubmit={handleRegister} noValidate>
        <div className="input-group">
          <input
            type="text"
            placeholder="Nama"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <PopupMessage message={nameError} />
        </div>

        <div className="input-group">
          <input
            type="text"
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
        </div>

        <button type="submit">
          Register
        </button>
      </form>

      <p>
        Sudah punya akun?{' '}
        <Link to="/">
          Login
        </Link>
      </p>
    </div>
  );
}

export default RegisterPage;