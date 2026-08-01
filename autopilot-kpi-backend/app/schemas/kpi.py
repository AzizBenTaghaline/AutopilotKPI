from datetime import datetime

from pydantic import BaseModel

from app.models.enums import KpiModule, Periodicity

class KpiCreate(BaseModel):
    code: str
    name: str
    description: str
    module: KpiModule
    periodicity: Periodicity
    unit: str
    target_value: float | None = None


class KpiUpdate(BaseModel):

    name: str | None = None
    description: str | None = None
    unit: str | None = None
    target_value: float | None = None
    is_active: bool | None = None


class KpiResponse(BaseModel):
    id: str
    code: str
    name: str
    description: str
    module: KpiModule
    periodicity: Periodicity
    unit: str
    target_value: float | None
    is_active: bool
    created_by: str
    created_at: datetime

    model_config = {"from_attributes": True}