import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import VoiceRecorder from '../components/VoiceRecorder';
import { createTransfer } from '../services/transactionService';
import { tts } from '../services/ttsService';

function TransferPage() {
  const navigate = useNavigate();
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTransfer = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!recipient || !amount) {
      setError('Isi semua field');
      return;
    }

    setLoading(true);
    try {
      await createTransfer({ type: 'transfer', amount: Number(amount), target_user: recipient });
      setSuccess(`Transfer Rp ${Number(amount).toLocaleString('id-ID')} ke ${recipient} berhasil!`);
      tts.transferSuccess(Number(amount).toLocaleString('id-ID'), recipient);
      setRecipient('');
      setAmount('');
    } catch (err) {
      const msg = err.response?.data?.detail || 'Transfer gagal';
      setError(msg);
      tts.transferError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Called from VoiceRecorder when intent is TRANSFER
  const handleVoiceResult = (result) => {
    if (result.intent === 'TRANSFER') {
      setVoiceEnabled(false);
    } else if (result.intent === 'CEK_SALDO') {
      navigate('/dashboard');
    } else if (result.intent === 'RIWAYAT') {
      navigate('/history');
    }
  };

  return (
    <div role="main" aria-label="Halaman transfer">
      <h1>Transfer</h1>

      <div className="transfer-card">
        <div className="toggle-section">
          <label className="switch">
            <input
              type="checkbox"
              checked={voiceEnabled}
              onChange={() => setVoiceEnabled(!voiceEnabled)}
              aria-label="Aktifkan transfer suara"
            />
            <span className="slider"></span>
          </label>
          <p>Enable Voice Transfer</p>
        </div>

        {/* MANUAL INPUT */}
        <form onSubmit={handleTransfer} aria-label="Form transfer manual">
          <div className="manual-transfer">
            <input
              type="text"
              placeholder="Recipient"
              aria-label="Nama penerima"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
            />
            <input
              type="number"
              placeholder="Amount"
              aria-label="Jumlah transfer"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div aria-live="polite">
            {error && <p className="error-msg">{error}</p>}
            {success && <p className="success-msg">{success}</p>}
          </div>

          <button className="submit-transfer" type="submit" disabled={loading} aria-label={loading ? 'Sedang memproses transfer' : 'Kirim transfer'}>
            {loading ? 'Processing...' : 'Transfer'}
          </button>
        </form>

        {/* VOICE MODE */}
        {voiceEnabled && <VoiceRecorder onResult={handleVoiceResult} />}
      </div>
    </div>
  );
}

export default TransferPage;