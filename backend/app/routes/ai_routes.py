from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from backend.app.services.ai_service import AIService

ai_bp = Blueprint("ai", __name__)

@ai_bp.route("/<symbol>/predict")
@jwt_required()
def predict(symbol):
    days = request.args.get("days", 5)
    interval = request.args.get("interval", "1d")

    try:
        predictions = AIService.generate_forecast(symbol, days, interval)
        return jsonify({"predictions": predictions}), 200
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
