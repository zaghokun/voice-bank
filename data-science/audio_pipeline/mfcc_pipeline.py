"""
VoiceBank - Data Scientist Pipeline
CC26-PSU325 | Coding Camp 2026 powered by DBS Foundation

TAHAPAN:
  1. ASSESSING  - Cek kualitas audio, distribusi, imbalance
  2. CLEANING   - Normalisasi 16kHz, trim silence, augmentasi
  3. FEATURE ENG- Ekstrak MFCC (40 coeff) + Delta + Spectral Contrast

"""

import os
import warnings
import logging
import numpy as np
import pandas as pd
import librosa
import soundfile as sf
from pathlib import Path
from tqdm import tqdm
from concurrent.futures import ThreadPoolExecutor, as_completed

warnings.filterwarnings("ignore")
logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(message)s")
log = logging.getLogger("VoiceBankDS")

#  KONFIGURASI — sesuaikan path di sini
BASE_DIR   = Path(r"C:\Users\ASUS\Documents\Dataset Audio\cv-corpus\id")
CLIPS_DIR  = BASE_DIR / "clips"
OUTPUT_DIR = Path("output_mfcc")        # relatif dari lokasi script ini
TSV_FILES  = ["train.tsv", "validated.tsv", "dev.tsv", "test.tsv"]

# Audio config
TARGET_SR      = 16000   # Hz — standar speech processing
MAX_DURATION   = 10.0    # detik — potong audio > 10 detik
MIN_DURATION   = 0.5     # detik — skip audio terlalu pendek
TOP_DB         = 30      # threshold trim silence (dB)

# MFCC config
N_MFCC         = 40      # jumlah koefisien MFCC
N_FFT          = 512
HOP_LENGTH     = 256
MAX_PAD_LEN    = 128     # frame padding agar shape seragam

# Augmentasi
AUGMENT        = True
NOISE_FACTOR   = 0.005
PITCH_STEPS    = [1.5, -1.5]

# Multiprocessing
N_WORKERS      = 4       # sesuaikan dengan CPU kamu

#  HELPER FUNCTIONS

def load_tsv_files(base_dir: Path, tsv_names: list) -> pd.DataFrame:
    """Gabungkan semua TSV yang ada, tandai split-nya."""
    frames = []
    for name in tsv_names:
        path = base_dir / name
        if not path.exists():
            log.warning(f"TSV tidak ditemukan: {path}")
            continue
        df = pd.read_csv(path, sep="\t", low_memory=False)
        df["split"] = name.replace(".tsv", "")
        frames.append(df)
    if not frames:
        raise FileNotFoundError(f"Tidak ada TSV valid di {base_dir}")
    combined = pd.concat(frames, ignore_index=True)
    log.info(f"Total baris TSV gabungan: {len(combined):,}")
    return combined


def assess_dataset(df: pd.DataFrame, clips_dir: Path) -> pd.DataFrame:
    """
    STEP 1 — ASSESSING
    Cek: durasi, sample rate, file exist, distribusi split.
    Return DataFrame dengan kolom tambahan: duration_s, file_exists
    """
    log.info("=" * 60)
    log.info("STEP 1: ASSESSING DATASET")
    log.info("=" * 60)

    # Kolom path file audio (Common Voice pakai 'path')
    path_col = "path" if "path" in df.columns else df.columns[0]

    df = df.copy()
    df["file_path"] = df[path_col].apply(lambda x: clips_dir / str(x))
    df["file_exists"] = df["file_path"].apply(lambda p: p.exists())

    missing = (~df["file_exists"]).sum()
    log.info(f"  File ditemukan : {df['file_exists'].sum():,}")
    log.info(f"  File hilang    : {missing:,}")

    # Sample durasi (random 2000 file agar cepat)
    sample_df = df[df["file_exists"]].sample(min(2000, df["file_exists"].sum()), random_state=42)
    durations = []
    for _, row in tqdm(sample_df.iterrows(), total=len(sample_df), desc="Sampling durasi"):
        try:
            d = librosa.get_duration(path=str(row["file_path"]))
            durations.append(d)
        except Exception:
            durations.append(None)

    d_series = pd.Series([d for d in durations if d is not None])
    log.info(f"\n  [Durasi Audio — Sample {len(d_series)} file]")
    log.info(f"  Mean   : {d_series.mean():.2f}s")
    log.info(f"  Median : {d_series.median():.2f}s")
    log.info(f"  Min    : {d_series.min():.2f}s")
    log.info(f"  Max    : {d_series.max():.2f}s")
    log.info(f"  < 0.5s : {(d_series < 0.5).sum()} file (akan di-skip)")
    log.info(f"  > 10s  : {(d_series > 10).sum()} file (akan di-trim)")

    # Distribusi split
    log.info(f"\n  [Distribusi Split]")
    for split, count in df["split"].value_counts().items():
        log.info(f"  {split:<15}: {count:,} baris")

    # Gender distribution jika ada
    if "gender" in df.columns:
        log.info(f"\n  [Distribusi Gender]")
        for g, c in df["gender"].value_counts().items():
            log.info(f"  {g}: {c:,}")

    return df


def load_and_clean_audio(file_path: Path) -> np.ndarray | None:
    """
    STEP 2 — CLEANING (per file)
    - Load audio → resample ke 16kHz mono
    - Trim silence
    - Validasi durasi (min/max)
    Return: numpy array audio bersih, atau None jika invalid
    """
    try:
        y, sr = librosa.load(str(file_path), sr=TARGET_SR, mono=True)

        # Trim silence di awal dan akhir
        y, _ = librosa.effects.trim(y, top_db=TOP_DB)

        duration = len(y) / TARGET_SR

        # Validasi durasi
        if duration < MIN_DURATION:
            return None
        if duration > MAX_DURATION:
            y = y[:int(MAX_DURATION * TARGET_SR)]

        return y

    except Exception:
        return None


def augment_audio(y: np.ndarray) -> list:
    """Augmentasi: noise injection + pitch shifting."""
    augmented = []

    # 1. Noise injection
    noise = np.random.randn(len(y)) * NOISE_FACTOR
    augmented.append(y + noise)

    # 2. Pitch shifting
    for steps in PITCH_STEPS:
        try:
            shifted = librosa.effects.pitch_shift(y, sr=TARGET_SR, n_steps=steps)
            augmented.append(shifted)
        except Exception:
            pass

    return augmented


def extract_features(y: np.ndarray) -> np.ndarray:
    """
    STEP 3 — FEATURE ENGINEERING
    Ekstrak:
    - MFCC (40 koefisien)
    - Delta MFCC
    - Spectral Contrast
    Pad/truncate ke MAX_PAD_LEN frames → shape: (MAX_PAD_LEN, 93)
    """
    # MFCC
    mfcc = librosa.feature.mfcc(y=y, sr=TARGET_SR, n_mfcc=N_MFCC,
                                  n_fft=N_FFT, hop_length=HOP_LENGTH)  # (40, T)

    # Delta MFCC (velocity)
    delta_mfcc = librosa.feature.delta(mfcc)                           # (40, T)

    # Spectral Contrast
    spec_contrast = librosa.feature.spectral_contrast(y=y, sr=TARGET_SR,
                                                       n_fft=N_FFT,
                                                       hop_length=HOP_LENGTH)  # (7, T)

    # Stack semua fitur → (87, T)  [40+40+7]
    features = np.vstack([mfcc, delta_mfcc, spec_contrast])  # (87, T)
    features = features.T  # → (T, 87)

    # Padding / Truncating agar shape seragam
    if features.shape[0] < MAX_PAD_LEN:
        pad = np.zeros((MAX_PAD_LEN - features.shape[0], features.shape[1]))
        features = np.vstack([features, pad])
    else:
        features = features[:MAX_PAD_LEN, :]

    return features.astype(np.float32)  # (128, 87)


def process_one_file(args: tuple) -> dict | None:
    """Worker function untuk multiprocessing."""
    file_path, label, split, do_augment = args

    y = load_and_clean_audio(file_path)
    if y is None:
        return None

    results = []
    # Original
    feat = extract_features(y)
    results.append({"features": feat, "label": label, "split": split, "aug": "original"})

    # Augmented (hanya untuk split train)
    if do_augment and split == "train":
        for i, y_aug in enumerate(augment_audio(y)):
            feat_aug = extract_features(y_aug)
            results.append({"features": feat_aug, "label": label, "split": split, "aug": f"aug_{i}"})

    return results


# ─────────────────────────────────────────────
#  LABEL MAPPING
#  Karena Common Voice ID tidak punya label intent,
#  kita pakai sentence-based rule untuk labeling.
#  Sesuaikan dengan kebutuhan proyek VoiceBank.
# ─────────────────────────────────────────────
INTENT_KEYWORDS = {
    "TRANSFER"   : ["transfer", "kirim", "bayar", "send"],
    "CEK_SALDO"  : ["saldo", "cek", "berapa", "balance", "uang"],
    "RIWAYAT"    : ["riwayat", "history", "transaksi", "mutasi"],
    "TABUNG"     : ["tabung", "simpan", "nabung", "saving"],
    "BANTUAN"    : ["bantuan", "bantu", "tolong", "help", "panduan"],
}

def sentence_to_intent(sentence: str) -> str:
    """Rule-based labeling dari teks kalimat (Common Voice pakai kolom 'sentence')."""
    if not isinstance(sentence, str):
        return "BANTUAN"
    s = sentence.lower()
    for intent, keywords in INTENT_KEYWORDS.items():
        if any(kw in s for kw in keywords):
            return intent
    return "BANTUAN"  # default


# ─────────────────────────────────────────────
#  MAIN PIPELINE
# ─────────────────────────────────────────────
def run_pipeline():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # ── STEP 1: ASSESSING ──
    df = load_tsv_files(BASE_DIR, TSV_FILES)
    df = assess_dataset(df, CLIPS_DIR)

    # Filter hanya file yang ada
    df = df[df["file_exists"]].reset_index(drop=True)

    # Label dari sentence (rule-based)
    if "sentence" in df.columns:
        df["intent_label"] = df["sentence"].apply(sentence_to_intent)
    else:
        df["intent_label"] = "BANTUAN"

    log.info(f"\n  [Distribusi Intent Label]")
    for intent, count in df["intent_label"].value_counts().items():
        log.info(f"  {intent:<15}: {count:,}")

    # ── STEP 2 & 3: CLEANING + FEATURE EXTRACTION ──
    log.info("\n" + "=" * 60)
    log.info("STEP 2+3: CLEANING + FEATURE EXTRACTION (parallel)")
    log.info("=" * 60)

    # Siapkan args
    args_list = [
        (row["file_path"], row["intent_label"], row["split"], AUGMENT)
        for _, row in df.iterrows()
    ]

    all_features, all_labels, all_splits = [], [], []
    failed = 0

    with ThreadPoolExecutor(max_workers=N_WORKERS) as executor:
        futures = {executor.submit(process_one_file, args): args for args in args_list}
        for future in tqdm(as_completed(futures), total=len(futures), desc="Processing audio"):
            result = future.result()
            if result is None:
                failed += 1
                continue
            for item in result:
                all_features.append(item["features"])
                all_labels.append(item["label"])
                all_splits.append(item["split"])

    log.info(f"\n  Berhasil diproses : {len(all_features):,} sampel (incl. augmented)")
    log.info(f"  Gagal / di-skip   : {failed:,} file")

    # ── SAVE OUTPUT ──
    log.info("\n" + "=" * 60)
    log.info("SAVING OUTPUT")
    log.info("=" * 60)

    features_arr = np.array(all_features, dtype=np.float32)  # (N, 128, 87)
    labels_arr   = np.array(all_labels)
    splits_arr   = np.array(all_splits)

    # Label encoding
    label_classes = sorted(INTENT_KEYWORDS.keys())
    label_to_idx  = {l: i for i, l in enumerate(label_classes)}
    labels_int    = np.array([label_to_idx.get(l, 0) for l in labels_arr], dtype=np.int32)

    # Simpan per split
    for split_name in ["train", "validated", "dev", "test"]:
        mask = splits_arr == split_name
        if mask.sum() == 0:
            continue
        out_path = OUTPUT_DIR / f"{split_name}_mfcc.npz"
        np.savez_compressed(
            out_path,
            features=features_arr[mask],
            labels=labels_int[mask],
            label_names=labels_arr[mask],
        )
        log.info(f"  Saved: {out_path}  | Shape: {features_arr[mask].shape}")

    # Simpan metadata
    meta_path = OUTPUT_DIR / "metadata.npz"
    np.savez(meta_path, label_classes=label_classes, label_to_idx=list(label_to_idx.items()))
    log.info(f"  Saved: {meta_path}")

    # ── RINGKASAN AKHIR ──
    log.info("\n" + "=" * 60)
    log.info("PIPELINE SELESAI ✓")
    log.info(f"  Total sampel final : {len(all_features):,}")
    log.info(f"  Shape per sampel   : (128, 87)  → 128 frames × 87 fitur")
    log.info(f"  Fitur              : 40 MFCC + 40 Delta MFCC + 7 Spectral Contrast")
    log.info(f"  Output dir         : {OUTPUT_DIR.resolve()}")
    log.info("=" * 60)
    log.info("NEXT STEP: Gunakan output NPZ ini untuk training model CNN+BiLSTM+Attention")
    log.info("=" * 60)


if __name__ == "__main__":
    run_pipeline()
