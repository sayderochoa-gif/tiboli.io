from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "Riwi HSE Attendance API"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    DATABASE_URL: str = "sqlite:///./riwi_hse.db"
    
    # Orígenes permitidos para CORS (Frontend)
    CORS_ORIGINS: List[str] = ["*"]
    
    # Directorio para almacenar evidencias y soportes subidos
    UPLOAD_DIR: str = "./uploads"

    # Configuración de la API externa de Coders (para cuando el TL entregue datos)
    EXTERNAL_CODERS_API_URL: str = "https://api.riwi.io/v1/coders"
    EXTERNAL_CODERS_API_TOKEN: str = "placeholder_token"
    USE_MOCK_CODERS_API: bool = True  # True por defecto hasta tener la API real del TL

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
