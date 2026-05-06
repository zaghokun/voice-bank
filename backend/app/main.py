from fastapi import FastAPI
from app.routers import transactions
from app.routers import voice_input

app = FastAPI(title="VoiceBank API", version="1.0.0")

app.include_router(transactions.router, prefix="/api", tags=["Transactions"])
app.include_router(voice_input.router, prefix="/api", tags=["Voice Input"])

@app.get("/")
def root():
    return {"status": "ok", "message": "VoiceBank API is running"}