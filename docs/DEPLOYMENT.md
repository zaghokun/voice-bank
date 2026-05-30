# Dokumentasi Deployment — VoiceBank

## 1. Frontend → Vercel

### Setup

1. Push repo ke GitHub
2. Buka [vercel.com](https://vercel.com) → Import project
3. Pilih folder `frontend/` sebagai root directory
4. Framework preset: **Vite**
5. Build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`

### Environment Variables (Vercel Dashboard)

```
VITE_API_URL=https://your-backend.railway.app/api
```

### Update `frontend/src/services/api.js`

Ganti baseURL agar baca dari env:

```js
baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
```

### Deploy

Setiap push ke branch `main` akan auto-deploy.

---

## 2. Backend → Railway

### Setup

1. Buka [railway.app](https://railway.app) → New Project → Deploy from GitHub
2. Pilih repo, set root directory: `backend/`
3. Railway akan auto-detect Python

### Konfigurasi

**Start Command:**
```
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

**Environment Variables (Railway Dashboard):**

```
DATABASE_URL=postgresql://user:pass@host:5432/voicebank
JWT_SECRET=your-production-secret-key
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=1440
FRONTEND_URL=https://your-frontend.vercel.app
```

### Database

- Tambah PostgreSQL plugin di Railway
- Copy connection string ke `DATABASE_URL`
- Hapus `connect_args={"check_same_thread": False}` di `database.py` (khusus SQLite)

### Catatan

- Pastikan `requirements.txt` ada di `backend/`
- Tambah `psycopg2-binary` ke requirements untuk PostgreSQL
- Update CORS origin di backend ke URL Vercel production

---

## 3. Dashboard → Streamlit Cloud

### Setup

1. Buat file `data-science/dashboard/app.py`
2. Buat `data-science/dashboard/requirements.txt`:
   ```
   streamlit
   pandas
   matplotlib
   seaborn
   scikit-learn
   numpy
   ```
3. Buka [share.streamlit.io](https://share.streamlit.io) → Deploy an app
4. Pilih repo, branch `main`, path: `data-science/dashboard/app.py`

### Deploy

Setiap push ke `main` akan auto-redeploy.

---

## 4. Checklist Production

- [ ] Ganti `JWT_SECRET` ke random string yang kuat (≥32 karakter)
- [ ] Update CORS origin ke URL Vercel production
- [ ] Ganti SQLite ke PostgreSQL
- [ ] Hapus `check_same_thread` dari database config
- [ ] Tambah `psycopg2-binary` ke requirements
- [ ] Test semua endpoint di production
- [ ] Pastikan model `.keras` ter-include di deployment backend (atau upload terpisah)
- [ ] Set `VITE_API_URL` di Vercel ke URL Railway

---

## 5. Arsitektur Production

```
[User Browser]
      ↓
[Vercel - React Frontend]
      ↓ HTTPS
[Railway - FastAPI Backend + Model]
      ↓
[PostgreSQL - Railway Plugin]

[Streamlit Cloud - Dashboard DS]
```
