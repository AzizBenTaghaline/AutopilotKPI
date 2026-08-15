from datetime import datetime

from pydantic import BaseModel

from app.models.enums import ImportEntityType, ImportStatus


class ImportResponse(BaseModel):
    id: str
    nom_fichier: str
    type_source: str
    entity_type: ImportEntityType
    statut: ImportStatus
    nb_lignes: int
    nb_lignes_succes: int
    nb_lignes_erreur: int
    erreurs: list[str]
    created_by: str
    created_at: datetime