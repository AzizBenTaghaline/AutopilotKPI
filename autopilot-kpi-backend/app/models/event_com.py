from datetime import datetime, timezone

from beanie import Document

from app.models.enums import EventComType


class EventCom(Document):

    titre: str
    type: EventComType
    lieu: str
    date_debut: datetime
    date_fin: datetime | None = None 
    nb_participants: int

    created_by: str
    created_at: datetime = datetime.now(timezone.utc)

    class Settings:
        name = "event_coms"