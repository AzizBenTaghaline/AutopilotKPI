from datetime import datetime

from beanie import Document, Indexed


class RefreshToken(Document):

    jti: Indexed(str, unique=True)  
    user_id: str
    expires_at: datetime
    revoked: bool = False
    created_at: datetime

    class Settings:
        name = "refresh_tokens"