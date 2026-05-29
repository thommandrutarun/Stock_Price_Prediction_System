import datetime as dt
from sqlalchemy.sql import func
from backend.app.database.db import db

class Transaction(db.Model):
    __tablename__ = 'transactions'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    symbol = db.Column(db.String(10), nullable=False, index=True)
    type = db.Column(db.String(10), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Numeric(15, 2), nullable=False)
    total_amount = db.Column(db.Numeric(15, 2), nullable=False)
    timestamp = db.Column(db.DateTime, default=func.now(), index=True)
    created_at = db.Column(db.DateTime, default=func.now())
    updated_at = db.Column(db.DateTime, default=func.now(), onupdate=func.now())

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "symbol": self.symbol,
            "type": self.type,
            "quantity": int(self.quantity or 0),
            "price": float(self.price or 0.0),
            "total_amount": float(self.total_amount or 0.0),
            "timestamp": self.timestamp.strftime("%Y-%m-%d %H:%M:%S") if self.timestamp else None,
            "created_at": self.created_at.strftime("%Y-%m-%d %H:%M:%S") if self.created_at else None,
            "updated_at": self.updated_at.strftime("%Y-%m-%d %H:%M:%S") if self.updated_at else None,
        }

class TransactionModel:
    @staticmethod
    def create(user_id, symbol, tx_type, quantity, price, total_amount):
        try:
            tx = Transaction(
                user_id=user_id,
                symbol=symbol.upper().strip(),
                type=tx_type.upper().strip(),
                quantity=quantity,
                price=price,
                total_amount=total_amount
            )
            db.session.add(tx)
            db.session.commit()
            return True
        except Exception as e:
            db.session.rollback()
            print(f"Error in TransactionModel.create: {e}")
            return False

    @staticmethod
    def get_by_user(user_id, limit=50):
        try:
            txs = Transaction.query.filter_by(user_id=user_id).order_by(Transaction.timestamp.desc()).limit(limit).all()
            return [t.to_dict() for t in txs]
        except Exception as e:
            print(f"Error in TransactionModel.get_by_user: {e}")
            return []
