from fastapi import APIRouter, HTTPException
from app.services.user_services import get_user_by_id

router = APIRouter()

@router.get("/users/{user_id}")
def fetch_user(user_id: int):
    user = get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
