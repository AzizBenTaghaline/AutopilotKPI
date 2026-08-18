from datetime import datetime, timezone

from beanie import Document


class SatisfactionClient(Document):

    client: str
    note: float
    date_saisie: datetime

    created_by: str
    created_at: datetime = datetime.now(timezone.utc)

    class Settings:
        name = "satisfactions_client"