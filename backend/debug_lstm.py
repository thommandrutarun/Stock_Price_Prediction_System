import yfinance as yf
import pandas as pd
import datetime as dt
import sys
import time
import os

# Add backend to path to import lstm_model
sys.path.append(os.path.join(os.getcwd(), 'backend'))
try:
    from lstm_model import predict_lstm
except ImportError as e:
    with open("debug_output.txt", "a") as f:
        f.write(f"ImportError: {e}\n")
    # Try local if running from backend dir
    try:
        from lstm_model import predict_lstm
    except Exception as e2:
         with open("debug_output.txt", "a") as f:
             f.write(f"Could not import predict_lstm: {e2}\n")

def log(msg):
    with open("debug_output.txt", "a") as f:
        f.write(msg + "\n")
    print(msg)

def test_get_history(symbol: str, interval_key: str):
    log(f"\n--- Testing {symbol} with interval_key={interval_key} ---")
    
    if interval_key == "1m": period_key = "1m"; min_pts = 75
    elif interval_key == "5m": period_key = "5m"; min_pts = 75
    elif interval_key == "15m": period_key = "15m"; min_pts = 75
    else: period_key = "2y"; min_pts = 75

    period_config = {
        "1m":  {"p": "5d",  "i": "1m"},
        "5m":  {"p": "1mo", "i": "5m"},
        "15m": {"p": "1mo", "i": "15m"},
        "2y":  {"p": "2y",  "i": "1d"},
    }
    
    config = period_config.get(period_key, {"p": "2y", "i": "1d"})
    
    try:
        data = yf.download(
            symbol, 
            period=config["p"], 
            interval=config["i"], 
            progress=False,
            threads=False 
        )
        
        # Flatten logic from app.py
        if isinstance(data.columns, pd.MultiIndex):
            if "Close" in data.columns.get_level_values(0):
                 data.columns = data.columns.get_level_values(0)
            else:
                 data.columns = data.columns.droplevel(1)

        count = len(data)
        log(f"Fetched {count} rows.")
        
        if count < min_pts:
            log(f"FAIL: < {min_pts} points.")
            return

        # Prepare for prediction
        if "Close" in data.columns:
            closes = data["Close"].tolist()
        elif "close" in data.columns:
            closes = data["close"].tolist()
        else:
             log("FAIL: No Close column found.")
             log(f"Columns: {data.columns}")
             return
             
        log(f"Running prediction with {len(closes)} points...")
        try:
            full_closes = [float(x) for x in closes if str(x) != 'nan']
            preds = predict_lstm(full_closes, days=5)
            log(f"Prediction result: {preds}")
            if len(preds) == 5:
                log("SUCCESS: Prediction returned 5 values.")
            else:
                log("FAIL: Prediction returned wrong number of values.")
        except Exception as e:
            log(f"FAIL: Prediction error: {e}")

    except Exception as e:
        log(f"ERROR: {e}")

if __name__ == "__main__":
    with open("debug_output.txt", "w") as f:
        f.write("Starting tests including prediction...\n")
        
    test_get_history("AAPL", "1d")
    time.sleep(1)
    test_get_history("AAPL", "1m")
    time.sleep(1)
    test_get_history("INFY.NS", "1d")
    log("Done.")
