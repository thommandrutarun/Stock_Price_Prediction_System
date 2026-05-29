import datetime as dt
import pandas as pd
import yfinance as yf
from backend.app.utils.cache import cache

class StockService:
    @staticmethod
    def get_history(symbol: str, period: str):
        symbol = symbol.upper().strip()
        cache_key = f"hist_{symbol}_{period}"

        # 1. Attempt cache retrieval
        cached_data = cache.get(cache_key)
        if cached_data is not None:
            print(f"DEBUG [Cache HIT]: Stock history loaded from cache for {symbol} ({period})")
            return cached_data

        # Period configuration mapping
        period_config = {
            "1m":  {"p": "5d",  "i": "1m"},
            "5m":  {"p": "1mo", "i": "5m"},
            "15m": {"p": "1mo", "i": "15m"},
            "1d":  {"p": "1d",  "i": "5m"},
            "1w":  {"p": "5d",  "i": "15m"},
            "1mo": {"p": "1mo", "i": "1h"},
            "3mo": {"p": "3mo", "i": "1d"},
            "6mo": {"p": "6mo", "i": "1d"},
            "1y":  {"p": "1y",  "i": "1d"},
            "2y":  {"p": "2y",  "i": "1d"},
            "3y":  {"p": "3y",  "i": "1wk"},
            "5y":  {"p": "5y",  "i": "1wk"},
            "max": {"p": "max", "i": "1wk"},
        }
        
        config = period_config.get(period, {"p": "1mo", "i": "1d"})
        if period == "all":
            config = period_config["max"]
            
        # 2. Fetch from external Yahoo Finance API with timeout protection
        try:
            data = yf.download(
                symbol, 
                period=config["p"], 
                interval=config["i"], 
                progress=False,
                timeout=5
            )
        except Exception as e:
            print(f"Error fetching history for {symbol} from yfinance: {e}")
            raise RuntimeError(f"Stock data provider timeout or error: {e}")
        
        if isinstance(data.columns, pd.MultiIndex):
            if "Close" in data.columns.get_level_values(0):
                data.columns = data.columns.get_level_values(0)
            else:
                data.columns = data.columns.droplevel(1)

        if data.empty:
            raise ValueError(f"No price data found for {symbol}. Market might be closed or symbol invalid.")

        df = data.reset_index()
        
        if period == "3y":
            cutoff = dt.datetime.now() - dt.timedelta(days=3*365)
            date_col = "Date" if "Date" in df.columns else "Datetime"
            if date_col in df.columns:
                df[date_col] = pd.to_datetime(df[date_col]).dt.tz_localize(None)
                df = df[df[date_col] >= cutoff]

        col_map = {c.lower(): c for c in df.columns}
        date_col = col_map.get("date") or col_map.get("datetime")

        final_cols = {}
        if date_col:
            final_cols["date"] = date_col
        
        for needed in ["open", "high", "low", "close"]:
            if needed in col_map:
                final_cols[needed] = col_map[needed]
            elif "close" in col_map:
                final_cols[needed] = col_map["close"]

        new_df = pd.DataFrame()
        for new_name, old_name in final_cols.items():
            new_df[new_name] = df[old_name]

        # 3. Store DataFrame in cache (5 minutes TTL)
        cache.set(cache_key, new_df, ttl=300)
        return new_df

    @staticmethod
    def get_quote(symbol: str):
        symbol = symbol.upper().strip()
        cache_key = f"quote_{symbol}"

        # 1. Attempt cache retrieval
        cached_quote = cache.get(cache_key)
        if cached_quote is not None:
            print(f"DEBUG [Cache HIT]: Stock quote loaded from cache for {symbol}")
            return cached_quote

        ticker = yf.Ticker(symbol)
        
        # 2. Fetch from external Yahoo Finance API with timeout protection
        try:
            hist = ticker.history(period="1d", timeout=5)
            if hist.empty:
                hist = ticker.history(period="5d", timeout=5)
        except Exception as e:
            print(f"Error fetching quote for {symbol} from yfinance: {e}")
            raise RuntimeError(f"Stock data provider timeout or error: {e}")
        
        if hist.empty:
            quote_data = {"price": 0.0, "change": 0.0, "percent": 0.0, "symbol": symbol}
        else:
            current_price = hist["Close"].iloc[-1]
            prev_close = hist["Open"].iloc[0]
            if len(hist) > 1:
                prev_close = hist["Close"].iloc[-2]
                 
            change = current_price - prev_close
            percent = (change / prev_close) * 100 if prev_close != 0 else 0

            quote_data = {
                "symbol": symbol,
                "price": float(current_price),
                "change": float(change),
                "percent": float(percent)
            }

        # 3. Store quote in cache (10 seconds TTL)
        cache.set(cache_key, quote_data, ttl=10)
        return quote_data
