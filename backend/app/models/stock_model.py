import datetime as dt
from sqlalchemy.sql import func
from backend.app.database.db import db

class UserStock(db.Model):
    __tablename__ = 'user_stocks'
    __table_args__ = (db.UniqueConstraint('user_id', 'symbol', name='uq_user_symbol'),)

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    symbol = db.Column(db.String(10), nullable=False, index=True)
    quantity = db.Column(db.Integer, nullable=False)
    avg_price = db.Column(db.Numeric(10, 2), nullable=False)
    latest_price = db.Column(db.Numeric(10, 2), nullable=False)
    purchase_date = db.Column(db.Date)
    created_at = db.Column(db.DateTime, default=func.now())
    updated_at = db.Column(db.DateTime, default=func.now(), onupdate=func.now())

    def to_dict(self):
        avg_price_f = float(self.avg_price or 0.0)
        latest_price_f = float(self.latest_price or 0.0)
        qty = int(self.quantity or 0)
        
        current_value = latest_price_f * qty
        profit_loss = (latest_price_f - avg_price_f) * qty
        change_abs_unit = latest_price_f - avg_price_f
        change_pct = (change_abs_unit / avg_price_f * 100.0) if avg_price_f > 0 else 0.0

        return {
            "id": self.id,
            "user_id": self.user_id,
            "symbol": self.symbol,
            "quantity": qty,
            "avg_price": avg_price_f,
            "latest_price": latest_price_f,
            "purchase_date": str(self.purchase_date) if self.purchase_date else None,
            "current_value": current_value,
            "profit_loss": profit_loss,
            "change_abs_unit": change_abs_unit,
            "change_pct": change_pct,
            "created_at": self.created_at.strftime("%Y-%m-%d %H:%M:%S") if self.created_at else None,
            "updated_at": self.updated_at.strftime("%Y-%m-%d %H:%M:%S") if self.updated_at else None,
        }

class StockModel:
    @staticmethod
    def add_position(user_id, symbol, quantity, avg_price, latest_price, purchase_date):
        parsed_date = None
        if purchase_date:
            if isinstance(purchase_date, (dt.date, dt.datetime)):
                parsed_date = purchase_date
            elif isinstance(purchase_date, str) and purchase_date.strip():
                try:
                    parsed_date = dt.datetime.strptime(purchase_date.strip(), "%Y-%m-%d").date()
                except ValueError:
                    parsed_date = None

        try:
            stock = UserStock(
                user_id=user_id,
                symbol=symbol.upper().strip(),
                quantity=quantity,
                avg_price=avg_price,
                latest_price=latest_price,
                purchase_date=parsed_date
            )
            db.session.add(stock)
            db.session.commit()
            return True
        except Exception as e:
            db.session.rollback()
            print(f"Error in StockModel.add_position: {e}")
            return False

    @staticmethod
    def delete_position(user_id, symbol):
        try:
            stock = UserStock.query.filter_by(user_id=user_id, symbol=symbol.upper().strip()).first()
            if stock:
                db.session.delete(stock)
                db.session.commit()
                return True
            return False
        except Exception as e:
            db.session.rollback()
            print(f"Error in StockModel.delete_position: {e}")
            return False

    @staticmethod
    def get_positions(user_id):
        try:
            stocks = UserStock.query.filter_by(user_id=user_id).all()
            serialized = [s.to_dict() for s in stocks]
            serialized.sort(key=lambda x: x["change_pct"], reverse=True)
            return serialized
        except Exception as e:
            print(f"Error in StockModel.get_positions: {e}")
            return []

    @staticmethod
    def get_position(user_id, symbol):
        try:
            stock = UserStock.query.filter_by(user_id=user_id, symbol=symbol.upper().strip()).first()
            return stock.to_dict() if stock else None
        except Exception as e:
            print(f"Error in StockModel.get_position: {e}")
            return None

    @staticmethod
    def update_latest_price(user_id, symbol, price):
        try:
            stock = UserStock.query.filter_by(user_id=user_id, symbol=symbol.upper().strip()).first()
            if stock:
                stock.latest_price = price
                db.session.commit()
                return True
            return False
        except Exception as e:
            db.session.rollback()
            print(f"Error in StockModel.update_latest_price: {e}")
            return False

    @staticmethod
    def update_quantity_and_prices(position_id, quantity, avg_price, latest_price):
        try:
            stock = UserStock.query.get(position_id)
            if stock:
                stock.quantity = quantity
                stock.avg_price = avg_price
                stock.latest_price = latest_price
                db.session.commit()
                return True
            return False
        except Exception as e:
            db.session.rollback()
            print(f"Error in StockModel.update_quantity_and_prices: {e}")
            return False
