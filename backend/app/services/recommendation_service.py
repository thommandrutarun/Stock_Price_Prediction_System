import numpy as np
from backend.app.services.stock_service import StockService
from backend.app.database.db import db

class RecommendationService:
    @staticmethod
    def get_recommendations(user_id):
        """
        AI-based Stock Recommendation Service.
        Computes potential high-yielding purchase opportunities using basic 5-day and 20-day 
        moving average crossovers on popular candidates.
        """
        candidates = ["AAPL", "TSLA", "MSFT", "GOOGL", "AMZN", "NVDA"]
        recommendations = []

        for symbol in candidates:
            try:
                # Fetch history
                df = StockService.get_history(symbol, "1mo")
                if len(df) >= 20:
                    closes = df["close"].astype(float).tolist()
                    ma5 = np.mean(closes[-5:])
                    ma20 = np.mean(closes[-20:])
                    
                    signal = "BUY" if ma5 > ma20 else "HOLD"
                    confidence = round(float(abs(ma5 - ma20) / ma20 * 100), 2)
                    
                    recommendations.append({
                        "symbol": symbol,
                        "current_price": closes[-1],
                        "signal": signal,
                        "confidence_percentage": min(confidence * 10 + 50, 95.0) # Scaled confidence rating
                    })
            except Exception as e:
                print(f"Error computing recommendations for {symbol}: {e}")
                
        return sorted(recommendations, key=lambda x: x["confidence_percentage"], reverse=True)
