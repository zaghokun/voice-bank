import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

function MainLayout({ children }) {
  return (
    <div className="flex flex-col-reverse md:flex-row h-screen bg-[#09090b] font-sans text-white overflow-hidden">
      
      {/* Sidebar Kiri */}
      <Sidebar />

      {/* Konten Kanan (Header + Page Content) */}
      <div className="flex flex-col flex-1 h-full overflow-hidden bg-[#09090b] relative">
        <Header />

        {/* Area Render Halaman */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative bg-[#09090b]">
          {children}
        </main>
      </div>
      
    </div>
  );
}

export default MainLayout;