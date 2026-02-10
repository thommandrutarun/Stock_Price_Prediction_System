
import yfinance as yf

def test_data():
    symbol = "BEL.NS"
    print(f"Fetching data for {symbol}...")
    
    # Portfolio uses this:
    print("\n--- Portfolio Logic (1d) ---")
    d1 = yf.download([symbol], period="1d", progress=False)
    print(d1)
    if not d1.empty:
        print("Last Close (1d):", d1["Close"].iloc[-1])
        
    # Dashboard uses this (default 1mo, 1h):
    print("\n--- Dashboard Logic (1mo, 1h) ---")
    d2 = yf.download(symbol, period="1mo", interval="1h", progress=False)
    print(d2.tail())
    if not d2.empty:
         # Handle MultiIndex if present (yfinance update)
         if isinstance(d2.columns,  pd.MultiIndex):
             try:
                 print("Last Close (1mo, 1h):", d2["Close"][symbol].iloc[-1])
             except:
                 print("Last Close (1mo, 1h) - Access Error")
         else:
             print("Last Close (1mo, 1h):", d2["Close"].iloc[-1])

    # Check for other symbols that might be ~1460
    print("\n--- Check HDFCBANK.NS ---")
    hdfc = yf.download("HDFCBANK.NS", period="1d", progress=False)
    print("HDFCBANK.NS:", hdfc["Close"].iloc[-1] if not hdfc.empty else "Empty")

import pandas as pd
test_data()
