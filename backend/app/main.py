from fastapi import FastAPI
from app.core.config import settings

app = FastAPI()

@app.get("/")
def root():
    return {"message": "Backend is correct"}

@app.get("/config-check")
def config_check():
    return {
        "db_host": settings.DB_HOST,
        "db_user": settings.DB_USER,
    }
