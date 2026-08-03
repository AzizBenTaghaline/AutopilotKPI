from app.models.enums import KpiModule
from pydantic import BaseModel


class DashboardItem(BaseModel):
    kpi_id: str
    kpi_code: str
    kpi_name: str
    module: KpiModule
    unit: str
    period: str | None  
    target_value: float | None
    current_value: float | None
    has_entry: bool