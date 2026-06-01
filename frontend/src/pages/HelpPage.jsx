import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, HelpCircle, Mic, Volume2, Keyboard } from 'lucide-react';
import { tts, speak } from '../services/ttsService';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&family=Syne:wght@700;800&display=swap');

  @keyframes hp-fade-up { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }

  .hp-root * { box-sizing:border-box; margin:0; padding:0; }

  .hp-page {
    font-family:'DM Sans',sans-serif;
    min-height:100svh;
    background:#09090b;
    background-image:radial-gradient(ellipse 70% 50% at 30% -5%,rgba(249,115,22,0.10) 0%,transparent 65%);
    color:#fff;
    padding:28px 24px 48px;
    animation:hp-fade-up 0.45s cubic-bezier(.22,1,.36,1) both;
  }

  .hp-topbar { display:flex;align-items:center;justify-content:space-between;margin-bottom:28px; }
  .hp-section-label {
    font-size:11px;font-weight:500;letter-spacing:0.14em;
    text-transform:uppercase;color:rgba(255,255,255,0.3);
  }
  .hp-title {
    font-family:'Syne',sans-serif;font-size:22px;font-weight:800;letter-spacing:0.03em;
  }
  .hp-title span { color:#fb923c; }
  .hp-back-btn {
    width:40px;height:40px;border-radius:12px;
    background:rgba(255,255,255,0.04);
    border:1px solid rgba(255,255,255,0.08);
    display:flex;align-items:center;justify-content:center;
    cursor:pointer;color:rgba(255,255,255,0.4);
  }
  .hp-back-btn:hover { background:rgba(255,255,255,0.08);color:#fff; }

  .hp-content { max-width:680px;margin:0 auto; }

  .hp-hero-card {
    background:linear-gradient(135deg,rgba(249,115,22,0.08) 0%,rgba(255,255,255,0.02) 100%);
    border:1px solid rgba(249,115,22,0.18);
    border-radius:24px;padding:32px;
    text-align:center;margin-bottom:24px;
  }
  .hp-hero-icon {
    width:64px;height:64px;border-radius:18px;
    background:rgba(249,115,22,0.15);
    border:1px solid rgba(249,115,22,0.3);
    display:flex;align-items:center;justify-content:center;
    margin:0 auto 16px;
  }
  .hp-hero-card h2 {
    font-family:'Syne',sans-serif;
    font-size:22px;font-weight:800;color:#fff;margin-bottom:8px;
  }
  .hp-hero-card p { font-size:14px;color:rgba(255,255,255,0.6);line-height:1.6; }

  .hp-listen-btn {
    margin-top:18px;padding:10px 20px;
    background:rgba(249,115,22,0.15);
    border:1px solid rgba(249,115,22,0.3);
    border-radius:12px;color:#fb923c;
    font-family:'DM Sans',sans-serif;font-size:13px;font-weight:500;
    cursor:pointer;display:inline-flex;align-items:center;gap:8px;
    transition:background 0.2s;
  }
  .hp-listen-btn:hover { background:rgba(249,115,22,0.25); }

  .hp-card {
    background:#18181b;
    border:1px solid rgba(255,255,255,0.08);
    border-radius:20px;padding:28px;margin-bottom:20px;
  }
  .hp-card h3 {
    font-family:'Syne',sans-serif;
    font-size:16px;font-weight:800;color:#fff;margin-bottom:16px;
    display:flex;align-items:center;gap:10px;
  }

  .hp-cmd-list { display:flex;flex-direction:column;gap:12px; }
  .hp-cmd {
    display:flex;justify-content:space-between;align-items:center;
    padding:12px 16px;background:rgba(255,255,255,0.03);
    border-radius:12px;
  }
  .hp-cmd-text { font-size:14px;color:#fff; }
  .hp-cmd-text strong { color:#fb923c; font-weight:600; }
  .hp-cmd-meta { font-size:11px;color:rgba(255,255,255,0.4);font-family:monospace; }

  .hp-shortcut-list { display:flex;flex-direction:column;gap:10px; }
  .hp-shortcut {
    display:flex;justify-content:space-between;align-items:center;
    padding:10px 14px;background:rgba(255,255,255,0.03);
    border-radius:10px;font-size:13px;
  }
  .hp-shortcut kbd {
    background:rgba(255,255,255,0.08);
    border:1px solid rgba(255,255,255,0.12);
    border-radius:6px;padding:3px 8px;
    font-family:monospace;font-size:11px;color:#fff;
  }
`;

function StyleTag() { return <style dangerouslySetInnerHTML={{ __html: styles }} />; }

const VOICE_COMMANDS = [
  { intent: 'TRANSFER',  example: '"Transfer", "Kirim uang"', desc: 'Buka halaman transfer' },
  { intent: 'CEK_SALDO', example: '"Cek saldo", "Berapa saldo saya"', desc: 'Bacakan saldo Anda' },
  { intent: 'RIWAYAT',   example: '"Riwayat", "Lihat transaksi"', desc: 'Buka riwayat transaksi' },
  { intent: 'TABUNG',    example: '"Tabung", "Menabung"', desc: 'Buka halaman menabung' },
  { intent: 'BANTUAN',   example: '"Bantuan", "Tolong"', desc: 'Buka halaman ini' },
];

export default function HelpPage() {
  const navigate = useNavigate();

  useEffect(() => {
    tts.speak(
      'Halaman bantuan VoiceBank. Anda dapat mengucapkan: transfer, cek saldo, riwayat, tabung, atau bantuan. ' +
      'Tekan tombol mikrofon di dashboard atau tekan spasi untuk mulai merekam perintah suara.'
    );
  }, []);

  const handleListenAll = () => {
    const text = 'Berikut perintah suara yang tersedia. ' +
      VOICE_COMMANDS.map(c => `${c.intent.replace('_', ' ')}: ${c.desc}`).join('. ');
    speak(text);
  };

  return (
    <div className="hp-root">
      <StyleTag />
      <div className="hp-page" role="main" aria-label="Halaman bantuan">
        <div className="hp-topbar">
          <div>
            <span className="hp-section-label">Panduan pengguna</span>
            <div className="hp-title">Bantuan<span>.</span></div>
          </div>
          <button className="hp-back-btn" onClick={() => navigate(-1)} aria-label="Kembali">
            <ArrowLeft size={18} />
          </button>
        </div>

        <div className="hp-content">
          <div className="hp-hero-card">
            <div className="hp-hero-icon">
              <HelpCircle size={32} color="#fb923c" strokeWidth={1.5} />
            </div>
            <h2>Selamat Datang di VoiceBank</h2>
            <p>
              VoiceBank dirancang untuk dapat dioperasikan sepenuhnya dengan suara.
              Berikut perintah yang bisa Anda gunakan.
            </p>
            <button className="hp-listen-btn" onClick={handleListenAll} aria-label="Dengarkan semua perintah">
              <Volume2 size={14} /> Dengarkan Semua Perintah
            </button>
          </div>

          <div className="hp-card">
            <h3>
              <Mic size={18} color="#fb923c" /> Perintah Suara
            </h3>
            <div className="hp-cmd-list">
              {VOICE_COMMANDS.map(cmd => (
                <div key={cmd.intent} className="hp-cmd">
                  <div>
                    <p className="hp-cmd-text">
                      <strong>{cmd.example}</strong>
                    </p>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>
                      {cmd.desc}
                    </p>
                  </div>
                  <span className="hp-cmd-meta">{cmd.intent}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="hp-card">
            <h3>
              <Keyboard size={18} color="#fb923c" /> Pintasan Keyboard
            </h3>
            <div className="hp-shortcut-list">
              <div className="hp-shortcut">
                <span>Mulai / Stop rekam suara</span>
                <kbd>Spasi</kbd>
              </div>
              <div className="hp-shortcut">
                <span>Pindah antar elemen</span>
                <kbd>Tab</kbd>
              </div>
              <div className="hp-shortcut">
                <span>Konfirmasi / Submit</span>
                <kbd>Enter</kbd>
              </div>
              <div className="hp-shortcut">
                <span>Kembali ke halaman sebelumnya</span>
                <kbd>Alt + ←</kbd>
              </div>
            </div>
          </div>

          <div className="hp-card">
            <h3>
              <Volume2 size={18} color="#fb923c" /> Aksesibilitas
            </h3>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>
              VoiceBank kompatibel dengan screen reader seperti NVDA (Windows) dan TalkBack (Android).
              Setiap aksi penting diumumkan via Text-to-Speech (TTS) dalam Bahasa Indonesia.
              Tombol mikrofon memberikan haptic feedback (getaran) saat mulai dan berhenti merekam.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
