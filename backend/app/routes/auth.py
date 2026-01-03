from fastapi import APIRouter, HTTPException
from app.services.auth_service import start_registration
from app.models import RegisterRequestModel

router = APIRouter()

@router.post("/register")
def register(data: RegisterRequestModel):
    try:
        token = start_registration(
            name=data.name,
            username=data.username,
            password=data.password,
            role=data.role
        )
        return {
            "message": "Registration started",
            "registration_token": token
        }

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    except Exception:
        raise HTTPException(status_code=500, detail="Registration failed")
