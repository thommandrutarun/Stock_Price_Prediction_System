from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from datetime import datetime, timedelta
from flask_jwt_extended import (
    JWTManager,
    create_access_token,
    jwt_required,
    get_jwt_identity,
)
import yfinance as yf
import datetime as dt
import mysql.connector

app = Flask(__name__)

# -------- CONFIG --------
app.config["JWT_SECRET_KEY"] = "super-secret-key-change-this"

app.config["DB_HOST"] = "localhost"
app.config["DB_USER"] = "root"
app.config["DB_PASSWORD"] = "Tarun@2004"
app.config["DB_NAME"] = "stock_prediction"

# Allow frontend running on Live Server
CORS(
    app,
    resources={
        r"/api/*": {
            "origins": ["http://127.0.0.1:5500", "http://localhost:5500"]
        }
    },
)

bcrypt = Bcrypt(app)
jwt = JWTManager(app)


def get_db():
    return mysql.connector.connect(
        host=app.config["DB_HOST"],
        user=app.config["DB_USER"],
        password=app.config["DB_PASSWORD"],
        database=app.config["DB_NAME"],
    )


# -------- ADMIN HELPER --------
def admin_required(fn):
    from functools import wraps

    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        user_id = int(get_jwt_identity())
        conn = get_db()
        cur = conn.cursor(dictionary=True)
        cur.execute("SELECT role FROM users WHERE id = %s", (user_id,))
        row = cur.fetchone()
        cur.close()
        conn.close()
        if not row or row["role"] != "admin":
            return jsonify({"message": "Admin access required"}), 403
        return fn(*args, **kwargs)

    return wrapper


# -------- AUTH ROUTES --------
@app.route("/api/auth/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    phone = data.get("phone")
    dob = data.get("dob")  # "YYYY-MM-DD"
    profession = data.get("profession")

    if not name or not email or not password:
        return jsonify({"message": "All fields are required"}), 400

    conn = get_db()
    cur = conn.cursor(dictionary=True)
    cur.execute("SELECT id FROM users WHERE email = %s", (email,))
    if cur.fetchone():
        cur.close()
        conn.close()
        return jsonify({"message": "User already exists"}), 400

    pw_hash = bcrypt.generate_password_hash(password).decode("utf-8")
    cur.execute(
        """
        INSERT INTO users (name, email, password, phone, dob, profession, role)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        """,
        (name, email, pw_hash, phone, dob, profession, "user"),
    )
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({"message": "Registered successfully"}), 201


@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"message": "Email and password are required"}), 400

    conn = get_db()
    cur = conn.cursor(dictionary=True)
    cur.execute(
        "SELECT id, name, email, password, role FROM users WHERE email = %s",
        (email,),
    )
    user = cur.fetchone()
    cur.close()
    conn.close()

    if not user or not bcrypt.check_password_hash(user["password"], password):
        return jsonify({"message": "Invalid credentials"}), 401

    # identity must be string → store user id as string
    user_id = user["id"]
    token = create_access_token(identity=str(user_id))

    return jsonify(
        {
            "access_token": token,
            "user": {
                "email": user["email"],
                "name": user["name"],
                "role": user["role"],
            },
        }
    ), 200


# -------- ADMIN ENDPOINTS --------
@app.route("/api/admin/users")
@admin_required
def list_users():
    conn = get_db()
    cur = conn.cursor(dictionary=True)
    cur.execute(
        "SELECT id, name, email, phone, dob, profession, role "
        "FROM users ORDER BY id"
    )
    users = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify({"users": users})


# -------- yfinance HELPER --------
def get_history(symbol: str, period: str):
    """Fetch price history using yfinance.download to avoid 'possibly delisted' issues."""
    symbol = symbol.upper().strip()
    period_map = {"1mo": "1mo", "3mo": "3mo", "6mo": "6mo", "1y": "1y"}
    yf_period = period_map.get(period, "1mo")

    data = yf.download(symbol, period=yf_period, interval="1d", progress=False)
    if data.empty:
        raise ValueError(f"No price data for {symbol} in period={yf_period}")
    return data.reset_index()[["Date", "Close"]]

# -------- STOCK HISTORY --------
@app.route("/api/stocks/<symbol>/history")
@jwt_required()
def stock_history(symbol):
    period = request.args.get("period", "1mo")
    try:
        hist = get_history(symbol, period)
    except ValueError as e:
        return jsonify({"prices": [], "message": str(e)}), 404
    except Exception as e:
        # log e if needed
        return jsonify({
            "prices": [],
            "message": "Stock data provider is currently unavailable. Please try again later."
        }), 502

    prices = []
    for ts, row in hist.iterrows():
        prices.append({
            "date": ts.strftime("%Y-%m-%d"),
            "close": float(row["Close"]),
        })

    return jsonify(prices=prices), 200


# -------- SIMPLE PREDICTION --------
@app.route("/api/stocks/<symbol>/predict")
@jwt_required()
def predict(symbol):
    days = int(request.args.get("days", 5))
    try:
        hist = get_history(symbol, "1mo")
    except Exception as e:
        # log e if needed
        return jsonify({"predictions": []}), 502

    closes = hist["Close"].tail(10).tolist()
    if len(closes) < 2:
        return jsonify({"message": "Not enough data", "predictions": []}), 400

    diffs = [closes[i + 1] - closes[i] for i in range(len(closes) - 1)]
    avg_change = sum(diffs) / len(diffs)
    last_price = closes[-1]
    today = dt.date.today()

    predictions = []
    for i in range(1, days + 1):
        last_price += avg_change
        day = today + dt.timedelta(days=i)
        predictions.append({
            "date": day.strftime("%Y-%m-%d"),
            "predicted_close": float(last_price),
        })

    return jsonify({"predictions": predictions})


# -------- REPORTS SUMMARY --------
@app.route("/api/reports/summary")
@jwt_required()
def reports_summary():
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) FROM users")
    total_users = cur.fetchone()[0]
    cur.close()
    conn.close()
    data = {
        "total_users": total_users,
        "popular_symbols": ["AAPL", "TSLA", "MSFT", "GOOGL"],
    }
    return jsonify(data)


# -------- HEALTH CHECK --------
@app.route("/")
def home():
    return "Stock Price Prediction Backend Running"


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)

# -------- REPORTS SUMMARY --------

@app.route("/api/reports/summary")
@jwt_required()
def reports_summary():
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) FROM users")
    total_users = cur.fetchone()[0]
    cur.close()
    conn.close()
    data = {
        "total_users": total_users,
        "popular_symbols": ["AAPL", "TSLA", "MSFT", "GOOGL"],
    }
    return jsonify(data)

# ===== NEW: USER PORTFOLIO REPORT =====

@app.route("/api/reports/portfolio")
@jwt_required()
def user_portfolio():
    user_id = int(get_jwt_identity())

    conn = get_db()
    cur = conn.cursor(dictionary=True)

    # Adjust table/column names to match your DB
    cur.execute("""
        SELECT
            symbol,
            quantity,
            avg_price,
            latest_price,
            (latest_price * quantity) AS current_value,
            (latest_price - avg_price) AS change_abs,
            ((latest_price - avg_price) / avg_price) * 100 AS change_pct
        FROM user_stocks
        WHERE user_id = %s
        ORDER BY change_pct DESC
    """, (user_id,))
    rows = cur.fetchall()

    total_value = sum(r["current_value"] for r in rows) if rows else 0

    cur.close()
    conn.close()

    return jsonify({
        "total_value": total_value,
        "positions": rows
    })
