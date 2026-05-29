import os
import redis
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from backend.app.services.ai_service import AIService
from backend.app.tasks.tasks import train_lstm_model_task

# Initialize Redis client
redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
r_client = redis.Redis.from_url(redis_url)

ai_bp = Blueprint("ai", __name__)

@ai_bp.route("/<symbol>/predict")
@jwt_required()
def predict(symbol):
    symbol = symbol.upper().strip()
    days = request.args.get("days", 5)
    interval = request.args.get("interval", "1d")

    try:
        predictions = AIService.generate_forecast(symbol, days, interval)
        return jsonify({"predictions": predictions}), 200
        
    except FileNotFoundError as e:
        # Model file not found on disk, handle background compilation
        status_key = f"training_status:{symbol}_{interval}"
        training_status = r_client.get(status_key)
        
        if not training_status:
            # Set training key with 10-minute timeout
            r_client.set(status_key, "in_progress", ex=600)
            
            # Queue CPU-intensive training task in Celery worker queue
            train_lstm_model_task.delay(symbol, interval)
            
            return jsonify({
                "status": "training",
                "message": "AI neural network model compilation initiated. Training is currently in progress."
            }), 202
        else:
            return jsonify({
                "status": "training",
                "message": "AI model training is already in progress. Please poll again shortly."
            }), 202
            
    except ValueError as e:
        from backend.app.services.monitoring_service import MonitoringService
        msg = str(e)
        status_code = 404 if "no data found" in msg.lower() else 400
        MonitoringService.log_metric(
            metric_type="ai_error",
            message=f"AI data validation warning for {symbol}: {msg}",
            endpoint=f"GET /api/stocks/{symbol}/predict"
        )
        return jsonify({"predictions": [], "message": msg}), status_code
        
    except Exception as e:
        from backend.app.services.monitoring_service import MonitoringService
        import traceback
        traceback.print_exc()
        msg = str(e)
        MonitoringService.log_metric(
            metric_type="ai_error",
            message=f"AI Prediction Controller Error for {symbol}: {msg}",
            endpoint=f"GET /api/stocks/{symbol}/predict"
        )
        return jsonify({"message": f"AI Model Error: {msg}", "predictions": []}), 500
