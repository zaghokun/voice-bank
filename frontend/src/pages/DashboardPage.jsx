import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getBalance } from '../services/transactionService';
import { tts } from '../services/ttsService';

function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    getBalance().then((data) => {
      setBalance(data.balance);
      tts.balance(data.balance.toLocaleString('id-ID'));
    }).catch(() => {});
  }, []);

  return (
    <div className="dashboard-page" role="main" aria-label="Dashboard utama">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Welcome back, {user?.name}</p>
      </div>

      {/* BALANCE CARD */}
      <div className="balance-card" aria-label={`Saldo Anda ${balance.toLocaleString('id-ID')} rupiah`}>
        <div className="balance-top">
          <div>
            <p className="balance-label">Current Balance</p>
            <h2 aria-live="polite">Rp {balance.toLocaleString('id-ID')}</h2>
          </div>
          <div className="balance-chip">VoiceBank</div>
        </div>

        <div className="balance-bottom">
          <div>
            <p className="card-label">Account Holder</p>
            <h3>{user?.name}</h3>
          </div>
          <div>
            <p className="card-label">Email</p>
            <h3>{user?.email}</h3>
          </div>
        </div>
      </div>

      {/* QUICK MENU */}
      <nav className="quick-menu" aria-label="Menu utama">
        <button className="menu-card" onClick={() => navigate('/transfer')} aria-label="Transfer uang">
          <div className="menu-icon" aria-hidden="true">↑</div>
          <h3>Transfer</h3>
          <p>Send money using manual or voice transfer</p>
        </button>

        <button className="menu-card" onClick={() => navigate('/history')} aria-label="Lihat riwayat transaksi">
          <div className="menu-icon" aria-hidden="true">⏱</div>
          <h3>History</h3>
          <p>View your transaction history</p>
        </button>
      </nav>
    </div>
  );
}

export default DashboardPage;