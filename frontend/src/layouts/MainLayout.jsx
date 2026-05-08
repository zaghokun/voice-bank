import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

function MainLayout({ children }) {
  return (
    <div className="layout">
      <Sidebar />

      <div className="page-container">
        <Header />

        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}

export default MainLayout;