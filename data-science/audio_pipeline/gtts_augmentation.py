"""
VoiceBank - gTTS Augmentation Script
CC26-PSU325 | Coding Camp 2026 powered by DBS Foundation

TUJUAN:
  Generate data sintetis perintah banking Bahasa Indonesia per intent,
  konversi ke audio, ekstrak MFCC, append ke NPZ existing.

"""

from itertools import count
import os
import time
import random
import logging
import numpy as np
from pathlib import Path
from gtts import gTTS
from pydub import AudioSegment
import librosa
import io

logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(message)s")
log = logging.getLogger("gTTS-Aug")

#  KONFIGURASI
OUTPUT_DIR   = Path("output_mfcc")       
TEMP_DIR     = Path("temp_gtts")         
TARGET_SR    = 16000
N_MFCC       = 40
N_FFT        = 512
HOP_LENGTH   = 256
MAX_PAD_LEN  = 128

# Target jumlah sampel sintetis per intent
TARGET_PER_INTENT = 500   # generate 500 sampel per intent yang kurang

#  KALIMAT PERINTAH BANKING PER INTENT
#  Variasi natural Bahasa Indonesia
INTENT_SENTENCES = {
    "TRANSFER": [
        "tolong transfer seratus ribu ke rekening Budi",
        "kirim uang dua ratus ribu ke nomor rekening ini",
        "transfer lima puluh ribu ke Ani sekarang",
        "mau transfer uang ke rekening teman saya",
        "kirimkan uang satu juta ke rekening ibu",
        "pak tolong kirim dua ratus lima puluh ribu ke Doni",
        "transfer ke rekening BCA nomor satu dua tiga empat",
        "saya mau transfer uang ke saudara saya",
        "tolong kirimkan uang tiga ratus ribu ke rekening ini",
        "bantu saya transfer uang ke nomor rekening berikut",
        "kirim lima ratus ribu ke rekening Mandiri",
        "transfer uang seratus lima puluh ribu ke ibu saya",
        "mau kirim uang ke rekening BNI",
        "tolong lakukan transfer ke rekening tujuan",
        "kirim uang dua juta ke rekening ayah",
        "transfer dana ke rekening BRI saya",
        "mau mengirim uang ke rekening teman",
        "lakukan transfer sebesar satu juta rupiah",
        "kirimkan sejumlah uang ke rekening berikut",
        "pak minta tolong transfer ke rekening saya",
        "transfer uang ke nomor rekening enam tujuh delapan",
        "saya ingin mengirim uang ke rekening ini",
        "tolong bantu transfer uang saya",
        "kirim uang ke rekening atas nama Siti",
        "mau transfer ke rekening tabungan saya",
        "transfer sejumlah dana ke rekening tujuan",
        "tolong kirim uang tiga juta ke rekening papa",
        "bantu saya mengirimkan uang ke rekening ini",
        "transfer uang empat ratus ribu ke rekan kerja",
        "kirim uang ke rekening bank Mandiri saya",
    ],
    "CEK_SALDO": [
        "berapa saldo rekening saya sekarang",
        "cek saldo tabungan saya",
        "tolong cek saldo saya",
        "mau lihat saldo rekening",
        "saldo saya berapa ya",
        "tampilkan saldo rekening saya",
        "cek balance rekening tabungan",
        "berapa uang saya di rekening",
        "saya mau cek saldo",
        "tolong tampilkan saldo saya sekarang",
        "berapa jumlah uang di rekening saya",
        "lihat saldo rekening BCA saya",
        "cek saldo rekening Mandiri",
        "mau tau saldo tabungan saya",
        "berapa total saldo rekening saya hari ini",
        "tampilkan jumlah saldo saya",
        "periksa saldo rekening saya",
        "saldo tabungan saya berapa sekarang",
        "tolong informasikan saldo rekening saya",
        "bisa cek saldo rekening saya tidak",
        "cek saldo BNI saya sekarang",
        "ingin mengetahui saldo rekening",
        "berapa uang yang ada di tabungan saya",
        "lihatkan saldo rekening saya",
        "cek rekening tabungan saya sekarang",
        "mau cek sisa uang di rekening",
        "tolong lihat saldo rekening saya",
        "berapa saldo yang tersisa di rekening",
        "cek jumlah tabungan saya",
        "ingin tahu sisa saldo rekening saya",
    ],
    "RIWAYAT": [
        "tampilkan riwayat transaksi saya",
        "lihat mutasi rekening bulan ini",
        "mau cek riwayat transfer saya",
        "tampilkan histori transaksi terakhir",
        "riwayat transaksi saya bulan lalu",
        "cek mutasi rekening saya",
        "tolong tampilkan riwayat pembayaran",
        "mau lihat histori transaksi minggu ini",
        "tampilkan daftar transaksi terakhir saya",
        "lihat riwayat transfer masuk dan keluar",
        "cek histori transaksi rekening saya",
        "tampilkan mutasi tabungan bulan ini",
        "mau lihat riwayat transaksi kemarin",
        "tolong cek riwayat transaksi saya",
        "tampilkan semua transaksi hari ini",
        "lihat riwayat pembayaran saya",
        "cek aktivitas rekening saya",
        "mau tau histori transaksi rekening",
        "tampilkan log transaksi saya",
        "lihat mutasi tabungan saya",
        "riwayat transaksi tiga bulan terakhir",
        "tampilkan detail transaksi terakhir",
        "cek riwayat rekening saya bulan ini",
        "mau lihat semua transaksi saya",
        "histori transfer masuk rekening saya",
        "tolong tampilkan mutasi rekening",
        "lihat rekaman transaksi saya",
        "cek catatan transaksi bulan lalu",
        "tampilkan riwayat penarikan tunai",
        "mau cek semua aktivitas rekening saya",
    ],
    "TABUNG": [
        "saya mau menabung seratus ribu",
        "tolong simpan uang saya dua ratus ribu",
        "nabung lima ratus ribu ke rekening tabungan",
        "mau setor tunai ke rekening tabungan",
        "simpan uang satu juta di tabungan saya",
        "tolong tambahkan ke tabungan saya",
        "saya ingin menabung uang saya",
        "setor uang ke rekening tabungan",
        "mau nabung tiga ratus ribu sekarang",
        "simpan uang dua juta ke tabungan",
        "tolong masukkan uang ke tabungan saya",
        "saya mau setor ke tabungan saya",
        "tambahkan uang ke rekening tabungan saya",
        "nabung lima puluh ribu sekarang",
        "mau menyimpan uang di rekening tabungan",
        "setor tunai dua ratus lima puluh ribu",
        "tolong simpankan uang saya ke tabungan",
        "ingin menambah saldo tabungan saya",
        "mau setor uang ke rekening saya",
        "simpan uang satu juta lima ratus ribu",
        "nabung dua ratus ribu ke tabungan BCA",
        "tolong tambah saldo tabungan saya",
        "saya mau investasikan uang ke tabungan",
        "setor uang empat ratus ribu ke tabungan",
        "mau simpan uang enam ratus ribu",
        "tolong masukkan ke saldo tabungan",
        "nabung tujuh ratus ribu sekarang",
        "simpan dana ke rekening tabungan saya",
        "mau menambah tabungan saya hari ini",
        "setor uang ke rekening bank saya",
    ],
    "BANTUAN": [
        "saya butuh bantuan",
        "tolong bantu saya",
        "ada yang bisa membantu saya",
        "saya tidak mengerti cara menggunakan aplikasi ini",
        "bagaimana cara menggunakan voice bank",
        "minta panduan penggunaan aplikasi",
        "tolong jelaskan cara transfer uang",
        "saya bingung cara cek saldo",
        "bantu saya memahami aplikasi ini",
        "ada masalah dengan akun saya",
        "saya lupa cara melakukan transaksi",
        "tolong beri petunjuk penggunaan",
        "bagaimana cara kerja aplikasi ini",
        "saya perlu bantuan teknis",
        "tolong hubungi customer service",
        "ada error di aplikasi saya",
        "saya tidak bisa masuk ke akun",
        "bagaimana cara reset PIN saya",
        "tolong bantu selesaikan masalah saya",
        "saya butuh panduan lengkap",
        "cara daftar di aplikasi ini bagaimana",
        "tolong ajarkan cara pakai aplikasi",
        "saya kesulitan menggunakan fitur ini",
        "minta tolong bantu saya sekarang",
        "bagaimana cara menghubungi bank",
        "tolong bantu saya dengan akun ini",
        "ada kendala dalam penggunaan aplikasi",
        "saya butuh informasi lebih lanjut",
        "bagaimana prosedur pengaduan",
        "tolong jelaskan fitur yang tersedia",
    ],
}

#  HELPER FUNCTIONS

def extract_features(y: np.ndarray) -> np.ndarray:
    """Sama persis dengan mfcc_pipeline.py."""
    mfcc         = librosa.feature.mfcc(y=y, sr=TARGET_SR, n_mfcc=N_MFCC,
                                         n_fft=N_FFT, hop_length=HOP_LENGTH)
    delta_mfcc   = librosa.feature.delta(mfcc)
    spec_contrast= librosa.feature.spectral_contrast(y=y, sr=TARGET_SR,
                                                      n_fft=N_FFT, hop_length=HOP_LENGTH)
    features = np.vstack([mfcc, delta_mfcc, spec_contrast]).T  # (T, 87)

    if features.shape[0] < MAX_PAD_LEN:
        pad = np.zeros((MAX_PAD_LEN - features.shape[0], features.shape[1]))
        features = np.vstack([features, pad])
    else:
        features = features[:MAX_PAD_LEN, :]

    return features.astype(np.float32)


def gtts_to_numpy(text: str, lang: str = "id") -> np.ndarray | None:
    """Convert teks → gTTS MP3 → numpy array 16kHz."""
    try:
        tts = gTTS(text=text, lang=lang, slow=False)
        mp3_buffer = io.BytesIO()
        tts.write_to_fp(mp3_buffer)
        mp3_buffer.seek(0)

        # pydub: MP3 → WAV in memory
        audio_seg = AudioSegment.from_file(mp3_buffer, format="mp3")
        audio_seg = audio_seg.set_frame_rate(TARGET_SR).set_channels(1)

        wav_buffer = io.BytesIO()
        audio_seg.export(wav_buffer, format="wav")
        wav_buffer.seek(0)

        y, _ = librosa.load(wav_buffer, sr=TARGET_SR, mono=True)
        y, _ = librosa.effects.trim(y, top_db=30)

        return y if len(y) > TARGET_SR * 0.3 else None

    except Exception as e:
        log.warning(f"gTTS error: {e}")
        return None


def generate_intent_data(intent: str, sentences: list, target: int) -> tuple:
    """Generate sampel sintetis untuk satu intent."""
    features_list, labels_list = [], []
    count = 0

    # Cycle sentences sampai target terpenuhi
    sentence_pool = sentences * (target // len(sentences) + 2)
    random.shuffle(sentence_pool)

    for sentence in sentence_pool:
        if count >= target:
            break

        y = gtts_to_numpy(sentence)
        if y is None:
            continue

        # simpan preview audio
        if count < 5:
            import soundfile as sf
            sf.write(TEMP_DIR / f"{intent}_{count}.wav", y, TARGET_SR)

        feat = extract_features(y)
        features_list.append(feat)
        labels_list.append(intent)
        count += 1

        # tampilkan progress tiap 10 sampel
        if count % 10 == 0:
            log.info(f"[{intent}] progress: {count}/{target}")

        # Rate limiting agar tidak kena block gTTS
        time.sleep(0.3)

    log.info(f"  {intent:<15}: {count} sampel berhasil di-generate")
    return features_list, labels_list


def load_existing_npz(split: str) -> tuple:
    """Load NPZ yang sudah ada."""
    path = OUTPUT_DIR / f"{split}_mfcc.npz"
    if not path.exists():
        return np.array([]), np.array([])
    data = np.load(path, allow_pickle=True)
    return data["features"], data["label_names"]


def save_npz(split: str, features: np.ndarray, label_names: np.ndarray,
             label_classes: list):
    """Simpan ulang NPZ dengan data tambahan."""
    label_to_idx = {l: i for i, l in enumerate(label_classes)}
    labels_int   = np.array([label_to_idx.get(l, 0) for l in label_names], dtype=np.int32)

    out_path = OUTPUT_DIR / f"{split}_mfcc.npz"
    np.savez_compressed(out_path, features=features,
                        labels=labels_int, label_names=label_names)
    log.info(f"  Saved: {out_path} | Shape: {features.shape}")

#  MAIN
def run_augmentation():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    TEMP_DIR.mkdir(parents=True, exist_ok=True)

    LABEL_CLASSES = ["BANTUAN", "CEK_SALDO", "RIWAYAT", "TABUNG", "TRANSFER"]

    log.info("=" * 60)
    log.info("gTTS AUGMENTATION — VoiceBank CC26-PSU325")
    log.info("=" * 60)

    # Load existing train data untuk cek distribusi
    existing_feat, existing_labels = load_existing_npz("train")
    if len(existing_labels) > 0:
        unique, counts = np.unique(existing_labels, return_counts=True)
        log.info("\n[Distribusi SEBELUM augmentasi - train split]")
        for u, c in zip(unique, counts):
            log.info(f"  {u:<15}: {c:,}")

    # Generate sintetis untuk semua intent
    log.info(f"\n[Generating {TARGET_PER_INTENT} sampel per intent via gTTS...]")
    log.info("Estimasi waktu: ~10-15 menit (ada delay 0.3s per request)\n")

    all_new_features, all_new_labels = [], []

    for intent, sentences in INTENT_SENTENCES.items():
        feats, labels = generate_intent_data(intent, sentences, TARGET_PER_INTENT)
        all_new_features.extend(feats)
        all_new_labels.extend(labels)

    if not all_new_features:
        log.error("Tidak ada data yang berhasil di-generate. Cek koneksi internet dan ffmpeg!")
        return

    new_feat_arr   = np.array(all_new_features, dtype=np.float32)
    new_labels_arr = np.array(all_new_labels)

    # Append ke train split
    log.info("\n[Menggabungkan dengan data existing (train split)...]")
    if len(existing_feat) > 0:
        combined_feat   = np.concatenate([existing_feat, new_feat_arr], axis=0)
        combined_labels = np.concatenate([existing_labels, new_labels_arr], axis=0)
    else:
        combined_feat   = new_feat_arr
        combined_labels = new_labels_arr

    save_npz("train", combined_feat, combined_labels, LABEL_CLASSES)

    # Distribusi akhir
    unique, counts = np.unique(combined_labels, return_counts=True)
    log.info("\n[Distribusi SESUDAH augmentasi - train split]")
    for u, c in zip(unique, counts):
        log.info(f"  {u:<15}: {c:,}")

    log.info("\n" + "=" * 60)
    log.info("AUGMENTASI SELESAI ✓")
    log.info(f"  Total sampel train baru: {len(combined_feat):,}")
    log.info("  NEXT STEP: Lanjut ke EDA & training model")
    log.info("=" * 60)


if __name__ == "__main__":
    run_augmentation()
