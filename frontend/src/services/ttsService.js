/**
 * VoiceBank TTS Service
 * Wrapper Web Speech API (SpeechSynthesis) untuk audio feedback tunanetra.
 */

const LANG = 'id-ID';

export function speak(text, onEnd) {
  if (!window.speechSynthesis) return;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = LANG;
  utterance.rate = 0.9;
  utterance.pitch = 1;
  if (onEnd) utterance.onend = onEnd;
  window.speechSynthesis.speak(utterance);
}

// Pre-built feedback messages
export const tts = {
  welcome: (name) => speak(`Selamat datang, ${name}`),
  loginError: () => speak('Login gagal. Periksa email dan password Anda.'),
  registerSuccess: (name) => speak(`Registrasi berhasil. Selamat datang, ${name}`),
  intentDetected: (intent, confidence) => {
    const pct = Math.round(confidence * 100);
    const map = {
      TRANSFER: 'transfer uang',
      CEK_SALDO: 'cek saldo',
      RIWAYAT: 'lihat riwayat',
      TABUNG: 'menabung',
      BANTUAN: 'bantuan',
    };
    speak(`Perintah terdeteksi: ${map[intent] || intent}. Keyakinan ${pct} persen.`);
  },
  transferSuccess: (amount, target) =>
    speak(`Transfer ${amount} ke ${target} berhasil.`),
  transferError: (msg) => speak(`Transfer gagal. ${msg}`),
  balance: (amount) => speak(`Saldo Anda saat ini ${amount} rupiah.`),
  recordingStart: () => speak('Mulai merekam.'),
  recordingStop: () => speak('Rekaman selesai. Tekan kirim untuk memproses.'),
  error: (msg) => speak(msg || 'Maaf, terjadi kesalahan. Silakan ulangi.'),
};
