from datetime import datetime, timezone

from beanie import Document


class EventCom(Document):
    titre: str
    lieu: str
    date_evenement: datetime
    nb_participants: int

    created_by: str  
    created_at: datetime = datetime.now(timezone.utc)

    class Settings:
        name = "event_coms"