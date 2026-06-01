import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, PiggyBank, CheckCircle2 } from 'lucide-react';
import { createTransfer, getBalance } from '../services/transactionService';
import { tts } from '../services/ttsService';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&family=Syne:wght@700;800&family=DM+Mono:wght@400;500&display=swap');

  @keyframes sv-fade-up { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }

  .sv-root * { box-sizing:border-box; margin:0; padding:0; }

  .sv-page {
    font-family:'DM Sans',sans-serif;
    min-height:100svh;
    background:#09090b;
    background-image:radial-gradient(ellipse 70% 50% at 30% -5%,rgba(236,72,153,0.10) 0%,transparent 65%);
    color:#fff;
    padding:28px 24px 48px;
    animation:sv-fade-up 0.45s cubic-bezier(.22,1,.36,1) both;
  }

  .sv-topbar { display:flex; align-items:center; justify-content:space-between; margin-bottom:28px; }
  .sv-section-label {
    font-size:11px; font-weight:500; letter-spacing:0.14em;
    text-transform:uppercase; color:rgba(255,255,255,0.3);
  }
  .sv-title {
    font-family:'Syne',sans-serif;
    font-size:22px; font-weight:800; letter-spacing:0.03em;
  }
  .sv-title span { color:#f472b6; }
  .sv-back-btn {
    width:40px;height:40px;border-radius:12px;
    background:rgba(255,255,255,0.04);
    border:1px solid rgba(255,255,255,0.08);
    display:flex;align-items:center;justify-content:center;
    cursor:pointer;color:rgba(255,255,255,0.4);
    transition:background 0.2s,color 0.2s;
  }
  .sv-back-btn:hover { background:rgba(255,255,255,0.08); color:#fff; }

  .sv-card {
    max-width:520px; margin:0 auto;
    background:#18181b;
    border:1px solid rgba(255,255,255,0.08);
    border-radius:24px; padding:36px;
  }

  .sv-icon-hero {
    width:80px; height:80px; border-radius:24px;
    background:linear-gradient(135deg,rgba(236,72,153,0.15) 0%,rgba(236,72,153,0.04) 100%);
    border:1px solid rgba(236,72,153,0.25);
    display:flex; align-items:center; justify-content:center;
    margin:0 auto 24px;
  }

  .sv-balance-info {
    text-align:center; margin-bottom:28px;
  }
  .sv-balance-info p:first-child {
    font-size:11px; letter-spacing:0.12em; text-transform:uppercase;
    color:rgba(255,255,255,0.3); margin-bottom:6px;
  }
  .sv-balance-info p:last-child {
    font-family:'Syne',sans-serif;
    font-size:24px; font-weight:800; color:#fff;
  }

  .sv-field { margin-bottom:24px; }
  .sv-field label {
    display:block;
    font-size:11px; font-weight:500;
    letter-spacing:0.1em; text-transform:uppercase;
    color:rgba(255,255,255,0.4); margin-bottom:8px;
  }
  .sv-input-wrap {
    display:flex; align-items:center;
    background:rgba(255,255,255,0.04);
    border:1px solid rgba(255,255,255,0.08);
    border-radius:12px; padding:0 16px;
    transition:border-color 0.2s;
  }
  .sv-input-wrap:focus-within { border-color:rgba(236,72,153,0.5); }
  .sv-input-wrap span {
    font-size:18px; font-weight:600; color:rgba(255,255,255,0.5); margin-right:12px;
  }
  .sv-input {
    flex:1; background:transparent; border:none; outline:none;
    font-family:'DM Sans',sans-serif;
    font-size:24px; font-weight:600; color:#fff;
    padding:14px 0;
  }
  .sv-input::placeholder { color:rgba(255,255,255,0.2); }

  .sv-shortcuts { display:grid; grid-template-columns:repeat(4,1fr); gap:8px; margin-top:12px; }
  .sv-shortcut {
    background:rgba(255,255,255,0.03);
    border:1px solid rgba(255,255,255,0.08);
    border-radius:10px; padding:10px;
    color:rgba(255,255,255,0.6); font-size:12px; font-weight:500;
    cursor:pointer; transition:all 0.2s;
  }
  .sv-shortcut:hover { background:rgba(236,72,153,0.08); color:#f472b6; border-color:rgba(236,72,153,0.2); }

  .sv-error { color:#f9a8d4; font-size:12px; margin-bottom:12px; }
  .sv-success {
    text-align:center; padding:16px;
    background:rgba(16,185,129,0.08);
    border:1px solid rgba(16,185,129,0.2);
    border-radius:12px;
    color:#10b981; font-size:14px; font-weight:500;
    margin-bottom:16px;
  }

  .sv-btn {
    width:100%; padding:15px; border-radius:12px; border:none; cursor:pointer;
    font-family:'DM Sans',sans-serif;
    font-size:14px; font-weight:500; letter-spacing:0.06em;
    color:#fff;
    background:linear-gradient(135deg,#f472b6 0%,#ec4899 100%);
    transition:opacity 0.2s, transform 0.15s;
  }
  .sv-btn:hover { opacity:0.88; }
  .sv-btn:active { transform:scale(0.98); }
  .sv-btn:disabled { opacity:0.5; cursor:not-allowed; }
`;

function StyleTag() { return <style dangerouslySetInnerHTML={{ __html: styles }} />; }

export default function SavingsPage() {
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    getBalance().then(d => setBalance(d.balance)).catch(() => {});
    tts.speak('Halaman menabung. Masukkan nominal yang ingin ditabung.');
  }, []);

  const handleAmountChange = (e) => {
    setAmount(e.target.value.replace(/[^0-9]/g, ''));
    setError('');
  };

  const handleAdd = (val) => {
    setAmount(prev => (parseInt(prev || '0', 10) + val).toString());
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const numAmount = parseInt(amount, 10);
    if (!numAmount || numAmount <= 0) {
      setError('Nominal harus lebih dari Rp 0.');
      tts.error('Nominal harus lebih dari nol rupiah.');
      return;
    }

    setSubmitting(true);
    try {
      await createTransfer({
        type: 'tabung',
        amount: numAmount,
      });
      const formatted = numAmount.toLocaleString('id-ID');
      setSuccess(`Berhasil menabung Rp ${formatted}!`);
      tts.speak(`Berhasil menabung Rp ${formatted} rupiah.`);
      setAmount('');
      // Refresh balance
      getBalance().then(d => setBalance(d.balance)).catch(() => {});
    } catch (err) {
      const msg = err.response?.data?.detail || 'Gagal menabung';
      setError(msg);
      tts.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="sv-root">
      <StyleTag />
      <div className="sv-page" role="main" aria-label="Halaman menabung">
        <div className="sv-topbar">
          <div>
            <span className="sv-section-label">Tabungan</span>
            <div className="sv-title">Tabung<span>.</span></div>
          </div>
          <button className="sv-back-btn" onClick={() => navigate(-1)} aria-label="Kembali">
            <ArrowLeft size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="sv-card" aria-label="Form tabung">
          <div className="sv-icon-hero">
            <PiggyBank size={36} color="#f472b6" strokeWidth={1.5} />
          </div>

          <div className="sv-balance-info" aria-live="polite">
            <p>Saldo Anda Saat Ini</p>
            <p>Rp {balance.toLocaleString('id-ID')}</p>
          </div>

          <div className="sv-field">
            <label htmlFor="sv-amount">Nominal Menabung</label>
            <div className="sv-input-wrap">
              <span>Rp</span>
              <input
                id="sv-amount"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={amount ? parseInt(amount, 10).toLocaleString('id-ID') : ''}
                onChange={handleAmountChange}
                placeholder="0"
                className="sv-input"
                aria-label="Nominal yang ingin ditabung"
              />
            </div>
            <div className="sv-shortcuts">
              {[50000, 100000, 250000, 500000].map(v => (
                <button type="button" key={v} className="sv-shortcut" onClick={() => handleAdd(v)} aria-label={`Tambah ${v.toLocaleString('id-ID')} rupiah`}>
                  +{(v / 1000)}rb
                </button>
              ))}
            </div>
          </div>

          {error && <p className="sv-error" role="alert">{error}</p>}
          {success && (
            <div className="sv-success" role="status">
              <CheckCircle2 size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
              {success}
            </div>
          )}

          <button type="submit" className="sv-btn" disabled={submitting} aria-label={submitting ? 'Memproses tabungan' : 'Tabung sekarang'}>
            {submitting ? 'Memproses...' : 'Tabung Sekarang'}
          </button>
        </form>
      </div>
    </div>
  );
}
