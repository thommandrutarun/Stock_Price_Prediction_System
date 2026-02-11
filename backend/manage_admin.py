import mysql.connector
import sys

# DB Config (matching app.py)
DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "Tarun@2004",
    "database": "stock_prediction"
}

def get_db():
    return mysql.connector.connect(**DB_CONFIG)

def list_users():
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT id, name, email, role FROM users")
    users = cursor.fetchall()
    conn.close()
    
    print("Users List:")
    for u in users:
        print(f"Email: {u['email']}, Role: {u['role']}")
    return users

def promote_user(email):
    conn = get_db()
    cursor = conn.cursor()
    
    # Check if user exists
    cursor.execute("SELECT id, role FROM users WHERE email = %s", (email,))
    user = cursor.fetchone()
    
    if not user:
        print(f"\nUser with email '{email}' not found.")
        return

    if user[1] == 'admin':
         print(f"\nUser '{email}' is already an admin.")
         return

    # Check for existing admin
    cursor.execute("SELECT email FROM users WHERE role = 'admin'")
    existing_admin = cursor.fetchone()
    
    if existing_admin:
        print(f"Existing admin found: {existing_admin[0]}. Demoting...")
        cursor.execute("UPDATE users SET role = 'user' WHERE role = 'admin'")
    
    try:
        cursor.execute("UPDATE users SET role = 'admin' WHERE email = %s", (email,))
        conn.commit()
        print(f"\nSuccess! User '{email}' is now an Admin.")
    except Exception as e:
        print(f"\nError promoting user: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    if len(sys.argv) > 1:
        email = sys.argv[1]
        promote_user(email)
    else:
        list_users()
        print("\nTo promote a user, run: python manage_admin.py <email>")
