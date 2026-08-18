from datetime import datetime

from pydantic import BaseModel

from app.models.enums import DevisStatut


class DevisCreate(BaseModel):
    client: str
    marque: str
    montant: float
    date_devis: datetime


class DevisStatutUpdate(BaseModel):
    statut: DevisStatut


class DevisResponse(BaseModel):
    id: str
    client: str
    marque: str
    montant: float
    statut: DevisStatut
    date_devis: datetime
    date_conversion: datetime | None
    created_by: str
    created_at: datetime


class RankingEntry(BaseModel):
    user_id: str
    full_name: str
    total_montant: float
    nb_ventes: int
    is_current_user: bool