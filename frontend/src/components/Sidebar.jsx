import { NavLink, useNavigate } from 'react-router-dom';

function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');

    navigate('/');
  };

  return (
    <aside className="sidebar">
      <h2 className="logo">VoiceBank</h2>

      <nav className="menu">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            isActive ? 'menu-item active' : 'menu-item'
          }
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/transfer"
          className={({ isActive }) =>
            isActive ? 'menu-item active' : 'menu-item'
          }
        >
          Transfer
        </NavLink>

        <NavLink
          to="/history"
          className={({ isActive }) =>
            isActive ? 'menu-item active' : 'menu-item'
          }
        >
          History
        </NavLink>

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </nav>
    </aside>
  );
}

export default Sidebar;