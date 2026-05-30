from pydantic import BaseModel
from datetime import datetime


class TransactionCreate(BaseModel):
    type: str  # "transfer" atau "tabung"
    amount: float
    target_user: str | None = None


class TransactionResponse(BaseModel):
    id: int
    type: str
    amount: float
    target_user: str | None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
