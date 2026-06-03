# WebAuthn API Documentation

Backend untuk biometric authentication sudah selesai diimplementasi. Dokumentasi ini untuk frontend developer.

---

## Endpoint yang Tersedia

### 1. POST `/api/auth/webauthn/register`

**Deskripsi:** Simpan credential ID dari browser ke database user.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "credential_id": "string"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Credential berhasil didaftarkan"
}
```

**Cara pakai:**
```js
// Setelah dapat credential dari navigator.credentials.create()
const response = await fetch('http://localhost:8000/api/auth/webauthn/register', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    credential_id: credential.id // dari WebAuthn API
  })
});
```

---

### 2. POST `/api/auth/webauthn/verify`

**Deskripsi:** Verifikasi apakah credential ID dari browser cocok dengan yang tersimpan di database.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "credential_id": "string"
}
```

**Response (200 OK):**
```json
{
  "verified": true,
  "message": "Credential terverifikasi"
}
```

atau jika gagal:

```json
{
  "verified": false,
  "message": "Credential tidak cocok"
}
```

**Cara pakai:**
```js
// Setelah dapat credential dari navigator.credentials.get()
const response = await fetch('http://localhost:8000/api/auth/webauthn/verify', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    credential_id: credential.id
  })
});

const result = await response.json();
if (result.verified) {
  // Lanjut transfer
} else {
  // Tampilkan fallback PIN
}
```

---

## Database Schema

Kolom baru sudah ditambahkan ke tabel `users`:

```sql
webauthn_credential_id VARCHAR NULL
```

Kolom ini menyimpan credential ID yang didapat dari `navigator.credentials.create()`.

---

## Testing

### 1. Recreate Database (PENTING!)

Karena ada kolom baru `webauthn_credential_id`, database perlu dibuat ulang:

```bash
cd backend
python recreate_db.py
```

Script ini akan:
- Hapus `voicebank.db` lama
- Buat database baru dengan schema terbaru (termasuk kolom WebAuthn)

### 2. Install Dependencies (jika belum):

```bash
pip install -r requirements.txt
```

### 3. Jalankan Backend:

```bash
uvicorn app.main:app --reload --port 8000
```

### 4. Jalankan Frontend:

```bash
cd ../frontend
npm run dev
```

### 5. Test Flow Lengkap:

1. **Register user baru** di `http://localhost:5173`
2. **Login**
3. **Setup biometric** di halaman Profile (klik "Setup Biometric")
4. Browser akan minta fingerprint/face ID → scan
5. Credential tersimpan di backend
6. **Test transfer** → di step 3 (konfirmasi), browser akan minta biometric lagi
7. Jika berhasil → transfer diproses
8. Jika gagal → fallback ke PIN

### 6. Test via Swagger UI (Optional):

- Buka `http://localhost:8000/docs`
- Login dulu via `/api/auth/login` untuk dapat token
- Klik "Authorize" di kanan atas, masukkan token dengan format: `Bearer <token>`
- Test endpoint `/api/auth/webauthn/register` dan `/api/auth/webauthn/verify`

---

## Catatan untuk Frontend

1. **Kedua endpoint butuh authentication** (JWT token di header)
2. **Endpoint hanya menyimpan credential_id** (string) — bukan public key atau signature. Ini cukup untuk demo lokal.
3. **Verifikasi simpel**: cek apakah credential_id yang dikirim sama dengan yang tersimpan di DB.
4. **Satu user = satu credential**: Jika user register ulang, credential lama akan di-overwrite.

---

## Flow Lengkap (Frontend Reference)

```
User klik "Konfirmasi dengan Biometrik"
↓
Cek: apakah credential sudah terdaftar? (optional, bisa langsung ke step berikut)
↓
Jika belum:
  → navigator.credentials.create() → dapat credential
  → POST /api/auth/webauthn/register dengan credential.id
↓
Jalankan: navigator.credentials.get() → dapat assertion
↓
POST /api/auth/webauthn/verify dengan assertion.id
↓
Jika verified === true:
  → lanjut createTransfer()
Jika verified === false:
  → tampilkan fallback PIN
```

---

## File yang Diubah/Dibuat (Backend)

- `app/models/user.py` — tambah kolom `webauthn_credential_id`
- `app/schemas/webauthn.py` — schema request/response (baru)
- `app/routers/auth.py` — tambah 2 endpoint WebAuthn
- `requirements.txt` — tambah `py_webauthn==2.2.0` (untuk future enhancement)

---

## Referensi

- [MDN Web Authentication API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Authentication_API)
- `.kiro/steering/biometric-plan.md` — Planning lengkap
