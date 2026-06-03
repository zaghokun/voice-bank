from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token, get_current_user
from app.models.user import User
from app.schemas.user import UserRegister, UserLogin, UserResponse, TokenResponse
from app.schemas.webauthn import (
    RegisterCredentialRequest,
    RegisterCredentialResponse,
    VerifyCredentialRequest,
    VerifyCredentialResponse,
)

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", response_model=TokenResponse, status_code=201)
def register(data: UserRegister, db: Session = Depends(get_db)):
    """Registrasi user baru. Mengembalikan JWT token dan data user."""
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email sudah terdaftar")

    user = User(
        name=data.name,
        email=data.email,
        password_hash=hash_password(data.password),
        phone=data.phone,
        disability_type=data.disability_type,
        balance=10000000,  # saldo awal demo
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": user.id})
    return TokenResponse(access_token=token, user=UserResponse.model_validate(user))


@router.post("/login", response_model=TokenResponse)
def login(data: UserLogin, db: Session = Depends(get_db)):
    """Login dengan email & password. Mengembalikan JWT access token."""
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Email atau password salah")

    token = create_access_token({"sub": user.id})
    return TokenResponse(access_token=token, user=UserResponse.model_validate(user))


@router.get("/me", response_model=UserResponse)
def get_me(user: User = Depends(get_current_user)):
    """Get data user yang sedang login (dari JWT token)."""
    return user


@router.post("/webauthn/register", response_model=RegisterCredentialResponse)
def register_webauthn(
    data: RegisterCredentialRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Register WebAuthn credential untuk user yang sedang login."""
    user.webauthn_credential_id = data.credential_id
    db.commit()
    return RegisterCredentialResponse(
        success=True,
        message="Credential berhasil didaftarkan"
    )


@router.post("/webauthn/verify", response_model=VerifyCredentialResponse)
def verify_webauthn(
    data: VerifyCredentialRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Verifikasi WebAuthn credential untuk konfirmasi transaksi."""
    if not user.webauthn_credential_id:
        return VerifyCredentialResponse(
            verified=False,
            message="Credential belum terdaftar"
        )
    
    if user.webauthn_credential_id == data.credential_id:
        return VerifyCredentialResponse(
            verified=True,
            message="Credential terverifikasi"
        )
    
    return VerifyCredentialResponse(
        verified=False,
        message="Credential tidak cocok"
    )
