from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie

from app.core.config import settings
from app.models.user import User
from app.models.refresh_token import RefreshToken
from app.models.kpi import Kpi
from app.models.kpi_entry import KpiEntry
from app.models.audit_log import AuditLog
from app.models.alert import Alert
from app.models.sav_retour import SavRetour
from app.models.sav_reclamation import SavReclamation
from app.models.event_com import EventCom
from app.models.import_record import Import

DOCUMENT_MODELS: list = [
    User,
    RefreshToken,
    Kpi,
    KpiEntry,
    AuditLog,
    Alert,
    SavRetour,
    SavReclamation,
    EventCom,
    Import,
]

async def init_db() -> None:

    client = AsyncIOMotorClient(settings.mongo_uri)
    database = client[settings.mongo_db_name]

    await init_beanie(database=database, document_models=DOCUMENT_MODELS)
