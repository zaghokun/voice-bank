import { useEffect, useState } from 'react';
import { getTransactions } from '../services/transactionService';

function HistoryPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTransactions()
      .then((data) => setTransactions(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="history-page"><p>Loading...</p></div>;

  return (
    <div className="history-page">
      <div className="history-header">
        <h1>Transaction History</h1>
        <p>View all incoming and outgoing transactions</p>
      </div>

      <div className="history-list">
        {transactions.length === 0 && <p>Belum ada transaksi.</p>}

        {transactions.map((tx) => (
          <div key={tx.id} className="history-card">
            <div className="history-left">
              <div className={tx.type === 'tabung' ? 'history-icon incoming' : 'history-icon outgoing'}>
                {tx.type === 'tabung' ? '↓' : '↑'}
              </div>
              <div>
                <h3>{tx.type === 'transfer' ? tx.target_user : 'Tabungan'}</h3>
                <p>{new Date(tx.created_at).toLocaleDateString('id-ID')}</p>
              </div>
            </div>

            <div className="history-right">
              <h3>Rp {tx.amount.toLocaleString('id-ID')}</h3>
              <span className={`status ${tx.status}`}>{tx.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default HistoryPage;