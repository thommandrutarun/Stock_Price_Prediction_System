
-- Add wallet_balance to users table if it doesn't exist
-- Note: MySQL doesn't support IF NOT EXISTS for columns in ALTER TABLE directly in older versions,
-- so we use a procedure or just run it and handle error. For simplicity in this script, we assume it needs adding.

-- We can use a safe block:
SET @dbname = DATABASE();
SET @tablename = "users";
SET @columnname = "wallet_balance";
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  "SELECT 1",
  "ALTER TABLE users ADD COLUMN wallet_balance DECIMAL(15, 2) DEFAULT 100000.00;"
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Create transactions table
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
);
