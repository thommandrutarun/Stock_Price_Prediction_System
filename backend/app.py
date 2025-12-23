from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import (
    JWTManager, create_access_token, jwt_required, get_jwt_identity
)
import yfinance as yf
import datetime as dt
import mysql.connector

app = Flask(__name__)

app.config["JWT_SECRET_KEY"] = "super-secret-key-change-this"

app.config["DB_HOST"] = "localhost"
app.config["DB_USER"] = "root"
app.config["DB_PASSWORD"] = ""
app.config["DB_NAME"] = "stock_prediction"

CORS(app, origins=["http://127.0.0.1:5500"])
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
        user_id = get_jwt_identity()
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
    dob = data.get("dob")  # ISO string "YYYY-MM-DD" from <input type='date'>
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

    token = create_access_token(identity=user["id"])
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
        "SELECT id, name, email, phone, dob, profession, role FROM users ORDER BY id"
    )
    users = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify({"users": users})


# -------- STOCK HISTORY --------
@app.route("/api/stocks/<symbol>/history")
@jwt_required()
def stock_history(symbol):
    period = request.args.get("period", "1mo")
    period_map = {"1mo": "1mo", "3mo": "3mo", "6mo": "6mo", "1y": "1y"}
    yf_period = period_map.get(period, "1mo")

    ticker = yf.Ticker(symbol.upper())
    hist = ticker.history(period=yf_period)

    if hist.empty:
        return jsonify({"message": "No data for this symbol/period"}), 404

    prices = []
    for ts, row in hist.iterrows():
        prices.append(
            {
                "date": ts.strftime("%Y-%m-%d"),
                "close": float(row["Close"]),
            }
        )

    return jsonify({"prices": prices})


# -------- SIMPLE PREDICTION --------
@app.route("/api/stocks/<symbol>/predict")
@jwt_required()
def predict(symbol):
    days = int(request.args.get("days", 5))

    ticker = yf.Ticker(symbol.upper())
    hist = ticker.history(period="1mo")

    if hist.empty:
        return jsonify({"message": "No data to predict"}), 404

    closes = hist["Close"].tail(10).tolist()
    if len(closes) < 2:
        return jsonify({"message": "Not enough data"}), 400

    diffs = [closes[i + 1] - closes[i] for i in range(len(closes) - 1)]
    avg_change = sum(diffs) / len(diffs)

    last_price = closes[-1]
    today = dt.date.today()
    predictions = []

    for i in range(1, days + 1):
        last_price += avg_change
        day = today + dt.timedelta(days=i)
        predictions.append(
            {
                "date": day.strftime("%Y-%m-%d"),
                "predicted_close": float(last_price),
            }
        )

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
