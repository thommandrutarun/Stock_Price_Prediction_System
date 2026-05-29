from flask import Blueprint, request, jsonify
from backend.app.services.auth_service import AuthService
from backend.app import limiter
from flask_jwt_extended import (
    set_access_cookies, 
    set_refresh_cookies, 
    unset_jwt_cookies, 
    jwt_required, 
    get_jwt_identity, 
    create_access_token
)

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/register", methods=["POST"])
@limiter.limit("10 per minute")
def register():
    from backend.app.services.analytics_service import AnalyticsService
    from backend.app.models.user_model import UserModel
    data = request.get_json() or {}
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    phone = data.get("phone")
    dob = data.get("dob")   # "YYYY-MM-DD"
    profession = data.get("profession")

    try:
        res = AuthService.register_user(name, email, password, phone, dob, profession)
        # Log successful registration
        created_user = UserModel.get_by_email(email)
        if created_user:
            AnalyticsService.log_activity(created_user["id"], "register", f"New user signed up: {email}")
        return jsonify(res), 201
    except ValueError as e:
        return jsonify({"message": str(e)}), 400
    except Exception as e:
        return jsonify({"message": str(e)}), 500

@auth_bp.route("/login", methods=["POST"])
@limiter.limit("10 per minute")
def login():
    from backend.app.services.monitoring_service import MonitoringService
    from backend.app.services.analytics_service import AnalyticsService
    from backend.app.models.user_model import UserModel
    data = request.get_json() or {}
    email = data.get("email")
    password = data.get("password")

    try:
        res = AuthService.login_user(email, password)
        
        # Log successful login
        user = UserModel.get_by_email(email)
        if user:
            AnalyticsService.log_activity(user["id"], "login", f"User logged in: {email}")
            
        resp = jsonify({"user": res["user"]})
        set_access_cookies(resp, res["access_token"])
        set_refresh_cookies(resp, res["refresh_token"])
        return resp, 200
    except ValueError as e:
        msg = str(e)
        MonitoringService.log_metric(
            metric_type="login_failure",
            message=f"Failed login attempt for user: {email} | Reason: {msg}",
            endpoint="POST /api/auth/login"
        )
        return jsonify({"message": msg}), 401 if "credentials" in msg.lower() else 400
    except Exception as e:
        msg = str(e)
        MonitoringService.log_metric(
            metric_type="login_failure",
            message=f"Login system exception for user: {email} | Error: {msg}",
            endpoint="POST /api/auth/login"
        )
        return jsonify({"message": msg}), 500

@auth_bp.route("/logout", methods=["POST"])
def logout():
    resp = jsonify({"message": "Logged out successfully"})
    unset_jwt_cookies(resp)
    return resp, 200

@auth_bp.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    identity = get_jwt_identity()
    access_token = create_access_token(identity=identity)
    resp = jsonify({"message": "Session refreshed successfully"})
    set_access_cookies(resp, access_token)
    return resp, 200
