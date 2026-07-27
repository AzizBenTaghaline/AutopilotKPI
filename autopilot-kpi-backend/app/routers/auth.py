from fastapi import APIRouter

from app.schemas.user import LoginRequest, TokenResponse
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentification"])


@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest):
    return await AuthService.login(data)
