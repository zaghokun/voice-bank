# VoiceBank — Voice-First Banking App untuk Tunanetra Indonesia

> **Tim CC26-PSU325** | Coding Camp 2026 powered by DBS Foundation

Indonesia memiliki lebih dari **3,7 juta penyandang tunanetra** yang kesulitan mengakses layanan perbankan digital. VoiceBank hadir sebagai solusi *voice-first banking* pertama di Indonesia yang memungkinkan tunanetra melakukan transaksi keuangan secara mandiri, hanya dengan perintah suara dalam Bahasa Indonesia.

Cukup ucapkan:
> *"Pak, kirim uang 50 ribu ke Budi"*

Sistem akan memahami perintah, mengonfirmasi, dan memberikan umpan balik audio yang jelas.

---

## 🎯 Fitur Utama

| Modul | Deskripsi |
|-------|-----------|
| 🎤 Voice Command Interface | Antarmuka suara kompatibel TalkBack/VoiceOver, haptic feedback & TTS |
| 🧠 Smart Intent Engine | Model CNN+BiLSTM+Custom Attention Layer, akurasi 93.93% |
| 📊 Analytics Dashboard | Dashboard Streamlit: confusion matrix, distribusi intent |

**5 Intent yang Didukung:** `TRANSFER` · `CEK_SALDO` · `RIWAYAT` · `TABUNG` · `BANTUAN`

---

## 🛠 Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Frontend | React 19, Vite, Tailwind CSS, Axios |
| Backend | FastAPI, SQLAlchemy, JWT (python-jose), Passlib |
| AI/ML | TensorFlow, Keras, Librosa, Custom Attention Layer |
| Database | SQLite (dev) / PostgreSQL (prod) |
| Dashboard | Streamlit, Pandas, Matplotlib, Seaborn |
| Deployment | Vercel (FE), Railway (BE), Streamlit Cloud (DS) |

---

## 📁 Struktur Folder

```
voice-bank/
├── frontend/              → React/Vite app
│   └── src/
│       ├── pages/         → LoginPage, DashboardPage, TransferPage, HistoryPage
│       ├── components/    → VoiceRecorder, Sidebar, Header, ProtectedRoute
│       ├── services/      → api.js, userService, transactionService, voiceService, ttsService
│       ├── hooks/         → useAuth, useAudioRecorder
│       └── routes/        → AppRoutes (protected routing)
├── backend/               → FastAPI REST API
│   └── app/
│       ├── routers/       → auth, transactions, voice_input, user
│       ├── models/        → User, Transaction, VoiceLog, ModelMetrics
│       ├── schemas/       → Pydantic request/response schemas
│       └── core/          → config, database, security (JWT)
├── ml-model/              → TensorFlow model & inference
│   ├── inference/         → model_loader, preprocessor, predict
│   ├── evaluate_model.py  → Script evaluasi lengkap
│   └── *.keras           → Trained model file
├── data-science/          → EDA, pipeline, dashboard
│   ├── audio_pipeline/    → mfcc_pipeline.py, gtts_augmentation.py
│   ├── notebook/          → Jupyter notebooks (scraping, analysis)
│   └── dashboard/         → Streamlit app
└── docs/                  → Screenshots & guidelines
```

---

## 🚀 Cara Menjalankan Lokal

### Prerequisites

- Node.js ≥ 18
- Python ≥ 3.11
- pip / venv

### 1. Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Linux/Mac

pip install -r requirements.txt

# Jalankan server (auto-create database)
uvicorn app.main:app --reload --port 8000
```

Backend berjalan di `http://localhost:8000`. Swagger docs di `http://localhost:8000/docs`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend berjalan di `http://localhost:5173`.

### 3. ML Model (opsional, untuk testing inference)

```bash
cd ml-model
pip install -r requirements.txt

# Test inference dengan audio file
python -c "from inference import IntentPredictor; p = IntentPredictor(); print(p.predict('path/ke/audio.wav'))"
```

---

## 🔐 Environment Variables

Buat file `backend/.env`:

```env
DATABASE_URL=sqlite:///./voicebank.db
JWT_SECRET=your-secret-key-here
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=1440
FRONTEND_URL=http://localhost:5173
```

---

## 📡 API Endpoints

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/api/auth/register` | Registrasi user baru |
| POST | `/api/auth/login` | Login, return JWT token |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/user/profile` | Profil user |
| GET | `/api/balance` | Saldo user |
| GET | `/api/transactions` | Riwayat transaksi |
| POST | `/api/transactions` | Buat transaksi (transfer/tabung) |
| POST | `/api/voice-input` | Kirim audio → prediksi intent |
| GET | `/api/health` | Health check |

Dokumentasi lengkap: jalankan backend lalu buka `http://localhost:8000/docs`

---

## 🌿 Branch Rules

```
main      ← production-ready only
develop   ← integrasi mingguan
feat/*    ← satu fitur = satu branch
```

## 📝 Commit Convention

```
feat: fitur baru
fix: perbaikan bug
docs: update dokumentasi
model: push model
data: perbaikan data
```

---

## 👥 Tim

| Nama | Role |
|------|------|
| Muhammad Rafif Pasya | AI Engineer |
| Muhammad Hanif Rajendra | Full-Stack Web Developer |
| Gladys Paramadani Hersaputri | Full-Stack Web Developer |
| Fathan Nabil Rahman | Data Scientist |
| Muhammad Inzaghi Rizqullah | Data Scientist |

---

## 📊 Link

- **Trello**: https://trello.com/b/Dfh845Ky/voice-bank-project
- **Deployment**: *(coming soon)*
- **Dataset**: Mozilla Common Voice (ID) + Synthetic (gTTS)
