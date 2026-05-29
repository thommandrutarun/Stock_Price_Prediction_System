import os
import redis
from backend.app.tasks.celery_app import celery_app
from backend.app.services.stock_service import StockService
from backend.app.ai.prediction.predict import get_model_path
from backend.app.ai.training.preprocess import prepare_data
from backend.app.ai.training.train_model import build_model

# Initialize connection to shared Redis cluster
redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
r_client = redis.Redis.from_url(redis_url)

@celery_app.task(name="tasks.train_lstm_model")
def train_lstm_model_task(symbol, interval):
    symbol = symbol.upper().strip()
    status_key = f"training_status:{symbol}_{interval}"
    
    try:
        print(f"Celery [Task Started]: Initiating AI network training for {symbol} ({interval})")
        
        # Determine validation limits based on interval
        if interval == "1m":
             period_key = "1m"
             min_data_points = 75 
        elif interval == "5m":
             period_key = "5m"
             min_data_points = 75
        elif interval == "15m":
             period_key = "15m"
             min_data_points = 75
        else:
             period_key = "2y" # default for daily
             min_data_points = 75

        # Fetch appropriate history using StockService inside background process
        hist = StockService.get_history(symbol, period_key)
        if hist.empty:
             raise ValueError("No historical price feeds found for symbol")

        closes = hist["close"].astype(float).tolist()
        if len(closes) < min_data_points:
             raise ValueError(f"Insufficient historical data (need {min_data_points}, got {len(closes)})")

        look_back = 60
        # 1. Prepare Data
        X, y, scaler, scaled_prices = prepare_data(closes, look_back)

        # 2. Build and fit model
        model = build_model((X.shape[1], 1))
        model.fit(X, y, epochs=5, batch_size=32, verbose=0)

        # 3. Save model to target disk path
        model_path = get_model_path(symbol, interval)
        os.makedirs(os.path.dirname(model_path), exist_ok=True)
        model.save(model_path)
        print(f"Celery [Success]: Model compiled and saved to {model_path}")
        
    except Exception as e:
        print(f"Celery [Error]: Training failed: {e}")
        raise e
    finally:
        # Guarantee removal of active status flag to allow future triggers
        r_client.delete(status_key)
