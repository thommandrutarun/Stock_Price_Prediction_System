import mysql.connector

# Config matches app.py
DB_HOST = "localhost"
DB_USER = "root"
DB_PASSWORD = "Tarun@2004"
DB_NAME = "stock_prediction"

def migrate_db():
    print("Connecting to database...")
    conn = mysql.connector.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME
    )
    cursor = conn.cursor()
    
    try:
        print("Altering table user_stocks...")
        cursor.execute("ALTER TABLE user_stocks ADD COLUMN purchase_date DATE;")
        conn.commit()
        print("Column purchase_date added successfully.")
    except mysql.connector.errors.ProgrammingError as e:
        if "Duplicate column name" in str(e):
            print("Column purchase_date already exists.")
        else:
            print(f"Error: {e}")
            
    cursor.close()
    conn.close()

if __name__ == "__main__":
    migrate_db()
