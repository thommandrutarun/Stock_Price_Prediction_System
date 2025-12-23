import numpy as np
from sklearn.linear_model import LinearRegression

def predict_price(prices):
    X = np.array(range(len(prices))).reshape(-1, 1)
    y = np.array(prices)

    model = LinearRegression()
    model.fit(X, y)

    future_day = [[len(prices)]]
    prediction = model.predict(future_day)
    return round(float(prediction[0]), 2)
