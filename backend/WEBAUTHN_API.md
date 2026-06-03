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

1. Install dependencies (jika belum):
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. Jalankan server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

3. Hapus database lama (jika ada) agar kolom baru terbentuk:
   ```bash
   del voicebank.db  # Windows
   # atau
   rm voicebank.db   # Linux/Mac
   ```
   Database akan otomatis dibuat ulang saat server start.

4. Test endpoint via Swagger UI:
   - Buka `http://localhost:8000/docs`
   - Login dulu via `/api/auth/login` untuk dapat token
   - Klik "Authorize" di kanan atas, masukkan token
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
