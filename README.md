# **Voice Bank Project**
---
# **JANGAN LUPA UPDATE TRELLO**
1. Jangan push ke main
2. Tiap develop push ke branch masing-masing sesuai aturan branch rules
3. Kalau udah push ke branch masing-masing minta review ke anggota biar dinilai dulu
4. Kalau udah nanti di merge ke develop abis tu ke main setiap minggu sesuai milestone
---
## 📌 Deskripsi

Indonesia memiliki lebih dari **3,7 juta penyandang tunanetra** yang kesulitan
mengakses layanan perbankan digital. Hampir semua aplikasi bank dirancang
untuk pengguna yang bisa melihat layar — meninggalkan tunanetra dalam
ketergantungan pada orang lain untuk transaksi sehari-hari.

**VoiceBank** hadir sebagai solusi *voice-first banking* pertama di Indonesia
yang memungkinkan tunanetra melakukan transaksi keuangan secara **mandiri,
hanya dengan perintah suara dalam Bahasa Indonesia**.

Cukup ucapkan:
> *"Pak, kirim uang 50 ribu ke Budi"*

Sistem akan memahami perintah, mengonfirmasi, memproses transaksi, dan
memberikan umpan balik audio yang jelas — tanpa satu pun sentuhan layar.

---

## 🎯 Fitur Utama

| Modul | Deskripsi |
|---|---|
| 🎤 **Voice Command Interface** | Antarmuka perekaman suara kompatibel TalkBack/VoiceOver, dengan haptic feedback & konfirmasi TTS |
| 🧠 **Smart Intent Engine** | Model TensorFlow CNN+BiLSTM+Custom Attention Layer untuk klasifikasi 5 intent keuangan dari audio |
| 📊 **Analytics Dashboard** | Dashboard Streamlit interaktif: akurasi per dialek, confusion matrix, distribusi kualitas audio |

**5 Intent yang Didukung:**
`TRANSFER` · `CEK_SALDO` · `RIWAYAT` · `TABUNG` · `BANTUAN`

---


## **Project Structure**
```
📁 project-name/
├── 📁 frontend/          # React/Vite app
├── 📁 backend/           # Express.js REST API
├── 📁 ml-model/          # TensorFlow model & training
│   ├── notebooks/        # EDA, training notebooks
│   ├── models/           # Saved .keras / SavedModel
│   └── inference/        # Inference code
├── 📁 data-science/      # Streamlit dashboard
│   ├── data/
│   └── dashboard/
├── 📁 docs/              # Screenshots, guideline docs
├── .gitignore
├── README.md
└── docker-compose.yml    # (opsional)
```

---

## **Branch Rules** 
```
main          ← production-ready only
develop       ← integrasi mingguan
├── feat/frontend-auth
├── feat/backend-api-user
├── feat/ml-model-training
└── feat/ds-eda-cleaning
```

Aturan branch:
- main — hanya merge dari develop saat milestone tercapai
- develop — merge setiap akhir minggu (sprint review)
- feat/[nama-fitur] — satu fitur = satu branch, dibuat dari develop
---
## **Commit Convension**
```
feat: digunakan kalau add fitur baru
fix: kalo benerin error atau bug
docs: update documentation
model: buat push model
data: kalau misalkan udah benerin datanya
```
---
## 🚀 Cara Menjalankan Lokal
## 🔗 Link Deployment
## 📊 Link Dataset


