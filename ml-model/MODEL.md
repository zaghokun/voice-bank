# Dokumentasi Model AI — VoiceBank Speech-to-Intent

## Arsitektur Model

```
Input MFCC (128, 87)
    ↓
Conv1D (64 filters, kernel=3, ReLU, padding=same)
    ↓
MaxPooling1D (pool=2)
    ↓
Dropout (0.3)
    ↓
Bidirectional LSTM (64 units, return_sequences=True)
    ↓
KustomAttention Layer (custom trainable attention)
    ↓
Dense (64, ReLU)
    ↓
Dropout (0.3)
    ↓
Dense Softmax (5 kelas intent)
```

**Total Parameters**: 91,589 (357.77 KB)
**Format**: `.keras` (TensorFlow SavedModel)

## Input

- **Shape**: `(128, 87)` per sampel
- **Fitur**: 40 MFCC + 40 Delta MFCC + 7 Spectral Contrast = 87 fitur
- **Frames**: 128 (padding/truncate)
- **Audio config**: 16kHz, mono, trim silence (top_db=30)
- **MFCC config**: n_fft=512, hop_length=256, n_mfcc=40

## Output

5 kelas intent (sorted alphabetically):

| Index | Intent | Deskripsi |
|-------|--------|-----------|
| 0 | BANTUAN | Minta bantuan/help |
| 1 | CEK_SALDO | Cek saldo rekening |
| 2 | RIWAYAT | Lihat riwayat transaksi |
| 3 | TABUNG | Menabung |
| 4 | TRANSFER | Transfer uang |

## Custom Attention Layer (KustomAttention)

Layer attention kustom yang memberi bobot pada timestep penting:

```python
e = tanh(x @ W + b)           # alignment score
a = softmax(e, axis=1)         # attention weights
context = sum(x * a, axis=1)   # weighted sum
```

Tujuan: memberi bobot lebih pada fonem kunci yang konsisten lintas variasi ucapan.

## Performa

| Metrik | Nilai |
|--------|-------|
| Test Accuracy | **93.93%** |
| Target Minimum | 85% |
| Test MAE | 0.0460 |
| Training Epochs | 30 |
| Optimizer | Adam (lr=0.001) |

## Cara Menjalankan Inference

```python
from inference import IntentPredictor

predictor = IntentPredictor()
result = predictor.predict("path/ke/audio.wav")

print(result)
# {
#   "intent": "TRANSFER",
#   "confidence": 0.9370,
#   "all_scores": {"BANTUAN": 0.01, "CEK_SALDO": 0.02, "RIWAYAT": 0.01, "TABUNG": 0.02, "TRANSFER": 0.94}
# }
```

## Cara Menjalankan Evaluasi

```bash
cd ml-model
python evaluate_model.py --data-dir ./path/ke/npz --model ./model_intent_classification_prod.keras
```

Output: accuracy, precision/recall/F1 per intent, confusion matrix, confidence distribution.

## Dataset

| Sumber | Tipe | Jumlah |
|--------|------|--------|
| gTTS (sintetis) | Generated dari teks perintah keuangan | Mayoritas |
| Mozilla Common Voice (ID) | Audio natural + rule-based labeling | Tambahan |

- **Train**: 22,425 sampel
- **Dev**: 3,469 sampel
- **Test**: 3,693 sampel

## Limitasi

1. **Data mayoritas sintetis (gTTS)** — model sangat akurat untuk suara "bersih" standar, belum teruji dengan variasi aksen/dialek real
2. **Belum ada evaluasi per-dialek** — dataset tidak memiliki label dialek
3. **Single speaker TTS** — gTTS menghasilkan 1 suara standar, kurang representatif untuk variasi user
4. **Background noise** — model belum dilatih dengan augmentasi noise berat (hanya noise ringan 0.005)
5. **Label mapping dari rule-based** — Common Voice dilabeli berdasarkan keyword di transkrip, bukan intent sebenarnya

## Rekomendasi Pengembangan

- Tambah dataset audio real dari user tunanetra
- Augmentasi noise lebih agresif (SNR 5-15 dB)
- Evaluasi dengan berbagai perangkat mic (HP, laptop, headset)
- Fine-tune dengan data dialek spesifik jika tersedia
