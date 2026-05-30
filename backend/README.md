# VoiceBank Backend API

Backend untuk aplikasi VoiceBank - Voice-First Banking App untuk Tunanetra Indonesia.

## Teknologi

- Python 3.11+
- FastAPI
- SQLAlchemy + Alembic
- TensorFlow (Model Speech-to-Intent)
- JWT (JSON Web Token) untuk Autentikasi

## Menjalankan Server (Development)

1. Masuk ke folder backend:
   cd voice-bank/backend

2. Buat virtual environment:
   python -m venv venv

3. Aktifkan virtual environment:

- Windows:
  venv\Scripts\activate.bat
- macOS/Linux:
  source venv/bin/activate

4. Install dependensi:
   pip install -r requirements.txt

5. Jalankan migrasi database (jika belum):
   alembic upgrade head

6. Jalankan server:
   uvicorn app.main:app --reload

7. Buka dokumentasi API di browser:

- Swagger UI: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- Health Check: [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)

## Autentikasi

- Register: POST /api/auth/register
- Login: POST /api/auth/login

Gunakan token JWT dari respons login/register untuk mengakses endpoint terproteksi. Di Swagger UI, klik tombol Authorize dan masukkan token di bagian HTTPBearer atau opsi OAuth2 yang tersedia.

## Endpoint Utama

- POST /api/auth/register : Registrasi user baru
- POST /api/auth/login : Login user
- GET /api/auth/me : Data user yang sedang login
- GET /api/user/profile : Profil user
- GET /api/balance : Cek saldo
- POST /api/transactions : Buat transaksi (transfer/tabung)
- GET /api/transactions : Riwayat transaksi
- POST /api/voice-input : Kirim audio, dapatkan intent (AI)

## Integrasi Model AI

Endpoint POST /api/voice-input menerima file audio (WAV/MP3/WebM/OGG), lalu:

- Audio di-preprocess menjadi MFCC features.
- Model TensorFlow (model_intent_classification_prod.keras) memprediksi intent.
- Hasil: intent + confidence score.

Model dilatih untuk 5 intent: TRANSFER, CEK_SALDO, RIWAYAT, TABUNG, BANTUAN.

## Catatan Pengembangan

- JWT_SECRET masih hardcode ("secret-key-development-only"). Untuk production, pindahkan ke environment variable.
- Database menggunakan SQLite untuk kemudahan development. Migrasi ke PostgreSQL disarankan untuk production.
- Model AI di-load saat startup. Pastikan folder ml-model/ berada di root repository.
