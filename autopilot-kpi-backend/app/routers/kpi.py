from fastapi import APIRouter, Depends

from app.models.enums import KpiModule, UserRole
from app.models.user import User
from app.core.dependencies import get_current_user, require_role
from app.schemas.kpi import KpiCreate, KpiResponse, KpiUpdate
from app.services.kpi_service import KpiService

router = APIRouter(prefix="/kpis", tags=["Catalogue KPI"])


@router.post(
    "",
    response_model=KpiResponse,
    dependencies=[Depends(require_role(UserRole.ADMINISTRATEUR, UserRole.MANAGER))],
)
async def create_kpi(data: KpiCreate, current_user: User = Depends(get_current_user)):
    return await KpiService.create_kpi(data, created_by=str(current_user.id))


@router.get("", response_model=list[KpiResponse])
async def list_kpis(module: KpiModule | None = None, current_user: User = Depends(get_current_user)):
    return await KpiService.list_kpis(module, current_user)


@router.get("/{kpi_id}", response_model=KpiResponse)
async def get_kpi(kpi_id: str, current_user: User = Depends(get_current_user)):
    return await KpiService.get_kpi(kpi_id, current_user)

@router.patch(
    "/{kpi_id}",
    response_model=KpiResponse,
    dependencies=[Depends(require_role(UserRole.ADMINISTRATEUR, UserRole.MANAGER))],
)
async def update_kpi(kpi_id: str, data: KpiUpdate):
    return await KpiService.update_kpi(kpi_id, data)


@router.delete(
    "/{kpi_id}",
    status_code=204,
    dependencies=[Depends(require_role(UserRole.ADMINISTRATEUR, UserRole.MANAGER))],
)
async def delete_kpi(kpi_id: str):
    await KpiService.delete_kpi(kpi_id)