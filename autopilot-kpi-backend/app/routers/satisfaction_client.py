from fastapi import APIRouter, Depends

from app.core.dependencies import get_current_user, require_role
from app.core.permissions import SAV_ROLES
from app.models.user import User
from app.schemas.satisfaction_client import SatisfactionClientCreate, SatisfactionClientResponse, SatisfactionStats
from app.services.satisfaction_client_service import SatisfactionClientService

router = APIRouter(prefix="/satisfactions", tags=["SAV - Satisfaction Client"])


@router.post("", response_model=SatisfactionClientResponse, dependencies=[Depends(require_role(*SAV_ROLES))])
async def create_satisfaction(data: SatisfactionClientCreate, current_user: User = Depends(get_current_user)):
    return await SatisfactionClientService.create(data, current_user)


@router.get("", response_model=list[SatisfactionClientResponse], dependencies=[Depends(require_role(*SAV_ROLES))])
async def list_satisfactions():
    return await SatisfactionClientService.list_all()


@router.get("/stats", response_model=SatisfactionStats, dependencies=[Depends(require_role(*SAV_ROLES))])
async def get_satisfaction_stats():
    return await SatisfactionClientService.get_stats()