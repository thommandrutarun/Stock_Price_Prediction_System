from functools import wraps
from flask import jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.app.models.user_model import UserModel

def user_required(fn):
    """Decorator ensuring the JWT identity maps to an existing active user."""
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        user_id = int(get_jwt_identity())
        user = UserModel.get_by_id(user_id)
        if not user:
            return jsonify({"message": "User account not found"}), 401
        return fn(*args, **kwargs)
    return wrapper
