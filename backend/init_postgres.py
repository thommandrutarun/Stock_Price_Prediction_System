import os
import sys

# Add the project root to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.app import create_app
from backend.app.database.db import db

# Explicitly import all models so SQLAlchemy metadata registers them
from backend.app.models.user_model import User
from backend.app.models.stock_model import UserStock
from backend.app.models.transaction_model import Transaction
from backend.app.models.activity_model import UserActivity
from backend.app.models.admin_model import AdminLog
from backend.app.models.message_model import Message
from backend.app.models.metric_model import SystemMetric
from backend.app.models.watchlist_model import Watchlist

app = create_app()

with app.app_context():
    print("==========================================================")
    print("PostgreSQL Safe Schema Initialization Utility")
    print("==========================================================")
    
    print("Initializing missing database tables...")
    db.create_all()
    
    print("PostgreSQL tables initialized safely (zero data dropped)!")
    print("==========================================================")
