import os
from pathlib import Path

class Config:
    """Base configuration."""
    SECRET_KEY = os.getenv("SECRET_KEY", "quizzy-dev-secret-key-change-in-production")
    
    # CORS Origins (comma-separated or single URL)
    CORS_ORIGINS = [
        origin.strip()
        for origin in os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
        if origin.strip()
    ]
    
    # Upstream Trivia API
    TRIVIA_API_BASE_URL = os.getenv("TRIVIA_API_BASE_URL", "https://opentdb.com/api.php")
    TRIVIA_API_TIMEOUT = float(os.getenv("TRIVIA_API_TIMEOUT_SECONDS", "10.0"))
    
    # Session configuration
    SESSION_DIR = os.getenv("SESSION_DIR", str(Path(__file__).resolve().parent.parent / ".sessions"))
    SESSION_TTL_SECONDS = int(os.getenv("SESSION_LIFETIME_SECONDS", "7200"))  # 2 hours
    
    TESTING = False
    DEBUG = False


class DevelopmentConfig(Config):
    """Development configuration."""
    DEBUG = True


class TestingConfig(Config):
    """Testing configuration."""
    TESTING = True
    DEBUG = True
    SESSION_TTL_SECONDS = 3600


class ProductionConfig(Config):
    """Production configuration."""
    DEBUG = False


config_by_name = {
    "development": DevelopmentConfig,
    "testing": TestingConfig,
    "production": ProductionConfig,
    "default": DevelopmentConfig,
}
