from datetime import datetime, timezone

from beanie import Document


class KpiEntry(Document):

    kpi_id: str 
    value: float
    period: str
    comment: str | None = None
    submitted_by: str 
    submitted_at: datetime = datetime.now(timezone.utc)

    class Settings:
        name = "kpi_entries"