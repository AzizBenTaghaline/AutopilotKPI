from fastapi import APIRouter, Depends

from app.models.enums import UserRole
from app.models.user import User
from app.core.dependencies import get_current_user, require_role
from app.schemas.user import UserCreate, UserResponse, UserUpdate
from app.services.auth_service import AuthService

router = APIRouter(prefix="/users", tags=["Utilisateurs"])


@router.post(
    "",
    response_model=UserResponse,
    dependencies=[Depends(require_role(UserRole.ADMINISTRATEUR))],
)
async def create_user(data: UserCreate, current_user: User = Depends(get_current_user)):
    return await AuthService.create_user(data, current_user)


@router.get(
    "",
    response_model=list[UserResponse],
    dependencies=[Depends(require_role(UserRole.ADMINISTRATEUR))],
)
async def list_users():
    return await AuthService.list_users()


@router.get("/me", response_model=UserResponse)
async def get_my_profile(current_user: User = Depends(get_current_user)):
    return await AuthService.get_user(str(current_user.id))


@router.patch(
    "/{user_id}",
    response_model=UserResponse,
    dependencies=[Depends(require_role(UserRole.ADMINISTRATEUR))],
)
async def update_user(user_id: str, data: UserUpdate, current_user: User = Depends(get_current_user)):
    return await AuthService.update_user(user_id, data, current_user)