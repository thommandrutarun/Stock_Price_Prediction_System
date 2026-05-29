from flask import Blueprint, jsonify
from backend.app.services.market_service import MarketService

market_bp = Blueprint("market", __name__)

@market_bp.route("/ticker", methods=["GET"])
def get_market_ticker():
    try:
        results = MarketService.get_market_ticker()
        return jsonify(results), 200
    except Exception as e:
        print(f"Ticker data error in route: {e}")
        return jsonify([]), 200
