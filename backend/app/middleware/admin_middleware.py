from functools import wraps
from flask import jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.app.models.user_model import UserModel
from backend.app.models.admin_model import AdminLogModel

def admin_required(fn):
    """Decorator ensuring only users with an 'admin' role can access the endpoint."""
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        try:
            user_id = int(get_jwt_identity())
            user = UserModel.get_by_id(user_id)
        except Exception as e:
            print(f"Error checking admin role: {e}")
            user = None

        if not user or user.get("role") != "admin":
            return jsonify({"message": "Admin access required"}), 403
        return fn(*args, **kwargs)

    return wrapper

def log_admin_action(admin_email, action, target):
    """Registers administrative adjustments in the database audit log."""
    try:
        AdminLogModel.create(admin_email, action, target)
    except Exception as e:
        print(f"Failed to log admin action: {e}")
