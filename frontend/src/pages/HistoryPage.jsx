function HistoryPage() {
  const transactions = [
    {
      id: 1,
      type: 'incoming',
      name: 'Budi Santoso',
      amount: 500000,
      date: '08 Mei 2026',
      status: 'Success',
    },
    {
      id: 2,
      type: 'outgoing',
      name: 'Amanda',
      amount: 150000,
      date: '07 Mei 2026',
      status: 'Success',
    },
    {
      id: 3,
      type: 'incoming',
      name: 'Jonathan',
      amount: 250000,
      date: '06 Mei 2026',
      status: 'Pending',
    },
    {
      id: 4,
      type: 'outgoing',
      name: 'Michael',
      amount: 300000,
      date: '05 Mei 2026',
      status: 'Failed',
    },
  ];

  return (
    <div className="history-page">
      <div className="history-header">
        <h1>Transaction History</h1>
        <p>
          View all incoming and outgoing
          transactions
        </p>
      </div>

      <div className="history-list">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="history-card"
          >
            <div className="history-left">
              <div
                className={
                  transaction.type === 'incoming'
                    ? 'history-icon incoming'
                    : 'history-icon outgoing'
                }
              >
                {transaction.type === 'incoming'
                  ? '↓'
                  : '↑'}
              </div>

              <div>
                <h3>{transaction.name}</h3>

                <p>{transaction.date}</p>
              </div>
            </div>

            <div className="history-right">
              <h3>
                Rp{' '}
                {transaction.amount.toLocaleString(
                  'id-ID'
                )}
              </h3>

              <span
                className={`status ${transaction.status.toLowerCase()}`}
              >
                {transaction.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default HistoryPage;