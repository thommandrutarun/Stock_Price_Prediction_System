import mysql.connector

# DB Config
DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "Tarun@2004",
    "database": "stock_prediction"
}

def check_user(email):
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT email, role FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()
        conn.close()
        
        if user:
            print(f"FOUND: Email={user['email']}, Role={user['role']}")
        else:
            print("User not found")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_user("thommandrutarun2004@gmail.com")
