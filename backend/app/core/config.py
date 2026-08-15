from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "Personal AI Banking Coach"
    API_V1_STR: str = "/api/v1"
    
    # Database
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "banking_coach"
    DATABASE_URL: Optional[str] = None
    
    # Security
    SECRET_KEY: str = "DEVELOPMENT_SECRET_KEY_CHANGE_IN_PRODUCTION_MIN_32_CHARS"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Hermes Agent & OmniRoute Server Configurations
    HERMES_BASE_URL: str = "https://jishnupg-opencode-cli.hf.space/hermes/v1"
    HERMES_API_KEY: str = "sk-2e556e0437ee2958-7baf2d-b4133935"
    
    OMNIROUTE_BASE_URL: str = "https://jishnupg-opencode-cli.hf.space/v1"
    OMNIROUTE_API_KEY: str = "sk-6646a5f2024f6318-d27ff7-f3e152c8"
    
    # Vector Embeddings
    VECTOR_DIMENSION: int = 1536
    
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    def get_database_url(self) -> str:
        if self.DATABASE_URL:
            return self.DATABASE_URL
        return f"postgresql+psycopg2://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

settings = Settings()
