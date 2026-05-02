from fastapi import FastAPI
from app.routers import transactions  # sudah ada
# nanti setelah impor, tambahkan ini di bawah app = FastAPI(...)
app.include_router(voice_router, prefix="/api", tags=["Voice Input"])

app = FastAPI(title="VoiceBank API", version="1.0.0")

app.include_router(transactions.router, prefix="/api", tags=["Transactions"])

@app.get("/")
def root():
    return {"status": "ok", "message": "VoiceBank API is running"}