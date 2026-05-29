from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.app.services.admin_service import AdminService
from backend.app.middleware.admin_middleware import admin_required

admin_bp = Blueprint("admin", __name__)

@admin_bp.route("/users", methods=["GET"])
@admin_required
def list_users():
    try:
        users = AdminService.list_all_users()
        return jsonify({"users": users}), 200
    except Exception as e:
        print(f"Error listing users: {e}")
        return jsonify({"users": [], "message": "Failed to retrieve users"}), 500

@admin_bp.route("/users/<int:user_id>", methods=["DELETE"])
@admin_required
def delete_user(user_id):
    current_admin_id = int(get_jwt_identity())
    super_admin_email = current_app.config["SUPER_ADMIN_EMAIL"]

    try:
        res = AdminService.delete_user_account(user_id, current_admin_id, super_admin_email)
        return jsonify(res), 200
    except ValueError as e:
        return jsonify({"message": str(e)}), 404
    except PermissionError as e:
        return jsonify({"message": str(e)}), 403
    except Exception as e:
        print(f"Error in delete_user: {e}")
        return jsonify({"message": "Failed to delete user"}), 500

@admin_bp.route("/promote", methods=["POST"])
@admin_required
def promote_admin():
    data = request.get_json() or {}
    target_id = data.get("user_id")
    if not target_id:
        return jsonify({"message": "user_id is required"}), 400
    
    current_admin_id = int(get_jwt_identity())
    try:
        res = AdminService.promote_to_admin(int(target_id), current_admin_id)
        return jsonify(res), 200
    except ValueError as e:
        status = 404 if "not found" in str(e).lower() else 400
        return jsonify({"message": str(e)}), status
    except Exception as e:
        print(f"Error in promote_admin: {e}")
        return jsonify({"message": "Failed to promote user"}), 500

@admin_bp.route("/revoke", methods=["POST"])
@admin_required
def revoke_admin():
    data = request.get_json() or {}
    target_id = data.get("user_id")
    if not target_id:
        return jsonify({"message": "user_id is required"}), 400
        
    current_admin_id = int(get_jwt_identity())
    super_admin_email = current_app.config["SUPER_ADMIN_EMAIL"]

    try:
        res = AdminService.revoke_admin_privileges(int(target_id), current_admin_id, super_admin_email)
        return jsonify(res), 200
    except ValueError as e:
        return jsonify({"message": str(e)}), 404
    except PermissionError as e:
        return jsonify({"message": str(e)}), 403
    except Exception as e:
        print(f"Error in revoke_admin: {e}")
        return jsonify({"message": "Failed to revoke admin"}), 500

@admin_bp.route("/logs", methods=["GET"])
@admin_required
def get_admin_logs():
    current_admin_id = int(get_jwt_identity())
    super_admin_email = current_app.config["SUPER_ADMIN_EMAIL"]

    try:
        logs = AdminService.list_admin_logs(current_admin_id, super_admin_email)
        return jsonify({"logs": logs}), 200
    except PermissionError as e:
        return jsonify({"message": str(e)}), 403
    except Exception as e:
        print(f"Error fetching logs: {e}")
        return jsonify({"logs": [], "message": "Failed to load audit logs"}), 500

@admin_bp.route("/messages", methods=["GET"])
@admin_required
def list_messages():
    try:
        messages = AdminService.list_support_messages()
        return jsonify({"messages": messages}), 200
    except Exception as e:
        print(f"Error listing messages: {e}")
        return jsonify({"messages": [], "message": "Failed to load messages"}), 500

@admin_bp.route("/system-stats", methods=["GET"])
@admin_required
def get_system_stats():
    try:
        stats = AdminService.get_system_metrics()
        return jsonify(stats), 200
    except Exception as e:
        print(f"Error fetching system stats: {e}")
        return jsonify({"error": "Failed to fetch stats"}), 500

@admin_bp.route("/monitoring/stats", methods=["GET"])
@admin_required
def get_monitoring_stats():
    from backend.app.services.monitoring_service import MonitoringService
    try:
        stats = MonitoringService.get_monitoring_summary()
        return jsonify(stats), 200
    except Exception as e:
        print(f"Error fetching telemetry metrics: {e}")
        return jsonify({"message": "Failed to load telemetry metrics"}), 500

@admin_bp.route("/analytics/stats", methods=["GET"])
@admin_required
def get_analytics_stats():
    from backend.app.services.analytics_service import AnalyticsService
    try:
        stats = AnalyticsService.get_user_analytics()
        return jsonify(stats), 200
    except Exception as e:
        print(f"Error fetching user analytics: {e}")
        return jsonify({"message": "Failed to load user analytics"}), 500
