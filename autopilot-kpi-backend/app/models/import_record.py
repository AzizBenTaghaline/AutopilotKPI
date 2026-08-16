from datetime import datetime, timezone

from beanie import Document

from app.models.enums import ImportEntityType, ImportStatus


class Import(Document):

    nom_fichier: str
    type_source: str  
    entity_type: ImportEntityType

    statut: ImportStatus = ImportStatus.PROCESSING
    nb_lignes: int = 0
    nb_lignes_succes: int = 0
    nb_lignes_erreur: int = 0
    erreurs: list[str] = []

    created_by: str
    created_at: datetime = datetime.now(timezone.utc)

    class Settings:
        name = "imports"