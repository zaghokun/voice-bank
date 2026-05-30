from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./voicebank.db"
    JWT_SECRET: str = "secret-key-development-only"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 1440
    FRONTEND_URL: str = "http://localhost:5173"
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    REDIS_URL: str = "redis://localhost:6379"

    class Config:
        env_file = ".env"

settings = Settings()