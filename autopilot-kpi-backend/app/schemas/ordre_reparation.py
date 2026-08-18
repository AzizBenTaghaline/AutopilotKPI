from datetime import datetime

from pydantic import BaseModel

from app.models.enums import OrdreReparationStatut


class OrdreReparationCreate(BaseModel):
    client: str
    sous_garantie: bool = False
    montant: float
    date_or: datetime


class OrdreReparationResponse(BaseModel):
    id: str
    client: str
    statut: OrdreReparationStatut
    sous_garantie: bool
    montant: float
    date_or: datetime
    created_by: str
    created_at: datetime


class OrdreReparationStats(BaseModel):
    total: int
    ouverts: int  
    factures: int
    sous_garantie: int