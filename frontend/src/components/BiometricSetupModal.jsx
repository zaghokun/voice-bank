import { useState, useEffect } from 'react';
import {
  Fingerprint,
  ShieldCheck,
  X,
} from 'lucide-react';
import { registerBiometric, isWebAuthnSupported } from '../services/webauthnService';
import { speak } from '../services/ttsService';

export default function BiometricSetupModal({
  open,
  onClose,
  onSuccess,
  userId,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // TTS announce saat modal buka
  useEffect(() => {
    if (open) {
      speak('Pengaturan biometrik. Gunakan fingerprint atau Face ID perangkat Anda agar proses transfer lebih cepat dan aman.');
    }
  }, [open]);

  if (!open) return null;

  const handleRegister = async () => {
    try {
      setLoading(true);
      setError('');

      if (!isWebAuthnSupported()) {
        const errorMsg = 'Perangkat atau browser Anda tidak mendukung WebAuthn.';
        setError(errorMsg);
        speak(errorMsg);
        throw new Error(errorMsg);
      }

      speak('Silakan gunakan biometrik perangkat Anda untuk mendaftar.');
      await registerBiometric(userId);
      localStorage.setItem('webauthn_credential_id', 'mocked_credential');
      speak('Biometrik berhasil didaftarkan.');
      onSuccess();
    } catch (err) {
      const errorMsg = err.message || 'Registrasi biometrik gagal. Silakan coba lagi.';
      setError(errorMsg);
      speak(errorMsg);
    } finally {
      setLoading(false);
    }
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
              Biometrik<span className="text-pink-500 dark:text-[#fbcfe8]">.</span>
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-zinc-50 border border-zinc-200 dark:bg-white/4 dark:border-white/8 flex items-center justify-center text-zinc-500 dark:text-white/50 hover:bg-zinc-100 dark:hover:bg-white/8 transition"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-7">
          <div className="flex flex-col items-center">
            <div className="w-[90px] h-[90px] rounded-[26px] bg-pink-500/10 border border-pink-500/20 dark:bg-[#fbcfe8]/10 dark:border-[#fbcfe8]/20 flex items-center justify-center mb-5">
              <Fingerprint size={42} className="text-pink-600 dark:text-[#f9a8d4]" />
            </div>

            <h3 className="font-semibold text-zinc-800 dark:text-white text-center mb-2">
              Daftarkan Biometrik Anda
            </h3>

            <p className="text-xs text-zinc-500 dark:text-white/40 text-center leading-relaxed max-w-[280px] mb-6">
              Gunakan fingerprint atau Face ID perangkat Anda agar proses transfer lebih cepat dan aman.
            </p>

            {error && (
              <div className="w-full mb-5 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
                <p className="text-xs text-amber-600 dark:text-amber-400 text-center">
                  {error}
                </p>
              </div>
            )}

            <button
              onClick={handleRegister}
              disabled={loading}
              className="w-full p-[15px] rounded-xl border-none cursor-pointer font-medium text-[#09090b] bg-gradient-to-br from-[#fbcfe8] to-[#f472b6] flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-98 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <ShieldCheck size={16} />
              {loading ? 'Memproses...' : 'Daftarkan Sekarang'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
