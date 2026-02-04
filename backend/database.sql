CREATE DATABASE IF NOT EXISTS stock_prediction;

USE stock_prediction;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    dob DATE,
    profession VARCHAR(50),
    role VARCHAR(20) NOT NULL DEFAULT 'user'
);

DELIMITER $$

CREATE TRIGGER one_admin_only
BEFORE INSERT ON users
FOR EACH ROW
BEGIN
    IF NEW.role = 'admin' THEN
        IF (SELECT COUNT(*) FROM users WHERE role = 'admin') >= 1 THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Only one admin allowed';
        END IF;
    END IF;
END$$

CREATE TRIGGER one_admin_only_update
BEFORE UPDATE ON users
FOR EACH ROW
BEGIN
    IF NEW.role = 'admin' AND OLD.role <> 'admin' THEN
        IF (SELECT COUNT(*) FROM users WHERE role = 'admin') >= 1 THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Only one admin allowed';
        END IF;
    END IF;
END$$

DELIMITER ;

-- portfolio table used by /api/reports/portfolio
CREATE TABLE IF NOT EXISTS user_stocks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    symbol VARCHAR(10) NOT NULL,
    quantity INT NOT NULL,
    avg_price DECIMAL(10,2) NOT NULL,
    latest_price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
