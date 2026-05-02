from fastapi import APIRouter

router = APIRouter()

@router.get("/balance")
async def get_balance():
    return {"balance": 5000000}