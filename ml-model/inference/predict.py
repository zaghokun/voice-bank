"""
VoiceBank - Predict
Main inference: audio file → intent prediction + confidence score.
"""

import numpy as np
from pathlib import Path

from .model_loader import load_model, LABEL_CLASSES
from .preprocessor import preprocess_audio

# Default model path (relatif dari root project)
DEFAULT_MODEL_PATH = Path(__file__).parent.parent / "model_intent_classification_prod.keras"


class IntentPredictor:
    """Stateful predictor — load model sekali, predict berkali-kali."""

    def __init__(self, model_path: str = None):
        path = model_path or str(DEFAULT_MODEL_PATH)
        self.model = load_model(path)
        self.labels = LABEL_CLASSES

    def predict(self, audio_path: str) -> dict:
        """
        Predict intent dari file audio.

        Returns:
            {
                "intent": "TRANSFER",
                "confidence": 0.9370,
                "all_scores": {"BANTUAN": 0.01, "CEK_SALDO": 0.02, ...}
            }
        """
        features = preprocess_audio(audio_path)
        input_batch = np.expand_dims(features, axis=0)  # (1, 128, 87)

        predictions = self.model.predict(input_batch, verbose=0)
        probs = predictions[0]

        predicted_idx = np.argmax(probs)
        confidence = float(probs[predicted_idx])
        intent = self.labels[predicted_idx]

        all_scores = {label: float(probs[i]) for i, label in enumerate(self.labels)}

        return {
            "intent": intent,
            "confidence": confidence,
            "all_scores": all_scores,
        }


def predict_intent(audio_path: str, model_path: str = None) -> dict:
    """Fungsi sederhana untuk single prediction (load model tiap panggil)."""
    predictor = IntentPredictor(model_path)
    return predictor.predict(audio_path)
