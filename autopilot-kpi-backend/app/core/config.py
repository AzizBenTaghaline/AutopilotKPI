from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):

    # MongoDB
    mongo_uri: str
    mongo_db_name: str = "autopilot_kpi"

    # Sécurité JWT
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    # Divers
    app_env: str = "development"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


# Instance unique réutilisée dans toute l'application
settings = Settings()
