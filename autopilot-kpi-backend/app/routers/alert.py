from fastapi import APIRouter, Depends

from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.alert import AlertResponse
from app.services.alert_service import AlertService

router = APIRouter(prefix="/alerts", tags=["Alertes"])


@router.get("", response_model=list[AlertResponse])
async def list_alerts(current_user: User = Depends(get_current_user)):
    return await AlertService.list_alerts(current_user)