from datetime import datetime, timezone

from beanie import Document

from app.models.enums import KpiModule


class Alert(Document):
    kpi_id: str
    kpi_code: str  
    kpi_name: str
    module: KpiModule

    entry_id: str 
    period: str
    target_value: float
    actual_value: float

    created_at: datetime = datetime.now(timezone.utc)

    class Settings:
        name = "alerts"