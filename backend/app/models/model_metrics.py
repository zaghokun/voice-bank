from sqlalchemy import Column, Integer, String, Float, DateTime, func
from app.core.database import Base

class ModelMetrics(Base):
    __tablename__ = "model_metrics"

    id = Column(Integer, primary_key=True, index=True)
    model_version = Column(String, nullable=False)
    dialect = Column(String, nullable=False)
    intent_class = Column(String, nullable=False)
    accuracy = Column(Float, nullable=False)
    f1_score = Column(Float, nullable=True)
    evaluated_at = Column(DateTime, server_default=func.now())