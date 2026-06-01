import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Mic, CheckCircle2, Clock,
  CreditCard, ArrowRight, Info
} from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { createTransfer } from '../services/transactionService';
import { sendVoiceCommand } from '../services/voiceService';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { tts } from '../services/ttsService';

function initials(name) {
  if (!name) return '?';
  return name.split(' ').slice(0,2).map(n => n[0]).join('').toUpperCase();
}

export default function TransferPage() {
  const navigate = useNavigate();
  const { theme } = useTheme();

  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [step, setStep] = useState(1);
  const [accountNumber, setAccountNumber] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('Transfer via VoiceBank');
  const [error, setError] = useState('');
  const [voiceText, setVoiceText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [voiceProcessing, setVoiceProcessing] = useState(false);

  const { recording, audioBlob, startRecording, stopRecording } = useAudioRecorder();
  const isListening = recording || voiceProcessing;

  // TTS announce halaman load
  useEffect(() => {
    tts.speak('Halaman transfer. Langkah 1 dari 4. Masukkan nomor rekening tujuan.');
  }, []);

  // TTS announce per-step
  useEffect(() => {
    if (step === 2) tts.speak('Langkah 2 dari 4. Masukkan nominal transfer.');
    else if (step === 3) tts.speak(`Langkah 3 dari 4. Konfirmasi transfer Rp ${parseInt(amount||'0',10).toLocaleString('id-ID')} ke ${recipientName}.`);
    else if (step === 4) tts.transferSuccess(parseInt(amount||'0',10).toLocaleString('id-ID'), recipientName);
  }, [step]);

  const recipientHistory = [
    { name: 'Budi Santoso',  accNo: '82938102', initial: 'BS' },
    { name: 'Ani Wijaya',    accNo: '10294820', initial: 'AW' },
    { name: 'Candra Kirana', accNo: '93028472', initial: 'CK' },
    { name: 'Dewi Lestari',  accNo: '48201948', initial: 'DL' },
  ];
  const amountShortcuts = [50000, 100000, 250000, 500000];

  useEffect(() => {
    const matched = recipientHistory.find(r => r.accNo === accountNumber.trim());
    if (matched) setRecipientName(matched.name);
    else if (accountNumber.trim().length > 4) setRecipientName(`Rekening (${accountNumber})`);
    else setRecipientName('');
  }, [accountNumber]);

  // Real voice: kirim audioBlob ke backend, route berdasarkan intent
  useEffect(() => {
    if (!audioBlob) return;
    let cancelled = false;
    setVoiceProcessing(true);
    setVoiceText('Memproses...');
    sendVoiceCommand(audioBlob)
      .then(data => {
        if (cancelled) return;
        const { intent, confidence } = data;
        setVoiceText(`Intent: ${intent} (${(confidence * 100).toFixed(0)}%)`);
        if (confidence < 0.6) {
          tts.error('Perintah tidak jelas. Silakan ulangi.');
          return;
        }
        tts.intentDetected(intent, confidence);
        // TRANSFER intent → tetap di halaman, prompt user input
        if (intent === 'TRANSFER') {
          tts.speak('Silakan masukkan nomor rekening atau pilih dari riwayat.');
        } else if (intent === 'CEK_SALDO') {
          navigate('/dashboard');
        } else if (intent === 'RIWAYAT') {
          navigate('/history');
        } else if (intent === 'TABUNG') {
          navigate('/savings');
        } else if (intent === 'BANTUAN') {
          navigate('/help');
        }
      })
      .catch(err => {
        if (cancelled) return;
        const msg = err.response?.data?.detail || 'Gagal memproses perintah suara';
        setVoiceText('Gagal memproses');
        tts.error(msg);
      })
      .finally(() => {
        if (!cancelled) setVoiceProcessing(false);
      });
    return () => { cancelled = true; };
  }, [audioBlob]);

  const toggleVoice = () => {
    if ('vibrate' in navigator) navigator.vibrate([80, 40, 80]);
    if (recording) {
      stopRecording();
      tts.recordingStop();
      setVoiceText('Memproses...');
    } else {
      tts.recordingStart();
      setVoiceText('Mendengarkan...');
      startRecording();
    }
  };

  const handleSelectHistory = (c) => { setAccountNumber(c.accNo); setRecipientName(c.name); setError(''); setStep(2); };
  const handleAmountChange  = (e) => { setAmount(e.target.value.replace(/[^0-9]/g,'')); setError(''); };
  const handleAddAmount     = (v) => { setAmount((parseInt(amount||'0',10)+v).toString()); setError(''); };

  const handleNextStep = async () => {
    if (step === 1) {
      if (!accountNumber.trim()) { setError('Silakan masukkan nomor rekening tujuan.'); tts.error('Silakan masukkan nomor rekening.'); return; }
      setError(''); setStep(2);
    } else if (step === 2) {
      if (!amount || parseInt(amount,10) <= 0) { setError('Nominal transfer harus lebih besar dari Rp 0.'); tts.error('Nominal harus lebih dari nol rupiah.'); return; }
      setError(''); setStep(3);
    } else if (step === 3) {
      // Submit transfer ke backend
      setSubmitting(true);
      try {
        await createTransfer({
          type: 'transfer',
          amount: parseInt(amount, 10),
          target_user: recipientName || `Rekening ${accountNumber}`,
        });
        setError('');
        setStep(4);
      } catch (err) {
        const msg = err.response?.data?.detail || 'Transfer gagal';
        setError(msg);
        tts.transferError(msg);
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleReset = () => { setAccountNumber(''); setRecipientName(''); setAmount(''); setNote('Transfer via VoiceBank'); setError(''); setStep(1); };

  const handleBack = () => { if (step > 1 && step < 4) setStep(step-1); else navigate('/dashboard'); };

  const stepLabels = ['Penerima','Nominal','Konfirmasi','Selesai'];

  return (
    <div className="min-h-screen bg-[#f4f4f5] dark:bg-[#09090b] bg-[radial-gradient(ellipse_70%_50%_at_20%_-5%,rgba(99,102,241,0.05)_0%,transparent_65%),radial-gradient(ellipse_40%_35%_at_85%_90%,rgba(244,114,182,0.04)_0%,transparent_60%)] dark:bg-[radial-gradient(ellipse_70%_50%_at_20%_-5%,rgba(251,207,232,0.08)_0%,transparent_65%),radial-gradient(ellipse_40%_35%_at_85%_90%,rgba(251,207,232,0.04)_0%,transparent_60%)] text-zinc-800 dark:text-white p-6 pb-14 animate-fade-up font-sans selection:bg-pink-500/10 dark:selection:bg-[#fbcfe8]/30">
      
      {/* Top bar */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3.5">
          <button className="w-[38px] h-[38px] rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-800 dark:bg-white/4 dark:border-white/8 flex items-center justify-center cursor-pointer dark:text-white/50 transition-colors dark:hover:bg-white/8 dark:hover:text-white" onClick={handleBack} aria-label="Kembali">
            <ArrowLeft size={16} />
          </button>
          <h1 className="font-syne text-[20px] font-extrabold text-zinc-800 dark:text-white tracking-[0.04em]">Transfer<span className="text-pink-500 dark:text-[#fbcfe8]">.</span></h1>
        </div>

        <div className="flex items-center gap-2.5 bg-white border border-zinc-200 dark:bg-[#18181b] dark:border-white/8 rounded-full px-4 py-2 shadow-sm dark:shadow-none">
          <span className="text-[11px] font-medium tracking-[0.1em] uppercase text-zinc-400 dark:text-white/30">Mode Suara</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={voiceEnabled} className="sr-only peer"
              onChange={() => { setVoiceEnabled(p => !p); handleReset(); }} />
            <div className="w-9 h-5 rounded-full bg-zinc-200 border border-zinc-300 dark:bg-white/8 dark:border-white/12 transition-all duration-250 relative peer-checked:bg-pink-500 peer-checked:border-pink-500 dark:peer-checked:bg-[#fbcfe8] dark:peer-checked:border-[#fbcfe8]">
              <div className="absolute top-[2px] left-[2px] w-4 h-4 rounded-full bg-white transition-all duration-250 pointer-events-none peer-checked:translate-x-4" />
            </div>
          </label>
        </div>
      </div>

      {/* Step indicator (manual only) */}
      {!voiceEnabled && step < 4 && (
        <div className="flex items-center gap-1.5 mb-7">
          {stepLabels.slice(0,3).map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i+1 < step ? 'bg-pink-500/30 dark:bg-[#fbcfe8]/40 w-6' : i+1 === step ? 'bg-pink-500 dark:bg-[#fbcfe8] w-8' : 'bg-zinc-200 dark:bg-white/8 w-6'}`} />
          ))}
          <span className="text-[11px] text-pink-600 dark:text-[#fbcfe8] ml-1.5 tracking-[0.06em]">
            Langkah {step} dari 3 — {stepLabels[step-1]}
          </span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2.5 bg-amber-500/6 border border-amber-500/18 rounded-xl p-3.5 px-4 mb-5 animate-fade-in">
          <Info size={15} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-600 dark:text-amber-400 leading-normal">{error}</p>
        </div>
      )}

      {/* ══════════════════════════════════════════════ */}
      {/* MANUAL FLOW                                    */}
      {/* ══════════════════════════════════════════════ */}
      {!voiceEnabled && (
        <>
          {/* STEP 1 */}
          {step === 1 && (
            <div className="flex flex-col gap-5 animate-fade-up">
              <div className="shadow-md dark:shadow-none bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-white/8 rounded-[20px] p-7">
                <p className="text-[11px] font-medium tracking-[0.14em] uppercase text-zinc-400 dark:text-white/30 mb-5">Tujuan transfer</p>
                <div className="flex flex-col gap-1.5 mb-4">
                  <label className="text-[11px] font-medium tracking-[0.10em] uppercase text-zinc-400 dark:text-white/30 pl-0.5">Nomor Rekening</label>
                  <div className="relative">
                    <input
                      className="w-full bg-zinc-50 border border-zinc-200 dark:bg-white/4 dark:border-white/8 rounded-xl px-4 py-3.5 pr-[46px] font-sans text-sm text-zinc-900 dark:text-white outline-none transition-all placeholder-zinc-400 dark:placeholder-white/20 hover:border-zinc-300 dark:hover:border-white/20 focus:border-pink-500/55 dark:focus:border-[#fbcfe8]/55 focus:bg-pink-50/20 dark:focus:bg-[#fbcfe8]/4"
                      type="text" inputMode="numeric"
                      placeholder="Masukkan nomor rekening tujuan"
                      value={accountNumber}
                      onChange={e => { setAccountNumber(e.target.value.replace(/[^0-9]/g,'')); setError(''); }}
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-white/20 pointer-events-none"><CreditCard size={16} /></span>
                  </div>
                  {recipientName && <p className="text-xs font-medium text-pink-600 dark:text-[#f9a8d4] pl-1 animate-fade-in">Pemilik: {recipientName}</p>}
                </div>
                <button className="w-full p-[15px] rounded-xl border-none cursor-pointer font-sans text-sm font-medium tracking-[0.05em] text-[#09090b] bg-gradient-to-br from-[#fbcfe8] to-[#f472b6] flex items-center justify-center gap-2 transition-all hover:opacity-88 active:scale-98 relative overflow-hidden after:absolute after:inset-0 after:bg-gradient-to-b after:from-white/8 after:to-transparent after:pointer-events-none" onClick={handleNextStep}>
                  Lanjut <ArrowRight size={16} />
                </button>
              </div>

              <div>
                <p className="text-[11px] font-medium tracking-[0.14em] uppercase text-zinc-400 dark:text-white/30 mb-5 flex items-center gap-1.5">
                  <Clock size={12} /> Riwayat penerima
                </p>
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
                  {recipientHistory.map((c,i) => (
                    <div key={i} className="flex items-center gap-3 bg-white border border-zinc-200 dark:bg-[#18181b] dark:border-white/8 rounded-2xl p-3.5 cursor-pointer transition-all hover:bg-zinc-50 dark:hover:bg-white/8 hover:border-pink-500/25 dark:hover:border-[#fbcfe8]/25 active:scale-97 shadow-sm dark:shadow-none" onClick={() => handleSelectHistory(c)}>
                      <div className="w-[38px] h-[38px] rounded-[10px] flex-shrink-0 bg-zinc-100 dark:bg-white/8 flex items-center justify-center font-bold text-xs text-zinc-500 dark:text-white/60">{c.initial}</div>
                      <div>
                        <p className="text-[13px] font-medium text-zinc-800 dark:text-white leading-normal">{c.name}</p>
                        <p className="text-[11px] font-mono text-zinc-400 dark:text-white/30 mt-0.5">{c.accNo}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[5fr_7fr] animate-fade-up">
              {/* Recipient info */}
              <div className="shadow-md dark:shadow-none bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-white/8 rounded-[20px] p-7 flex flex-col gap-5">
                <p className="text-[11px] font-medium tracking-[0.14em] uppercase text-zinc-400 dark:text-white/30 mb-0">Penerima</p>
                <div className="flex items-center gap-3.5 pb-5 border-b border-zinc-100 dark:border-white/8">
                  <div className="w-[52px] h-[52px] rounded-[16px] flex-shrink-0 bg-pink-500/10 border border-pink-500/20 text-pink-600 dark:bg-[#fbcfe8]/10 dark:border-[#fbcfe8]/18 dark:text-[#f9a8d4] font-syne text-sm font-extrabold">{initials(recipientName)}</div>
                  <div>
                    <p className="text-[15px] font-medium text-zinc-800 dark:text-white mb-1">{recipientName}</p>
                    <p className="text-xs font-mono text-pink-500 dark:text-[#fbcfe8]">{accountNumber}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 flex-1">
                  <label className="text-[11px] font-medium tracking-[0.10em] uppercase text-zinc-400 dark:text-white/30 pl-0.5">Catatan (opsional)</label>
                  <input
                    className="w-full bg-zinc-50 border border-zinc-200 dark:bg-white/4 dark:border-white/8 rounded-xl px-4 py-3.5 font-sans text-sm text-zinc-900 dark:text-white outline-none transition-all placeholder-zinc-400 dark:placeholder-white/20 hover:border-zinc-300 dark:hover:border-white/20 focus:border-pink-500/55 dark:focus:border-[#fbcfe8]/55 focus:bg-pink-50/20 dark:focus:bg-[#fbcfe8]/4" type="text"
                    value={note} onChange={e => setNote(e.target.value)}
                    placeholder="Tulis keterangan transfer"
                  />
                </div>
              </div>

              {/* Amount */}
              <div className="shadow-md dark:shadow-none bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-white/8 rounded-[20px] p-7 flex flex-col gap-5">
                <p className="text-[11px] font-medium tracking-[0.14em] uppercase text-zinc-400 dark:text-white/30 mb-0">Nominal</p>
                <div>
                  <div className="flex items-center gap-0 bg-zinc-50 border border-zinc-200 dark:bg-white/4 dark:border-white/8 rounded-xl overflow-hidden transition-colors focus-within:border-pink-500/55 dark:focus-within:border-[#fbcfe8]/55">
                    <span className="px-4 font-syne text-base font-bold text-zinc-400 dark:text-white/30 border-r border-zinc-200 dark:border-white/8 white-space-nowrap user-select-none align-self-stretch flex items-center">Rp</span>
                    <input
                      className="flex-1 bg-transparent border-none outline-none py-4.5 px-4 font-mono text-[28px] font-medium text-zinc-800 dark:text-white placeholder-zinc-300 dark:placeholder-white/12 min-w-0" type="text" inputMode="numeric"
                      placeholder="0" value={amount} onChange={handleAmountChange}
                    />
                  </div>
                  {amount && parseInt(amount,10) > 0 && (
                    <p className="text-xs text-zinc-400 dark:text-white/30 pl-1 mt-0.5 animate-fade-in">≈ Rp {parseInt(amount,10).toLocaleString('id-ID')}</p>
                  )}
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {amountShortcuts.map(v => (
                    <button key={v} className="bg-white border border-zinc-200 text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800 hover:border-zinc-300 dark:bg-[#18181b] dark:border-white/8 rounded-[10px] py-2.5 px-1.5 text-xs font-medium dark:text-white/50 cursor-pointer text-center transition-all dark:hover:bg-white/8 dark:hover:text-white dark:hover:border-white/20 active:scale-96 shadow-sm dark:shadow-none" onClick={() => handleAddAmount(v)}>
                      +{v>=1000000?`${v/1000000}jt`:`${v/1000}k`}
                    </button>
                  ))}
                </div>
                <button className="w-full p-[15px] rounded-xl border-none cursor-pointer font-sans text-sm font-medium tracking-[0.05em] text-[#09090b] bg-gradient-to-br from-[#fbcfe8] to-[#f472b6] flex items-center justify-center gap-2 transition-all hover:opacity-88 active:scale-98 relative overflow-hidden after:absolute after:inset-0 after:bg-gradient-to-b after:from-white/8 after:to-transparent after:pointer-events-none mt-auto" onClick={handleNextStep}>
                  Lanjut ke Konfirmasi <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[7fr_5fr] animate-fade-up">
              {/* Detail */}
              <div className="shadow-md dark:shadow-none bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-white/8 rounded-[20px] p-7">
                <p className="text-[11px] font-medium tracking-[0.14em] uppercase text-zinc-400 dark:text-white/30 mb-5">Ringkasan transaksi</p>
                <div className="flex justify-between items-center py-3.5 border-b border-zinc-100 dark:border-b-white/4 last:border-b-0 text-xs"><span className="text-zinc-400 dark:text-white/40">Pemilik rekening</span><span className="text-zinc-800 dark:text-white font-medium text-right">{recipientName}</span></div>
                <div className="flex justify-between items-center py-3.5 border-b border-zinc-100 dark:border-b-white/4 last:border-b-0 text-xs"><span className="text-zinc-400 dark:text-white/40">No. rekening tujuan</span><span className="text-zinc-800 dark:text-white font-medium text-right font-mono text-xs">{accountNumber}</span></div>
                <div className="flex justify-between items-center py-3.5 border-b border-zinc-100 dark:border-b-white/4 last:border-b-0 text-xs"><span className="text-zinc-400 dark:text-white/40">Catatan</span><span className="text-zinc-800 dark:text-white font-medium text-right">{note||'—'}</span></div>
                <div className="flex justify-between items-center py-3.5 border-b border-zinc-100 dark:border-b-white/4 last:border-b-0 text-xs"><span className="text-zinc-400 dark:text-white/40">Biaya admin</span><span className="text-emerald-600 dark:text-emerald-500 font-semibold text-right">Gratis</span></div>
              </div>

              {/* Summary + CTA */}
              <div className="shadow-md dark:shadow-none bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-white/8 rounded-[20px] p-7 flex flex-col gap-5">
                <p className="text-[11px] font-medium tracking-[0.14em] uppercase text-zinc-400 dark:text-white/30 mb-0">Total nominal</p>
                <div className="text-center py-2">
                  <p className="text-[11px] uppercase tracking-[0.12em] text-pink-600 dark:text-[#fbcfe8] mb-2">Anda akan mentransfer</p>
                  <p className="font-syne text-[34px] font-extrabold text-zinc-800 dark:text-white leading-none">
                    Rp {parseInt(amount,10).toLocaleString('id-ID')}
                  </p>
                </div>
                <div className="bg-zinc-50 border border-zinc-200 text-zinc-500 dark:bg-white/4 dark:border-white/8 rounded-xl p-3.5 px-4 text-xs dark:text-white/30 leading-relaxed">
                  Pastikan semua informasi sudah benar. Transaksi yang telah diproses tidak dapat dibatalkan.
                </div>
                <button className="w-full p-[15px] rounded-xl border-none cursor-pointer font-sans text-sm font-medium tracking-[0.05em] text-[#09090b] bg-gradient-to-br from-[#fbcfe8] to-[#f472b6] flex items-center justify-center gap-2 transition-all hover:opacity-88 active:scale-98 relative overflow-hidden after:absolute after:inset-0 after:bg-gradient-to-b after:from-white/8 after:to-transparent after:pointer-events-none mt-auto disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100" onClick={handleNextStep} disabled={submitting}>
                  {submitting ? 'Memproses...' : 'Transfer Sekarang'}
                </button>
              </div>
            </div>
          )}

          {/* STEP 4 — Success */}
          {step === 4 && (
            <div className="animate-scale-in max-w-[480px] mx-auto w-full">
              <div className="shadow-md dark:shadow-none bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-white/8 rounded-[20px] p-7 text-center">
                <div className="w-[72px] h-[72px] rounded-[22px] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 size={32} color="#10b981" strokeWidth={1.75} />
                </div>
                <h2 className="font-syne text-24 font-extrabold text-zinc-800 dark:text-white mb-1.5">Transfer Berhasil</h2>
                <p className="text-xs text-zinc-500 dark:text-white/40 mb-7">Transaksi Anda telah sukses diproses oleh VoiceBank</p>

                <div className="bg-zinc-50 border border-zinc-200 dark:bg-[#18181b] dark:border-white/8 rounded-2xl p-5 px-6 mb-6 text-left shadow-sm dark:shadow-none">
                  <p className="font-mono text-[11px] text-zinc-400 border-zinc-200 dark:text-white/30 tracking-[0.08em] mb-4 pb-3 border-b dark:border-b-white/8">REF: TX-910283019</p>
                  <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-400 dark:text-white/30 mb-1">Total Transfer</p>
                  <p className="font-syne text-[28px] font-extrabold text-zinc-800 dark:text-white mb-5">Rp {parseInt(amount,10).toLocaleString('id-ID')}</p>
                  <div className="flex justify-between items-center py-3.5 border-b border-zinc-100 dark:border-b-white/4 last:border-b-0 text-xs"><span className="text-zinc-400 dark:text-white/40">Penerima</span><span className="text-zinc-800 dark:text-white font-medium text-right">{recipientName}</span></div>
                  <div className="flex justify-between items-center py-3.5 border-b border-zinc-100 dark:border-b-white/4 last:border-b-0 text-xs"><span className="text-zinc-400 dark:text-white/40">No. rekening</span><span className="text-zinc-800 dark:text-white font-medium text-right font-mono text-xs">{accountNumber}</span></div>
                  <div className="flex justify-between items-center py-3.5 border-b border-zinc-100 dark:border-b-white/4 last:border-b-0 text-xs" style={{ borderBottom:'none' }}><span className="text-zinc-400 dark:text-white/40">Catatan</span><span className="text-zinc-800 dark:text-white font-medium text-right">{note||'—'}</span></div>
                </div>

                <button className="w-full p-[15px] rounded-xl border-none cursor-pointer font-sans text-sm font-medium tracking-[0.05em] text-[#09090b] bg-gradient-to-br from-[#fbcfe8] to-[#f472b6] flex items-center justify-center gap-2 transition-all hover:opacity-88 active:scale-98 relative overflow-hidden after:absolute after:inset-0 after:bg-gradient-to-b after:from-white/8 after:to-transparent after:pointer-events-none" onClick={handleReset}>
                  Transfer Lagi
                </button>
                <button className="w-full p-3.5 rounded-xl border border-zinc-200 dark:border-white/8 bg-white dark:bg-[#18181b] cursor-pointer font-sans text-sm font-medium text-zinc-600 dark:text-white/60 transition-all hover:bg-zinc-50 hover:text-zinc-800 dark:hover:bg-white/8 dark:hover:text-white active:scale-98 mt-2.5 shadow-sm dark:shadow-none" onClick={() => navigate('/dashboard')}>
                  Kembali ke Dashboard
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ══════════════════════════════════════════════ */}
      {/* VOICE FLOW                                     */}
      {/* ══════════════════════════════════════════════ */}
      {voiceEnabled && (
        <div className="bg-white border border-zinc-200 dark:bg-[#18181b] dark:border-white/8 rounded-[20px] overflow-hidden animate-fade-in shadow-md dark:shadow-none">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {/* Mic side */}
            <div className="flex flex-col items-center justify-center p-12 px-7 border-b border-zinc-100 dark:border-white/8 md:border-b-0 md:border-r border-zinc-100 dark:md:border-r-white/8">
              <div className="relative mb-5">
                {isListening && (
                  <>
                    <div className="absolute inset-[-14px] rounded-full bg-pink-500/15 dark:bg-[#fbcfe8]/15 animate-ping" />
                    <div className="absolute inset-[-7px] rounded-full border border-pink-500/15 dark:border-[#fbcfe8]/15 animate-ping" />
                  </>
                )}
                <button
                  className={`relative z-10 w-[88px] h-[88px] rounded-full flex items-center justify-center cursor-pointer border-none transition-all hover:scale-106 active:scale-97 ${isListening ? 'bg-[#fbcfe8] shadow-[0_0_32px_rgba(251,207,232,.4)]' : 'bg-zinc-100 border border-zinc-200 dark:bg-white/4 dark:border-white/12'}`}
                  onClick={toggleVoice}
                  aria-label={isListening ? 'Hentikan' : 'Mulai perintah suara'}
                >
                  <Mic size={30} color={isListening ? '#09090b' : (theme === 'dark' ? 'rgba(251,207,232,.8)' : '#ec4899')} strokeWidth={1.75} />
                </button>
              </div>

              {isListening
                ? (
                  <div className="flex items-center gap-1 h-7">
                    <div className="w-[3px] rounded-full bg-pink-500/70 dark:bg-[#fbcfe8]/70 h-2 animate-wave" />
                    <div className="w-[3px] rounded-full bg-pink-500/70 dark:bg-[#fbcfe8]/70 h-4.5 animate-[wave_0.9s_0.1s_ease-in-out_infinite]" />
                    <div className="w-[3px] rounded-full bg-pink-500/70 dark:bg-[#fbcfe8]/70 h-6 animate-[wave_0.9s_0.2s_ease-in-out_infinite]" />
                    <div className="w-[3px] rounded-full bg-pink-500/70 dark:bg-[#fbcfe8]/70 h-3.5 animate-[wave_0.9s_0.3s_ease-in-out_infinite]" />
                    <div className="w-[3px] rounded-full bg-pink-500/70 dark:bg-[#fbcfe8]/70 h-5.5 animate-[wave_0.9s_0.15s_ease-in-out_infinite]" />
                    <div className="w-[3px] rounded-full bg-pink-500/70 dark:bg-[#fbcfe8]/70 h-2.5 animate-[wave_0.9s_0.25s_ease-in-out_infinite]" />
                    <div className="w-[3px] rounded-full bg-pink-500/70 dark:bg-[#fbcfe8]/70 h-4 animate-[wave_0.9s_0.05s_ease-in-out_infinite]" />
                  </div>
                )
                : <p className="text-xs text-pink-600 dark:text-[#fbcfe8] mt-3 text-center">
                    Ketuk untuk mulai
                  </p>
              }
            </div>

            {/* Text side */}
            <div className="p-10 px-8 flex flex-col gap-5">
              <div>
                <p className="text-[11px] font-medium tracking-[0.14em] uppercase text-zinc-400 dark:text-white/30 mb-5">Asisten suara</p>
                <p className="text-sm text-zinc-500 dark:text-white/40 leading-relaxed">
                  Tekan tombol mikrofon dan ucapkan nama penerima atau nomor rekening untuk transfer cepat.
                </p>
              </div>

              <div className="bg-zinc-50 border border-zinc-200 dark:bg-[#18181b] dark:border-white/8 rounded-xl p-4 min-h-[64px] flex items-center">
                <p className={`text-sm italic leading-normal ${isListening ? 'text-zinc-800 dark:text-white not-italic' : 'text-zinc-400 dark:text-white/30'}`}>
                  {isListening
                    ? voiceText || 'Mendengarkan…'
                    : 'Silakan tekan tombol Mic untuk mulai berbicara…'}
                </p>
              </div>

              <div className="bg-zinc-50 border border-zinc-200 dark:bg-white/4 dark:border-white/8 rounded-xl p-4">
                <p className="text-[11px] font-medium tracking-[0.12em] uppercase text-zinc-400 dark:text-white/30 mb-2.5">Contoh perintah</p>
                <ul className="pl-0 list-none flex flex-col gap-2">
                  <li className="text-xs text-zinc-500 dark:text-white/40 leading-normal pl-3.5 relative before:absolute before:left-0 before:top-[7px] before:w-1 before:h-1 before:rounded-full before:bg-pink-500/50 dark:before:bg-[#fbcfe8]/50">"Kirim ke Budi Santoso"</li>
                  <li className="text-xs text-zinc-500 dark:text-white/40 leading-normal pl-3.5 relative before:absolute before:left-0 before:top-[7px] before:w-1 before:h-1 before:rounded-full before:bg-pink-500/50 dark:before:bg-[#fbcfe8]/50">"Transfer ke nomor delapan dua sembilan tiga…"</li>
                  <li className="text-xs text-zinc-500 dark:text-white/40 leading-normal pl-3.5 relative before:absolute before:left-0 before:top-[7px] before:w-1 before:h-1 before:rounded-full before:bg-pink-500/50 dark:before:bg-[#fbcfe8]/50">Pastikan mikrofon perangkat memiliki izin aktif</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}