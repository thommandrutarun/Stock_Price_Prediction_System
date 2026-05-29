import datetime as dt
from sqlalchemy.sql import func
from backend.app.database.db import db

class Message(db.Model):
    __tablename__ = 'messages'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False, index=True)
    subject = db.Column(db.String(255))
    message = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=func.now(), index=True)
    created_at = db.Column(db.DateTime, default=func.now())
    updated_at = db.Column(db.DateTime, default=func.now(), onupdate=func.now())

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "subject": self.subject,
            "message": self.message,
            "timestamp": self.timestamp.strftime("%Y-%m-%d %H:%M:%S") if self.timestamp else None,
            "created_at": self.created_at.strftime("%Y-%m-%d %H:%M:%S") if self.created_at else None,
            "updated_at": self.updated_at.strftime("%Y-%m-%d %H:%M:%S") if self.updated_at else None,
        }

class MessageModel:
    @staticmethod
    def create(name, email, subject, message):
        try:
            msg = Message(
                name=name,
                email=email,
                subject=subject,
                message=message
            )
            db.session.add(msg)
            db.session.commit()
            return True
        except Exception as e:
            db.session.rollback()
            print(f"Error in MessageModel.create: {e}")
            return False

    @staticmethod
    def get_all():
        try:
            messages = Message.query.order_by(Message.timestamp.desc()).all()
            return [m.to_dict() for m in messages]
        except Exception as e:
            print(f"Error in MessageModel.get_all: {e}")
            return []
