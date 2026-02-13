import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv()

def get_db():
    return mysql.connector.connect(
        host=os.getenv("DB_HOST", "localhost"),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASSWORD", ""),
        database=os.getenv("DB_NAME", "stock_prediction"),
    )

def migrate():
    try:
        conn = get_db()
        cur = conn.cursor()
        
        print("Connected to database...")

        # 1. Add wallet_balance column
        # Check if column exists first to avoid error
        cur.execute("""
            SELECT count(*) 
            FROM information_schema.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'users' 
            AND COLUMN_NAME = 'wallet_balance'
        """)
        exists = cur.fetchone()[0]
        
        if not exists:
            print("Adding wallet_balance column...")
            cur.execute("ALTER TABLE users ADD COLUMN wallet_balance DECIMAL(15, 2) DEFAULT 100000.00")
        else:
            print("wallet_balance column already exists.")

        # 2. Create transactions table
        print("Creating transactions table...")
        cur.execute("""
            CREATE TABLE IF NOT EXISTS transactions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                symbol VARCHAR(20) NOT NULL,
                type ENUM('BUY', 'SELL') NOT NULL,
                quantity INT NOT NULL,
                price DECIMAL(10, 2) NOT NULL,
                total_amount DECIMAL(15, 2) NOT NULL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        """)
        
        # 3. Update existing users to have 100k if they are 0 (optional, but good for migration)
        cur.execute("UPDATE users SET wallet_balance = 100000.00 WHERE wallet_balance IS NULL OR wallet_balance = 0")
        
        conn.commit()
        cur.close()
        conn.close()
        print("Migration successful!")
        
    except Exception as e:
        print(f"Migration failed: {e}")

if __name__ == "__main__":
    migrate()
