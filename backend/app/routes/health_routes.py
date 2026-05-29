import os
import redis
from flask import Blueprint, jsonify
from sqlalchemy.sql import text
from backend.app.database.db import db
from backend.app.models.user_model import User
from backend.app.models.stock_model import UserStock
from backend.app.models.transaction_model import Transaction

health_bp = Blueprint("health", __name__)

# Initialize Redis connection
redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
r_client = redis.Redis.from_url(redis_url)

@health_bp.route("/health", methods=["GET"])
def health_check():
    db_healthy = False
    redis_healthy = False
    details = {}

    # 1. Verify SQL Database connectivity
    try:
        db.session.execute(text("SELECT 1"))
        db_healthy = True
        details["database"] = "healthy"
    except Exception as e:
        details["database"] = f"unhealthy: {str(e)}"

    # 2. Verify Redis Cache connectivity
    try:
        r_client.ping()
        redis_healthy = True
        details["redis"] = "healthy"
    except Exception as e:
        details["redis"] = f"unhealthy: {str(e)}"

    # 3. Collect core platform telemetry metrics if system is healthy
    if db_healthy:
        try:
            total_users = User.query.count()
            total_positions = UserStock.query.count()
            total_transactions = Transaction.query.count()
            
            details["telemetry"] = {
                "total_registered_users": total_users,
                "total_active_holdings": total_positions,
                "total_simulated_transactions": total_transactions
            }
        except Exception as e:
            details["telemetry_error"] = str(e)

    status_code = 200 if (db_healthy and redis_healthy) else 500
    response_payload = {
        "status": "online" if status_code == 200 else "degraded",
        "services": details
    }
    
    return jsonify(response_payload), status_code
