from datetime import datetime, timezone

from beanie import Document

from app.models.enums import DevisStatut


class Devis(Document):
    client: str
    marque: str
    montant: float
    statut: DevisStatut = DevisStatut.EN_COURS

    date_devis: datetime
    date_conversion: datetime | None = None 

    created_by: str 
    created_at: datetime = datetime.now(timezone.utc)

    class Settings:
        name = "devis"