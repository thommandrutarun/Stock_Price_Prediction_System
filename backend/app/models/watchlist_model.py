from backend.app.database.db import db
from sqlalchemy.sql import func

class Watchlist(db.Model):
    __tablename__ = 'watchlists'
    __table_args__ = (db.UniqueConstraint('user_id', 'symbol', name='uq_watchlist_user_symbol'),)

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    symbol = db.Column(db.String(10), nullable=False, index=True)
    created_at = db.Column(db.DateTime, default=func.now())

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "symbol": self.symbol,
            "created_at": self.created_at.strftime("%Y-%m-%d %H:%M:%S") if self.created_at else None,
        }
