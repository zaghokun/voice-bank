"""
VoiceBank - Audio Preprocessor
Convert raw audio file → MFCC feature array (128, 87) ready for model input.
"""

import numpy as np
import librosa

# Config — harus sama persis dengan training pipeline
TARGET_SR = 16000
MAX_DURATION = 10.0
MIN_DURATION = 0.5
TOP_DB = 30
N_MFCC = 40
N_FFT = 512
HOP_LENGTH = 256
MAX_PAD_LEN = 128


def load_audio(file_path: str) -> np.ndarray | None:
    """Load audio, resample ke 16kHz mono, trim silence."""
    y, _ = librosa.load(file_path, sr=TARGET_SR, mono=True)
    y, _ = librosa.effects.trim(y, top_db=TOP_DB)

    duration = len(y) / TARGET_SR
    if duration < MIN_DURATION:
        raise ValueError(f"Audio terlalu pendek: {duration:.2f}s (min {MIN_DURATION}s)")
    if duration > MAX_DURATION:
        y = y[:int(MAX_DURATION * TARGET_SR)]

    return y


def extract_features(y: np.ndarray) -> np.ndarray:
    """Ekstrak MFCC + Delta MFCC + Spectral Contrast → shape (128, 87)."""
    mfcc = librosa.feature.mfcc(y=y, sr=TARGET_SR, n_mfcc=N_MFCC,
                                n_fft=N_FFT, hop_length=HOP_LENGTH)
    delta_mfcc = librosa.feature.delta(mfcc)
    spec_contrast = librosa.feature.spectral_contrast(y=y, sr=TARGET_SR,
                                                      n_fft=N_FFT, hop_length=HOP_LENGTH)

    # Stack: (87, T) → transpose → (T, 87)
    features = np.vstack([mfcc, delta_mfcc, spec_contrast]).T

    # Pad/truncate ke MAX_PAD_LEN frames
    if features.shape[0] < MAX_PAD_LEN:
        pad = np.zeros((MAX_PAD_LEN - features.shape[0], features.shape[1]))
        features = np.vstack([features, pad])
    else:
        features = features[:MAX_PAD_LEN, :]

    return features.astype(np.float32)


def preprocess_audio(file_path: str) -> np.ndarray:
    """Pipeline lengkap: audio file → MFCC array (128, 87)."""
    y = load_audio(file_path)
    return extract_features(y)
