import datetime as dt
from backend.app.services.stock_service import StockService
from backend.app.ai.prediction.predict import predict_lstm

class AIService:
    @staticmethod
    def generate_forecast(symbol: str, days: int, interval: str):
        symbol = symbol.upper().strip()
        steps = int(days)

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

        # Fetch appropriate history
        hist = StockService.get_history(symbol, period_key)
        if hist.empty:
             raise ValueError("No price data found")

        # Extract closing prices
        closes = hist["close"].astype(float).tolist()
        
        # Check if we have enough data (60 lookback + 15 min training)
        if len(closes) < min_data_points:
            raise ValueError(f"Not enough historical data (need {min_data_points} points, got {len(closes)})")

        # Upper limit step capping
        if steps > 60: 
            steps = 60

        # Predict using our optimized LSTM engine
        predicted_prices = predict_lstm(closes, symbol=symbol, interval=interval, days=steps)

        # Format predictions with timestamps anchored to "present day"
        predictions = []
        current_date = dt.datetime.now()

        for price in predicted_prices:
            if interval == "1m":
                 current_date += dt.timedelta(minutes=1)
                 date_str = current_date.strftime("%Y-%m-%d %H:%M")
            elif interval == "5m":
                 current_date += dt.timedelta(minutes=5)
                 date_str = current_date.strftime("%Y-%m-%d %H:%M")
            elif interval == "15m":
                 current_date += dt.timedelta(minutes=15)
                 date_str = current_date.strftime("%Y-%m-%d %H:%M")
            else:
                 current_date += dt.timedelta(days=1)
                 # Skip weekends for daily forecasts
                 while current_date.weekday() >= 5: # 5=Saturday, 6=Sunday
                     current_date += dt.timedelta(days=1)
                     
                 date_str = current_date.strftime("%Y-%m-%d")

            predictions.append({
                "date": date_str,
                "predicted_close": float(price)
            })

        return predictions
