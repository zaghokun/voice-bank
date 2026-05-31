import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Mic, CheckCircle2, Clock,
  CreditCard, ArrowRight, Info, User2
} from 'lucide-react';

/* ─── Styles ─── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;1,400&family=Syne:wght@700;800&family=DM+Mono:wght@400;500&display=swap');

  @keyframes vb-fade-up   { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  @keyframes vb-fade-in   { from{opacity:0} to{opacity:1} }
  @keyframes vb-scale-in  { from{opacity:0;transform:scale(0.92)} to{opacity:1;transform:scale(1)} }
  @keyframes vb-ping      { 75%,100%{transform:scale(2);opacity:0} }
  @keyything vb-wave      { 0%,100%{transform:scaleY(0.3)} 50%{transform:scaleY(1)} }
  @keyframes vb-wave      { 0%,100%{transform:scaleY(0.3)} 50%{transform:scaleY(1)} }
  @keyframes vb-check     { from{stroke-dashoffset:60} to{stroke-dashoffset:0} }

  .vb-root * { box-sizing:border-box; margin:0; padding:0; }

  /* ── Shell ── */
  .vb-page {
    font-family:'DM Sans',sans-serif;
    min-height:100svh;
    background:#09090b;
    background-image:
      radial-gradient(ellipse 70% 50% at 20% -5%,rgba(251,207,232,0.08) 0%,transparent 65%),
      radial-gradient(ellipse 40% 35% at 85% 90%,rgba(251,207,232,0.04) 0%,transparent 60%);
    color:#ffffff;
    padding:28px 24px 56px;
    animation:vb-fade-up .5s cubic-bezier(.22,1,.36,1) both;
  }

  /* ── Top bar ── */
  .vb-topbar {
    display:flex; align-items:center; justify-content:space-between;
    margin-bottom:32px;
  }
  .vb-topbar-left { display:flex; align-items:center; gap:14px; }
  .vb-back-btn {
    width:38px; height:38px; border-radius:12px;
    background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08);
    display:flex; align-items:center; justify-content:center;
    cursor:pointer; color:rgba(255,255,255,0.5);
    transition:background .2s,color .2s;
  }
  .vb-back-btn:hover { background:rgba(255,255,255,0.08); color:#ffffff; }
  .vb-page-title {
    font-family:'Syne',sans-serif;
    font-size:20px; font-weight:800; color:#ffffff; letter-spacing:.04em;
  }
  .vb-page-title span { color:#fbcfe8; }

  /* Voice toggle pill */
  .vb-voice-pill {
    display:flex; align-items:center; gap:10px;
    background:#18181b; border:1px solid rgba(255,255,255,0.08);
    border-radius:99px; padding:8px 16px;
  }
  .vb-voice-pill-label {
    font-size:11px; font-weight:500; letter-spacing:.1em; text-transform:uppercase;
    color:rgba(255,255,255,0.3);
  }
  /* toggle switch */
  .vb-toggle { position:relative; display:inline-flex; align-items:center; cursor:pointer; }
  .vb-toggle input { position:absolute; opacity:0; width:0; height:0; }
  .vb-toggle-track {
    width:36px; height:20px; border-radius:99px;
    background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.12);
    transition:background .25s, border-color .25s;
    position:relative;
  }
  .vb-toggle input:checked ~ .vb-toggle-track { background:#fbcfe8; border-color:#fbcfe8; }
  .vb-toggle-thumb {
    position:absolute; top:2px; left:2px;
    width:16px; height:16px; border-radius:50%;
    background:#ffffff; transition:transform .25s;
    pointer-events:none;
  }
  .vb-toggle input:checked ~ .vb-toggle-track .vb-toggle-thumb { transform:translateX(16px); }

  /* ── Step breadcrumb ── */
  .vb-steps {
    display:flex; align-items:center; gap:6px;
    margin-bottom:28px;
  }
  .vb-step-dot {
    width:24px; height:6px; border-radius:99px;
    background:rgba(255,255,255,0.08);
    transition:background .3s, width .3s;
  }
  .vb-step-dot.done   { background:rgba(251,207,232,.4); }
  .vb-step-dot.active { background:#fbcfe8; width:32px; }

  /* ── Error banner ── */
  .vb-error {
    display:flex; align-items:flex-start; gap:10px;
    background:rgba(245,158,11,.06); border:1px solid rgba(245,158,11,.18);
    border-radius:12px; padding:14px 16px; margin-bottom:20px;
    animation:vb-fade-in .25s ease both;
  }
  .vb-error p { font-size:13px; color:rgba(251,191,36,.9); line-height:1.5; }

  /* ── Card base ── */
  .vb-card {
    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03);
    background:#18181b;
    border:1px solid rgba(255,255,255,0.08);
    border-radius:20px; padding:28px;
  }

  /* ── Section label ── */
  .vb-slabel {
    font-size:11px; font-weight:500; letter-spacing:.14em; text-transform:uppercase;
    color:rgba(255,255,255,0.3); margin-bottom:20px;
  }

  /* ── Field ── */
  .vb-field { display:flex; flex-direction:column; gap:6px; }
  .vb-field label {
    font-size:11px; font-weight:500; letter-spacing:.10em; text-transform:uppercase;
    color:rgba(255,255,255,0.3); padding-left:2px;
  }
  .vb-input {
    width:100%; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08);
    border-radius:12px; padding:14px 16px;
    font-family:'DM Sans',sans-serif; font-size:14px; color:#ffffff; outline:none;
    transition:border-color .2s, background .2s; caret-color:#fbcfe8;
  }
  .vb-input::placeholder { color:rgba(255,255,255,0.2); }
  .vb-input:hover  { border-color:rgba(255,255,255,0.2); }
  .vb-input:focus  { border-color:rgba(251,207,232,.55); background:rgba(251,207,232,.04); }
  .vb-input-icon-wrap {
    position:relative;
  }
  .vb-input-icon-wrap .vb-input { padding-right:46px; }
  .vb-input-icon {
    position:absolute; right:14px; top:50%; transform:translateY(-50%);
    color:rgba(255,255,255,0.2); pointer-events:none;
  }
  .vb-recipient-hint {
    font-size:12px; font-weight:500; color:#f9a8d4; padding-left:4px;
    animation:vb-fade-in .2s ease both;
  }

  /* ── Amount input ── */
  .vb-amount-wrap {
    display:flex; align-items:center; gap:0;
    background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08);
    border-radius:12px; overflow:hidden;
    transition:border-color .2s;
  }
  .vb-amount-wrap:focus-within { border-color:rgba(251,207,232,.55); }
  .vb-amount-prefix {
    padding:0 16px;
    font-family:'Syne',sans-serif; font-size:16px; font-weight:700;
    color:rgba(255,255,255,0.3);
    border-right:1px solid rgba(255,255,255,0.08);
    white-space:nowrap; user-select:none;
    align-self:stretch; display:flex; align-items:center;
  }
  .vb-amount-input {
    flex:1; background:transparent; border:none; outline:none;
    padding:18px 16px;
    font-family:'DM Mono',monospace; font-size:28px; font-weight:500;
    color:#ffffff; caret-color:#fbcfe8; min-width:0;
  }
  .vb-amount-input::placeholder { color:rgba(255,255,255,0.12); }
  .vb-amount-hint {
    font-size:12px; color:rgba(255,255,255,0.3); padding-left:4px; margin-top:2px;
    animation:vb-fade-in .2s ease both;
  }

  /* Shortcut chips */
  .vb-chips { display:grid; grid-template-columns:repeat(4,1fr); gap:8px; }
  .vb-chip {
    background:#18181b; border:1px solid rgba(255,255,255,0.08);
    border-radius:10px; padding:11px 6px;
    font-size:12px; font-weight:500; color:rgba(255,255,255,0.5);
    cursor:pointer; text-align:center;
    transition:background .2s, color .2s, border-color .2s, transform .15s;
  }
  .vb-chip:hover  { background:rgba(255,255,255,0.08); color:#ffffff; border-color:rgba(255,255,255,0.2); }
  .vb-chip:active { transform:scale(.96); }

  /* ── Recipient avatar ── */
  .vb-avatar-lg {
    width:52px; height:52px; border-radius:16px; flex-shrink:0;
    background:rgba(251,207,232,.1); border:1px solid rgba(251,207,232,.18);
    display:flex; align-items:center; justify-content:center;
    font-family:'Syne',sans-serif; font-size:14px; font-weight:800; color:#f9a8d4;
  }

  /* History contacts */
  .vb-contacts { display:grid; grid-template-columns:repeat(2,1fr); gap:10px; }
  @media(min-width:640px)  { .vb-contacts { grid-template-columns:repeat(3,1fr); } }
  @media(min-width:1024px) { .vb-contacts { grid-template-columns:repeat(4,1fr); } }
  .vb-contact-card {
    display:flex; align-items:center; gap:12px;
    background:#18181b; border:1px solid rgba(255,255,255,0.08);
    border-radius:14px; padding:14px;
    cursor:pointer; transition:background .2s, border-color .2s, transform .15s;
  }
  .vb-contact-card:hover  { background:rgba(255,255,255,0.08); border-color:rgba(251,207,232,.25); }
  .vb-contact-card:active { transform:scale(.97); }
  .vb-contact-avatar {
    width:38px; height:38px; border-radius:10px; flex-shrink:0;
    background:rgba(255,255,255,0.08);
    display:flex; align-items:center; justify-content:center;
    font-size:11px; font-weight:700; color:rgba(255,255,255,0.6);
  }
  .vb-contact-name { font-size:13px; font-weight:500; color:#ffffff; line-height:1.3; }
  .vb-contact-acc  { font-size:11px; font-family:'DM Mono',monospace; color:rgba(255,255,255,0.3); margin-top:2px; }

  /* ── Grid layouts ── */
  .vb-two-col { display:grid; grid-template-columns:1fr; gap:20px; }
  @media(min-width:1024px) { .vb-two-col { grid-template-columns:5fr 7fr; } }
  .vb-two-col-even { display:grid; grid-template-columns:1fr; gap:20px; }
  @media(min-width:1024px) { .vb-two-col-even { grid-template-columns:7fr 5fr; } }

  /* ── Confirm rows ── */
  .vb-confirm-row {
    display:flex; justify-content:space-between; align-items:center;
    padding:14px 0; border-bottom:1px solid rgba(255,255,255,0.04);
    font-size:13px;
  }
  .vb-confirm-row:last-child { border-bottom:none; }
  .vb-confirm-row .label { color:rgba(255,255,255,0.4); }
  .vb-confirm-row .value { color:#ffffff; font-weight:500; text-align:right; }
  .vb-confirm-row .value.mono { font-family:'DM Mono',monospace; font-size:12px; }
  .vb-confirm-row .value.green { color:#10b981; font-weight:600; }

  /* Disclaimer box */
  .vb-disclaimer {
    background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08);
    border-radius:12px; padding:14px 16px;
    font-size:12px; color:rgba(255,255,255,0.3); line-height:1.7;
  }

  /* ── CTA button ── */
  .vb-btn {
    width:100%; padding:15px; border-radius:12px; border:none; cursor:pointer;
    font-family:'DM Sans',sans-serif; font-size:14px; font-weight:500; letter-spacing:.05em;
    color:#09090b; background:linear-gradient(135deg,#fbcfe8 0%,#f472b6 100%);
    display:flex; align-items:center; justify-content:center; gap:8px;
    transition:opacity .2s, transform .15s; position:relative; overflow:hidden;
  }
  .vb-btn::after {
    content:''; position:absolute; inset:0;
    background:linear-gradient(180deg,rgba(255,255,255,0.08) 0%,transparent 100%);
    pointer-events:none;
  }
  .vb-btn:hover  { opacity:.88; }
  .vb-btn:active { transform:scale(.98); }
  .vb-btn-ghost {
    width:100%; padding:14px; border-radius:12px;
    border:1px solid rgba(255,255,255,0.08);
    background:#18181b; cursor:pointer;
    font-family:'DM Sans',sans-serif; font-size:14px; font-weight:500;
    color:rgba(255,255,255,0.6);
    transition:background .2s, color .2s, transform .15s;
  }
  .vb-btn-ghost:hover  { background:rgba(255,255,255,0.08); color:#ffffff; }
  .vb-btn-ghost:active { transform:scale(.98); }

  /* ── Success ── */
  .vb-success {
    max-width:500px; margin:0 auto; text-align:center;
    animation:vb-scale-in .5s cubic-bezier(.22,1,.36,1) both;
  }
  .vb-success-icon {
    width:72px; height:72px; border-radius:22px;
    background:rgba(16,185,129,.1); border:1px solid rgba(16,185,129,.2);
    display:flex; align-items:center; justify-content:center;
    margin:0 auto 24px;
  }
  .vb-success-title {
    font-family:'Syne',sans-serif; font-size:24px; font-weight:800; color:#ffffff;
    margin-bottom:6px;
  }
  .vb-success-sub { font-size:13px; color:rgba(255,255,255,0.4); margin-bottom:28px; }
  .vb-success-receipt {
    background:#18181b; border:1px solid rgba(255,255,255,0.08);
    border-radius:16px; padding:20px 24px; margin-bottom:24px; text-align:left;
  }
  .vb-ref {
    font-family:'DM Mono',monospace; font-size:11px;
    color:rgba(255,255,255,0.3); letter-spacing:.08em;
    margin-bottom:16px; padding-bottom:12px;
    border-bottom:1px solid rgba(255,255,255,0.08);
  }
  .vb-total-label { font-size:11px; text-transform:uppercase; letter-spacing:.12em; color:rgba(255,255,255,0.3); margin-bottom:4px; }
  .vb-total-amount {
    font-family:'Syne',sans-serif; font-size:28px; font-weight:800;
    color:#ffffff; margin-bottom:20px;
  }

  /* ── Voice panel ── */
  .vb-voice-panel {
    background:#18181b; border:1px solid rgba(255,255,255,0.08);
    border-radius:20px; overflow:hidden;
    animation:vb-fade-in .3s ease both;
  }
  .vb-voice-inner {
    display:grid; grid-template-columns:1fr; gap:0;
  }
  @media(min-width:768px) { .vb-voice-inner { grid-template-columns:1fr 1fr; } }
  .vb-voice-left {
    display:flex; flex-direction:column; align-items:center; justify-content:center;
    padding:48px 28px;
    border-bottom:1px solid rgba(255,255,255,0.08);
  }
  @media(min-width:768px) {
    .vb-voice-left { border-bottom:none; border-right:1px solid rgba(255,255,255,0.08); }
  }
  .vb-mic-wrap { position:relative; margin-bottom:20px; }
  .vb-mic-ping {
    position:absolute; inset:-14px; border-radius:50%;
    background:rgba(251,207,232,.15);
    animation:vb-ping 1.4s cubic-bezier(0,0,.2,1) infinite;
  }
  .vb-mic-ring {
    position:absolute; inset:-7px; border-radius:50%;
    border:1px solid rgba(251,207,232,.15);
    animation:vb-ping 1.8s .4s cubic-bezier(0,0,.2,1) infinite;
  }
  .vb-mic-btn {
    position:relative; z-index:1;
    width:88px; height:88px; border-radius:50%;
    display:flex; align-items:center; justify-content:center;
    cursor:pointer; border:none;
    transition:transform .2s, box-shadow .2s;
  }
  .vb-mic-btn.idle {
    background:rgba(255,255,255,0.04);
    border:1.5px solid rgba(255,255,255,0.12);
  }
  .vb-mic-btn.active {
    background:#fbcfe8;
    box-shadow:0 0 32px rgba(251,207,232,.4);
  }
  .vb-mic-btn:hover  { transform:scale(1.06); }
  .vb-mic-btn:active { transform:scale(.97); }
  .vb-wave-row { display:flex; align-items:center; gap:3px; height:28px; }
  .vb-wbar {
    width:3px; border-radius:99px; background:rgba(251,207,232,.7);
  }
  .vb-wbar:nth-child(1){height:8px; animation:vb-wave .9s 0s ease-in-out infinite}
  .vb-wbar:nth-child(2){height:18px;animation:vb-wave .9s .1s ease-in-out infinite}
  .vb-wbar:nth-child(3){height:24px;animation:vb-wave .9s .2s ease-in-out infinite}
  .vb-wbar:nth-child(4){height:14px;animation:vb-wave .9s .3s ease-in-out infinite}
  .vb-wbar:nth-child(5){height:22px;animation:vb-wave .9s .15s ease-in-out infinite}
  .vb-wbar:nth-child(6){height:10px;animation:vb-wave .9s .25s ease-in-out infinite}
  .vb-wbar:nth-child(7){height:16px;animation:vb-wave .9s .05s ease-in-out infinite}
  .vb-voice-right { padding:40px 32px; display:flex; flex-direction:column; gap:20px; }
  .vb-transcript {
    background:#18181b; border:1px solid rgba(255,255,255,0.08);
    border-radius:12px; padding:16px;
    min-height:64px; display:flex; align-items:center;
  }
  .vb-transcript p { font-size:14px; color:rgba(255,255,255,0.3); font-style:italic; line-height:1.5; }
  .vb-transcript p.live { color:#ffffff; font-style:normal; }
  .vb-tips {
    background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08);
    border-radius:12px; padding:16px;
  }
  .vb-tips-title {
    font-size:11px; font-weight:500; letter-spacing:.12em; text-transform:uppercase;
    color:rgba(255,255,255,0.3); margin-bottom:10px;
  }
  .vb-tips ul { padding-left:0; list-style:none; display:flex; flex-direction:column; gap:8px; }
  .vb-tips li {
    font-size:12px; color:rgba(255,255,255,0.4); line-height:1.5;
    padding-left:14px; position:relative;
  }
  .vb-tips li::before {
    content:''; position:absolute; left:0; top:7px;
    width:5px; height:5px; border-radius:50%;
    background:rgba(251,207,232,.5);
  }
`;

function StyleTag() { return <style dangerouslySetInnerHTML={{ __html: styles }} />; }

function initials(name) {
  if (!name) return '?';
  return name.split(' ').slice(0,2).map(n => n[0]).join('').toUpperCase();
}

export default function TransferPage() {
  const navigate = useNavigate();

  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [step, setStep] = useState(1);
  const [accountNumber, setAccountNumber] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('Transfer via VoiceBank');
  const [error, setError] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [voiceText, setVoiceText] = useState('');

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

  useEffect(() => {
    if (!isListening) { setVoiceText(''); return; }
    let t1, t2, t3;
    setVoiceText('Mendengarkan…');
    t1 = setTimeout(() => setVoiceText('"Kirim ke Budi…"'), 1200);
    t2 = setTimeout(() => setVoiceText('"Kirim ke Budi Santoso (82938102)"'), 2500);
    t3 = setTimeout(() => {
      setAccountNumber('82938102'); setRecipientName('Budi Santoso');
      setIsListening(false); setStep(2);
    }, 3800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [isListening]);

  const handleSelectHistory = (c) => { setAccountNumber(c.accNo); setRecipientName(c.name); setError(''); setStep(2); };
  const handleAmountChange  = (e) => { setAmount(e.target.value.replace(/[^0-9]/g,'')); setError(''); };
  const handleAddAmount     = (v) => { setAmount((parseInt(amount||'0',10)+v).toString()); setError(''); };

  const handleNextStep = () => {
    if (step === 1) {
      if (!accountNumber.trim()) { setError('Silakan masukkan nomor rekening tujuan.'); return; }
      setError(''); setStep(2);
    } else if (step === 2) {
      if (!amount || parseInt(amount,10) <= 0) { setError('Nominal transfer harus lebih besar dari Rp 0.'); return; }
      setError(''); setStep(3);
    } else if (step === 3) { setError(''); setStep(4); }
  };

  const handleReset = () => { setAccountNumber(''); setRecipientName(''); setAmount(''); setNote('Transfer via VoiceBank'); setError(''); setStep(1); };

  const handleBack = () => { if (step > 1 && step < 4) setStep(step-1); else navigate('/dashboard'); };

  const stepLabels = ['Penerima','Nominal','Konfirmasi','Selesai'];

  return (
    <div className="vb-root">
      <StyleTag />
      <div className="vb-page">

        {/* Top bar */}
        <div className="vb-topbar">
          <div className="vb-topbar-left">
            <button className="vb-back-btn" onClick={handleBack} aria-label="Kembali">
              <ArrowLeft size={16} />
            </button>
            <h1 className="vb-page-title">Transfer<span>.</span></h1>
          </div>

          <div className="vb-voice-pill">
            <span className="vb-voice-pill-label">Mode Suara</span>
            <label className="vb-toggle">
              <input type="checkbox" checked={voiceEnabled}
                onChange={() => { setVoiceEnabled(p => !p); handleReset(); }} />
              <div className="vb-toggle-track">
                <div className="vb-toggle-thumb" />
              </div>
            </label>
          </div>
        </div>

        {/* Step indicator (manual only) */}
        {!voiceEnabled && step < 4 && (
          <div className="vb-steps">
            {stepLabels.slice(0,3).map((_, i) => (
              <div key={i} className={`vb-step-dot ${i+1 < step ? 'done' : i+1 === step ? 'active' : ''}`} />
            ))}
            <span style={{ fontSize:11, color: '#fbcfe8', marginLeft:6, letterSpacing:'.06em' }}>
              Langkah {step} dari 3 — {stepLabels[step-1]}
            </span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="vb-error">
            <Info size={15} color="rgba(251,191,36,.8)" style={{ flexShrink:0, marginTop:1 }} />
            <p>{error}</p>
          </div>
        )}

        {/* ══════════════════════════════════════════════ */}
        {/* MANUAL FLOW                                    */}
        {/* ══════════════════════════════════════════════ */}
        {!voiceEnabled && (
          <>
            {/* STEP 1 */}
            {step === 1 && (
              <div style={{ display:'flex', flexDirection:'column', gap:20, animation:'vb-fade-up .35s ease both' }}>
                <div className="vb-card">
                  <p className="vb-slabel">Tujuan transfer</p>
                  <div className="vb-field" style={{ marginBottom:16 }}>
                    <label>Nomor Rekening</label>
                    <div className="vb-input-icon-wrap">
                      <input
                        className="vb-input"
                        type="text" inputMode="numeric"
                        placeholder="Masukkan nomor rekening tujuan"
                        value={accountNumber}
                        onChange={e => { setAccountNumber(e.target.value.replace(/[^0-9]/g,'')); setError(''); }}
                      />
                      <span className="vb-input-icon"><CreditCard size={16} /></span>
                    </div>
                    {recipientName && <p className="vb-recipient-hint">Pemilik: {recipientName}</p>}
                  </div>
                  <button className="vb-btn" onClick={handleNextStep}>
                    Lanjut <ArrowRight size={16} />
                  </button>
                </div>

                <div>
                  <p className="vb-slabel" style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <Clock size={12} /> Riwayat penerima
                  </p>
                  <div className="vb-contacts">
                    {recipientHistory.map((c,i) => (
                      <div key={i} className="vb-contact-card" onClick={() => handleSelectHistory(c)}>
                        <div className="vb-contact-avatar">{c.initial}</div>
                        <div>
                          <p className="vb-contact-name">{c.name}</p>
                          <p className="vb-contact-acc">{c.accNo}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <div className="vb-two-col" style={{ animation:'vb-fade-up .35s ease both' }}>
                {/* Recipient info */}
                <div className="vb-card" style={{ display:'flex', flexDirection:'column', gap:20 }}>
                  <p className="vb-slabel">Penerima</p>
                  <div style={{ display:'flex', alignItems:'center', gap:14, paddingBottom:20, borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
                    <div className="vb-avatar-lg">{initials(recipientName)}</div>
                    <div>
                      <p style={{ fontSize:15, fontWeight:500, color:'#ffffff', marginBottom:4 }}>{recipientName}</p>
                      <p style={{ fontSize:12, fontFamily:'DM Mono,monospace', color: '#fbcfe8' }}>{accountNumber}</p>
                    </div>
                  </div>
                  <div className="vb-field" style={{ flex:1 }}>
                    <label>Catatan (opsional)</label>
                    <input
                      className="vb-input" type="text"
                      value={note} onChange={e => setNote(e.target.value)}
                      placeholder="Tulis keterangan transfer"
                    />
                  </div>
                </div>

                {/* Amount */}
                <div className="vb-card" style={{ display:'flex', flexDirection:'column', gap:20 }}>
                  <p className="vb-slabel">Nominal</p>
                  <div>
                    <div className="vb-amount-wrap">
                      <span className="vb-amount-prefix">Rp</span>
                      <input
                        className="vb-amount-input" type="text" inputMode="numeric"
                        placeholder="0" value={amount} onChange={handleAmountChange}
                      />
                    </div>
                    {amount && parseInt(amount,10) > 0 && (
                      <p className="vb-amount-hint">≈ Rp {parseInt(amount,10).toLocaleString('id-ID')}</p>
                    )}
                  </div>
                  <div className="vb-chips">
                    {amountShortcuts.map(v => (
                      <button key={v} className="vb-chip" onClick={() => handleAddAmount(v)}>
                        +{v>=1000000?`${v/1000000}jt`:`${v/1000}k`}
                      </button>
                    ))}
                  </div>
                  <button className="vb-btn" onClick={handleNextStep} style={{ marginTop:'auto' }}>
                    Lanjut ke Konfirmasi <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <div className="vb-two-col-even" style={{ animation:'vb-fade-up .35s ease both' }}>
                {/* Detail */}
                <div className="vb-card">
                  <p className="vb-slabel">Ringkasan transaksi</p>
                  <div className="vb-confirm-row"><span className="label">Pemilik rekening</span><span className="value">{recipientName}</span></div>
                  <div className="vb-confirm-row"><span className="label">No. rekening tujuan</span><span className="value mono">{accountNumber}</span></div>
                  <div className="vb-confirm-row"><span className="label">Catatan</span><span className="value">{note||'—'}</span></div>
                  <div className="vb-confirm-row"><span className="label">Biaya admin</span><span className="value green">Gratis</span></div>
                </div>

                {/* Summary + CTA */}
                <div className="vb-card" style={{ display:'flex', flexDirection:'column', gap:20 }}>
                  <p className="vb-slabel">Total nominal</p>
                  <div style={{ textAlign:'center', padding:'8px 0' }}>
                    <p style={{ fontSize:11, letterSpacing:'.12em', textTransform:'uppercase', color: '#fbcfe8', marginBottom:8 }}>Anda akan mentransfer</p>
                    <p style={{ fontFamily:'Syne,sans-serif', fontSize:34, fontWeight:800, color:'#ffffff' }}>
                      Rp {parseInt(amount,10).toLocaleString('id-ID')}
                    </p>
                  </div>
                  <div className="vb-disclaimer">
                    Pastikan semua informasi sudah benar. Transaksi yang telah diproses tidak dapat dibatalkan.
                  </div>
                  <button className="vb-btn" onClick={handleNextStep} style={{ marginTop:'auto' }}>
                    Transfer Sekarang
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4 — Success */}
            {step === 4 && (
              <div style={{ animation:'vb-scale-in .5s cubic-bezier(.22,1,.36,1) both', maxWidth:480, margin:'0 auto', width:'100%' }}>
                <div className="vb-card" style={{ textAlign:'center' }}>
                  <div className="vb-success-icon">
                    <CheckCircle2 size={32} color="#10b981" strokeWidth={1.75} />
                  </div>
                  <h2 className="vb-success-title">Transfer Berhasil</h2>
                  <p className="vb-success-sub">Transaksi Anda telah sukses diproses oleh VoiceBank</p>

                  <div className="vb-success-receipt">
                    <p className="vb-ref">REF: TX-910283019</p>
                    <p className="vb-total-label">Total Transfer</p>
                    <p className="vb-total-amount">Rp {parseInt(amount,10).toLocaleString('id-ID')}</p>
                    <div className="vb-confirm-row"><span className="label">Penerima</span><span className="value">{recipientName}</span></div>
                    <div className="vb-confirm-row"><span className="label">No. rekening</span><span className="value mono">{accountNumber}</span></div>
                    <div className="vb-confirm-row" style={{ borderBottom:'none' }}><span className="label">Catatan</span><span className="value">{note||'—'}</span></div>
                  </div>

                  <button className="vb-btn" onClick={handleReset}>
                    Transfer Lagi
                  </button>
                  <button className="vb-btn-ghost" onClick={() => navigate('/dashboard')} style={{ marginTop:10 }}>
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
          <div className="vb-voice-panel">
            <div className="vb-voice-inner">
              {/* Mic side */}
              <div className="vb-voice-left">
                <div className="vb-mic-wrap">
                  {isListening && (
                    <>
                      <div className="vb-mic-ping" />
                      <div className="vb-mic-ring" />
                    </>
                  )}
                  <button
                    className={`vb-mic-btn ${isListening ? 'active' : 'idle'}`}
                    onClick={() => setIsListening(p => !p)}
                    aria-label={isListening ? 'Hentikan' : 'Mulai perintah suara'}
                  >
                    <Mic size={30} color={isListening ? '#09090b' : 'rgba(251,207,232,.8)'} strokeWidth={1.75} />
                  </button>
                </div>

                {isListening
                  ? <div className="vb-wave-row">{[1,2,3,4,5,6,7].map(i=><div key={i} className="vb-wbar"/>)}</div>
                  : <p style={{ fontSize:12, color: '#fbcfe8', marginTop:12, textAlign:'center' }}>
                      Ketuk untuk mulai
                    </p>
                }
              </div>

              {/* Text side */}
              <div className="vb-voice-right">
                <div>
                  <p className="vb-slabel">Asisten suara</p>
                  <p style={{ fontSize:13, color:'rgba(255,255,255,0.4)', lineHeight:1.7 }}>
                    Tekan tombol mikrofon dan ucapkan nama penerima atau nomor rekening untuk transfer cepat.
                  </p>
                </div>

                <div className="vb-transcript">
                  <p className={isListening ? 'live' : ''}>
                    {isListening
                      ? voiceText || 'Mendengarkan…'
                      : 'Silakan tekan tombol Mic untuk mulai berbicara…'}
                  </p>
                </div>

                <div className="vb-tips">
                  <p className="vb-tips-title">Contoh perintah</p>
                  <ul>
                    <li>"Kirim ke Budi Santoso"</li>
                    <li>"Transfer ke nomor delapan dua sembilan tiga…"</li>
                    <li>Pastikan mikrofon perangkat memiliki izin aktif</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}