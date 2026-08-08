from datetime import datetime

from pydantic import BaseModel

from app.models.enums import KpiModule


class AlertResponse(BaseModel):
    id: str
    kpi_id: str
    kpi_code: str
    kpi_name: str
    module: KpiModule
    entry_id: str
    period: str
    target_value: float
    actual_value: float
    created_at: datetime