from fastapi import APIRouter, HTTPException
from app.models import LoginRequestModel
from app.services.login_services import authenticate_user

router = APIRouter()

@router.post("/login", response_model=dict)
def login(req: LoginRequestModel):
    user = authenticate_user(req.username, req.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    return user
