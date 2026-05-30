"""
VoiceBank - Model Evaluation Script
Evaluasi lengkap model Speech-to-Intent:
  - Accuracy, Precision, Recall, F1 per intent
  - Confusion Matrix
  - Confidence Distribution
  - (Opsional) Per-dialek jika metadata tersedia

Usage:
    python evaluate_model.py --data-dir ./output_mfcc --model ./model_intent_classification_prod.keras
"""

import argparse
import numpy as np
import tensorflow as tf
from pathlib import Path
from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    accuracy_score,
)

import sys
sys.path.insert(0, str(Path(__file__).parent))
from inference.model_loader import load_model, LABEL_CLASSES


def load_test_data(data_dir: str):
    """Load test set dari .npz files."""
    data_path = Path(data_dir)

    # Coba load test_mfcc.npz
    test_file = data_path / "test_mfcc.npz"
    if not test_file.exists():
        raise FileNotFoundError(f"Test data tidak ditemukan: {test_file}")

    data = np.load(test_file)
    X_test = data["features"]
    y_test = data["labels"]

    # Load metadata untuk label classes
    meta_file = data_path / "metadata.npz"
    if meta_file.exists():
        meta = np.load(meta_file, allow_pickle=True)
        label_classes = list(meta["label_classes"])
    else:
        label_classes = LABEL_CLASSES

    return X_test, y_test, label_classes


def evaluate(model, X_test, y_test, label_classes):
    """Run full evaluation."""
    print("=" * 60)
    print("VOICEBANK MODEL EVALUATION")
    print("=" * 60)

    # Predict
    predictions = model.predict(X_test, verbose=0)
    y_pred = np.argmax(predictions, axis=1)
    y_confidence = np.max(predictions, axis=1)

    # Overall accuracy
    acc = accuracy_score(y_test, y_pred)
    print(f"\n📊 Overall Accuracy: {acc*100:.2f}%")
    print(f"   Target minimum : 85.00%")
    print(f"   Status         : {'✅ LULUS' if acc >= 0.85 else '❌ BELUM LULUS'}")

    # Per-intent classification report
    print(f"\n{'='*60}")
    print("METRIK PER INTENT (Precision / Recall / F1-Score)")
    print("=" * 60)
    report = classification_report(
        y_test, y_pred,
        target_names=label_classes,
        digits=4,
        zero_division=0
    )
    print(report)

    # Confusion Matrix
    print(f"{'='*60}")
    print("CONFUSION MATRIX")
    print("=" * 60)
    cm = confusion_matrix(y_test, y_pred)
    print(f"\n{'':>12}", end="")
    for label in label_classes:
        print(f"{label:>12}", end="")
    print()
    for i, row in enumerate(cm):
        print(f"{label_classes[i]:>12}", end="")
        for val in row:
            print(f"{val:>12}", end="")
        print()

    # Misclassification analysis
    print(f"\n{'='*60}")
    print("TOP MISCLASSIFICATIONS")
    print("=" * 60)
    misclass = []
    for i in range(len(label_classes)):
        for j in range(len(label_classes)):
            if i != j and cm[i][j] > 0:
                misclass.append((label_classes[i], label_classes[j], cm[i][j]))
    misclass.sort(key=lambda x: x[2], reverse=True)
    for actual, predicted, count in misclass[:10]:
        print(f"  {actual:>12} → {predicted:<12} : {count} sampel")

    # Confidence Distribution
    print(f"\n{'='*60}")
    print("CONFIDENCE DISTRIBUTION")
    print("=" * 60)

    # Overall
    print(f"\n  Overall:")
    print(f"    Mean confidence : {y_confidence.mean():.4f}")
    print(f"    Std             : {y_confidence.std():.4f}")
    print(f"    Min             : {y_confidence.min():.4f}")
    print(f"    Max             : {y_confidence.max():.4f}")

    # Per intent
    print(f"\n  Per Intent:")
    for i, label in enumerate(label_classes):
        mask = y_test == i
        if mask.sum() == 0:
            continue
        conf = y_confidence[mask]
        correct_mask = (y_test == i) & (y_pred == i)
        wrong_mask = (y_test == i) & (y_pred != i)
        print(f"    {label:<12}: mean={conf.mean():.4f} | "
              f"correct={correct_mask.sum()}/{mask.sum()} | "
              f"wrong={wrong_mask.sum()}/{mask.sum()}")

    # Low confidence predictions (potential errors)
    print(f"\n  Low Confidence Predictions (< 0.7):")
    low_conf_mask = y_confidence < 0.7
    low_conf_count = low_conf_mask.sum()
    print(f"    Total: {low_conf_count}/{len(y_test)} ({low_conf_count/len(y_test)*100:.1f}%)")
    if low_conf_count > 0:
        low_conf_correct = (y_pred[low_conf_mask] == y_test[low_conf_mask]).sum()
        print(f"    Correct: {low_conf_correct}/{low_conf_count} "
              f"({low_conf_correct/low_conf_count*100:.1f}%)")

    # Confidence histogram (text-based)
    print(f"\n  Confidence Histogram:")
    bins = [(0.0, 0.5), (0.5, 0.6), (0.6, 0.7), (0.7, 0.8), (0.8, 0.9), (0.9, 1.0)]
    for low, high in bins:
        count = ((y_confidence >= low) & (y_confidence < high)).sum()
        bar = "█" * (count // max(1, len(y_test) // 50))
        print(f"    [{low:.1f}-{high:.1f}): {count:>5} {bar}")

    print(f"\n{'='*60}")
    print("EVALUATION SELESAI ✓")
    print("=" * 60)

    return {
        "accuracy": acc,
        "confusion_matrix": cm,
        "y_pred": y_pred,
        "y_confidence": y_confidence,
    }


def main():
    parser = argparse.ArgumentParser(description="VoiceBank Model Evaluation")
    parser.add_argument("--data-dir", type=str, default="./output_mfcc",
                        help="Directory containing test_mfcc.npz and metadata.npz")
    parser.add_argument("--model", type=str,
                        default="./model_intent_classification_prod.keras",
                        help="Path to trained .keras model")
    args = parser.parse_args()

    print(f"Loading model: {args.model}")
    model = load_model(args.model)

    print(f"Loading test data: {args.data_dir}")
    X_test, y_test, label_classes = load_test_data(args.data_dir)
    print(f"Test samples: {len(X_test)}")

    evaluate(model, X_test, y_test, label_classes)


if __name__ == "__main__":
    main()
