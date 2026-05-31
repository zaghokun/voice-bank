import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

function MainLayout({ children }) {
  return (
    <div className="flex h-screen bg-slate-950 font-sans text-slate-100 overflow-hidden">
      
      {/* Sidebar Kiri */}
      <Sidebar />

      {/* Konten Kanan (Header + Page Content) */}
      <div className="flex flex-col flex-1 h-full overflow-hidden bg-slate-950 relative">
        <Header />

        {/* Area Render Halaman */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
          {children}
        </main>
      </div>
      
    </div>
  );
}

export default MainLayout;