from fastapi import APIRouter, Depends

from app.models.enums import UserRole
from app.core.dependencies import require_role
from app.schemas.user import UserCreate, UserResponse
from app.services.auth_service import AuthService

router = APIRouter(prefix="/users", tags=["Utilisateurs"])


@router.post(
    "",
    response_model=UserResponse,
    dependencies=[Depends(require_role(UserRole.ADMINISTRATEUR))],
)
async def create_user(data: UserCreate):
    return await AuthService.create_user(data)