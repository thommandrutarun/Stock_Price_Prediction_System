from backend.app.models.user_model import UserModel
from backend.app.models.admin_model import AdminLogModel
from backend.app.models.message_model import MessageModel
from backend.app.database.db import db


class AdminService:
    @staticmethod
    def list_all_users():
        return UserModel.get_all()

    @staticmethod
    def delete_user_account(user_id: int, current_admin_id: int, super_admin_email: str):
        admin = UserModel.get_by_id(current_admin_id)
        admin_email = admin["email"] if admin else "unknown"

        user = UserModel.get_by_id(user_id)
        if not user:
            raise ValueError("User not found")
            
        if user['email'] == super_admin_email:
            raise PermissionError("Action not allowed on Super Admin account")

        success = UserModel.delete(user_id)
        if not success:
            raise RuntimeError("Failed to delete user from database")

        AdminLogModel.create(admin_email, "DELETE_USER", f"ID: {user_id}, Email: {user['email']}")
        return {"message": "User deleted successfully"}

    @staticmethod
    def promote_to_admin(target_id: int, current_admin_id: int):
        admin = UserModel.get_by_id(current_admin_id)
        admin_email = admin["email"] if admin else "unknown"
        
        target = UserModel.get_by_id(target_id)
        if not target:
            raise ValueError("User not found")
            
        if target["role"] == "admin":
            raise ValueError("User is already admin")

        success = UserModel.update_role(target_id, "admin")
        if not success:
            raise RuntimeError("Failed to update user role")

        AdminLogModel.create(admin_email, "PROMOTE_ADMIN", f"ID: {target_id}, Email: {target['email']}")
        return {"message": "User promoted to Admin"}

    @staticmethod
    def revoke_admin_privileges(target_id: int, current_admin_id: int, super_admin_email: str):
        admin = UserModel.get_by_id(current_admin_id)
        admin_email = admin["email"] if admin else "unknown"
        
        target = UserModel.get_by_id(target_id)
        if not target:
            raise ValueError("User not found")
        
        if target["email"] == super_admin_email:
            raise PermissionError("Action not allowed on Super Admin account")

        success = UserModel.update_role(target_id, "user")
        if not success:
            raise RuntimeError("Failed to update user role")

        AdminLogModel.create(admin_email, "REVOKE_ADMIN", f"ID: {target_id}, Email: {target['email']}")
        return {"message": "Admin privileges revoked"}

    @staticmethod
    def list_admin_logs(current_admin_id: int, super_admin_email: str):
        admin = UserModel.get_by_id(current_admin_id)
        if not admin or admin["email"] != super_admin_email:
            raise PermissionError("Access Denied")

        return AdminLogModel.get_recent()

    @staticmethod
    def list_support_messages():
        return MessageModel.get_all()

    @staticmethod
    def get_system_metrics():
        from backend.app.models.user_model import User
        from backend.app.models.stock_model import UserStock
        from backend.app.models.message_model import Message
        from sqlalchemy.sql import func, desc

        try:
            total_users = User.query.count()
            new_users_today = 0
            total_stocks_tracked = UserStock.query.count()
            
            pop_stock_query = db.session.query(
                UserStock.symbol, func.count(UserStock.id).label('freq')
            ).group_by(UserStock.symbol).order_by(func.count(UserStock.id).desc()).first()

            most_popular_stock = pop_stock_query[0] if pop_stock_query else "N/A"
            
            total_messages = Message.query.count()
        except Exception as e:
            print(f"Error in AdminService.get_system_metrics: {e}")
            total_users = 0
            new_users_today = 0
            total_stocks_tracked = 0
            most_popular_stock = "N/A"
            total_messages = 0

        return {
            "total_users": total_users,
            "new_users_today": new_users_today,
            "total_stocks_tracked": total_stocks_tracked,
            "most_popular_stock": most_popular_stock,
            "total_messages": total_messages
        }
