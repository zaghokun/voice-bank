import os
import numpy as np
from sklearn.model_selection import train_test_split

DATA_DIR = "../data"

LABEL_CLASSES = np.array(["BANTUAN", "CEK_SALDO", "RIWAYAT", "TABUNG", "TRANSFER"])

FILES = [
    "train_mfcc_synthetic_real.npz",
    "dev_mfcc_synthetic_real.npz",
    "test_mfcc_synthetic_real.npz",
    "train_mfcc_hardcase.npz",
    "dev_mfcc_hardcase.npz",
    "test_mfcc_hardcase.npz",
]

X_list, y_list = [], []

for file in FILES:
    path = os.path.join(DATA_DIR, file)
    data = np.load(path)
    X_list.append(data["features"])
    y_list.append(data["labels"])
    print(f"Loaded {file}: {data['features'].shape}")

X = np.concatenate(X_list, axis=0)
y = np.concatenate(y_list, axis=0)

print("\nDistribusi gabungan:")
for idx, count in zip(*np.unique(y, return_counts=True)):
    print(idx, LABEL_CLASSES[int(idx)], count)

X_train, X_temp, y_train, y_temp = train_test_split(
    X, y, test_size=0.2, stratify=y, random_state=42
)

X_dev, X_test, y_dev, y_test = train_test_split(
    X_temp, y_temp, test_size=0.5, stratify=y_temp, random_state=42
)

np.savez_compressed(os.path.join(DATA_DIR, "train_mfcc_final_v2.npz"), features=X_train, labels=y_train)
np.savez_compressed(os.path.join(DATA_DIR, "dev_mfcc_final_v2.npz"), features=X_dev, labels=y_dev)
np.savez_compressed(os.path.join(DATA_DIR, "test_mfcc_final_v2.npz"), features=X_test, labels=y_test)

print("\n✅ Dataset final v2 selesai dibuat.")