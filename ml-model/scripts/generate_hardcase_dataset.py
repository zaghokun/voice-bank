import os
import time
import random
import asyncio
import numpy as np
import librosa
import edge_tts
from sklearn.model_selection import train_test_split

DATA_DIR = "../data"
AUDIO_DIR = os.path.join(DATA_DIR, "hardcase_audio")
SAMPLES_PER_INTENT = 200

VOICES = ["id-ID-GadisNeural", "id-ID-ArdiNeural"]

TARGET_SR = 16000
TOP_DB = 30
N_MFCC = 40
N_FFT = 512
HOP_LENGTH = 256
MAX_PAD_LEN = 128

LABEL_CLASSES = ["BANTUAN", "CEK_SALDO", "RIWAYAT", "TABUNG", "TRANSFER"]
LABEL_TO_IDX = {label: i for i, label in enumerate(LABEL_CLASSES)}

amounts = [
    "lima puluh ribu",
    "seratus ribu",
    "dua ratus ribu",
    "lima ratus ribu",
    "500 ribu",
    "satu juta",
]

templates = {
    "RIWAYAT": [
        "riwayat pembayaran saya",
        "lihat riwayat pembayaran saya",
        "cek riwayat pembayaran saya",
        "tampilkan riwayat pembayaran saya",
        "daftar pembayaran saya",
        "pembayaran terakhir saya apa",
        "lihat daftar pembayaran saya",
        "cek daftar pembayaran saya",
        "tampilkan pembayaran terakhir saya",
        "lihat aktivitas pembayaran saya",
    ],
    "TABUNG": [
        "masukkan {amount} ke tabungan",
        "masukkan uang {amount} ke tabungan",
        "pindahkan {amount} ke tabungan",
        "setor {amount} ke tabungan",
        "simpan {amount} ke tabungan",
        "tambahkan {amount} ke tabungan saya",
        "masukin {amount} ke tabungan saya",
        "saya mau simpan {amount} ke tabungan",
        "alokasikan {amount} ke tabungan",
        "tabungkan {amount} dari rekening saya",
    ],
    "BANTUAN": [
        "bantu saya arahkan ke menu bantuan",
        "arahkan saya ke menu bantuan",
        "buka menu bantuan",
        "tolong arahkan saya ke bantuan",
        "bantu saya masuk ke pusat bantuan",
        "saya perlu diarahkan ke customer service",
        "hubungkan saya ke pusat bantuan",
        "tolong buka pusat bantuan",
        "saya butuh arahan penggunaan aplikasi",
        "bantu saya mencari menu bantuan",
    ],
}


async def create_tts_audio_async(text, path, voice):
    communicate = edge_tts.Communicate(text, voice)
    await communicate.save(path)


def create_tts_audio(text, path):
    voice = random.choice(VOICES)
    asyncio.run(create_tts_audio_async(text, path, voice))


def extract_features(path):
    y, _ = librosa.load(path, sr=TARGET_SR, mono=True)
    y, _ = librosa.effects.trim(y, top_db=TOP_DB)

    mfcc = librosa.feature.mfcc(
        y=y, sr=TARGET_SR, n_mfcc=N_MFCC, n_fft=N_FFT, hop_length=HOP_LENGTH
    )
    delta = librosa.feature.delta(mfcc)
    contrast = librosa.feature.spectral_contrast(
        y=y, sr=TARGET_SR, n_fft=N_FFT, hop_length=HOP_LENGTH
    )

    features = np.vstack([mfcc, delta, contrast]).T

    if features.shape[0] < MAX_PAD_LEN:
        pad = np.zeros((MAX_PAD_LEN - features.shape[0], features.shape[1]))
        features = np.vstack([features, pad])
    else:
        features = features[:MAX_PAD_LEN]

    return features.astype(np.float32)


X, y = [], []

print("🚀 Generate hard-case dataset...")

for intent, intent_templates in templates.items():
    intent_dir = os.path.join(AUDIO_DIR, intent)
    os.makedirs(intent_dir, exist_ok=True)

    label_idx = LABEL_TO_IDX[intent]

    print(f"\n🎯 Intent hard-case: {intent}")

    for i in range(SAMPLES_PER_INTENT):
        template = random.choice(intent_templates)
        text = template.format(amount=random.choice(amounts))

        audio_path = os.path.join(intent_dir, f"{intent.lower()}_hardcase_{i:04d}.mp3")

        if not os.path.exists(audio_path):
            create_tts_audio(text, audio_path)
            time.sleep(0.15)

        features = extract_features(audio_path)
        X.append(features)
        y.append(label_idx)

        if (i + 1) % 50 == 0:
            print(f"  ✅ {i + 1}/{SAMPLES_PER_INTENT}")

X = np.array(X, dtype=np.float32)
y = np.array(y, dtype=np.int64)

print("\nDistribusi hard-case:")
for idx, count in zip(*np.unique(y, return_counts=True)):
    print(idx, LABEL_CLASSES[int(idx)], count)

X_train, X_temp, y_train, y_temp = train_test_split(
    X, y, test_size=0.2, stratify=y, random_state=42
)

X_dev, X_test, y_dev, y_test = train_test_split(
    X_temp, y_temp, test_size=0.5, stratify=y_temp, random_state=42
)

np.savez_compressed(os.path.join(DATA_DIR, "train_mfcc_hardcase.npz"), features=X_train, labels=y_train)
np.savez_compressed(os.path.join(DATA_DIR, "dev_mfcc_hardcase.npz"), features=X_dev, labels=y_dev)
np.savez_compressed(os.path.join(DATA_DIR, "test_mfcc_hardcase.npz"), features=X_test, labels=y_test)

print("\n✅ Hard-case NPZ selesai dibuat.")