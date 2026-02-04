import yfinance as yf
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
import datetime as dt

def predict_price(prices):
    if len(prices) < 2:
        return float(prices[-1])

    X = np.array(range(len(prices))).reshape(-1, 1)
    y = np.array(prices)
    model = LinearRegression()
    model.fit(X, y)
    future_day = [[len(prices)]]
    prediction = model.predict(future_day)
    return round(float(prediction[0]), 2)

def get_history(symbol: str, period: str):
    symbol = symbol.upper().strip()
    
    # Map frontend period to yfinance period + interval
    period_config = {
        "1d":  {"p": "1d",  "i": "5m"},
        "1w":  {"p": "5d",  "i": "15m"},
        "1mo": {"p": "1mo", "i": "1h"},  # 1h for 1mo is good detail
        "3mo": {"p": "3mo", "i": "1d"},
        "6mo": {"p": "6mo", "i": "1d"},
        "1y":  {"p": "1y",  "i": "1d"},
        "3y":  {"p": "3y",  "i": "1wk"}, # 3y not supported natively, fetch 5y
        "5y":  {"p": "5y",  "i": "1wk"},
        "max": {"p": "max", "i": "1wk"}, # or 1mo
    }
    
    config = period_config.get(period, {"p": "1mo", "i": "1d"})
    
    # For 'all' we map to 'max'
    if period == "all":
        config = period_config["max"]
        
    data = yf.download(
        symbol, 
        period=config["p"], 
        interval=config["i"], 
        progress=False
    )
    
    # Flatten MultiIndex if present
    # yfinance < 0.2 returns (Open, High, ..)
    # yfinance >= 0.2 returns (Price, Ticker) -> we want Price level
    if isinstance(data.columns, pd.MultiIndex):
        # We assume level 0 is the price type (Open, Close, etc) and level 1 is Ticker
        # Check if 'Close' is in level 0
        if "Close" in data.columns.get_level_values(0):
             data.columns = data.columns.get_level_values(0)
        else:
             # Maybe swapped?
             data.columns = data.columns.droplevel(1)

    if data.empty:
        raise ValueError(f"No price data found for {symbol}. Market might be closed or symbol invalid.")

    # Standardize columns
    df = data.reset_index()
    
    # 3y filter logic
    if period == "3y":
        cutoff = dt.datetime.now() - dt.timedelta(days=3*365)
        date_col = "Date" if "Date" in df.columns else "Datetime"
        if date_col in df.columns:
            df[date_col] = pd.to_datetime(df[date_col]).dt.tz_localize(None)
            df = df[df[date_col] >= cutoff]

    # Normalize column names to Title Case for checking
    # Some versions return 'open', some 'Open'
    # we want to ensure we have 'Date'/'Datetime' and 'Open','High','Low','Close'
    
    # Create map of lower->actual
    col_map = {c.lower(): c for c in df.columns}
    
    # Find Date column
    date_col = col_map.get("date") or col_map.get("datetime")
    
    if not date_col:
        # Fallback, use index if it is a DatetimeIndex and wasn't reset properly?
        # But we did reset_index().
        pass

    final_cols = {}
    if date_col:
        final_cols["date"] = date_col
    
    for needed in ["open", "high", "low", "close"]:
        if needed in col_map:
            final_cols[needed] = col_map[needed]
        elif "close" in col_map:
             # Fallback: if 'open' missing (unlikely for daily, but maybe), use close
             final_cols[needed] = col_map["close"]

    # Construct new DF
    new_df = pd.DataFrame()
    for new_name, old_name in final_cols.items():
        new_df[new_name] = df[old_name]

    print("Final DF Columns:", new_df.columns) # Debug print
    return new_df


try:
    print("Fetching history calling function...")
    hist = get_history("AAPL", "1mo")
    print("Columns:", hist.columns)
    
    closes = hist["close"].astype(float).tail(30)
    print("Closes head:", closes.head())
    
    closes_list = closes.tolist()
    
    print("Predicting...")
    next_price = predict_price(closes_list)
    print("Next price:", next_price)

except Exception as e:
    print("Error:", e)
    import traceback
    traceback.print_exc()
