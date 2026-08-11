from datetime import datetime, timezone
from beanie import Document

from app.models.enums import ReclamationStatut

class SavReclamation(Document):

    client: str
    cause: str
    statut: ReclamationStatut = ReclamationStatut.OUVERTE
    date_reclamation: datetime

    created_by: str
    created_at: datetime = datetime.now(timezone.utc)

    class Settings:
        name = "sav_reclamations"

    def resolve(self) -> None:
        self.statut = ReclamationStatut.RESOLUE