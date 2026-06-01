import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const skipLinkStyle = `
  .skip-link {
    position: absolute;
    top: -40px;
    left: 8px;
    background: #f472b6;
    color: #09090b;
    padding: 10px 16px;
    border-radius: 8px;
    font-weight: 600;
    font-size: 13px;
    text-decoration: none;
    z-index: 9999;
    transition: top 0.2s;
  }
  .skip-link:focus { top: 8px; outline: 2px solid #fff; }
`;

function MainLayout({ children }) {
  return (
    <div className="flex flex-col-reverse md:flex-row h-screen bg-[#f4f4f5] dark:bg-[#09090b] font-sans text-zinc-800 dark:text-white overflow-hidden">
      <style dangerouslySetInnerHTML={{ __html: skipLinkStyle }} />
      <a href="#main-content" className="skip-link">Lewati ke konten utama</a>
      {/* Sidebar Kiri */}
      <Sidebar />

      {/* Konten Kanan (Header + Page Content) */}
      <div className="flex flex-col flex-1 h-full overflow-hidden bg-[#f4f4f5] dark:bg-[#09090b] relative">
        <Header />

        {/* Area Render Halaman */}
        <main id="main-content" className="flex-1 overflow-y-auto relative bg-[#f4f4f5] dark:bg-[#09090b]" tabIndex="-1">
          {children}
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
