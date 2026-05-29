import os
import time
import json
import pandas as pd

class RenderFriendlyCache:
    def __init__(self):
        self.redis_client = None
        self.in_memory = {}
        
        redis_url = os.getenv("REDIS_URL")
        if redis_url:
            try:
                import redis
                # Setup Redis connection with a 2-second timeout protection
                self.redis_client = redis.Redis.from_url(
                    redis_url, 
                    socket_timeout=2.0, 
                    socket_connect_timeout=2.0,
                    decode_responses=True
                )
                self.redis_client.ping()
                print("DEBUG [Cache]: Connected to Redis successfully.")
            except Exception as e:
                print(f"Warning [Cache]: Redis connection failed ({e}). Falling back to In-Memory Cache.")
                self.redis_client = None

    def set(self, key, value, ttl=300):
        try:
            is_df = isinstance(value, pd.DataFrame)
            serialized = {
                "is_df": is_df,
                "data": value.to_json() if is_df else value
            }
            
            if self.redis_client:
                self.redis_client.setex(key, ttl, json.dumps(serialized))
            else:
                self.in_memory[key] = {
                    "value": value,
                    "expiry": time.time() + ttl
                }
        except Exception as e:
            print(f"Warning [Cache]: Set failed for key '{key}': {e}")

    def get(self, key):
        try:
            if self.redis_client:
                data = self.redis_client.get(key)
                if not data:
                    return None
                serialized = json.loads(data)
                if serialized.get("is_df"):
                    return pd.read_json(serialized["data"])
                return serialized["data"]
            else:
                entry = self.in_memory.get(key)
                if not entry:
                    return None
                if time.time() > entry["expiry"]:
                    del self.in_memory[key]
                    return None
                return entry["value"]
        except Exception as e:
            print(f"Warning [Cache]: Get failed for key '{key}': {e}")
            return None

    def delete(self, key):
        try:
            if self.redis_client:
                self.redis_client.delete(key)
            else:
                if key in self.in_memory:
                    del self.in_memory[key]
        except Exception as e:
            print(f"Warning [Cache]: Delete failed for key '{key}': {e}")

cache = RenderFriendlyCache()
