from datetime import datetime

from pydantic import BaseModel


class KpiEntryCreate(BaseModel):
    kpi_id: str
    value: float
    period: str
    comment: str | None = None


class KpiEntryResponse(BaseModel):
    id: str
    kpi_id: str
    kpi_code: str
    kpi_name: str
    value: float
    period: str
    comment: str | None
    submitted_by: str
    submitted_at: datetime