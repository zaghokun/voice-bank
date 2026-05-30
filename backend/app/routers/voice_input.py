import os
import sys
import tempfile
import numpy as np
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.voice_log import VoiceLog

# Add ml-model to path for inference imports
ML_MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "..", "ml-model")
sys.path.insert(0, os.path.abspath(ML_MODEL_DIR))

from inference.model_loader import load_model, LABEL_CLASSES
from inference.preprocessor import preprocess_audio

router = APIRouter()

# Load model once at startup
MODEL_PATH = os.path.join(ML_MODEL_DIR, "model_intent_classification_prod.keras")
_model = None


def get_model():
    global _model
    if _model is None:
        _model = load_model(MODEL_PATH)
    return _model


@router.post("/voice-input")
async def voice_input(
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Terima file audio, jalankan model Speech-to-Intent, return prediksi.

    - Input: file audio (WAV/WebM/OGG)
    - Output: intent (TRANSFER/CEK_SALDO/RIWAYAT/TABUNG/BANTUAN) + confidence score
    """
    # Validate file type
    if not file.content_type or "audio" not in file.content_type:
        if not file.filename.endswith((".wav", ".mp3", ".webm", ".ogg")):
            raise HTTPException(status_code=400, detail="Format file audio tidak valid")

    # Save to temp file
    suffix = os.path.splitext(file.filename or "audio.wav")[1]
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name

    try:
        # Preprocess audio → MFCC
        features = preprocess_audio(tmp_path)
        input_batch = np.expand_dims(features, axis=0)

        # Predict
        model = get_model()
        predictions = model.predict(input_batch, verbose=0)
        probs = predictions[0]

        predicted_idx = int(np.argmax(probs))
        confidence = float(probs[predicted_idx])
        intent = LABEL_CLASSES[predicted_idx]

        # Save voice log
        log = VoiceLog(
            user_id=user.id,
            detected_intent=intent,
            confidence=confidence,
        )
        db.add(log)
        db.commit()

        return {
            "intent": intent,
            "confidence": round(confidence, 4),
            "all_scores": {label: round(float(probs[i]), 4) for i, label in enumerate(LABEL_CLASSES)},
        }

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal memproses audio: {str(e)}")
    finally:
        os.unlink(tmp_path)