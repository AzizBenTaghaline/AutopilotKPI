from fastapi import APIRouter, Depends

from app.core.dependencies import get_current_user, require_role
from app.core.permissions import SAV_ROLES
from app.models.user import User
from app.schemas.sav_retour import SavRetourCreate, SavRetourResponse
from app.services.sav_retour_service import SavRetourService

router = APIRouter(prefix="/sav-retours", tags=["SAV - Retours"])


@router.post("", response_model=SavRetourResponse, dependencies=[Depends(require_role(*SAV_ROLES))])
async def create_retour(data: SavRetourCreate, current_user: User = Depends(get_current_user)):
    return await SavRetourService.create(data, current_user)


@router.get("", response_model=list[SavRetourResponse], dependencies=[Depends(require_role(*SAV_ROLES))])
async def list_retours(cloture: bool | None = None):
    return await SavRetourService.list_all(cloture)


@router.patch(
    "/{retour_id}/cloturer",
    response_model=SavRetourResponse,
    dependencies=[Depends(require_role(*SAV_ROLES))],
)
async def cloturer_retour(retour_id: str, current_user: User = Depends(get_current_user)):
    return await SavRetourService.cloturer(retour_id, current_user)