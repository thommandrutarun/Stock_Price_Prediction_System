import yfinance as yf
import pandas as pd
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.app.models.user_model import UserModel
from backend.app.models.stock_model import StockModel
from backend.app.utils.cache import cache

report_bp = Blueprint("reports", __name__)

@report_bp.route("/summary", methods=["GET"])
@jwt_required()
def reports_summary():
    try:
        users = UserModel.get_all()
        total_users = len(users)
        
        data = {
            "total_users": total_users,
            "popular_symbols": ["AAPL", "TSLA", "MSFT", "GOOGL"],
        }
        return jsonify(data), 200
    except Exception as e:
        print(f"Error in summary report: {e}")
        return jsonify({"message": "Failed to load summary"}), 500


@report_bp.route("/portfolio", methods=["GET", "POST", "DELETE"])
@jwt_required()
def user_portfolio():
    user_id = int(get_jwt_identity())
    cache_key = f"portfolio_{user_id}"

    if request.method == "DELETE":
        # Invalidate portfolio cache instantly
        cache.delete(cache_key)
        
        data = request.get_json() or {}
        symbol = data.get("symbol")
        if not symbol:
            return jsonify({"message": "Symbol required"}), 400
        
        try:
            success = StockModel.delete_position(user_id, symbol)
            if not success:
                return jsonify({"message": "Position not found"}), 404
            return jsonify({"message": "Deleted successfully"}), 200
        except Exception as e:
            print(f"Error in deleting position: {e}")
            return jsonify({"message": "Failed to delete position"}), 500

    if request.method == "POST":
        # Invalidate portfolio cache instantly
        cache.delete(cache_key)
        
        data = request.get_json() or {}
        symbol = data.get("symbol")
        quantity = data.get("quantity")
        avg_price = data.get("avg_price")
        p_date = data.get("purchase_date") # YYYY-MM-DD

        if not symbol or not quantity or not avg_price:
            return jsonify({"message": "Symbol, quantity, and avg_price required"}), 400

        latest_price = avg_price
        
        try:
            success = StockModel.add_position(user_id, symbol, quantity, avg_price, latest_price, p_date)
            if success:
                return jsonify({"message": "Added successfully"}), 201
            return jsonify({"message": "Failed to add position"}), 500
        except Exception as e:
            print(f"Error in adding position: {e}")
            return jsonify({"message": "Failed to add position"}), 500

    # GET Workflow (caching with 5-second TTL)
    try:
        cached_portfolio = cache.get(cache_key)
        if cached_portfolio is not None:
            print(f"DEBUG [Cache HIT]: User {user_id} portfolio loaded from cache")
            return jsonify(cached_portfolio), 200

        stocks = StockModel.get_positions(user_id)
        
        if stocks:
            unique_symbols = list(set(s["symbol"] for s in stocks))
            try:
                # Batch download to update latest prices with a 5-second timeout
                batch_data = yf.download(unique_symbols, period="1d", progress=False, timeout=5)
                current_prices = {}
                
                for sym in unique_symbols:
                    price = 0.0
                    try:
                        if len(unique_symbols) == 1:
                            if isinstance(batch_data.columns, pd.MultiIndex):
                                price = float(batch_data["Close"][sym.upper()].iloc[-1])
                            else:
                                price = float(batch_data["Close"].iloc[-1])
                        else:
                            if isinstance(batch_data.columns, pd.MultiIndex):
                                price = float(batch_data["Close"][sym.upper()].iloc[-1])
                            else:
                                price = float(batch_data[sym.upper()].iloc[-1])
                    except Exception:
                        pass

                    
                    if price > 0:
                        current_prices[sym] = price

                # Sync batch updates in database
                for sym, price in current_prices.items():
                    StockModel.update_latest_price(user_id, sym, price)

            except Exception as e:
                print(f"Error updating portfolio prices: {e}")
                # Continue showing existing DB prices on network error

        # Refetch fresh holding lists with updated prices
        updated_stocks = StockModel.get_positions(user_id)
        
        total_value = sum(float(r["current_value"] or 0) for r in updated_stocks) if updated_stocks else 0
        total_invested = sum(int(r["quantity"]) * float(r["avg_price"]) for r in updated_stocks) if updated_stocks else 0
        
        # Get user details for wallet balance
        user = UserModel.get_by_id(user_id)
        wallet_balance = float(user["wallet_balance"] or 0.0) if user else 0.0

        # Cast decimals to float for JSON output
        for r in updated_stocks:
            r["avg_price"] = float(r["avg_price"])
            r["latest_price"] = float(r["latest_price"])
            r["current_value"] = float(r["current_value"])
            r["profit_loss"] = float(r["profit_loss"])
            r["change_abs_unit"] = float(r["change_abs_unit"])
            r["change_pct"] = float(r["change_pct"])

        res_data = {
            "total_value": float(total_value),
            "total_invested": float(total_invested),
            "wallet_balance": wallet_balance,
            "positions": updated_stocks,
        }

        # Store response in cache (5 seconds TTL)
        cache.set(cache_key, res_data, ttl=5)
        return jsonify(res_data), 200

    except Exception as e:
        print(f"Error rendering portfolio positions: {e}")
        return jsonify({"message": "Failed to fetch portfolio info"}), 500
