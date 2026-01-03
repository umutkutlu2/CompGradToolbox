from fastapi import APIRouter, HTTPException
from app.services.register_finish_service import finish_registration

router = APIRouter(prefix="/api/register", tags=["Register"])

@router.post("/finish")
def finish(payload: dict):
    """
    payload:
    {
      "registration_token": "...",
      "data": { ... role-specific onboarding data ... }
    }
    """
    try:
        token = payload["registration_token"]
        data = payload["data"]
        return finish_registration(token, data)
    except KeyError:
        raise HTTPException(status_code=400, detail="Missing registration_token or data")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        raise HTTPException(status_code=500, detail="Finish registration failed")
