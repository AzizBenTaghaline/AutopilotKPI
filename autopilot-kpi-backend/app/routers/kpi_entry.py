from fastapi import APIRouter, Depends

from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.kpi_entry import KpiEntryCreate, KpiEntryResponse
from app.services.kpi_entry_service import KpiEntryService

router = APIRouter(prefix="/kpi-entries", tags=["Saisies KPI"])


@router.post("", response_model=KpiEntryResponse)
async def create_entry(data: KpiEntryCreate, current_user: User = Depends(get_current_user)):
    return await KpiEntryService.create_entry(data, current_user)


@router.get("", response_model=list[KpiEntryResponse])
async def list_entries(
    kpi_id: str | None = None,
    period: str | None = None,
    current_user: User = Depends(get_current_user),
):
    return await KpiEntryService.list_entries(current_user, kpi_id, period)