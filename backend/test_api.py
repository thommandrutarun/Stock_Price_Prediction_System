import requests
import json

# Login to get JWT
login_url = "http://127.0.0.1:5000/api/auth/login"
predict_url = "http://127.0.0.1:5000/api/stocks/AAPL/predict?days=5"

try:
    # 1. Login
    # Assuming a default test user or I register one?
    # I'll use the super admin credentials from app.py or just register a new one.
    # Actually, I can use the existing admin: 40tarun02@gmail.com
    # Wait, I don't know the password.
    # I should register a specific test user.
    session = requests.Session()
    
    register_url = "http://127.0.0.1:5000/api/auth/register"
    reg_data = {
        "email": "test_prediction_user@example.com",
        "password": "testpassword123",
        "name": "Test User"
    }
    requests.post(register_url, json=reg_data) # Ignore error if exists

    resp = session.post(login_url, json={"email": "test_prediction_user@example.com", "password": "testpassword123"})
    if resp.status_code != 200:
        print(f"Login failed: {resp.text}")
        exit()
    
    token = resp.json().get("access_token")
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Predict
    print(f"Requesting prediction for AAPL...")
    resp = requests.get(predict_url, headers=headers, timeout=60) # High timeout for LSTM
    
    print(f"Status Code: {resp.status_code}")
    print(f"Response: {resp.text}")

except Exception as e:
    print(f"Test Error: {e}")
