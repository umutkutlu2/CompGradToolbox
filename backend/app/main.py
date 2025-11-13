from fastapi import FastAPI
from app.core.config import settings
from app.routes import algorithm
from app.routes import algorithm_excel

app = FastAPI()

app.include_router(algorithm.router, prefix="/api", tags=["Algorithm"])
app.include_router(algorithm_excel.router, prefix="/api", tags=["Algorithm, Excel"])




@app.get("/")
def root():
    return {"message": "Backend is correct"}

@app.get("/config-check")
def config_check():
    return {
        "db_host": settings.DB_HOST,
        "db_user": settings.DB_USER,
    }
