from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.core.database import init_db
from app.routers import auth, users


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield
   


app = FastAPI(
    title="AutoPilot KPI API",
    description="API de pilotage des indicateurs de performance (Commercial / SAV / Admin)",
    version="0.1.0",
    lifespan=lifespan,
)


@app.get("/health", tags=["Monitoring"])
async def health_check():
    return {"status": "ok", "database": "connected"}


app.include_router(auth.router)
app.include_router(users.router)
