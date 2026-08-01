from datetime import datetime, timezone

from beanie import Document, Indexed
from app.models.enums import KpiModule, Periodicity


class Kpi(Document):
    code: Indexed(str, unique=True)
    name: str
    description: str
    module: KpiModule
    periodicity: Periodicity
    unit: str  
    target_value: float | None = None

    is_active: bool = True  
    created_by: str 

    created_at: datetime = datetime.now(timezone.utc)
    updated_at: datetime = datetime.now(timezone.utc)

    class Settings:
        name = "kpis"