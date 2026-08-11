from datetime import datetime

from pydantic import BaseModel


class SavRetourCreate(BaseModel):
    client: str
    cause: str
    reparation_origine: str
    date_retour: datetime


class SavRetourResponse(BaseModel):
    id: str
    client: str
    cause: str
    reparation_origine: str
    cloture: bool
    date_retour: datetime
    created_by: str
    created_at: datetime