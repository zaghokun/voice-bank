function Header() {
  const user = JSON.parse(
    localStorage.getItem('registeredUser')
  );

  const accountNumber =
    localStorage.getItem('accountNumber') ||
    generateAccountNumber();

  localStorage.setItem(
    'accountNumber',
    accountNumber
  );

  function generateAccountNumber() {
    return Math.floor(
      1000000000 + Math.random() * 9000000000
    );
  }

  return (
    <header className="top-header">
      <div className="header-right">
        <div className="user-info">
          <h3>{user?.name || 'User'}</h3>

          <p>
            No. Rekening: {accountNumber}
          </p>
        </div>

        <div className="avatar">
          {user?.name?.charAt(0) || 'U'}
        </div>
      </div>
    </header>
  );
}

export default Header;