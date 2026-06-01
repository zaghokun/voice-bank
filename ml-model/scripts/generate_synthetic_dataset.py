import os
import time
import random
import asyncio
import numpy as np
import librosa
import edge_tts
from sklearn.model_selection import train_test_split

# =========================
# CONFIG
# =========================

DATA_DIR = "data"
AUDIO_DIR = os.path.join(DATA_DIR, "synthetic_audio")
SAMPLES_PER_INTENT = 1000

VOICES = [
    "id-ID-GadisNeural",
    "id-ID-ArdiNeural",
]

TARGET_SR = 16000
MAX_DURATION = 10.0
MIN_DURATION = 0.5
TOP_DB = 30
N_MFCC = 40
N_FFT = 512
HOP_LENGTH = 256
MAX_PAD_LEN = 128

LABEL_CLASSES = ["BANTUAN", "CEK_SALDO", "RIWAYAT", "TABUNG", "TRANSFER"]
LABEL_TO_IDX = {label: i for i, label in enumerate(LABEL_CLASSES)}

names = [
    "Budi", "Siti", "Andi", "Rina", "Dewi", "Agus", "Rafi", "Nabil",
    "Putri", "Hana", "Ayu", "Dimas", "Rizky", "Fajar", "Tono"
]

amounts = [
    "sepuluh ribu", "dua puluh ribu", "lima puluh ribu",
    "seratus ribu", "dua ratus ribu", "lima ratus ribu",
    "satu juta", "dua juta"
]

banks = [
    "rekening saya", "rekening utama", "BCA", "BRI", "Mandiri",
    "rekening bank saya", "akun bank saya"
]

prefixes = [
    "", "tolong", "coba", "mohon", "bisa", "aku mau", "saya mau",
    "tolong dong", "coba bantu"
]

templates = {
    "TRANSFER": [
        "{prefix} transfer {amount} ke {name}",
        "{prefix} kirim uang {amount} ke {name}",
        "{prefix} kirim {amount} ke {name}",
        "{prefix} transferin {amount} ke {name}",
        "{prefix} bayar {amount} ke {name}",
        "{prefix} pindahkan {amount} ke rekening {name}",
        "{prefix} kirim dana {amount} ke {name}",
        "{prefix} lakukan transfer {amount} ke {name}",
        "{prefix} saya ingin transfer {amount} ke {name}",
        "{prefix} saya ingin kirim uang {amount} ke {name}",
        "transfer ke {name} sebesar {amount}",
        "kirim uang ke {name} sebesar {amount}",
        "bayarkan {amount} untuk {name}",
        "saya perlu transfer {amount} ke {name}",
        "bantu transfer {amount} ke {name}",
    ],

    "CEK_SALDO": [
        "{prefix} cek saldo saya",
        "{prefix} lihat saldo saya",
        "{prefix} tampilkan saldo saya",
        "{prefix} cek saldo rekening saya",
        "{prefix} lihat saldo rekening saya",
        "{prefix} tampilkan saldo rekening saya",
        "berapa saldo saya",
        "saldo saya berapa",
        "berapa saldo rekening saya",
        "saldo rekening saya berapa",
        "sisa saldo saya berapa",
        "berapa uang saya sekarang",
        "cek jumlah uang saya",
        "cek uang di rekening saya",
        "informasi saldo saya",
        "saldo {bank} berapa",
        "lihat saldo {bank}",
        "cek saldo {bank}",
        "tolong kasih tahu saldo saya",
        "saya ingin tahu saldo saya",
    ],

    "RIWAYAT": [
        "{prefix} lihat riwayat transaksi",
        "{prefix} cek riwayat transaksi",
        "{prefix} tampilkan riwayat transaksi",
        "{prefix} lihat riwayat transaksi saya",
        "{prefix} cek riwayat transaksi saya",
        "{prefix} tampilkan riwayat transaksi saya",
        "lihat transaksi terakhir",
        "cek transaksi terakhir",
        "tampilkan transaksi terakhir",
        "transaksi terakhir saya apa",
        "apa transaksi terakhir saya",
        "lihat mutasi rekening",
        "cek mutasi rekening",
        "tampilkan mutasi rekening",
        "mutasi rekening saya",
        "lihat mutasi rekening saya",
        "cek aktivitas transaksi saya",
        "lihat daftar transaksi saya",
        "riwayat pembayaran saya",
        "tampilkan daftar transaksi saya",
    ],

    "TABUNG": [
        "{prefix} tabung {amount}",
        "{prefix} menabung {amount}",
        "{prefix} saya mau menabung {amount}",
        "{prefix} saya ingin menabung {amount}",
        "{prefix} simpan {amount}",
        "{prefix} simpan uang {amount}",
        "{prefix} masukkan {amount} ke tabungan",
        "{prefix} pindahkan {amount} ke tabungan",
        "{prefix} setor {amount} ke tabungan saya",
        "{prefix} tambahkan {amount} ke tabungan saya",
        "saya mau nabung {amount}",
        "masukin {amount} ke tabungan",
        "alokasikan {amount} ke tabungan",
        "simpan {amount} untuk tabungan",
        "buat tabungan sebesar {amount}",
    ],

    "BANTUAN": [
        "{prefix} buka menu bantuan",
        "{prefix} hubungi layanan bantuan",
        "{prefix} buka pusat bantuan",
        "{prefix} hubungkan saya ke bantuan",
        "saya butuh bantuan",
        "saya perlu bantuan",
        "tolong bantu saya",
        "bantu saya menggunakan aplikasi",
        "saya bingung menggunakan aplikasi ini",
        "saya tidak mengerti",
        "saya kesulitan menggunakan aplikasi",
        "aplikasi ini membingungkan",
        "tolong pandu saya",
        "hubungkan saya ke customer service",
        "saya mau menghubungi customer service",
        "saya butuh panduan",
        "tolong jelaskan cara menggunakan aplikasi",
    ],
}


def clean_text(text):
    return " ".join(text.split()).strip()


def generate_sentence(intent):
    template = random.choice(templates[intent])
    sentence = template.format(
        prefix=random.choice(prefixes),
        amount=random.choice(amounts),
        name=random.choice(names),
        bank=random.choice(banks),
    )
    return clean_text(sentence)


async def create_tts_audio_async(text, path, voice):
    communicate = edge_tts.Communicate(text, voice)
    await communicate.save(path)


def create_tts_audio(text, path):
    voice = random.choice(VOICES)
    asyncio.run(create_tts_audio_async(text, path, voice))


def load_audio(file_path):
    y, _ = librosa.load(file_path, sr=TARGET_SR, mono=True)
    y, _ = librosa.effects.trim(y, top_db=TOP_DB)

    duration = len(y) / TARGET_SR

    if duration < MIN_DURATION:
        raise ValueError(f"Audio terlalu pendek: {duration:.2f}s")

    if duration > MAX_DURATION:
        y = y[:int(MAX_DURATION * TARGET_SR)]

    return y


def extract_features(y):
    mfcc = librosa.feature.mfcc(
        y=y,
        sr=TARGET_SR,
        n_mfcc=N_MFCC,
        n_fft=N_FFT,
        hop_length=HOP_LENGTH,
    )

    delta_mfcc = librosa.feature.delta(mfcc)

    spec_contrast = librosa.feature.spectral_contrast(
        y=y,
        sr=TARGET_SR,
        n_fft=N_FFT,
        hop_length=HOP_LENGTH,
    )

    features = np.vstack([mfcc, delta_mfcc, spec_contrast]).T

    if features.shape[0] < MAX_PAD_LEN:
        pad = np.zeros((MAX_PAD_LEN - features.shape[0], features.shape[1]))
        features = np.vstack([features, pad])
    else:
        features = features[:MAX_PAD_LEN, :]

    return features.astype(np.float32)


def main():
    os.makedirs(AUDIO_DIR, exist_ok=True)

    X = []
    y = []

    used_sentences = {intent: set() for intent in LABEL_CLASSES}

    print("🚀 Mulai generate synthetic dataset dengan edge-tts...")

    for intent in LABEL_CLASSES:
        label_idx = LABEL_TO_IDX[intent]
        intent_dir = os.path.join(AUDIO_DIR, intent)
        os.makedirs(intent_dir, exist_ok=True)

        print(f"\n🎙️ Generate intent: {intent}")

        i = 0
        retry = 0

        while i < SAMPLES_PER_INTENT:
            text = generate_sentence(intent)

            # Hindari kalimat duplikat terlalu banyak
            if text in used_sentences[intent] and retry < 200:
                retry += 1
                continue

            used_sentences[intent].add(text)
            retry = 0

            audio_path = os.path.join(intent_dir, f"{intent.lower()}_{i:04d}.mp3")

            try:
                if not os.path.exists(audio_path) or os.path.getsize(audio_path) == 0:
                    create_tts_audio(text, audio_path)
                    time.sleep(0.15)

                audio = load_audio(audio_path)
                features = extract_features(audio)

                X.append(features)
                y.append(label_idx)

                i += 1

                if i % 100 == 0:
                    print(f"  ✅ {i}/{SAMPLES_PER_INTENT} selesai")

            except Exception as e:
                print(f"  ⚠️ Skip {intent} #{i}: {e}")
                i += 1

    X = np.array(X, dtype=np.float32)
    y = np.array(y, dtype=np.int64)

    print("\n📊 Distribusi synthetic dataset:")
    for label_idx, count in zip(*np.unique(y, return_counts=True)):
        print(label_idx, LABEL_CLASSES[int(label_idx)], count)

    X_train, X_temp, y_train, y_temp = train_test_split(
        X,
        y,
        test_size=0.2,
        stratify=y,
        random_state=42,
    )

    X_dev, X_test, y_dev, y_test = train_test_split(
        X_temp,
        y_temp,
        test_size=0.5,
        stratify=y_temp,
        random_state=42,
    )

    np.savez_compressed(
        os.path.join(DATA_DIR, "train_mfcc_synthetic.npz"),
        features=X_train,
        labels=y_train,
    )

    np.savez_compressed(
        os.path.join(DATA_DIR, "dev_mfcc_synthetic.npz"),
        features=X_dev,
        labels=y_dev,
    )

    np.savez_compressed(
        os.path.join(DATA_DIR, "test_mfcc_synthetic.npz"),
        features=X_test,
        labels=y_test,
    )

    np.savez_compressed(
        os.path.join(DATA_DIR, "metadata_synthetic.npz"),
        label_classes=np.array(LABEL_CLASSES),
        label_to_idx=np.array([
            ["BANTUAN", "0"],
            ["CEK_SALDO", "1"],
            ["RIWAYAT", "2"],
            ["TABUNG", "3"],
            ["TRANSFER", "4"],
        ]),
    )

    print("\n✅ Synthetic dataset selesai dibuat!")
    print("- train_mfcc_synthetic.npz")
    print("- dev_mfcc_synthetic.npz")
    print("- test_mfcc_synthetic.npz")
    print("- metadata_synthetic.npz")


if __name__ == "__main__":
    main()