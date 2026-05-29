import os
from dotenv import load_dotenv

# Ensure environment variables are loaded
load_dotenv()

class Config:
    """Base shared configuration defaults."""
    FLASK_ENV = "production"
    FLASK_DEBUG = False
    TESTING = False

    # Flask application settings
    SECRET_KEY = os.getenv("SECRET_KEY")
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    
    # JWT Settings
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
    JWT_TOKEN_LOCATION = ['cookies']
    JWT_ACCESS_COOKIE_PATH = '/'
    JWT_REFRESH_COOKIE_PATH = '/api/auth/refresh'
    JWT_COOKIE_CSRF_PROTECT = False
    JWT_ACCESS_TOKEN_EXPIRES = 1800  # 30 minutes
    JWT_REFRESH_TOKEN_EXPIRES = 2592000  # 30 days
    JWT_COOKIE_SECURE = False 

    # Database Settings
    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_USER = os.getenv("DB_USER", "root")
    DB_PASSWORD = os.getenv("DB_PASSWORD")
    DB_NAME = os.getenv("DB_NAME", "stock_prediction")
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # System Preferences
    SUPER_ADMIN_EMAIL = os.getenv("SUPER_ADMIN_EMAIL", "40tarun02@gmail.com")

    # Dynamic CORS configurations (Comma-separated list of origins)
    CORS_ALLOWED_ORIGINS = os.getenv(
        "CORS_ALLOWED_ORIGINS", 
        "http://localhost:5173,http://127.0.0.1:5173,http://localhost:5500,http://127.0.0.1:5500"
    )

    # API Rate Limiting Config (Semicolon-separated limits)
    RATELIMIT_DEFAULT = os.getenv("RATELIMIT_DEFAULT", "200 per day;50 per hour")

class DevelopmentConfig(Config):
    FLASK_ENV = "development"
    FLASK_DEBUG = True
    
    # Dev-only fallbacks
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-insecure-flask-secret-key-change-me")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-secret-key-123")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "Tarun@2004")
    
    @property
    def SQLALCHEMY_DATABASE_URI(self):
        pwd_part = f":{self.DB_PASSWORD}" if self.DB_PASSWORD else ""
        return os.getenv("DATABASE_URL") or f"mysql+mysqlconnector://{self.DB_USER}{pwd_part}@{self.DB_HOST}/{self.DB_NAME}"

class StagingConfig(Config):
    FLASK_ENV = "staging"
    FLASK_DEBUG = True  # Keep debug active in staging for diagnostics
    TESTING = True      # Enable testing context
    
    # Staging default overrides
    DB_NAME = os.getenv("DB_NAME", "stock_prediction_staging")
    SECRET_KEY = os.getenv("SECRET_KEY", "staging-insecure-flask-secret-key-change-me")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "staging-secret-key-123")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "Tarun@2004")
    
    @property
    def SQLALCHEMY_DATABASE_URI(self):
        pwd_part = f":{self.DB_PASSWORD}" if self.DB_PASSWORD else ""
        return os.getenv("DATABASE_URL") or f"mysql+mysqlconnector://{self.DB_USER}{pwd_part}@{self.DB_HOST}/{self.DB_NAME}"

class ProductionConfig(Config):
    FLASK_ENV = "production"
    FLASK_DEBUG = False
    
    # Strict security session settings in production
    SESSION_COOKIE_SECURE = True
    JWT_COOKIE_SECURE = True
    
    def __init__(self):
        # Strict validation checks for mandatory variables
        if not self.SECRET_KEY:
            raise ValueError("CRITICAL: SECRET_KEY environment variable must be set in production mode!")
        if not self.JWT_SECRET_KEY:
            raise RuntimeError("Environment variable JWT_SECRET_KEY must be set in production.")
        if not self.DB_PASSWORD:
            raise RuntimeError("Environment variable DB_PASSWORD must be set in production.")

    @property
    def SQLALCHEMY_DATABASE_URI(self):
        # Production strictly uses the DATABASE_URL connection variable
        uri = os.getenv("DATABASE_URL")
        if not uri:
            raise RuntimeError("CRITICAL: DATABASE_URL must be specified in production.")
        return uri

# Environment mapping
config_by_name = {
    "development": DevelopmentConfig,
    "staging": StagingConfig,
    "production": ProductionConfig
}
