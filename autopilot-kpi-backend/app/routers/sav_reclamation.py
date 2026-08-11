from fastapi import APIRouter, Depends

from app.core.dependencies import get_current_user, require_role
from app.core.permissions import SAV_ROLES
from app.models.enums import ReclamationStatut
from app.models.user import User
from app.schemas.sav_reclamation import SavReclamationCreate, SavReclamationResponse
from app.services.sav_reclamation_service import SavReclamationService

router = APIRouter(prefix="/sav-reclamations", tags=["SAV - Réclamations"])


@router.post("", response_model=SavReclamationResponse, dependencies=[Depends(require_role(*SAV_ROLES))])
async def create_reclamation(data: SavReclamationCreate, current_user: User = Depends(get_current_user)):
    return await SavReclamationService.create(data, current_user)


@router.get("", response_model=list[SavReclamationResponse], dependencies=[Depends(require_role(*SAV_ROLES))])
async def list_reclamations(statut: ReclamationStatut | None = None):
    return await SavReclamationService.list_all(statut)


@router.patch(
    "/{reclamation_id}/resolve",
    response_model=SavReclamationResponse,
    dependencies=[Depends(require_role(*SAV_ROLES))],
)
async def resolve_reclamation(reclamation_id: str, current_user: User = Depends(get_current_user)):
    return await SavReclamationService.resolve(reclamation_id, current_user)