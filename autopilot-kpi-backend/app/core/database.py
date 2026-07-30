from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie

from app.core.config import settings
from app.models.user import User
from app.models.refresh_token import RefreshToken
from app.models.kpi import Kpi

DOCUMENT_MODELS: list = [
    User,
    RefreshToken,
    Kpi,
]


async def init_db() -> None:

    client = AsyncIOMotorClient(settings.mongo_uri)
    database = client[settings.mongo_db_name]

    await init_beanie(database=database, document_models=DOCUMENT_MODELS)
