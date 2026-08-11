from datetime import datetime

from pydantic import BaseModel

from app.models.enums import ReclamationStatut


class SavReclamationCreate(BaseModel):
    client: str
    cause: str
    date_reclamation: datetime


class SavReclamationResponse(BaseModel):
    id: str
    client: str
    cause: str
    statut: ReclamationStatut
    date_reclamation: datetime
    created_by: str
    created_at: datetime