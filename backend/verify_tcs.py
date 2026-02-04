
import yfinance as yf
import pandas as pd

def test_fetch(symbol):
    print(f"Testing {symbol}...")
    try:
        # Mimic app.py 1mo config
        data = yf.download(symbol, period="1mo", interval="1h", progress=False)
        
        if data.empty:
            print("Data is EMPTY.")
        else:
            print("Data fetched successfully.")
            print("Columns:", data.columns)
            print("Head:", data.head(1))
            
    except Exception as e:
        print("Exception:", e)
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_fetch("TCS.NS")
