from fastapi import APIRouter, Depends

from app.core.dependencies import get_current_user, require_role
from app.core.permissions import SAV_ROLES
from app.models.enums import OrdreReparationStatut
from app.models.user import User
from app.schemas.ordre_reparation import OrdreReparationCreate, OrdreReparationResponse, OrdreReparationStats
from app.services.ordre_reparation_service import OrdreReparationService

router = APIRouter(prefix="/ordres-reparation", tags=["SAV - Ordres de Réparation"])


@router.post("", response_model=OrdreReparationResponse, dependencies=[Depends(require_role(*SAV_ROLES))])
async def create_ordre(data: OrdreReparationCreate, current_user: User = Depends(get_current_user)):
    return await OrdreReparationService.create(data, current_user)


@router.get("", response_model=list[OrdreReparationResponse], dependencies=[Depends(require_role(*SAV_ROLES))])
async def list_ordres(statut: OrdreReparationStatut | None = None):
    return await OrdreReparationService.list_all(statut)


@router.get("/stats", response_model=OrdreReparationStats, dependencies=[Depends(require_role(*SAV_ROLES))])
async def get_ordres_stats():
    return await OrdreReparationService.get_stats()


@router.patch(
    "/{ordre_id}/facturer",
    response_model=OrdreReparationResponse,
    dependencies=[Depends(require_role(*SAV_ROLES))],
)
async def facturer_ordre(ordre_id: str, current_user: User = Depends(get_current_user)):
    return await OrdreReparationService.facturer(ordre_id, current_user)