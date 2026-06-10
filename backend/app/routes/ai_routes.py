import os
import redis
import threading
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from backend.app.services.ai_service import AIService
from backend.app.tasks.tasks import train_lstm_model_task

# Initialize Redis client
redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
r_client = redis.Redis.from_url(redis_url)

# In-memory fallbacks if Redis/Celery are down
_IN_MEMORY_TRAINING_STATUS = {}
_status_lock = threading.Lock()

ai_bp = Blueprint("ai", __name__)

@ai_bp.route("/<symbol>/predict")
@jwt_required()
def predict(symbol):
    symbol = symbol.upper().strip()
    days = request.args.get("days", 5)
    interval = request.args.get("interval", "1d")

    try:
        predictions = AIService.generate_forecast(symbol, days, interval)
        
        # Log prediction activity in user_activities
        user_id = None
        try:
            from flask_jwt_extended import get_jwt_identity
            user_id_str = get_jwt_identity()
            if user_id_str:
                user_id = int(user_id_str)
        except Exception:
            pass

        if user_id:
            try:
                from backend.app.database.db import db
                from backend.app.models.activity_model import UserActivity
                activity = UserActivity(
                    user_id=user_id,
                    action="prediction",
                    details=f"Generated AI forecast for {symbol} ({interval})"
                )
                db.session.add(activity)
                db.session.commit()
            except Exception as act_err:
                db.session.rollback()
                print(f"Error logging prediction activity: {act_err}")

        return jsonify({"predictions": predictions}), 200
        
    except FileNotFoundError as e:
        # Model file not found on disk, handle background compilation
        status_key = f"training_status:{symbol}_{interval}"
        
        # Try to use Redis, fallback to in-memory dictionary on failure
        use_redis = False
        training_status = None
        try:
            training_status = r_client.get(status_key)
            if training_status:
                training_status = training_status.decode("utf-8") if isinstance(training_status, bytes) else training_status
            use_redis = True
        except Exception:
            # Fall back to in-memory tracking
            with _status_lock:
                training_status = _IN_MEMORY_TRAINING_STATUS.get(status_key)

        if training_status and training_status.startswith("failed:"):
            # Training failed previously, extract error message and return error
            err_msg = training_status.split("failed:", 1)[1].strip()
            try:
                r_client.delete(status_key)
            except Exception:
                pass
            with _status_lock:
                _IN_MEMORY_TRAINING_STATUS.pop(status_key, None)
                
            return jsonify({
                "message": f"AI model training failed: {err_msg}",
                "predictions": []
            }), 400

        if not training_status:
            # Mark as in progress
            if use_redis:
                try:
                    r_client.set(status_key, "in_progress", ex=600)
                except Exception:
                    use_redis = False
            
            if not use_redis:
                with _status_lock:
                    _IN_MEMORY_TRAINING_STATUS[status_key] = "in_progress"
            
            # Try to queue via Celery, fallback to daemon thread if Celery/Redis fails
            celery_queued = False
            try:
                train_lstm_model_task.delay(symbol, interval)
                celery_queued = True
                print(f"DEBUG: Successfully queued AI training for {symbol} ({interval}) via Celery.")
            except Exception as celery_err:
                print(f"Warning: Celery queueing failed ({celery_err}). Falling back to local daemon thread.")
                
            if not celery_queued:
                # Trigger training in a background daemon thread
                def local_training_worker(sym, inter):
                    success = False
                    try:
                        print(f"Local Thread [Task Started]: Initiating AI network training for {sym} ({inter})")
                        # Perform the actual training
                        from backend.app.services.stock_service import StockService
                        from backend.app.ai.prediction.predict import get_model_path
                        from backend.app.ai.training.preprocess import prepare_data
                        from backend.app.ai.training.train_model import build_model
                        
                        # Determine validation limits based on interval
                        if inter == "1m":
                             period_key = "1m"
                             min_data_points = 75 
                        elif inter == "5m":
                             period_key = "5m"
                             min_data_points = 75
                        elif inter == "15m":
                             period_key = "15m"
                             min_data_points = 75
                        else:
                             period_key = "2y" # default for daily
                             min_data_points = 75

                        hist = StockService.get_history(sym, period_key)
                        if hist.empty:
                             raise ValueError("No historical price feeds found for symbol")

                        closes = hist["close"].astype(float).tolist()
                        if len(closes) < min_data_points:
                             raise ValueError(f"Insufficient data (need {min_data_points}, got {len(closes)})")

                        look_back = 60
                        X, y, scaler, scaled_prices = prepare_data(closes, look_back)
                        model = build_model((X.shape[1], 1))
                        model.fit(X, y, epochs=5, batch_size=32, verbose=0)

                        model_path = get_model_path(sym, inter)
                        os.makedirs(os.path.dirname(model_path), exist_ok=True)
                        model.save(model_path)
                        print(f"Local Thread [Success]: Model compiled and saved to {model_path}")
                        success = True
                    except Exception as train_err:
                        print(f"Local Thread [Error]: Training failed: {train_err}")
                        try:
                            r_client.set(status_key, f"failed: {str(train_err)}", ex=300)
                        except Exception:
                            pass
                        with _status_lock:
                            _IN_MEMORY_TRAINING_STATUS[status_key] = f"failed: {str(train_err)}"
                    finally:
                        if success:
                            # Clean up status key only on success
                            try:
                                r_client.delete(status_key)
                            except Exception:
                                pass
                            with _status_lock:
                                _IN_MEMORY_TRAINING_STATUS.pop(status_key, None)

                t = threading.Thread(target=local_training_worker, args=(symbol, interval), daemon=True)
                t.start()

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
