import requests
import json
import sys

BASE_URL = "http://localhost:5000/api"

# We need a token. Let's try to login first, or assuming we can't easily, 
# we might need to bypass auth or use a known user. 
# Based on app.py, there is a login endpoint.
# Let's try to register a temp user or login if we know credentials?
# Or just check if we can reach the public endpoints (none are public except auth/home).
# Wait, I have access to app.py, I can see the JWT secret. 
# I can generate a valid token myself if needed, OR just login with the user created in previous steps if any.

# Let's try to login with a test user. If it fails, we register one.
TEST_EMAIL = "test_verifier@example.com"
TEST_PASS = "password123"

def get_token():
    # Try Login
    try:
        res = requests.post(f"{BASE_URL}/auth/login", json={"email": TEST_EMAIL, "password": TEST_PASS})
        if res.status_code == 200:
            return res.json()["access_token"]
    except Exception as e:
        print(f"Login connection failed: {e}")
        return None

    # Try Register
    try:
        res = requests.post(f"{BASE_URL}/auth/register", json={
            "name": "Verifier",
            "email": TEST_EMAIL,
            "password": TEST_PASS,
            "phone": "0000000000",
            "dob": "2000-01-01",
            "profession": "Tester"
        })
        if res.status_code == 201:
            # Login again
            res = requests.post(f"{BASE_URL}/auth/login", json={"email": TEST_EMAIL, "password": TEST_PASS})
            if res.status_code == 200:
                return res.json()["access_token"]
    except Exception as e:
        print(f"Register failed: {e}")
    
    return None

def test_endpoints():
    print("--- Starting System Verification ---")
    
    # 1. Check Server Status
    try:
        r = requests.get("http://localhost:5000/")
        if r.status_code == 200:
            print("[PASS] Backend Server is Running")
        else:
            print(f"[FAIL] Backend Server returned {r.status_code}")
    except:
        print("[FAIL] Could not connect to Backend Server")
        return

    token = get_token()
    if not token:
        print("[FAIL] Could not authenticate (Login/Register failed).")
        return
    print("[PASS] Authentication (Login/Register)")

    headers = {"Authorization": f"Bearer {token}"}
    symbol = "AAPL"

    # 2. Test History
    try:
        r = requests.get(f"{BASE_URL}/stocks/{symbol}/history?period=1d", headers=headers)
        if r.status_code == 200:
            data = r.json()
            if len(data.get("prices", [])) > 0:
                print(f"[PASS] History API ({symbol}) returned {len(data['prices'])} records")
            else:
                print(f"[WARN] History API ({symbol}) returned empty list")
        else:
            print(f"[FAIL] History API returned {r.status_code} - {r.text}")
    except Exception as e:
        print(f"[FAIL] History API Exception: {e}")

    # 3. Test Prediction (Daily)
    try:
        r = requests.get(f"{BASE_URL}/stocks/{symbol}/predict?days=5&interval=1d", headers=headers)
        if r.status_code == 200:
            data = r.json()
            preds = data.get("predictions", [])
            print(f"[PASS] Prediction Daily API returned {len(preds)} predictions")
            if preds:
                print(f"       Sample Date: {preds[0]['date']} (Should be future/today)")
        else:
            print(f"[FAIL] Prediction Daily API returned {r.status_code} - {r.text}")
    except Exception as e:
        print(f"[FAIL] Prediction Daily API Exception: {e}")

    # 4. Test Prediction (Intraday)
    try:
        r = requests.get(f"{BASE_URL}/stocks/{symbol}/predict?days=5&interval=5m", headers=headers)
        if r.status_code == 200:
            data = r.json()
            preds = data.get("predictions", [])
            print(f"[PASS] Prediction Intraday (5m) API returned {len(preds)} predictions")
            if preds:
                print(f"       Sample Date: {preds[0]['date']} (Should include time)")
        else:
            print(f"[FAIL] Prediction Intraday (5m) API returned {r.status_code} - {r.text}")
    except Exception as e:
        print(f"[FAIL] Prediction Intraday API Exception: {e}")

if __name__ == "__main__":
    test_endpoints()
