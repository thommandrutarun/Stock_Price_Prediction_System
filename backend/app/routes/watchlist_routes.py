from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.app.database.db import db
from backend.app.models.watchlist_model import Watchlist

watchlist_bp = Blueprint("watchlist", __name__)

@watchlist_bp.route("", methods=["GET"])
@jwt_required()
def get_watchlist():
    try:
        user_id = int(get_jwt_identity())
        items = Watchlist.query.filter_by(user_id=user_id).all()
        symbols = [item.symbol for item in items]
        return jsonify({"watchlist": symbols}), 200
    except Exception as e:
        print(f"Error in GET /api/watchlist: {e}")
        return jsonify({"message": "Failed to retrieve watchlist"}), 500

@watchlist_bp.route("", methods=["POST"])
@jwt_required()
def add_to_watchlist():
    try:
        user_id = int(get_jwt_identity())
        data = request.get_json() or {}
        symbol = data.get("symbol")
        
        if not symbol:
            return jsonify({"message": "Symbol is required"}), 400
        
        symbol = symbol.upper().strip()
        
        # Check if already exists
        existing = Watchlist.query.filter_by(user_id=user_id, symbol=symbol).first()
        if existing:
            return jsonify({"message": f"{symbol} is already in your watchlist"}), 400
        
        # Create new watchlist item
        item = Watchlist(user_id=user_id, symbol=symbol)
        db.session.add(item)
        db.session.commit()
        
        # Return updated list
        items = Watchlist.query.filter_by(user_id=user_id).all()
        symbols = [item.symbol for item in items]
        return jsonify({
            "message": f"Added {symbol} to watchlist",
            "watchlist": symbols
        }), 201
    except Exception as e:
        db.session.rollback()
        print(f"Error in POST /api/watchlist: {e}")
        return jsonify({"message": "Failed to add to watchlist"}), 500

@watchlist_bp.route("", methods=["DELETE"])
@jwt_required()
def remove_from_watchlist():
    try:
        user_id = int(get_jwt_identity())
        data = request.get_json() or {}
        symbol = data.get("symbol")
        
        if not symbol:
            return jsonify({"message": "Symbol is required"}), 400
            
        symbol = symbol.upper().strip()
        
        item = Watchlist.query.filter_by(user_id=user_id, symbol=symbol).first()
        if not item:
            return jsonify({"message": "Symbol not found in watchlist"}), 404
            
        db.session.delete(item)
        db.session.commit()
        
        # Return updated list
        items = Watchlist.query.filter_by(user_id=user_id).all()
        symbols = [item.symbol for item in items]
        return jsonify({
            "message": f"Removed {symbol} from watchlist",
            "watchlist": symbols
        }), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error in DELETE /api/watchlist: {e}")
        return jsonify({"message": "Failed to remove from watchlist"}), 500
