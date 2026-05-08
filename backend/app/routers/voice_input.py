from fastapi import APIRouter, UploadFile, File

router = APIRouter()

@router.post("/voice-input")
async def voice_input(file: UploadFile = File(...)):
    # Dummy response dulu, nanti diganti panggil model AI
    return {
        "intent": "TRANSFER",
        "confidence": 0.98,
        "entities": {
            "amount": 50000,
            "target_name": "Budi"
        }
    }