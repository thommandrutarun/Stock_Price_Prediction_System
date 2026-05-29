from backend.app.database.db import db
from backend.app.models.user_model import User
from backend.app.models.activity_model import UserActivity
from backend.app.models.transaction_model import Transaction
from sqlalchemy.sql import func
import datetime as dt

class AnalyticsService:
    @staticmethod
    def log_activity(user_id, action, details=None):
        """durable recording of individual user actions and page interactions."""
        try:
            activity = UserActivity(
                user_id=user_id,
                action=action,
                details=details
            )
            db.session.add(activity)
            db.session.commit()
            return True
        except Exception as e:
            db.session.rollback()
            print(f"Error logging user activity: {e}")
            return False

    @staticmethod
    def get_user_analytics():
        """Retrieve aggregated registrations, active counts, popular stocks, and chronological activity trail."""
        try:
            # 1. Total registered accounts count
            total_users = User.query.count()
            
            # 2. Daily Active Users (DAU) count
            today = dt.date.today()
            dau_today = db.session.query(
                func.count(func.distinct(UserActivity.user_id))
            ).filter(
                func.date(UserActivity.timestamp) == today,
                UserActivity.user_id.isnot(None)
            ).scalar() or 0

            # 3. Top 5 Most viewed stocks (Grouped by ticker parameters)
            views = db.session.query(
                UserActivity.details, func.count(UserActivity.id).label('v_count')
            ).filter_by(action='view_stock').group_by(UserActivity.details).order_by(
                func.count(UserActivity.id).desc()
            ).limit(5).all()
            
            most_viewed = [{"symbol": row.details, "views": row.v_count} for row in views if row.details]

            # 4. Top 5 Most traded stocks (Grouped by transaction symbol)
            trades = db.session.query(
                Transaction.symbol, func.count(Transaction.id).label('t_count')
            ).group_by(Transaction.symbol).order_by(
                func.count(Transaction.id).desc()
            ).limit(5).all()
            
            most_traded = [{"symbol": row.symbol, "trades": row.t_count} for row in trades if row.symbol]

            # 5. Rolling 14-day history series
            registrations_series = []
            dau_series = []
            categories = []
            
            for i in range(13, -1, -1):
                date_cursor = today - dt.timedelta(days=i)
                date_str = date_cursor.strftime("%b %d")
                categories.append(date_str)
                
                # New user signups on cursor date
                reg_count = User.query.filter(func.date(User.created_at) == date_cursor).count()
                registrations_series.append(reg_count)
                
                # Active users on cursor date
                active_count = db.session.query(
                    func.count(func.distinct(UserActivity.user_id))
                ).filter(
                    func.date(UserActivity.timestamp) == date_cursor,
                    UserActivity.user_id.isnot(None)
                ).scalar() or 0
                dau_series.append(active_count)

            # 6. Chronological activity trail joined with User email parameters
            logs_query = db.session.query(
                UserActivity.id,
                UserActivity.action,
                UserActivity.details,
                UserActivity.timestamp,
                User.email
            ).outerjoin(User, UserActivity.user_id == User.id).order_by(
                UserActivity.timestamp.desc()
            ).limit(50).all()

            activity_logs = [
                {
                    "id": row.id,
                    "action": row.action,
                    "details": row.details,
                    "timestamp": row.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
                    "email": row.email or "Guest/Anonymous"
                }
                for row in logs_query
            ]

            return {
                "total_users": total_users,
                "dau_today": dau_today,
                "most_viewed": most_viewed,
                "most_traded": most_traded,
                "series": {
                    "categories": categories,
                    "registrations": registrations_series,
                    "dau": dau_series
                },
                "activity_logs": activity_logs
            }
        except Exception as e:
            print(f"Error compiling user analytics: {e}")
            return {
                "total_users": 0,
                "dau_today": 0,
                "most_viewed": [],
                "most_traded": [],
                "series": {"categories": [], "registrations": [], "dau": []},
                "activity_logs": []
            }
