from datetime import datetime

from pydantic import BaseModel

from app.models.enums import EventComType


class EventComCreate(BaseModel):
    titre: str
    type: EventComType
    lieu: str
    date_debut: datetime
    date_fin: datetime | None = None
    nb_participants: int


class EventComResponse(BaseModel):
    id: str
    titre: str
    type: EventComType
    lieu: str
    date_debut: datetime
    date_fin: datetime | None
    nb_participants: int
    created_by: str
    created_at: datetime


class EventComStats(BaseModel):
    total_evenements: int
    total_participants: int
    moyenne_participants: float