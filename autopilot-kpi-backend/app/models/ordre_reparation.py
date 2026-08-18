from datetime import datetime, timezone

from beanie import Document

from app.models.enums import OrdreReparationStatut


class OrdreReparation(Document):

    client: str
    statut: OrdreReparationStatut = OrdreReparationStatut.NON_FACTURE
    sous_garantie: bool = False
    montant: float
    date_or: datetime

    created_by: str
    created_at: datetime = datetime.now(timezone.utc)

    class Settings:
        name = "ordres_reparation"