import os
import requests
import pandas as pd
import redis

# Initialize Redis client for rate limit checks
redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
r_client = redis.Redis.from_url(redis_url)

class MarketDataProvider:
    @staticmethod
    def _is_rate_limited(provider_name):
        return r_client.exists(f"rate_limit:{provider_name}")

    @staticmethod
    def _set_rate_limited(provider_name, seconds=60):
        print(f"MarketDataProvider: [RATE LIMIT BLOCK] Provider {provider_name} has hit rate limits. Blocking for {seconds} seconds.")
        r_client.set(f"rate_limit:{provider_name}", "1", ex=seconds)

    @staticmethod
    def get_history(symbol, period):
        symbol = symbol.upper().strip()
        twelve_key = os.getenv("TWELVE_DATA_API_KEY")
        polygon_key = os.getenv("POLYGON_API_KEY")

        # Configuration interval mapping
        # Maps yfinance intervals to Twelve Data / Polygon equivalents
        period_map = {
            "1m":  {"interval": "1min",   "outputsize": 100},
            "5m":  {"interval": "5min",   "outputsize": 100},
            "15m": {"interval": "15min",  "outputsize": 100},
            "1d":  {"interval": "1day",   "outputsize": 100},
            "1w":  {"interval": "1week",  "outputsize": 50},
            "1mo": {"interval": "1day",   "outputsize": 30},
            "3mo": {"interval": "1day",   "outputsize": 90},
            "6mo": {"interval": "1day",   "outputsize": 180},
            "1y":  {"interval": "1day",   "outputsize": 365},
        }
        config = period_map.get(period, {"interval": "1day", "outputsize": 100})

        # --- Tier 1: Twelve Data ---
        if twelve_key and not MarketDataProvider._is_rate_limited("twelve_data"):
            try:
                url = f"https://api.twelvedata.com/time_series?symbol={symbol}&interval={config['interval']}&outputsize={config['outputsize']}&apikey={twelve_key}"
                resp = requests.get(url, timeout=5)
                
                if resp.status_code == 429:
                    MarketDataProvider._set_rate_limited("twelve_data")
                elif resp.status_code == 200:
                    data = resp.json()
                    if "values" in data:
                        df = pd.DataFrame(data["values"])
                        df["date"] = pd.to_datetime(df["datetime"])
                        df = df.rename(columns={"close": "close", "open": "open", "high": "high", "low": "low"})
                        df = df[["date", "open", "high", "low", "close"]]
                        # Reverse to chronological order (ascending dates)
                        df = df.iloc[::-1].reset_index(drop=True)
                        print(f"MarketDataProvider: Loaded history for {symbol} using Twelve Data.")
                        return df
            except Exception as e:
                print(f"MarketDataProvider Warning: Twelve Data fetch failed for {symbol}: {e}")

        # --- Tier 2: Polygon.io ---
        if polygon_key and not MarketDataProvider._is_rate_limited("polygon"):
            try:
                # Convert interval to Polygon timespan
                multiplier = 1
                timespan = "day"
                if "min" in config["interval"]:
                    multiplier = int(config["interval"].replace("min", ""))
                    timespan = "minute"
                elif "week" in config["interval"]:
                    timespan = "week"
                
                # Fetch recent aggregation bars
                url = f"https://api.polygon.io/v2/aggs/ticker/{symbol}/range/{multiplier}/{timespan}/2025-01-01/2026-12-31?adjusted=true&sort=asc&limit={config['outputsize']}&apiKey={polygon_key}"
                resp = requests.get(url, timeout=5)

                if resp.status_code == 429:
                    MarketDataProvider._set_rate_limited("polygon")
                elif resp.status_code == 200:
                    data = resp.json()
                    if "results" in data:
                        df = pd.DataFrame(data["results"])
                        # Polygon returns UNIX ms timestamps in 't'
                        df["date"] = pd.to_datetime(df["t"], unit="ms")
                        df = df.rename(columns={"o": "open", "h": "high", "l": "low", "c": "close"})
                        df = df[["date", "open", "high", "low", "close"]]
                        print(f"MarketDataProvider: Loaded history for {symbol} using Polygon.io.")
                        return df
            except Exception as e:
                print(f"MarketDataProvider Warning: Polygon.io fetch failed for {symbol}: {e}")

        # If both primary providers are rate-limited or fail, return None to trigger yfinance fallback
        return None

    @staticmethod
    def get_quote(symbol):
        symbol = symbol.upper().strip()
        twelve_key = os.getenv("TWELVE_DATA_API_KEY")
        polygon_key = os.getenv("POLYGON_API_KEY")

        # --- Tier 1: Twelve Data ---
        if twelve_key and not MarketDataProvider._is_rate_limited("twelve_data"):
            try:
                url = f"https://api.twelvedata.com/quote?symbol={symbol}&apikey={twelve_key}"
                resp = requests.get(url, timeout=5)

                if resp.status_code == 429:
                    MarketDataProvider._set_rate_limited("twelve_data")
                elif resp.status_code == 200:
                    data = resp.json()
                    if "price" in data:
                        price = float(data["price"])
                        change = float(data.get("change", 0.0))
                        percent = float(data.get("percent_change", 0.0))
                        print(f"MarketDataProvider: Loaded quote for {symbol} using Twelve Data.")
                        return {
                            "symbol": symbol,
                            "price": price,
                            "change": change,
                            "percent": percent
                        }
            except Exception as e:
                print(f"MarketDataProvider Warning: Twelve Data quote failed for {symbol}: {e}")

        # --- Tier 2: Polygon.io ---
        if polygon_key and not MarketDataProvider._is_rate_limited("polygon"):
            try:
                url = f"https://api.polygon.io/v2/aggs/ticker/{symbol}/prev?adjusted=true&apiKey={polygon_key}"
                resp = requests.get(url, timeout=5)

                if resp.status_code == 429:
                    MarketDataProvider._set_rate_limited("polygon")
                elif resp.status_code == 200:
                    data = resp.json()
                    if "results" in data and len(data["results"]) > 0:
                        res = data["results"][0]
                        price = float(res["c"])
                        prev_close = float(res["o"])
                        change = price - prev_close
                        percent = (change / prev_close) * 100 if prev_close != 0 else 0.0
                        print(f"MarketDataProvider: Loaded quote for {symbol} using Polygon.io.")
                        return {
                            "symbol": symbol,
                            "price": price,
                            "change": change,
                            "percent": percent
                        }
            except Exception as e:
                print(f"MarketDataProvider Warning: Polygon.io quote failed for {symbol}: {e}")

        # If both fail, return None to trigger yfinance fallback
        return None
