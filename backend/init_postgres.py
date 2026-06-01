import os
import sys

# Add the project root to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.app import create_app
from backend.app.database.db import db

app = create_app()

with app.app_context():
    print("==========================================================")
    print("PostgreSQL Safe Schema Initialization Utility")
    print("==========================================================")
    
    print("Initializing missing database tables...")
    db.create_all()
    
    print("PostgreSQL tables initialized safely (zero data dropped)!")
    print("==========================================================")
