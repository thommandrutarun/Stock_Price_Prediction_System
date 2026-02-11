import mysql.connector

# DB Config
DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "Tarun@2004",
    "database": "stock_prediction"
}

def apply_migration():
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()

        print("1. Dropping single-admin restriction triggers...")
        cursor.execute("DROP TRIGGER IF EXISTS one_admin_only")
        cursor.execute("DROP TRIGGER IF EXISTS one_admin_only_update")
        print("   - Triggers dropped.")

        print("2. Creating admin_logs table...")
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS admin_logs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            admin_email VARCHAR(100) NOT NULL,
            action VARCHAR(50) NOT NULL,
            target VARCHAR(255),
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
        """)
        print("   - Table created.")

        conn.commit()
        print("\nSuccess! Database migrated for Multi-Admin system.")

    except mysql.connector.Error as err:
        print(f"Error: {err}")
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()

if __name__ == "__main__":
    apply_migration()
