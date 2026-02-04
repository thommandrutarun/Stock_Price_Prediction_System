from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import (
    JWTManager,
    create_access_token,
    jwt_required,
    get_jwt_identity,
)
import datetime as dt
import yfinance as yf
import mysql.connector
import pandas as pd
from functools import wraps

from model import predict_price  # your ML helper


# -------- CONFIG --------

app = Flask(__name__)

CORS(
    app,
    resources={
        r"/api/*": {
            "origins": ["http://127.0.0.1:5500", "http://localhost:5500"],
            "supports_credentials": True,
        }
    },
)

bcrypt = Bcrypt(app)
jwt = JWTManager(app)

app.config["JWT_SECRET_KEY"] = "super-secret-key-change-this"

app.config["DB_HOST"] = "localhost"
app.config["DB_USER"] = "root"
app.config["DB_PASSWORD"] = "Tarun@2004"  # change for production
app.config["DB_NAME"] = "stock_prediction"


def get_db():
    return mysql.connector.connect(
        host=app.config["DB_HOST"],
        user=app.config["DB_USER"],
        password=app.config["DB_PASSWORD"],
        database=app.config["DB_NAME"],
    )


# -------- ADMIN HELPER --------

def admin_required(fn):
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
    dob = data.get("dob")   # "YYYY-MM-DD"
    profession = data.get("profession")

    if not name or not email or not password:
        return jsonify({"message": "All fields are required"}), 400

    conn = get_db()
    cur = conn.cursor(dictionary=True)

    # Check if user already exists
    cur.execute("SELECT id FROM users WHERE email = %s", (email,))
    if cur.fetchone():
        cur.close()
        conn.close()
        return jsonify({"message": "User already exists"}), 400

    pw_hash = bcrypt.generate_password_hash(password).decode("utf-8")

    # Always create normal user (role = 'user')
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

    user_id = user["id"]
    token = create_access_token(identity=str(user_id))

    return (
        jsonify(
            {
                "access_token": token,
                "user": {
                    "email": user["email"],
                    "name": user["name"],
                    "role": user["role"],
                },
            }
        ),
        200,
    )


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
    symbol = symbol.upper().strip()
    
    # Map frontend period to yfinance period + interval
    # 1d -> 1d period, 5m interval
    # 1w -> 5d period, 15m interval? Or 1mo period? 
    # yfinance '1w' period doesn't exist? It does. '5d', '1mo', etc.
    # valid periods: 1d,5d,1mo,3mo,6mo,1y,2y,5y,10y,ytd,max
    
    # We map user "1W" -> "5d" (trading week) or "1mo"? "5d" is usually standard for 1 week view.
    # User "3Y" -> "5y"? yfinance doesn't have 3y. We can use "5y" and slice? Or "5y" is fine.
    
    period_config = {
        "1d":  {"p": "1d",  "i": "5m"},
        "1w":  {"p": "5d",  "i": "15m"},
        "1mo": {"p": "1mo", "i": "1h"},  # 1h for 1mo is good detail
        "3mo": {"p": "3mo", "i": "1d"},
        "6mo": {"p": "6mo", "i": "1d"},
        "1y":  {"p": "1y",  "i": "1d"},
        "3y":  {"p": "3y",  "i": "1wk"}, # 3y not supported natively, fetch 5y
        "5y":  {"p": "5y",  "i": "1wk"},
        "max": {"p": "max", "i": "1wk"}, # or 1mo
    }
    
    config = period_config.get(period, {"p": "1mo", "i": "1d"})
    
    # For 'all' we map to 'max'
    if period == "all":
        config = period_config["max"]
        
    data = yf.download(
        symbol, 
        period=config["p"], 
        interval=config["i"], 
        progress=False
    )
    
    # Flatten MultiIndex if present
    # yfinance < 0.2 returns (Open, High, ..)
    # yfinance >= 0.2 returns (Price, Ticker) -> we want Price level
    if isinstance(data.columns, pd.MultiIndex):
        # We assume level 0 is the price type (Open, Close, etc) and level 1 is Ticker
        # Check if 'Close' is in level 0
        if "Close" in data.columns.get_level_values(0):
             data.columns = data.columns.get_level_values(0)
        else:
             # Maybe swapped?
             data.columns = data.columns.droplevel(1)

    if data.empty:
        raise ValueError(f"No price data found for {symbol}. Market might be closed or symbol invalid.")

    # Standardize columns
    df = data.reset_index()
    
    # 3y filter logic
    if period == "3y":
        cutoff = dt.datetime.now() - dt.timedelta(days=3*365)
        date_col = "Date" if "Date" in df.columns else "Datetime"
        if date_col in df.columns:
            df[date_col] = pd.to_datetime(df[date_col]).dt.tz_localize(None)
            df = df[df[date_col] >= cutoff]

    # Normalize column names to Title Case for checking
    # Some versions return 'open', some 'Open'
    # we want to ensure we have 'Date'/'Datetime' and 'Open','High','Low','Close'
    
    # Create map of lower->actual
    col_map = {c.lower(): c for c in df.columns}
    
    # Find Date column
    date_col = col_map.get("date") or col_map.get("datetime")
    
    if not date_col:
        # Fallback, use index if it is a DatetimeIndex and wasn't reset properly?
        # But we did reset_index().
        pass

    final_cols = {}
    if date_col:
        final_cols["date"] = date_col
    
    for needed in ["open", "high", "low", "close"]:
        if needed in col_map:
            final_cols[needed] = col_map[needed]
        elif "close" in col_map:
             # Fallback: if 'open' missing (unlikely for daily, but maybe), use close
             final_cols[needed] = col_map["close"]

    # Construct new DF
    new_df = pd.DataFrame()
    for new_name, old_name in final_cols.items():
        new_df[new_name] = df[old_name]

    return new_df




# -------- STOCK HISTORY --------

@app.route("/api/stocks/<symbol>/history")
@jwt_required()
def stock_history(symbol):
    period = request.args.get("period", "1mo").lower()
    try:
        hist = get_history(symbol, period)
    except ValueError as e:
        return jsonify({"prices": [], "message": str(e)}), 404
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Error fetching history for {symbol}: {e}")
        return (
            jsonify(
                {
                    "prices": [],
                    "message": f"Stock data provider error: {str(e)}",
                }
            ),
            502,
        )

    # Convert to struct
    # hist has lower case columns: date, open, high, low, close
    # Intraday dates might include time
    
    # Helper to format date
    def fmt_date(d):
        if isinstance(d, pd.Timestamp):
            # If intraday (has non-zero time), keep time
            if d.time() != dt.time(0, 0):
                return d.strftime("%Y-%m-%d %H:%M")
            return d.strftime("%Y-%m-%d")
        return str(d)

    data = []
    for _, row in hist.iterrows():
        entry = {
            "date": fmt_date(row["date"]),
            "open": float(row["open"]),
            "high": float(row["high"]),
            "low": float(row["low"]),
            "close": float(row["close"]),
        }
        data.append(entry)

    return jsonify({"prices": data}), 200


# -------- SIMPLE PREDICTION USING model.py --------

@app.route("/api/stocks/<symbol>/predict")
@jwt_required()
def predict(symbol):
    days = int(request.args.get("days", 5))
    try:
        hist = get_history(symbol, "1mo")
    except Exception:
        return jsonify({"predictions": [], "message": "Could not fetch history"}), 502

    closes = hist["close"].astype(float).tail(30).tolist()
    if len(closes) < 5:
        return jsonify({"message": "Not enough data", "predictions": []}), 400

    today = dt.date.today()
    predictions = []
    last_prices = closes[:]  # copy

    for i in range(1, days + 1):
        next_price = predict_price(last_prices)
        next_price = float(next_price)
        last_prices.append(next_price)
        predictions.append(
            {
                "date": (today + dt.timedelta(days=i)).strftime("%Y-%m-%d"),
                "predicted_close": next_price,
            }
        )

    return jsonify({"predictions": predictions}), 200


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


# -------- USER PORTFOLIO REPORT --------

@app.route("/api/reports/portfolio")
@jwt_required()
def user_portfolio():
    user_id = int(get_jwt_identity())
    conn = get_db()
    cur = conn.cursor(dictionary=True)
    cur.execute(
        """
        SELECT
            symbol,
            quantity,
            avg_price,
            latest_price,
            latest_price * quantity AS current_value,
            latest_price - avg_price AS change_abs,
            (latest_price - avg_price) / avg_price * 100 AS change_pct
        FROM user_stocks
        WHERE user_id = %s
        ORDER BY change_pct DESC
        """,
        (user_id,),
    )
    rows = cur.fetchall()
    total_value = sum(r["current_value"] for r in rows) if rows else 0
    cur.close()
    conn.close()
    return jsonify(
        {
            "total_value": float(total_value),
            "positions": rows,
        }
    )


# -------- HEALTH CHECK --------

@app.route("/")
def home():
    return "Stock Price Prediction Backend Running"


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
