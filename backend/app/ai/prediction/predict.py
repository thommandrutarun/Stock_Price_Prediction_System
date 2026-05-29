import os
import threading
from collections import OrderedDict
import numpy as np
import tensorflow as tf
from backend.app.ai.training.preprocess import prepare_data
from backend.app.ai.training.train_model import build_model

# Ensure models directory exists
MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models")
os.makedirs(MODELS_DIR, exist_ok=True)

# Thread-safety mutex lock for loading/training Keras models
_model_lock = threading.Lock()

# LRU Model Cache (Restricted size to prevent RAM overflow in production)
_MODEL_CACHE = OrderedDict()
MAX_CACHE_SIZE = 5

def get_model_path(symbol, interval):
    """Generates standard model filename path on disk."""
    safe_symbol = symbol.upper().replace(".", "_").replace("=", "_").replace("^", "")
    return os.path.join(MODELS_DIR, f"{safe_symbol}_{interval}.keras")

def get_cached_model(symbol, interval, input_shape, X, y):
    """
    Retrieves a cached pre-trained model from memory.
    If not cached, loads it from disk.
    If it does not exist on disk, trains a new one, saves it, and caches it.
    Uses thread locking for thread safety.
    """
    model_key = f"{symbol.upper()}_{interval}"
    
    with _model_lock:
        # 1. Check in-memory cache (Hit)
        if model_key in _MODEL_CACHE:
            # Move to end to mark as most recently used
            _MODEL_CACHE.move_to_end(model_key)
            print(f"DEBUG [In-Memory HIT]: AI model loaded from RAM cache for {symbol} ({interval})")
            return _MODEL_CACHE[model_key]
            
        model_path = get_model_path(symbol, interval)
        model = None
        
        # 2. Check disk storage
        if os.path.exists(model_path):
            try:
                print(f"DEBUG [Disk HIT]: Loading cached pre-trained AI model from disk for {symbol} ({interval})")
                model = tf.keras.models.load_model(model_path)
            except Exception as e:
                print(f"Warning: Failed to load saved model for {symbol} ({interval}): {e}. Rebuilding...")

        # 3. Train on-the-fly (Fallback)
        if not model:
            print(f"DEBUG [MISS]: No cached model found for {symbol} ({interval}). Training new network...")
            model = build_model((input_shape[1], 1))
            model.fit(X, y, epochs=5, batch_size=32, verbose=0)
            
            try:
                model.save(model_path)
                print(f"DEBUG: Successfully saved trained AI model to {model_path}")
            except Exception as e:
                print(f"Warning: Failed to save trained model: {e}")

        # 4. Cache in memory with LRU eviction
        _MODEL_CACHE[model_key] = model
        _MODEL_CACHE.move_to_end(model_key)
        
        if len(_MODEL_CACHE) > MAX_CACHE_SIZE:
            # Evict least recently used (first item)
            oldest_key, _ = _MODEL_CACHE.popitem(last=False)
            print(f"DEBUG [Eviction]: RAM cache full. Evicted model {oldest_key} from memory.")
            
        return model

def predict_lstm(prices, symbol="GENERIC", interval="1d", days=5, look_back=60):
    """
    Optimized LSTM prediction.
    Utilizes LRU-cached models to avoid disk reads, compile times, and CPU spikes.
    """
    if len(prices) < look_back + 10:
        return []

    # 1. Prepare Scaling Data
    X, y, scaler, scaled_prices = prepare_data(prices, look_back)

    # 2. Fetch thread-safe cached model
    model = get_cached_model(symbol, interval, X.shape, X, y)

    # 3. Predict Future Steps
    predictions = []
    current_batch = scaled_prices[-look_back:]  # Take last lookback sequence
    current_batch = current_batch.reshape((1, look_back, 1))

    for _ in range(days):
        # Predict next step (run thread-safe)
        with _model_lock:
            pred_scaled = model.predict(current_batch, verbose=0)
        
        # Scale back to native price value
        pred_price = scaler.inverse_transform(pred_scaled)[0][0]
        predictions.append(round(float(pred_price), 2))

        # Shift batch sequence: discard oldest price, append prediction
        next_seq = np.append(current_batch[0][1:], pred_scaled)
        current_batch = next_seq.reshape((1, look_back, 1))
    
    return predictions
