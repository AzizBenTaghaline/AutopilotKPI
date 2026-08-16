from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import init_db
from app.routers import auth, users, kpi, kpi_entry, dashboard, audit_log, alert, sav_retour, sav_reclamation, event_com, import_router
@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield
   
app = FastAPI(
    title="AutoPilot KPI API",
    description="API de pilotfrom app.routers import auth, users, kpi, kpi_entry, dashboard, audit_log, alert, sav_retour, sav_reclamation, event_comage des indicateurs de performance (Commercial / SAV / Admin)",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["Monitoring"])
async def health_check():
    return {"status": "ok", "database": "connected"}


app.include_router(auth.router)
app.include_router(users.router)
app.include_router(kpi.router)
app.include_router(kpi_entry.router)
app.include_router(dashboard.router)
app.include_router(audit_log.router)
app.include_router(alert.router)
app.include_router(sav_retour.router)
app.include_router(sav_reclamation.router)
app.include_router(event_com.router)
app.include_router(import_router.router)