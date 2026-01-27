from pydantic_settings import BaseSettings
from typing import List
import secrets
import os

class Settings(BaseSettings):
    # Application
    APP_NAME: str = "EazyLink"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    ENVIRONMENT: str = "production"
    
    # Security - Use env var, fall back to consistent default
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-fixed-secret-key-for-development-only-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080  # 7 days
    
    # Database
    DATABASE_URL: str
    
    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:8081",
        "http://localhost:19006"
    ]
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60
    RATE_LIMIT_PER_HOUR: int = 1000
    
    # Agora
    AGORA_APP_ID: str = ""
    AGORA_APP_CERTIFICATE: str = ""
    
    # Logging
    LOG_LEVEL: str = "INFO"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
