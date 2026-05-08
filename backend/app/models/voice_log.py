from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, func
from app.core.database import Base

class VoiceLog(Base):
    __tablename__ = "voice_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    audio_url = Column(String, nullable=True)
    detected_intent = Column(String, nullable=False)
    confidence = Column(Float, nullable=False)
    dialect_tag = Column(String, nullable=True)
    created_at = Column(DateTime, server_default=func.now())