from sqlalchemy.sql import func
from backend.app.database.db import db

class UserActivity(db.Model):
    __tablename__ = 'user_activities'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=True, index=True)
    action = db.Column(db.String(50), nullable=False, index=True) # 'login', 'register', 'view_stock', 'trade', 'prediction'
    details = db.Column(db.String(255), nullable=True)
    timestamp = db.Column(db.DateTime, default=func.now(), index=True)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "action": self.action,
            "details": self.details,
            "timestamp": self.timestamp.strftime("%Y-%m-%d %H:%M:%S") if self.timestamp else None
        }
