import os
from pathlib import Path
from typing import List, Optional
try:
    from pydantic_settings import BaseSettings
except ImportError:
    from pydantic import BaseSettings

BACKEND_DIR = Path(__file__).resolve().parent.parent.parent

class Settings(BaseSettings):
    PROJECT_NAME: str = "FoodRescue AI Backend"
    API_V1_STR: str = "/api/v1"
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173", 
        "http://127.0.0.1:5173", 
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:4173",
        "http://127.0.0.1:4173"
    ]

    # Database parameters loaded strictly from environment variables without hardcoded credentials
    DATABASE_URL: Optional[str] = None
    DB_HOST: Optional[str] = None
    DB_PORT: Optional[str] = None
    DB_USER: Optional[str] = None
    DB_PASSWORD: Optional[str] = None
    DB_NAME: Optional[str] = None

    # Google Gemini AI configuration loaded strictly from environment
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-3.8-flash"
    GEMINI_TIMEOUT_SECONDS: float = 12.0
    GEMINI_THINKING_LEVEL: str = "low"

    # Optional Twilio SMS Gateway configuration loaded strictly from environment
    TWILIO_ACCOUNT_SID: Optional[str] = None
    TWILIO_AUTH_TOKEN: Optional[str] = None
    TWILIO_PHONE_NUMBER: Optional[str] = None

    # Optional SMTP Email Service configuration loaded strictly from environment
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    SMTP_FROM_EMAIL: Optional[str] = None
    SMTP_USE_TLS: bool = True

    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        if self.DATABASE_URL:
            if self.DATABASE_URL.startswith("sqlite:///./") or self.DATABASE_URL.startswith("sqlite:////"):
                clean_path = self.DATABASE_URL.replace("sqlite:///./", "").replace("sqlite:////", "")
                return f"sqlite:///{BACKEND_DIR / clean_path}"
            return self.DATABASE_URL
        if self.DB_HOST and self.DB_USER and self.DB_NAME:
            pwd = f":{self.DB_PASSWORD}" if self.DB_PASSWORD else ""
            port = f":{self.DB_PORT}" if self.DB_PORT else ""
            return f"postgresql://{self.DB_USER}{pwd}@{self.DB_HOST}{port}/{self.DB_NAME}"
        # Default fallback to SQLite file database anchored to backend directory
        return f"sqlite:///{BACKEND_DIR / 'foodrescue.db'}"

    class Config:
        env_file = str(BACKEND_DIR / ".env")
        extra = "ignore"

settings = Settings()

