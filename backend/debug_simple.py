
import yfinance as yf
import pandas as pd

def check_price():
    with open("price_output.txt", "w") as f:
        for symbol in ["BEL.NS", "HDFCBANK.NS"]:
            try:
                f.write(f"Checking {symbol}...\n")
                data = yf.download(symbol, period="1mo", interval="1h", progress=False)
                if isinstance(data.columns, pd.MultiIndex):
                     if "Close" in data.columns.get_level_values(0):
                         data.columns = data.columns.get_level_values(0)
                     else:
                         data.columns = data.columns.droplevel(1)
                
                if not data.empty:
                    close = data["Close"].iloc[-1]
                    f.write(f"FINAL_PRICE_{symbol}: {close}\n")
                else:
                    f.write(f"FINAL_PRICE_{symbol}: EMPTY\n")
            except Exception as e:
                f.write(f"FINAL_PRICE_{symbol}: ERROR {e}\n")

if __name__ == "__main__":
    check_price()
