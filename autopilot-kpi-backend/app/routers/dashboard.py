from fastapi import APIRouter, Depends

from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.dashboard import DashboardItem
from app.services.dashboard_service import DashboardService

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("", response_model=list[DashboardItem])
async def get_dashboard(current_user: User = Depends(get_current_user)):
    return await DashboardService.get_dashboard(current_user)