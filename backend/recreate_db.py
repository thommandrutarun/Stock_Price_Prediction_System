import os
import sys

# Add the project root to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.app import create_app
from backend.app.database.db import db
from backend.app.models.user_model import UserModel, User
from backend.app.models.stock_model import StockModel, UserStock
from backend.app.models.transaction_model import TransactionModel, Transaction
from backend.app.models.message_model import MessageModel, Message
from backend.app.models.admin_model import AdminLogModel, AdminLog
from backend.app.models.metric_model import SystemMetric
from backend.app.models.activity_model import UserActivity
from backend.app.models.watchlist_model import Watchlist
from flask_bcrypt import generate_password_hash

app = create_app()

with app.app_context():
    print("==========================================================")
    print("Database Schema Alignment Utility")
    print("==========================================================")
    
    print("Dropping all legacy mismatched tables...")
    db.drop_all()
    
    print("Recreating database tables from SQLAlchemy models...")
    db.create_all()
    print("Tables created successfully with all required columns (created_at, etc.)!")

    # Seed the standard Super Admin user (as seen in workbench/auth logs)
    admin_pw = generate_password_hash("Tarun@2004").decode("utf-8")
    success = UserModel.create(
        name="Super Admin",
        email="40tarun02@gmail.com",
        hashed_pw=admin_pw,
        phone="+91780502718",
        dob="2004-05-31",
        profession="System Administrator",
        role="admin",
        wallet_balance=100000.0
    )
    
    if success:
        print("Successfully seeded Default Admin Account:")
        print("  - Email: 40tarun02@gmail.com")
        print("  - Password: Tarun@2004")
    else:
        print("Warning: Seeding default admin user failed.")

    # Let's seed the regular user they were trying to log in with:
    # thommandrutarun2004@gmail.com
    user_pw = generate_password_hash("Tarun@2004").decode("utf-8")
    success_user = UserModel.create(
        name="Tarun",
        email="thommandrutarun2004@gmail.com",
        hashed_pw=user_pw,
        phone="780502718",
        dob="2004-05-31",
        profession="Software Engineer",
        role="user",
        wallet_balance=100000.0
    )
    
    if success_user:
        print("Successfully seeded Regular User Account:")
        print("  - Email: thommandrutarun2004@gmail.com")
        print("  - Password: Tarun@2004")
    
    print("==========================================================")
    print("Database sync complete! Start the server to begin.")
    print("==========================================================")
