import sys
import os
import time

LOG_FILE = "debug_output_v2.txt"

def log(msg):
    with open(LOG_FILE, "a") as f:
        f.write(msg + "\n")
    print(msg)

# Initialize log
with open(LOG_FILE, "w") as f:
    f.write("Starting debug_lstm_v2.py...\n")

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

# Try import
predict_lstm = None
try:
    log("Importing predict_lstm...")
    from lstm_model import predict_lstm
    log("Successfully imported predict_lstm.")
except Exception as e:
    log(f"FAIL: Could not import predict_lstm: {e}")
    # Try local import
    try:
        sys.path.append(os.getcwd())
        from backend.lstm_model import predict_lstm
        log("Successfully imported backend.lstm_model.predict_lstm.")
    except Exception as e2:
        log(f"FAIL: Could not import backend.lstm_model.predict_lstm: {e2}")

import yfinance as yf
import pandas as pd

def test(symbol, interval):
    log(f"\n--- Testing {symbol} {interval} ---")
    
    # Logic matching app.py
    if interval == "1m": period = "1m"; min_pts = 75
    elif interval == "5m": period = "5m"; min_pts = 75
    elif interval == "15m": period = "15m"; min_pts = 75
    else: period = "2y"; min_pts = 75 # for 1d

    p_config = {
        "1m": {"p": "5d", "i": "1m"},
        "5m": {"p": "1mo", "i": "5m"},
        "15m": {"p": "1mo", "i": "15m"},
        "2y": {"p": "2y", "i": "1d"}
    }
    cfg = p_config.get(period, {"p": "2y", "i": "1d"})
    
    log(f"Config: {cfg}")
    
    try:
        data = yf.download(symbol, period=cfg["p"], interval=cfg["i"], progress=False, threads=False)
        
        # Flatten
        if isinstance(data.columns, pd.MultiIndex):
             if "Close" in data.columns.get_level_values(0):
                  data.columns = data.columns.get_level_values(0)
             else:
                  data.columns = data.columns.droplevel(1)
        
        count = len(data)
        log(f"Fetched {count} rows.")
        
        if count < min_pts:
            log(f"FAIL: Not enough data ({count} < {min_pts})")
            return
            
        if predict_lstm:
            # Prepare data
            if "Close" in data.columns: c = data["Close"]
            elif "close" in data.columns: c = data["close"]
            else: 
                log(f"FAIL: No close column. Cols: {data.columns}")
                return
            
            closes = [float(x) for x in c if str(x) != 'nan']
            log(f"Predicting with {len(closes)} points...")
            try:
                # We need to reshape as predict_lstm expects list of floats
                preds = predict_lstm(closes, days=5)
                log(f"Predictions: {preds}")
            except Exception as e:
                log(f"FAIL: Prediction crashed: {e}")
        else:
            log("SKIP: predict_lstm not available.")

    except Exception as e:
        log(f"ERROR: {e}")

if __name__ == "__main__":
    test("AAPL", "1d")
    test("AAPL", "1m")
    test("INFY.NS", "1d")
