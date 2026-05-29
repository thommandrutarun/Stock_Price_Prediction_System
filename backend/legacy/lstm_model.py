import numpy as np
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense
from sklearn.preprocessing import MinMaxScaler

def prepare_data(prices, look_back=60):
    """
    Prepares data for LSTM model.
    Scales data to 0-1 range and creates sequences.
    """
    scaler = MinMaxScaler(feature_range=(0, 1))
    prices_array = np.array(prices).reshape(-1, 1)
    scaled_prices = scaler.fit_transform(prices_array)

    X, y = [], []
    for i in range(look_back, len(scaled_prices)):
        X.append(scaled_prices[i-look_back:i, 0])
        y.append(scaled_prices[i, 0])
    
    X, y = np.array(X), np.array(y)
    X = np.reshape(X, (X.shape[0], X.shape[1], 1))
    
    return X, y, scaler, scaled_prices

def build_model(input_shape):
    """
    Builds a simple LSTM model.
    """
    model = Sequential()
    model.add(LSTM(units=50, return_sequences=True, input_shape=input_shape))
    model.add(LSTM(units=50))
    model.add(Dense(units=1))
    model.compile(optimizer='adam', loss='mean_squared_error')
    return model

def predict_lstm(prices, days=5, look_back=60):
    """
    Trains an LSTM model on the fly and predicts the next N days.
    """
    if len(prices) < look_back + 10:
        return []

    # 1. Prepare Data
    X, y, scaler, scaled_prices = prepare_data(prices, look_back)

    # 2. Build Model
    model = build_model((X.shape[1], 1))

    # 3. Train Model
    # 5 epochs provides a balance between speed and 'learning' effect
    model.fit(X, y, epochs=5, batch_size=32, verbose=0)

    # 4. Predict N Days
    predictions = []
    current_batch = scaled_prices[-look_back:]  # Last 60 days
    current_batch = current_batch.reshape((1, look_back, 1))

    for _ in range(days):
        # Predict 1 step
        pred_scaled = model.predict(current_batch, verbose=0)
        
        # Inverse transform to get real price
        pred_price = scaler.inverse_transform(pred_scaled)[0][0]
        predictions.append(round(float(pred_price), 2))

        # Update batch: remove first, add new prediction
        # current_batch is (1, 60, 1)
        next_seq = np.append(current_batch[0][1:], pred_scaled)
        current_batch = next_seq.reshape((1, look_back, 1))
    
    return predictions
