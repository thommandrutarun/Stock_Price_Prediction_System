import numpy as np
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
