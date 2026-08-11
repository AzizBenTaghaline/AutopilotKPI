from datetime import datetime, timezone

from beanie import Document


class SavRetour(Document):

    client: str
    cause: str
    reparation_origine: str
    cloture: bool = False
    date_retour: datetime

    created_by: str
    created_at: datetime = datetime.now(timezone.utc)

    class Settings:
        name = "sav_retours"

    def cloturer(self) -> None:
        self.cloture = True