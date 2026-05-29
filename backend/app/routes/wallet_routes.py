from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.app.models.user_model import UserModel

wallet_bp = Blueprint("wallet", __name__)

@wallet_bp.route("/reset", methods=["POST"])
@jwt_required()
def reset_balance():
    user_id = int(get_jwt_identity())
    try:
        success = UserModel.update_balance(user_id, 100000.0)
        if success:
            return jsonify({
                "message": "Wallet balance reset to $100,000.00",
                "new_balance": 100000.0
            }), 200
        return jsonify({"message": "Failed to reset balance"}), 500
    except Exception as e:
        print(f"Balance reset error: {e}")
        return jsonify({"message": "Failed to reset balance", "error": str(e)}), 500
