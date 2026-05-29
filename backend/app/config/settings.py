import os

# System Environment Settings
DEBUG = os.getenv("FLASK_DEBUG", "False").lower() == "true"
ENV = os.getenv("FLASK_ENV", "production")

# Security Parameters
BCRYPT_LOG_ROUNDS = 12
TOKEN_COOKIE_SECURE = True

# Cache Settings
CACHE_TYPE = "SimpleCache"
CACHE_DEFAULT_TIMEOUT = 300
