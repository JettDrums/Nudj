from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    anthropic_api_key: str
    supabase_url: str = ""
    supabase_service_key: str = ""
    jwt_secret: str = "dev-secret-change-in-prod"
    environment: str = "development"

    class Config:
        env_file = ".env"


settings = Settings()
