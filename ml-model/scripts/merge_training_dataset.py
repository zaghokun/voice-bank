import os
import numpy as np
from sklearn.model_selection import train_test_split

DATA_DIR = "data"

LABEL_CLASSES = np.array([
    "BANTUAN",
    "CEK_SALDO",
    "RIWAYAT",
    "TABUNG",
    "TRANSFER",
])

FILES = [
    "train_mfcc_balanced.npz",
    "dev_mfcc_balanced.npz",
    "test_mfcc_balanced.npz",
    "train_mfcc_synthetic.npz",
    "dev_mfcc_synthetic.npz",
    "test_mfcc_synthetic.npz",
]

X_list = []
y_list = []

for file in FILES:
    path = os.path.join(DATA_DIR, file)

    data = np.load(path)
    X_list.append(data["features"])
    y_list.append(data["labels"])

    print(f"Loaded: {file} -> {data['features'].shape}")

X = np.concatenate(X_list, axis=0)
y = np.concatenate(y_list, axis=0)

print("\nDistribusi gabungan sebelum split:")
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
    os.path.join(DATA_DIR, "train_mfcc_final.npz"),
    features=X_train,
    labels=y_train,
)

np.savez_compressed(
    os.path.join(DATA_DIR, "dev_mfcc_final.npz"),
    features=X_dev,
    labels=y_dev,
)

np.savez_compressed(
    os.path.join(DATA_DIR, "test_mfcc_final.npz"),
    features=X_test,
    labels=y_test,
)

np.savez_compressed(
    os.path.join(DATA_DIR, "metadata_final.npz"),
    label_classes=LABEL_CLASSES,
    label_to_idx=np.array([
        ["BANTUAN", "0"],
        ["CEK_SALDO", "1"],
        ["RIWAYAT", "2"],
        ["TABUNG", "3"],
        ["TRANSFER", "4"],
    ]),
)

print("\n✅ Dataset final berhasil dibuat!")
print("- train_mfcc_final.npz")
print("- dev_mfcc_final.npz")
print("- test_mfcc_final.npz")
print("- metadata_final.npz")

print("\nDistribusi train final:")
for label_idx, count in zip(*np.unique(y_train, return_counts=True)):
    print(label_idx, LABEL_CLASSES[int(label_idx)], count)

print("\nDistribusi dev final:")
for label_idx, count in zip(*np.unique(y_dev, return_counts=True)):
    print(label_idx, LABEL_CLASSES[int(label_idx)], count)

print("\nDistribusi test final:")
for label_idx, count in zip(*np.unique(y_test, return_counts=True)):
    print(label_idx, LABEL_CLASSES[int(label_idx)], count)