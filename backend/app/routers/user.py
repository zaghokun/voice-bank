from fastapi import APIRouter, Depends
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.user import UserResponse

router = APIRouter(prefix="/user", tags=["User"])


@router.get("/profile", response_model=UserResponse)
def get_profile(user: User = Depends(get_current_user)):
    """Get profil lengkap user yang sedang login."""
    return user
