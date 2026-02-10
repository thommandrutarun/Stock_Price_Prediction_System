import mysql.connector
import os

# Config matches app.py
DB_HOST = "localhost"
DB_USER = "root"
DB_PASSWORD = "Tarun@2004"
DB_NAME = "stock_prediction"

def init_db():
    print("Connecting to database...")
    conn = mysql.connector.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME
    )
    cursor = conn.cursor()
    
    print("Reading database.sql...")
    with open("database.sql", "r") as f:
        sql_content = f.read()
    
    # Split by delimiter if possible, but basic splitting by ; might work for simple tables
    # However, triggers use DELIMITER $$, so we need to be careful.
    # For now, let's just manually run the CREATE TABLE for user_stocks which is missing.
    
    commands = [
        """
        CREATE TABLE IF NOT EXISTS user_stocks (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            symbol VARCHAR(10) NOT NULL,
            quantity INT NOT NULL,
            avg_price DECIMAL(10,2) NOT NULL,
            latest_price DECIMAL(10,2) NOT NULL,
            purchase_date DATE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
        """,
        """
        CREATE TABLE IF NOT EXISTS messages (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(100) NOT NULL,
            subject VARCHAR(255),
            message TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        """

    ]
    
    for cmd in commands:
        print(f"Executing: {cmd.strip()}")
        cursor.execute(cmd)
    
    conn.commit()
    cursor.close()
    conn.close()
    print("Database initialized successfully.")

if __name__ == "__main__":
    init_db()
