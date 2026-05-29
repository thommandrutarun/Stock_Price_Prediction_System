from sqlalchemy.sql import func
from backend.app.database.db import db

class SystemMetric(db.Model):
    __tablename__ = 'system_metrics'

    id = db.Column(db.Integer, primary_key=True)
    metric_type = db.Column(db.String(50), nullable=False, index=True) # 'api_error', 'login_failure', 'database_error', 'performance', 'ai_error'
    message = db.Column(db.Text, nullable=False)
    execution_time = db.Column(db.Float, nullable=True) # in milliseconds
    endpoint = db.Column(db.String(255), nullable=True)
    timestamp = db.Column(db.DateTime, default=func.now(), index=True)

    def to_dict(self):
        return {
            "id": self.id,
            "metric_type": self.metric_type,
            "message": self.message,
            "execution_time": self.execution_time,
            "endpoint": self.endpoint,
            "timestamp": self.timestamp.strftime("%Y-%m-%d %H:%M:%S") if self.timestamp else None
        }
