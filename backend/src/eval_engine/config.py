from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """Configuration settings for the application."""
    app_name: str = "Ajna Evaluation Engine"
    debug: bool = False
    host: str = "0.0.0.0"
    port: int = 8000
    cors_origins: list[str] = [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "*"
    ]
    vision_fps: int = 5
    audio_sample_rate: int = 16000
    audio_chunk_ms: int = 32
    asr_chunk_seconds: float = 3.0
    temporal_window_seconds: float = 5.0
    whisper_model: str = "large-v3-turbo"
    llm_model: str = "gemini-2.5-flash"
    max_session_duration: int = 7200

    # Authentication & Security
    jwt_secret_key: str = "antigravity-multimodal-intelligence-engine-secure-key-2026-enterprise-auth"
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 120
    jwt_refresh_token_expire_days: int = 7
    ws_ticket_expire_seconds: int = 60

    # MongoDB Persistence
    mongodb_uri: str = "mongodb://localhost:27017"
    mongodb_db_name: str = "mhei"

    class Config:
        env_file = ".env"

settings = Settings()

