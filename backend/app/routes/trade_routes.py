from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.app.services.trade_service import TradeService
from backend.app.models.transaction_model import TransactionModel
from backend.app.utils.cache import cache

trade_bp = Blueprint("trade", __name__)

@trade_bp.route("/buy", methods=["POST"])
@jwt_required()
def trade_buy():
    user_id = int(get_jwt_identity())
    
    # Invalidate portfolio cache instantly upon trade execution
    cache.delete(f"portfolio_{user_id}")
    
    data = request.get_json() or {}
    symbol = data.get("symbol")
    quantity = data.get("quantity")

    if not symbol or not quantity or int(quantity) <= 0:
        return jsonify({"message": "Invalid symbol or quantity"}), 400
    
    quantity = int(quantity)

    try:
        result = TradeService.execute_buy(user_id, symbol, quantity)
        from backend.app.services.analytics_service import AnalyticsService
        AnalyticsService.log_activity(user_id, "trade", f"Bought {quantity} shares of {symbol.upper().strip()}")
        return jsonify(result), 200
    except ValueError as e:
        return jsonify({"message": str(e)}), 400
    except Exception as e:
        print(f"Trade Buy Error: {e}")
        return jsonify({"message": "Trade failed", "error": str(e)}), 500


@trade_bp.route("/sell", methods=["POST"])
@jwt_required()
def trade_sell():
    user_id = int(get_jwt_identity())
    
    # Invalidate portfolio cache instantly upon trade execution
    cache.delete(f"portfolio_{user_id}")
    
    data = request.get_json() or {}
    symbol = data.get("symbol")
    quantity = data.get("quantity")

    if not symbol or not quantity or int(quantity) <= 0:
        return jsonify({"message": "Invalid symbol or quantity"}), 400
    
    quantity = int(quantity)

    try:
        result = TradeService.execute_sell(user_id, symbol, quantity)
        from backend.app.services.analytics_service import AnalyticsService
        AnalyticsService.log_activity(user_id, "trade", f"Sold {quantity} shares of {symbol.upper().strip()}")
        return jsonify(result), 200
    except ValueError as e:
        return jsonify({"message": str(e)}), 400
    except Exception as e:
        print(f"Trade Sell Error: {e}")
        return jsonify({"message": "Trade failed", "error": str(e)}), 500


@trade_bp.route("/transactions", methods=["GET"])
@jwt_required()
def get_user_transactions():
    user_id = int(get_jwt_identity())
    try:
        txs = TransactionModel.get_by_user(user_id)
        return jsonify({"transactions": txs}), 200
    except Exception as e:
        print(f"Error fetching transactions: {e}")
        return jsonify({"transactions": [], "message": "Failed to load transactions"}), 500
