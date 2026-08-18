from fastapi import APIRouter, Depends

from app.core.dependencies import get_current_user, require_role
from app.core.permissions import COMMERCIAL_ROLES
from app.models.user import User
from app.schemas.devis import DevisCreate, DevisResponse, DevisStatutUpdate, RankingEntry
from app.services.devis_service import DevisService

router = APIRouter(prefix="/devis", tags=["Devis"])


@router.post("", response_model=DevisResponse, dependencies=[Depends(require_role(*COMMERCIAL_ROLES))])
async def create_devis(data: DevisCreate, current_user: User = Depends(get_current_user)):
    return await DevisService.create(data, current_user)


@router.get("", response_model=list[DevisResponse], dependencies=[Depends(require_role(*COMMERCIAL_ROLES))])
async def list_devis(current_user: User = Depends(get_current_user)):
    return await DevisService.list_devis(current_user)


@router.patch(
    "/{devis_id}/statut",
    response_model=DevisResponse,
    dependencies=[Depends(require_role(*COMMERCIAL_ROLES))],
)
async def update_devis_statut(devis_id: str, data: DevisStatutUpdate, current_user: User = Depends(get_current_user)):
    return await DevisService.update_statut(devis_id, data, current_user)


@router.get(
    "/ranking/commerciaux",
    response_model=list[RankingEntry],
    dependencies=[Depends(require_role(*COMMERCIAL_ROLES))],
)
async def get_ranking(period: str | None = None, current_user: User = Depends(get_current_user)):
    return await DevisService.get_ranking(period, current_user)