from fastapi import APIRouter, status

from app.schemas.user import LoginRequest, RefreshRequest, TokenResponse
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentification"])


@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest):
    return await AuthService.login(data)


@router.post("/refresh", response_model=TokenResponse)
async def refresh(data: RefreshRequest):
    return await AuthService.refresh(data)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(data: RefreshRequest):
    await AuthService.logout(data)