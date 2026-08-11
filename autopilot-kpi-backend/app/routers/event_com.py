from fastapi import APIRouter, Depends

from app.core.dependencies import get_current_user, require_role
from app.core.permissions import COMMERCIAL_ROLES
from app.models.user import User
from app.schemas.event_com import EventComCreate, EventComResponse, EventComStats
from app.services.event_com_service import EventComService

router = APIRouter(prefix="/event-coms", tags=["Commercial - Événements"])


@router.post("", response_model=EventComResponse, dependencies=[Depends(require_role(*COMMERCIAL_ROLES))])
async def create_event(data: EventComCreate, current_user: User = Depends(get_current_user)):
    return await EventComService.create(data, current_user)


@router.get("", response_model=list[EventComResponse], dependencies=[Depends(require_role(*COMMERCIAL_ROLES))])
async def list_events():
    return await EventComService.list_all()


@router.get("/stats", response_model=EventComStats, dependencies=[Depends(require_role(*COMMERCIAL_ROLES))])
async def get_event_stats():
    return await EventComService.get_stats()