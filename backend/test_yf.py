import yfinance as yf
import pandas as pd

def test_fetch(symbol, period, interval):
    print(f"Testing {symbol} period={period} interval={interval}")
    try:
        data = yf.download(symbol, period=period, interval=interval, progress=False)
        print("Columns:", data.columns)
        print("Empty:", data.empty)
        if not data.empty:
            print(data.head())
            if isinstance(data.columns, pd.MultiIndex):
                print("MultiIndex detected")
                data.columns = data.columns.droplevel(1)
                print("Fixed Columns:", data.columns)
        else:
            print("Data is empty!")
    except Exception as e:
        print(f"Error: {e}")

test_fetch("AAPL", "1d", "5m")
test_fetch("AAPL", "5d", "15m")
test_fetch("AAPL", "1mo", "1h")
