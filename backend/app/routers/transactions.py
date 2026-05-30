from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.transaction import Transaction
from app.schemas.transaction import TransactionCreate, TransactionResponse

router = APIRouter()


@router.get("/balance")
def get_balance(user: User = Depends(get_current_user)):
    """Get saldo user yang sedang login."""
    return {"balance": user.balance}


@router.get("/transactions", response_model=list[TransactionResponse])
def get_transactions(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get riwayat transaksi user, diurutkan dari terbaru."""
    txs = db.query(Transaction).filter(Transaction.user_id == user.id).order_by(Transaction.created_at.desc()).all()
    return txs


@router.post("/transactions", response_model=TransactionResponse, status_code=201)
def create_transaction(
    data: TransactionCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Buat transaksi baru (transfer atau tabung). Saldo otomatis terupdate."""
    if data.amount <= 0:
        raise HTTPException(status_code=400, detail="Jumlah harus lebih dari 0")

    if data.type == "transfer":
        if not data.target_user:
            raise HTTPException(status_code=400, detail="Tujuan transfer harus diisi")
        if user.balance < data.amount:
            raise HTTPException(status_code=400, detail="Saldo tidak cukup")
        user.balance -= int(data.amount)
    elif data.type == "tabung":
        user.balance += int(data.amount)
    else:
        raise HTTPException(status_code=400, detail="Tipe transaksi tidak valid")

    tx = Transaction(
        user_id=user.id,
        type=data.type,
        amount=data.amount,
        target_user=data.target_user,
        status="completed",
    )
    db.add(tx)
    db.commit()
    db.refresh(tx)
    return tx