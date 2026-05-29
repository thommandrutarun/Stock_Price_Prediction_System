import datetime as dt
from backend.app.models.user_model import UserModel
from backend.app.models.stock_model import StockModel
from backend.app.models.transaction_model import TransactionModel
from backend.app.services.stock_service import StockService

class TradeService:
    @staticmethod
    def get_exchange_rate(symbol: str):
        """Returns the conversion rate from native currency to USD."""
        is_inr = symbol.upper().endswith(".NS") or symbol.upper().endswith(".BO")
        return 84.0 if is_inr else 1.0 # 1 USD = 84 INR

    @classmethod
    def execute_buy(cls, user_id: int, symbol: str, quantity: int):
        symbol = symbol.upper().strip()
        
        # 1. Fetch live stock price
        df = StockService.get_history(symbol, "1d")
        if df.empty:
            raise ValueError("Could not fetch live price")
        current_price = float(df.iloc[-1]["close"])

        # 2. Compute cost and currency conversion
        exchange_rate = cls.get_exchange_rate(symbol)
        total_cost_native = current_price * quantity
        total_cost_usd = total_cost_native / exchange_rate

        # 3. Check wallet balance
        user = UserModel.get_by_id(user_id)
        if not user:
            raise ValueError("User not found")

        balance = float(user["wallet_balance"] or 0)
        if balance < total_cost_usd:
            raise ValueError(f"Insufficient funds. Cost: ${total_cost_usd:.2f}, Balance: ${balance:.2f}")

        # 4. Perform buy transaction
        new_balance = balance - total_cost_usd
        UserModel.update_balance(user_id, new_balance)

        existing = StockModel.get_position(user_id, symbol)
        if existing:
            new_qty = existing["quantity"] + quantity
            # Weighted average price computation in native currency
            old_total_val = existing["quantity"] * float(existing["avg_price"])
            new_total_val = old_total_val + total_cost_native
            new_avg = new_total_val / new_qty
            
            StockModel.update_quantity_and_prices(existing["id"], new_qty, new_avg, current_price)
        else:
            StockModel.add_position(user_id, symbol, quantity, current_price, current_price, dt.date.today())

        # 5. Log transaction record
        TransactionModel.create(user_id, symbol, "BUY", quantity, current_price, total_cost_native)

        return {
            "message": f"Bought {quantity} {symbol} @ {current_price:.2f}",
            "new_balance": new_balance
        }

    @classmethod
    def execute_sell(cls, user_id: int, symbol: str, quantity: int):
        symbol = symbol.upper().strip()
        
        # 1. Fetch live price
        df = StockService.get_history(symbol, "1d")
        if df.empty:
            raise ValueError("Could not fetch live price")
        current_price = float(df.iloc[-1]["close"])

        # 2. Check holdings
        existing = StockModel.get_position(user_id, symbol)
        if not existing or existing["quantity"] < quantity:
            raise ValueError("Insufficient shares to sell")

        # 3. Currency conversion
        exchange_rate = cls.get_exchange_rate(symbol)
        total_sale_value_native = current_price * quantity
        total_sale_value_usd = total_sale_value_native / exchange_rate

        # 4. Execute sell transaction
        new_qty = existing["quantity"] - quantity
        if new_qty == 0:
            StockModel.delete_position(user_id, symbol)
        else:
            StockModel.update_quantity_and_prices(existing["id"], new_qty, existing["avg_price"], current_price)

        # 5. Add balance to wallet
        user = UserModel.get_by_id(user_id)
        new_balance = float(user["wallet_balance"] or 0) + total_sale_value_usd
        UserModel.update_balance(user_id, new_balance)

        # 6. Log transaction record
        TransactionModel.create(user_id, symbol, "SELL", quantity, current_price, total_sale_value_native)

        return {
            "message": f"Sold {quantity} {symbol} @ {current_price:.2f}",
            "new_balance": new_balance
        }
