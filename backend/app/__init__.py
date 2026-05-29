from flask import Flask, jsonify
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from backend.app.config.config import Config, config_by_name
from backend.app.middleware.error_handler import register_error_handlers

import os

from backend.app.database.db import db
from flask_migrate import Migrate

bcrypt = Bcrypt()
jwt = JWTManager()
migrate = Migrate()


# Load rate limits directly at import time from environment settings
raw_limits = os.getenv("RATELIMIT_DEFAULT", "200 per day;50 per hour")
default_limits = [limit.strip() for limit in raw_limits.split(";") if limit.strip()]

# Global API Limiter instance
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=default_limits
)

def create_app(config_name=None):
    if not config_name:
        config_name = os.getenv("FLASK_ENV", "development").lower()
        
    config_class = config_by_name.get(config_name, config_by_name["development"])
    
    # Instantiate if it is a class type (to execute validation logic)
    if isinstance(config_class, type):
        config_class = config_class()

    app = Flask(__name__)
    app.config.from_object(config_class)

    # Expose SQLALCHEMY_DATABASE_URI dynamic property value
    app.config["SQLALCHEMY_DATABASE_URI"] = config_class.SQLALCHEMY_DATABASE_URI

    # Production-ready SQLAlchemy connection pooling configuration
    app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
        "pool_size": 10,
        "max_overflow": 20,
        "pool_recycle": 1800,  # Recycle connection after 30 minutes
        "pool_pre_ping": True  # Check if connection is alive before querying
    }

    # Initialize rate limiting
    limiter.init_app(app)

    # Configure dynamic CORS based on environment configuration
    raw_origins = app.config.get("CORS_ALLOWED_ORIGINS", "")
    allowed_origins = [origin.strip() for origin in raw_origins.split(",") if origin.strip()]
    
    CORS(
        app,
        resources={
            r"/api/*": {
                "origins": allowed_origins if allowed_origins else "*",
                "supports_credentials": True,
            }
        },
    )
    bcrypt.init_app(app)
    jwt.init_app(app)
    db.init_app(app)
    migrate.init_app(app, db)


    # Import blueprints
    from backend.app.routes.auth_routes import auth_bp
    from backend.app.routes.stock_routes import stock_bp
    from backend.app.routes.trade_routes import trade_bp
    from backend.app.routes.admin_routes import admin_bp
    from backend.app.routes.ai_routes import ai_bp
    from backend.app.routes.report_routes import report_bp
    from backend.app.routes.market_routes import market_bp
    from backend.app.routes.contact_routes import contact_bp
    from backend.app.routes.wallet_routes import wallet_bp

    # Register blueprints with exact legacy matching prefixes
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(stock_bp, url_prefix="/api/stocks")
    app.register_blueprint(trade_bp, url_prefix="/api/trade")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")
    app.register_blueprint(ai_bp, url_prefix="/api/stocks")  # Nest predictions under stocks prefix
    app.register_blueprint(report_bp, url_prefix="/api/reports")
    app.register_blueprint(market_bp, url_prefix="/api/market")
    app.register_blueprint(contact_bp, url_prefix="/api/contact")
    app.register_blueprint(wallet_bp, url_prefix="/api/wallet")

    # Global Error handling registrar
    register_error_handlers(app)

    # Dynamic Response Latency Profiler Hook
    import time
    from flask import request, g
    from backend.app.services.monitoring_service import MonitoringService

    @app.before_request
    def start_timer():
        g.start_time = time.time()

    @app.after_request
    def log_response_time(response):
        if hasattr(g, 'start_time'):
            if request.path.startswith("/api/"):
                duration = round((time.time() - g.start_time) * 1000, 2)
                # Omit monitoring routes to prevent feedback logging loops
                if not request.path.endswith("/monitoring/stats"):
                    MonitoringService.log_metric(
                        metric_type="performance",
                        message=f"Request status {response.status_code}",
                        execution_time=duration,
                        endpoint=f"{request.method} {request.path}"
                    )
        return response

    @app.route("/")
    def home():
        return jsonify({
            "status": "online",
            "message": "Stock Price Prediction Platform Backend Running"
        }), 200

    return app
