from fastapi import HTTPException, status
from datetime import datetime, timezone
from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User
from app.schemas.user import (
    LoginRequest,
    RefreshRequest,
    TokenResponse,
    UserCreate,
    UserResponse,
    UserUpdate,
)
from app.models.refresh_token import RefreshToken
from app.core.security import create_access_token, create_refresh_token, decode_token, hash_password, verify_password
class AuthService:
    @staticmethod
    async def login(data: LoginRequest) -> TokenResponse:
        user = await User.find_one(User.email == data.email)

        if not user or not verify_password(data.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email ou mot de passe incorrect",
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Ce compte a été désactivé",
            )

        return await AuthService._issue_tokens(user)

    @staticmethod
    async def _issue_tokens(user: User) -> TokenResponse:
        access_token = create_access_token(subject=str(user.id), role=user.role.value)
        refresh_token, jti, expires_at = create_refresh_token(subject=str(user.id))

        await RefreshToken(
            jti=jti,
            user_id=str(user.id),
            expires_at=expires_at,
            created_at=datetime.now(timezone.utc),
        ).insert()

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            user=UserResponse(
                id=str(user.id),
                email=user.email,
                full_name=user.full_name,
                role=user.role,
                is_active=user.is_active,
                created_at=user.created_at,
            ),
        )

    @staticmethod
    async def create_user(data: UserCreate) -> UserResponse:

        existing = await User.find_one(User.email == data.email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Un compte existe déjà avec cet email",
            )

        user = User(
            email=data.email,
            hashed_password=hash_password(data.password),
            full_name=data.full_name,
            role=data.role,
        )
        await user.insert()

        return UserResponse(
            id=str(user.id),
            email=user.email,
            full_name=user.full_name,
            role=user.role,
            is_active=user.is_active,
            created_at=user.created_at,
        )
    @staticmethod
    async def list_users() -> list[UserResponse]:
        users = await User.find_all().to_list()
        return [
            UserResponse(
                id=str(u.id),
                email=u.email,
                full_name=u.full_name,
                role=u.role,
                is_active=u.is_active,
                created_at=u.created_at,
            )
            for u in users
        ]

    @staticmethod
    async def get_user(user_id: str) -> UserResponse:
        user = await User.get(user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Utilisateur introuvable")
        return UserResponse(
            id=str(user.id),
            email=user.email,
            full_name=user.full_name,
            role=user.role,
            is_active=user.is_active,
            created_at=user.created_at,
        )

    @staticmethod
    async def update_user(user_id: str, data: UserUpdate) -> UserResponse:
        user = await User.get(user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Utilisateur introuvable")
        updates = data.model_dump(exclude_unset=True)
        for field, value in updates.items():
            setattr(user, field, value)

        await user.save()

        return UserResponse(
            id=str(user.id),
            email=user.email,
            full_name=user.full_name,
            role=user.role,
            is_active=user.is_active,
            created_at=user.created_at,
        )

    @staticmethod
    async def refresh(data: RefreshRequest) -> TokenResponse:
        try:
            payload = decode_token(data.refresh_token)
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresh token invalide ou expiré",
            )

        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresh token invalide",
            )

        jti = payload.get("jti")
        stored = await RefreshToken.find_one(RefreshToken.jti == jti)

        if not stored or stored.revoked:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresh token révoqué ou introuvable",
            )

        user = await User.get(payload.get("sub"))
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Compte introuvable ou désactivé",
            )

        stored.revoked = True
        await stored.save()

        return await AuthService._issue_tokens(user)

    @staticmethod
    async def logout(data: RefreshRequest) -> None:
        try:
            payload = decode_token(data.refresh_token)
        except Exception:
            return 

        jti = payload.get("jti")
        stored = await RefreshToken.find_one(RefreshToken.jti == jti)
        if stored:
            stored.revoked = True
            await stored.save()