from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import Base, engine
from app.routers import transactions, voice_input, auth, user

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="VoiceBank API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api", tags=["Auth"])
app.include_router(user.router, prefix="/api", tags=["User"])
app.include_router(transactions.router, prefix="/api", tags=["Transactions"])
app.include_router(voice_input.router, prefix="/api", tags=["Voice Input"])

@app.get("/")
def root():
    return {"status": "ok", "message": "VoiceBank API is running"}

@app.get("/api/health")
def health():
    return {"status": "ok"}