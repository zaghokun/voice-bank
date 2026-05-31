import os
import numpy as np
import librosa
from sklearn.model_selection import train_test_split

DATA_DIR = "data"
AUDIO_DIR = os.path.join(DATA_DIR, "synthetic_audio")

LABEL_CLASSES = ["BANTUAN", "CEK_SALDO", "RIWAYAT", "TABUNG", "TRANSFER"]
LABEL_TO_IDX = {label: i for i, label in enumerate(LABEL_CLASSES)}

TARGET_SR = 16000
N_MFCC = 40
N_FFT = 512
HOP_LENGTH = 256
MAX_PAD_LEN = 128
TOP_DB = 30

def extract_features(path):
    y, _ = librosa.load(path, sr=TARGET_SR, mono=True)
    y, _ = librosa.effects.trim(y, top_db=TOP_DB)

    mfcc = librosa.feature.mfcc(y=y, sr=TARGET_SR, n_mfcc=N_MFCC, n_fft=N_FFT, hop_length=HOP_LENGTH)
    delta = librosa.feature.delta(mfcc)
    contrast = librosa.feature.spectral_contrast(y=y, sr=TARGET_SR, n_fft=N_FFT, hop_length=HOP_LENGTH)

    features = np.vstack([mfcc, delta, contrast]).T

    if features.shape[0] < MAX_PAD_LEN:
        pad = np.zeros((MAX_PAD_LEN - features.shape[0], features.shape[1]))
        features = np.vstack([features, pad])
    else:
        features = features[:MAX_PAD_LEN]

    return features.astype(np.float32)

X, y = [], []

for intent in LABEL_CLASSES:
    folder = os.path.join(AUDIO_DIR, intent)
    files = [f for f in os.listdir(folder) if f.endswith(".mp3")]

    print(intent, len(files), "audio")

    for file in files:
        path = os.path.join(folder, file)
        try:
            X.append(extract_features(path))
            y.append(LABEL_TO_IDX[intent])
        except Exception as e:
            print("Skip:", path, e)

X = np.array(X, dtype=np.float32)
y = np.array(y, dtype=np.int64)

print("\nDistribusi final:")
for idx, count in zip(*np.unique(y, return_counts=True)):
    print(idx, LABEL_CLASSES[idx], count)

X_train, X_temp, y_train, y_temp = train_test_split(
    X, y, test_size=0.2, stratify=y, random_state=42
)

X_dev, X_test, y_dev, y_test = train_test_split(
    X_temp, y_temp, test_size=0.5, stratify=y_temp, random_state=42
)

np.savez_compressed(os.path.join(DATA_DIR, "train_mfcc_synthetic.npz"), features=X_train, labels=y_train)
np.savez_compressed(os.path.join(DATA_DIR, "dev_mfcc_synthetic.npz"), features=X_dev, labels=y_dev)
np.savez_compressed(os.path.join(DATA_DIR, "test_mfcc_synthetic.npz"), features=X_test, labels=y_test)

print("\n✅ NPZ synthetic dari audio existing berhasil dibuat.")