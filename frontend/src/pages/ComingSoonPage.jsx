import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { tts } from '../services/ttsService';

export default function ComingSoonPage() {
  const navigate = useNavigate();

  useEffect(() => {
    tts.speak('Fitur ini akan tersedia di versi berikutnya. Silakan kembali ke dashboard.');
  }, []);

  return (
    <div style={{ minHeight: '100svh', background: '#09090b', color: '#fff', fontFamily: 'DM Sans, sans-serif', padding: '28px 24px' }} role="main" aria-label="Halaman segera hadir">
      <button
        onClick={() => navigate(-1)}
        aria-label="Kembali"
        style={{
          width: 40, height: 40, borderRadius: 12,
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: 'rgba(255,255,255,0.6)',
          marginBottom: 32,
        }}
      >
        <ArrowLeft size={18} />
      </button>

      <div style={{ maxWidth: 480, margin: '60px auto', textAlign: 'center' }}>
        <div style={{
          width: 80, height: 80, borderRadius: 24,
          background: 'rgba(251,207,232,0.10)',
          border: '1px solid rgba(251,207,232,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px',
        }}>
          <Sparkles size={36} color="#fbcfe8" strokeWidth={1.5} />
        </div>

        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 800, marginBottom: 12 }}>
          Segera Hadir
        </h1>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, marginBottom: 32 }}>
          Fitur ini sedang dalam pengembangan dan akan tersedia di versi berikutnya.
          Saat ini VoiceBank fokus pada fitur utama: Transfer, Cek Saldo, Riwayat, Tabung, dan Bantuan.
        </p>

        <button
          onClick={() => navigate('/dashboard')}
          style={{
            padding: '14px 28px', borderRadius: 12, border: 'none',
            background: 'linear-gradient(135deg, #fbcfe8 0%, #f472b6 100%)',
            color: '#09090b', fontSize: 14, fontWeight: 500, letterSpacing: '0.06em',
            cursor: 'pointer',
          }}
          aria-label="Kembali ke dashboard"
        >
          Kembali ke Dashboard
        </button>
      </div>
    </div>
  );
}
