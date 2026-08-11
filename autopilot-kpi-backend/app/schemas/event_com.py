from datetime import datetime

from pydantic import BaseModel


class EventComCreate(BaseModel):
    titre: str
    lieu: str
    date_evenement: datetime
    nb_participants: int


class EventComResponse(BaseModel):
    id: str
    titre: str
    lieu: str
    date_evenement: datetime
    nb_participants: int
    created_by: str
    created_at: datetime


class EventComStats(BaseModel):
    """Correspond à getStats() du diagramme de classes."""

    total_evenements: int
    total_participants: int
    moyenne_participants: float