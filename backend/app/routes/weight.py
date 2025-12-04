from fastapi import APIRouter
from app.models import Weights
from app.services.weight_services import get_weights, update_weights

router = APIRouter()

@router.get("/", response_model=Weights)
def read_weights():
    return get_weights()

@router.post("/", response_model=dict)
def save_weights(weights: Weights):
    update_weights(weights)
    return {"success": True}
