import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Camera,
  Mail,
  Phone,
  User,
  Save,
  Shield,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";

/* ─── Styles ─── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&family=Syne:wght@700;800&family=DM+Mono:wght@400;500&display=swap');

  @keyframes pv-fade-up {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes pv-check-in {
    from { opacity: 0; transform: scale(0.8); }
    to   { opacity: 1; transform: scale(1); }
  }

  .pv-root * { box-sizing: border-box; margin: 0; padding: 0; }

  .pv-page {
    font-family: 'DM Sans', sans-serif;
    min-height: 100svh;
    background: #09090b;
    background-image:
      radial-gradient(ellipse 60% 50% at 15% -5%, rgba(29,78,216,0.09) 0%, transparent 65%),
      radial-gradient(ellipse 50% 40% at 85% 90%, rgba(29,78,216,0.05) 0%, transparent 60%);
    color: #ffffff;
    padding: 28px 24px 48px;
    animation: pv-fade-up 0.45s cubic-bezier(.22,1,.36,1) both;
  }

  /* ── Top bar ── */
  .pv-topbar {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 28px;
  }
  .pv-topbar-left { display: flex; flex-direction: column; gap: 4px; }
  .pv-section-label {
    font-size: 11px; font-weight: 500; letter-spacing: 0.14em;
    text-transform: uppercase; color: rgba(255,255,255,0.3);
  }
  .pv-title {
    font-family: 'Syne', sans-serif;
    font-size: 22px; font-weight: 800; letter-spacing: 0.03em;
  }
  .pv-title span { color: #fbcfe8; }
  .pv-back-btn {
    width: 40px; height: 40px; border-radius: 12px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: background 0.2s, color 0.2s;
    color: rgba(255,255,255,0.4);
  }
  .pv-back-btn:hover { background: rgba(255,255,255,0.08); color: #ffffff; }

  /* ── Grid ── */
  .pv-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 20px;
  }
  @media (min-width: 900px) {
    .pv-grid { grid-template-columns: 280px 1fr; }
  }

  /* ── Card base ── */
  .pv-card {
    background: #18181b;
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 20px;
    padding: 28px;
  }

  /* ── Left column ── */
  .pv-left { display: flex; flex-direction: column; gap: 16px; }

  /* Avatar area */
  .pv-avatar-wrap {
    display: flex; flex-direction: column; align-items: center;
    gap: 16px; padding-bottom: 20px;
    border-bottom: 1px solid rgba(255,255,255,0.08);
  }
  .pv-avatar-ring {
    position: relative; cursor: pointer;
  }
  .pv-avatar-img {
    width: 96px; height: 96px; border-radius: 50%;
    background: rgba(251,207,232,0.08);
    border: 2px solid rgba(251,207,232,0.2);
    display: flex; align-items: center; justify-content: center;
    overflow: hidden; transition: border-color 0.2s;
    color: rgba(251,207,232,0.6);
  }
  .pv-avatar-ring:hover .pv-avatar-img { border-color: rgba(251,207,232,0.5); }
  .pv-avatar-img img { width: 100%; height: 100%; object-fit: cover; }
  .pv-camera-btn {
    position: absolute; bottom: 2px; right: 2px;
    width: 28px; height: 28px; border-radius: 50%;
    background: #fbcfe8; color: #ffffff;
    display: flex; align-items: center; justify-content: center;
    border: 2px solid #09090b;
    transition: background 0.2s, transform 0.15s;
  }
  .pv-avatar-ring:hover .pv-camera-btn { background: #b91c1c; transform: scale(1.08); }

  .pv-user-name {
    font-family: 'Syne', sans-serif;
    font-size: 18px; font-weight: 800;
    text-align: center; letter-spacing: 0.02em;
  }
  .pv-account-num {
    font-family: 'DM Mono', monospace;
    font-size: 11px; letter-spacing: 0.1em;
    color: rgba(255,255,255,0.3); text-align: center;
    margin-top: -8px;
  }

  /* Verified badge */
  .pv-verified {
    width: 100%;
    background: rgba(74,222,128,0.06);
    border: 1px solid rgba(74,222,128,0.15);
    border-radius: 12px; padding: 12px 14px;
    display: flex; align-items: center; gap: 10px;
  }
  .pv-verified-icon {
    width: 32px; height: 32px; border-radius: 9px;
    background: rgba(74,222,128,0.1);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; color: #10b981;
  }
  .pv-verified-title { font-size: 12px; font-weight: 500; color: #10b981; }
  .pv-verified-sub   { font-size: 11px; color: rgba(255,255,255,0.3); margin-top: 1px; }

  /* Stats row */
  .pv-stats {
    display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
  }
  .pv-stat {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px; padding: 12px;
    display: flex; flex-direction: column; gap: 4px;
  }
  .pv-stat-label {
    font-size: 10px; font-weight: 500; letter-spacing: 0.1em;
    text-transform: uppercase; color: rgba(255,255,255,0.2);
  }
  .pv-stat-val {
    font-family: 'Syne', sans-serif;
    font-size: 14px; font-weight: 700; color: #ffffff;
  }

  /* ── Right column ── */
  .pv-right { display: flex; flex-direction: column; gap: 0; }

  .pv-form-title {
    font-size: 11px; font-weight: 500; letter-spacing: 0.14em;
    text-transform: uppercase; color: rgba(255,255,255,0.3);
    margin-bottom: 20px;
  }

  /* Field */
  .pv-field { margin-bottom: 20px; }
  .pv-field:last-of-type { margin-bottom: 0; }
  .pv-label {
    font-size: 11px; font-weight: 500; letter-spacing: 0.08em;
    text-transform: uppercase; color: rgba(255,255,255,0.3);
    margin-bottom: 8px; display: flex; align-items: center; gap: 5px;
  }
  .pv-required { color: #f9a8d4; }

  .pv-field-wrap {
    display: flex; align-items: center; gap: 10px;
    background: #18181b;
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px; padding: 12px 14px;
    transition: border-color 0.2s;
  }
  .pv-field-wrap.readonly {
    background: rgba(255,255,255,0.04);
    border-color: rgba(255,255,255,0.04);
    cursor: not-allowed;
  }
  .pv-field-wrap:not(.readonly):focus-within {
    border-color: rgba(251,207,232,0.4);
  }
  .pv-field-icon { color: rgba(255,255,255,0.3); flex-shrink: 0; }
  .pv-field-wrap:not(.readonly):focus-within .pv-field-icon { color: #f9a8d4; }

  .pv-field-wrap input {
    background: transparent; border: none; outline: none;
    color: #ffffff; font-family: 'DM Sans', sans-serif;
    font-size: 14px; font-weight: 500; flex: 1; width: 100%;
  }
  .pv-field-wrap input::placeholder { color: rgba(255,255,255,0.2); }
  .pv-field-wrap input:disabled { color: rgba(255,255,255,0.4); cursor: not-allowed; }

  .pv-field-hint {
    font-size: 11px; color: rgba(255,255,255,0.2);
    margin-top: 6px; padding-left: 2px; line-height: 1.5;
  }

  /* Divider */
  .pv-divider {
    height: 1px; background: rgba(255,255,255,0.08);
    margin: 24px 0;
  }

  /* Save row */
  .pv-save-row {
    display: flex; align-items: center; justify-content: space-between; gap: 12px;
  }
  .pv-save-hint {
    font-size: 12px; color: rgba(255,255,255,0.2); flex: 1;
  }
  .pv-save-success {
    display: flex; align-items: center; gap: 7px;
    font-size: 12px; font-weight: 500; color: #10b981;
    animation: pv-check-in 0.3s cubic-bezier(.22,1,.36,1);
  }

  .pv-save-btn {
    display: flex; align-items: center; gap: 8px;
    padding: 11px 22px; border-radius: 12px;
    background: #fbcfe8; color: #ffffff;
    font-family: 'Syne', sans-serif;
    font-size: 13px; font-weight: 700; letter-spacing: 0.04em;
    border: 1px solid rgba(251,207,232,0.5);
    cursor: pointer; flex-shrink: 0;
    box-shadow: 0 4px 20px rgba(251,207,232,0.25);
    transition: background 0.2s, box-shadow 0.2s, transform 0.15s;
  }
  .pv-save-btn:hover {
    background: #b91c1c;
    box-shadow: 0 4px 24px rgba(251,207,232,0.4);
  }
  .pv-save-btn:active { transform: scale(0.97); }
`;

function StyleTag() {
  return <style dangerouslySetInnerHTML={{ __html: styles }} />;
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const storedUser = JSON.parse(localStorage.getItem("registeredUser")) || {};
  const [user, setUser] = useState({
    name: storedUser.name || "Pengguna",
    email: storedUser.email || "",
    phone: storedUser.phone || "",
    avatar: storedUser.avatar || null,
  });
  const [isSaved, setIsSaved] = useState(false);

  const accountNumber = localStorage.getItem("accountNumber") || "6785130512";
  const fmtAccount = accountNumber.replace(
    /(\d{3})(\d{4})(\d{3,})/,
    "$1 $2 $3",
  );

  const handleAvatarClick = () => fileInputRef.current.click();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setUser((u) => ({ ...u, avatar: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!user.email) {
      alert("Email wajib diisi untuk pengiriman bukti transaksi!");
      return;
    }
    localStorage.setItem("registeredUser", JSON.stringify(user));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="pv-root">
      <StyleTag />
      <div className="pv-page">
        {/* Top bar */}
        <div className="pv-topbar">
          <div className="pv-topbar-left">
            <span className="pv-section-label">Akun saya</span>
            <span className="pv-title">
              Profil<span>.</span>
            </span>
          </div>
          <button
            className="pv-back-btn"
            onClick={() => navigate(-1)}
            aria-label="Kembali"
          >
            <ArrowLeft size={18} strokeWidth={1.75} />
          </button>
        </div>

        <div className="pv-grid">
          {/* ── Left column ── */}
          <div className="pv-left">
            <div className="pv-card">
              {/* Avatar */}
              <div className="pv-avatar-wrap">
                <div
                  className="pv-avatar-ring"
                  onClick={handleAvatarClick}
                  role="button"
                  aria-label="Ganti foto profil"
                >
                  <div className="pv-avatar-img">
                    {user.avatar ? (
                      <img src={user.avatar} alt="Foto profil" />
                    ) : (
                      <User size={36} strokeWidth={1.5} />
                    )}
                  </div>
                  <div className="pv-camera-btn">
                    <Camera size={12} strokeWidth={2} />
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="pv-hidden-input"
                    accept="image/*"
                    style={{ display: "none" }}
                  />
                </div>
                <p className="pv-user-name">{user.name}</p>
                <p className="pv-account-num">{fmtAccount}</p>
              </div>

              {/* Verified */}
              <div className="pv-verified" style={{ marginTop: 16 }}>
                <div className="pv-verified-icon">
                  <Shield size={15} strokeWidth={1.75} />
                </div>
                <div>
                  <p className="pv-verified-title">Terverifikasi</p>
                  <p className="pv-verified-sub">Keamanan level bank</p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="pv-stats">
              <div className="pv-stat">
                <span className="pv-stat-label">Status</span>
                <span className="pv-stat-val">Aktif</span>
              </div>
              <div className="pv-stat">
                <span className="pv-stat-label">Tier</span>
                <span className="pv-stat-val">Silver</span>
              </div>
            </div>
          </div>

          {/* ── Right column ── */}
          <div className="pv-right">
            <div className="pv-card" style={{ height: "100%" }}>
              <p className="pv-form-title">Informasi Pribadi</p>

              {/* Nama — read only */}
              <div className="pv-field">
                <label className="pv-label">
                  <User size={12} strokeWidth={2} /> Nama Pemilik Rekening
                </label>
                <div className="pv-field-wrap readonly">
                  <User
                    size={15}
                    className="pv-field-icon"
                    strokeWidth={1.75}
                  />
                  <input type="text" value={user.name} disabled />
                </div>
                <p className="pv-field-hint">
                  Nama sesuai KTP, tidak dapat diubah.
                </p>
              </div>

              {/* Email */}
              <div className="pv-field">
                <label className="pv-label">
                  <Mail size={12} strokeWidth={2} /> Email Utama
                  <span className="pv-required">*</span>
                </label>
                <div className="pv-field-wrap">
                  <Mail
                    size={15}
                    className="pv-field-icon"
                    strokeWidth={1.75}
                  />
                  <input
                    type="email"
                    value={user.email}
                    onChange={(e) =>
                      setUser((u) => ({ ...u, email: e.target.value }))
                    }
                    placeholder="nama@email.com"
                  />
                </div>
                <p className="pv-field-hint">
                  Bukti transaksi dikirim ke alamat ini.
                </p>
              </div>

              {/* Phone */}
              <div className="pv-field">
                <label className="pv-label">
                  <Phone size={12} strokeWidth={2} /> Nomor Handphone
                </label>
                <div className="pv-field-wrap">
                  <Phone
                    size={15}
                    className="pv-field-icon"
                    strokeWidth={1.75}
                  />
                  <input
                    type="tel"
                    value={user.phone}
                    onChange={(e) =>
                      setUser((u) => ({ ...u, phone: e.target.value }))
                    }
                    placeholder="081234567890"
                  />
                </div>
              </div>

              <div className="pv-divider" />

              {/* Save row */}
              <div className="pv-save-row">
                {isSaved ? (
                  <div className="pv-save-success">
                    <CheckCircle size={15} strokeWidth={2} />
                    Perubahan berhasil disimpan!
                  </div>
                ) : (
                  <span className="pv-save-hint">
                    Pastikan data sudah benar sebelum menyimpan.
                  </span>
                )}

                <button className="pv-save-btn" onClick={handleSave}>
                  <Save size={14} strokeWidth={2} />
                  Simpan
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
