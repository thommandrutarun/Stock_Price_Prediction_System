import mysql.connector

# DB Config
DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "Tarun@2004",
    "database": "stock_prediction"
}

def apply_lock():
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()

        # 1. Drop old triggers
        print("Dropping old triggers...")
        cursor.execute("DROP TRIGGER IF EXISTS one_admin_only")
        cursor.execute("DROP TRIGGER IF EXISTS one_admin_only_update")

        # 2. Create new INSERT trigger
        # Only allow admin if email is 40tarun02@gmail.com
        print("Creating new INSERT trigger...")
        cursor.execute("""
        CREATE TRIGGER one_admin_only
        BEFORE INSERT ON users
        FOR EACH ROW
        BEGIN
            IF NEW.role = 'admin' THEN
                IF NEW.email <> '40tarun02@gmail.com' THEN
                    SIGNAL SQLSTATE '45000'
                    SET MESSAGE_TEXT = 'Admin role is restricted to 40tarun02@gmail.com only.';
                END IF;
            END IF;
        END
        """)

        # 3. Create new UPDATE trigger
        # - Prevent promoting anyone else to admin
        # - Prevent demoting the locked admin (optional but good for safety)
        print("Creating new UPDATE trigger...")
        cursor.execute("""
        CREATE TRIGGER one_admin_only_update
        BEFORE UPDATE ON users
        FOR EACH ROW
        BEGIN
            -- Prevent promoting others
            IF NEW.role = 'admin' AND NEW.email <> '40tarun02@gmail.com' THEN
                SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Admin role is restricted to 40tarun02@gmail.com only.';
            END IF;

            -- Prevent demoting the locked admin
            IF OLD.email = '40tarun02@gmail.com' AND OLD.role = 'admin' AND NEW.role <> 'admin' THEN
                 SIGNAL SQLSTATE '45000'
                 SET MESSAGE_TEXT = 'Cannot demote the locked admin account.';
            END IF;
            
            -- Also prevent changing the email of the admin account to something else while keeping role admin
            IF OLD.email = '40tarun02@gmail.com' AND NEW.email <> '40tarun02@gmail.com' AND NEW.role = 'admin' THEN
                 SIGNAL SQLSTATE '45000'
                 SET MESSAGE_TEXT = 'Cannot change email of the locked admin account.';
            END IF;
        END
        """)

        conn.commit()
        print("Successfully locked admin credentials to 40tarun02@gmail.com")

    except mysql.connector.Error as err:
        print(f"Error: {err}")
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()

if __name__ == "__main__":
    apply_lock()
