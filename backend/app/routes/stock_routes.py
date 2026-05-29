import datetime as dt
import pandas as pd
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from backend.app.services.stock_service import StockService

stock_bp = Blueprint("stocks", __name__)

@stock_bp.route("/<symbol>/history")
@jwt_required()
def stock_history(symbol):
    from flask_jwt_extended import get_jwt_identity
    from backend.app.services.analytics_service import AnalyticsService
    period = request.args.get("period", "1mo").lower()
    
    # Log successful stock view
    user_id = get_jwt_identity()
    if user_id:
        AnalyticsService.log_activity(int(user_id), "view_stock", symbol.upper().strip())

    try:
        hist = StockService.get_history(symbol, period)
    except ValueError as e:
        return jsonify({"prices": [], "message": str(e)}), 200
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Error fetching history for {symbol}: {e}")
        return jsonify({
            "prices": [],
            "message": f"Stock data provider error: {str(e)}"
        }), 502

    # Formatting timestamp/date
    def fmt_date(d):
        if isinstance(d, pd.Timestamp):
            if d.time() != dt.time(0, 0):
                return d.strftime("%Y-%m-%d %H:%M")
            return d.strftime("%Y-%m-%d")
        return str(d)

    data = []
    for _, row in hist.iterrows():
        entry = {
            "date": fmt_date(row["date"]),
            "open": float(row["open"]),
            "high": float(row["high"]),
            "low": float(row["low"]),
            "close": float(row["close"]),
        }
        data.append(entry)

    return jsonify({"prices": data}), 200


@stock_bp.route("/<symbol>/quote")
@jwt_required()
def stock_quote(symbol):
    try:
        quote = StockService.get_quote(symbol)
        return jsonify(quote), 200
    except Exception as e:
        print(f"Error fetching quote for {symbol}: {e}")
        return jsonify({"message": "Error fetching quote", "error": str(e)}), 500
