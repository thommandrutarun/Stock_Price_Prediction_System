import yfinance as yf
from backend.app.utils.cache import cache

class MarketService:
    @staticmethod
    def get_market_ticker():
        cache_key = "market_ticker"
        
        # 1. Attempt cache retrieval
        cached_ticker = cache.get(cache_key)
        if cached_ticker is not None:
            print("DEBUG [Cache HIT]: Market ticker loaded from cache")
            return cached_ticker

        assets = [
            {"symbol": "^BSESN", "label": "SENSEX", "currency": "₹"},
            {"symbol": "^NSEI", "label": "NIFTY 50", "currency": "₹"},
            {"symbol": "GC=F", "label": "GOLD 22K (1G)", "currency": "₹", "type": "gold"},
            {"symbol": "SI=F", "label": "SILVER (1KG)", "currency": "₹", "type": "silver"},
            {"static": True, "label": "PETROL", "value": 103.54, "currency": "₹", "change": 0.12, "pct": 0.11},
            {"static": True, "label": "DIESEL", "value": 90.03, "currency": "₹", "change": -0.05, "pct": -0.06},
            {"symbol": "BZ=F", "label": "CRUDE OIL", "currency": "$"},
            {"symbol": "USDINR=X", "label": "USD", "currency": "₹"},
        ]

        results = []
        # Get USD/INR rate first for conversion
        try:
            inr_ticker = yf.Ticker("USDINR=X")
            # Safe timeout protection
            inr_hist = inr_ticker.history(period="1d", timeout=5)
            inr_rate = float(inr_hist["Close"].iloc[-1]) if not inr_hist.empty else 83.0
        except Exception:
            inr_rate = 83.0 # Fallback

        for asset in assets:
            if asset.get("static"):
                results.append({
                    "label": asset["label"],
                    "value": asset["value"],
                    "currency": asset["currency"],
                    "change": asset["change"],
                    "pct": asset["pct"]
                })
                continue

            try:
                ticker = yf.Ticker(asset["symbol"])
                # Call with a 5-second timeout protection
                hist = ticker.history(period="2d", timeout=5)
                
                if len(hist) >= 2:
                    current_price = float(hist["Close"].iloc[-1])
                    prev_price = float(hist["Close"].iloc[-2])
                    change = current_price - prev_price
                    pct = (change / prev_price) * 100
                elif len(hist) == 1:
                    current_price = float(hist["Close"].iloc[-1])
                    prev_price = float(ticker.info.get("previousClose", current_price))
                    change = current_price - prev_price
                    pct = ((change / prev_price) * 100) if prev_price != 0 else 0
                else:
                    try:
                        current_price = float(ticker.fast_info.last_price)
                        prev_price = float(ticker.fast_info.previous_close)
                        change = current_price - prev_price
                        pct = ((change / prev_price) * 100) if prev_price != 0 else 0
                    except Exception:
                        current_price, change, pct = 0.0, 0.0, 0.0
            except Exception as e:
                print(f"Error fetching ticker for {asset['symbol']}: {e}")
                current_price, change, pct = 0.0, 0.0, 0.0

            # Conversion Logic for Metals
            if asset.get("type") == "gold":
                # GC=F is USD/oz. Gold 22K (1g) = (USD_per_oz / 31.1035) * INR_Rate * 0.916
                current_price = (current_price / 31.1035) * inr_rate * 0.916
                change = (change / 31.1035) * inr_rate * 0.916
            elif asset.get("type") == "silver":
                # SI=F is USD/oz. Convert to INR/1kg.
                current_price = (current_price / 31.1035) * inr_rate * 1000
                change = (change / 31.1035) * inr_rate * 1000

            results.append({
                "label": asset["label"],
                "value": round(current_price, 2),
                "currency": asset["currency"],
                "change": round(change, 2),
                "pct": pct
            })

        # 2. Store results in cache (15 seconds TTL)
        cache.set(cache_key, results, ttl=15)
        return results
