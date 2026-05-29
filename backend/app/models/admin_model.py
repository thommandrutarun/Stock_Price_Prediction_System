import datetime as dt
from sqlalchemy.sql import func
from backend.app.database.db import db

class AdminLog(db.Model):
    __tablename__ = 'admin_logs'

    id = db.Column(db.Integer, primary_key=True)
    admin_email = db.Column(db.String(100), nullable=False, index=True)
    action = db.Column(db.String(100), nullable=False)
    target = db.Column(db.String(255), nullable=False)
    timestamp = db.Column(db.DateTime, default=func.now(), index=True)
    created_at = db.Column(db.DateTime, default=func.now())
    updated_at = db.Column(db.DateTime, default=func.now(), onupdate=func.now())

    def to_dict(self):
        return {
            "id": self.id,
            "admin_email": self.admin_email,
            "action": self.action,
            "target": self.target,
            "timestamp": self.timestamp.strftime("%Y-%m-%d %H:%M:%S") if self.timestamp else None,
            "created_at": self.created_at.strftime("%Y-%m-%d %H:%M:%S") if self.created_at else None,
            "updated_at": self.updated_at.strftime("%Y-%m-%d %H:%M:%S") if self.updated_at else None,
        }

class AdminLogModel:
    @staticmethod
    def create(admin_email, action, target):
        try:
            log = AdminLog(
                admin_email=admin_email,
                action=action,
                target=target
            )
            db.session.add(log)
            db.session.commit()
            return True
        except Exception as e:
            db.session.rollback()
            print(f"Error in AdminLogModel.create: {e}")
            return False

    @staticmethod
    def get_recent(limit=100):
        try:
            logs = AdminLog.query.order_by(AdminLog.timestamp.desc()).limit(limit).all()
            return [l.to_dict() for l in logs]
        except Exception as e:
            print(f"Error in AdminLogModel.get_recent: {e}")
            return []
