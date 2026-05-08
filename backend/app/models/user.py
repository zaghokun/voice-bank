from sqlalchemy import Column, Integer, String, DateTime, func
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, nullable=True)
    disability_type = Column(String, nullable=True) #Tipe disabilitas?
    preferred_dialect = Column(String, nullable=True)
    created_at = Column(DateTime, server_default=func.now())