from datetime import datetime

from pydantic import BaseModel


class SatisfactionClientCreate(BaseModel):
    client: str
    note: float
    date_saisie: datetime


class SatisfactionClientResponse(BaseModel):
    id: str
    client: str
    note: float
    date_saisie: datetime
    created_by: str
    created_at: datetime


class SatisfactionStats(BaseModel):
    moyenne: float
    nb_saisies: int