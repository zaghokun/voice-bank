import { useState, useEffect } from 'react';
import { Lock, X, ShieldCheck } from 'lucide-react';
import { speak } from '../services/ttsService';

export default function PinSetupModal({
  open,
  onClose,
  onSuccess,
}) {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');

  // TTS announce saat modal buka
  useEffect(() => {
    if (open) {
      speak('Pengaturan PIN transaksi. Masukkan 6 digit angka untuk mengamankan transaksi Anda.');
    }
  }, [open]);

  // TTS announce saat pindah step
  useEffect(() => {
    if (open && step === 2) {
      speak('Langkah 2. Masukkan kembali 6 digit PIN untuk konfirmasi.');
    }
  }, [step, open]);

  if (!open) return null;

  const handleNext = () => {
    if (pin.length !== 6) {
      setError('PIN harus 6 angka.');
      speak('PIN harus 6 angka.');
      return;
    }
    setError('');
    setConfirmPin('');
    setStep(2);
  };

  const handleSave = () => {
    if (pin !== confirmPin) {
      setError('PIN tidak cocok. Silakan coba lagi.');
      speak('PIN tidak cocok. Silakan coba lagi.');
      return;
    }
    
    localStorage.setItem('transaction_pin', pin);
    speak('PIN transaksi berhasil disimpan.');
    onSuccess();
    
    setPin('');
    setConfirmPin('');
    setStep(1);
    setError('');
  };

  const reset = () => {
    setPin('');
    setConfirmPin('');
    setStep(1);
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-5 animate-fade-in">
      <div className="w-full max-w-md bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-white/8 rounded-[24px] overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100 dark:border-white/8">
          <div>
            <p className="text-[11px] uppercase tracking-[0.14em] text-zinc-400 dark:text-white/30">
              Pengaturan
            </p>
            <h2 className="font-syne text-xl font-extrabold text-zinc-800 dark:text-white">
              PIN Transaksi<span className="text-pink-500 dark:text-[#fbcfe8]">.</span>
            </h2>
          </div>
          <button
            onClick={reset}
            className="w-9 h-9 rounded-xl bg-zinc-50 border border-zinc-200 dark:bg-white/4 dark:border-white/8 flex items-center justify-center text-zinc-500 dark:text-white/50 hover:bg-zinc-100 dark:hover:bg-white/8 transition"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-7 flex flex-col items-center">
          <div className="w-[90px] h-[90px] rounded-[26px] bg-pink-500/10 border border-pink-500/20 dark:bg-[#fbcfe8]/10 dark:border-[#fbcfe8]/20 flex items-center justify-center mb-5">
            <Lock size={42} className="text-pink-600 dark:text-[#f9a8d4]" />
          </div>

          <h3 className="font-semibold text-zinc-800 dark:text-white text-center mb-2">
            {step === 1 ? 'Buat PIN Transaksi Baru' : 'Konfirmasi PIN Transaksi'}
          </h3>

          <p className="text-xs text-zinc-500 dark:text-white/40 text-center leading-relaxed max-w-[280px] mb-6">
            {step === 1
              ? 'Masukkan 6 digit angka untuk mengamankan transaksi Anda.'
              : 'Masukkan kembali 6 digit PIN untuk konfirmasi.'}
          </p>

          {error && (
            <div className="w-full mb-5 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
              <p className="text-xs text-amber-600 dark:text-amber-400 text-center">
                {error}
              </p>
            </div>
          )}

          <input
            type="password"
            maxLength={6}
            value={step === 1 ? pin : confirmPin}
            onChange={(e) => {
              const val = e.target.value.replace(/[^0-9]/g, '');
              if (step === 1) {
                setPin(val);
              } else {
                setConfirmPin(val);
              }
              setError('');
            }}
            placeholder="••••••"
            className="w-full bg-zinc-50 border border-zinc-200 dark:bg-white/4 dark:border-white/8 rounded-xl px-4 py-3.5 text-center tracking-[0.35em] font-mono text-lg text-zinc-800 dark:text-white outline-none mb-4 focus:border-pink-500/50 dark:focus:border-[#fbcfe8]/50"
          />

          <button
            onClick={step === 1 ? handleNext : handleSave}
            disabled={(step === 1 ? pin.length : confirmPin.length) !== 6}
            className="w-full p-[15px] rounded-xl border-none cursor-pointer font-medium text-[#09090b] bg-gradient-to-br from-[#fbcfe8] to-[#f472b6] flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShieldCheck size={16} />
            {step === 1 ? 'Lanjut' : 'Simpan PIN'}
          </button>
        </div>
      </div>
    </div>
  );
}
