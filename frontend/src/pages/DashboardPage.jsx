import { useNavigate } from 'react-router-dom';

function DashboardPage() {
  const navigate = useNavigate();

  const user = JSON.parse(
    localStorage.getItem('registeredUser')
  );

  const accountNumber =
    localStorage.getItem('accountNumber');

  // dummy saldo
  const balance = 12500000;

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Dashboard</h1>

        <p>
          Welcome back, {user?.name}
        </p>
      </div>

      {/* BALANCE CARD */}
      <div className="balance-card">
        <div className="balance-top">
          <div>
            <p className="balance-label">
              Current Balance
            </p>

            <h2>
              Rp{' '}
              {balance.toLocaleString('id-ID')}
            </h2>
          </div>

          <div className="balance-chip">
            VoiceBank
          </div>
        </div>

        <div className="balance-bottom">
          <div>
            <p className="card-label">
              Account Holder
            </p>

            <h3>{user?.name}</h3>
          </div>

          <div>
            <p className="card-label">
              Account Number
            </p>

            <h3>{accountNumber}</h3>
          </div>
        </div>
      </div>

      {/* QUICK MENU */}
      <div className="quick-menu">
        <button
          className="menu-card"
          onClick={() =>
            navigate('/transfer')
          }
        >
          <div className="menu-icon">
            ↑
          </div>

          <h3>Transfer</h3>

          <p>
            Send money using manual
            or voice transfer
          </p>
        </button>

        <button
          className="menu-card"
          onClick={() =>
            navigate('/history')
          }
        >
          <div className="menu-icon">
            ⏱
          </div>

          <h3>History</h3>

          <p>
            View your transaction
            history
          </p>
        </button>
      </div>
    </div>
  );
}

export default DashboardPage;