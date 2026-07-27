from datetime import datetime, timezone

import pymongo
from beanie import Document, Indexed
from pydantic import EmailStr

from app.models.enums import UserRole


class User(Document):

    email: Indexed(EmailStr, unique=True)  
    hashed_password: str 
    full_name: str
    role: UserRole

    is_active: bool = True 

    created_at: datetime = datetime.now(timezone.utc)
    updated_at: datetime = datetime.now(timezone.utc)

    class Settings:
        name = "users" 
        indexes = [
            [("email", pymongo.ASCENDING)],
        ]

    class Config:
        json_schema_extra = {
            "example": {
                "email": "admin@autopilotkpi.com",
                "full_name": "Amine Ben Salah",
                "role": "administrateur",
                "is_active": True,
            }
        }
