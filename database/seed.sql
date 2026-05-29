-- Database Seed Data for Stock Price Prediction System

-- 1. Insert Users (Bcrypt hashed password: 'password123')
INSERT INTO users (name, email, password, phone, dob, profession, role, wallet_balance) VALUES
('Super Admin', '40tarun02@gmail.com', '$2b$12$K.F1o5B9D.rL3gBqF9wXFe8/sFepWbB5XN/fO1y6zL5h4xT0cE2C2', '+919876543210', '2004-01-01', 'Software Engineer', 'admin', 250000.00),
('John Doe', 'john.doe@example.com', '$2b$12$K.F1o5B9D.rL3gBqF9wXFe8/sFepWbB5XN/fO1y6zL5h4xT0cE2C2', '+15550199', '1995-05-15', 'Financial Analyst', 'user', 100000.00),
('Jane Smith', 'jane.smith@example.com', '$2b$12$K.F1o5B9D.rL3gBqF9wXFe8/sFepWbB5XN/fO1y6zL5h4xT0cE2C2', '+15550198', '1998-08-20', 'Traders', 'user', 85000.00);

-- 2. Insert Mock Stock Holdings
INSERT INTO user_stocks (user_id, symbol, quantity, avg_price, latest_price, purchase_date) VALUES
(2, 'AAPL', 10, 175.50, 182.30, '2026-05-10'),
(2, 'TSLA', 5, 220.00, 215.40, '2026-05-12'),
(3, 'AAPL', 15, 178.20, 182.30, '2026-05-14'),
(3, 'MSFT', 8, 395.00, 415.60, '2026-05-15');

-- 3. Insert Mock Transactions History
INSERT INTO transactions (user_id, symbol, type, quantity, price, total_amount, timestamp) VALUES
(2, 'AAPL', 'BUY', 10, 175.50, 1755.00, '2026-05-10 10:15:30'),
(2, 'TSLA', 'BUY', 5, 220.00, 1100.00, '2026-05-12 14:22:11'),
(3, 'AAPL', 'BUY', 15, 178.20, 2673.00, '2026-05-14 09:35:45'),
(3, 'MSFT', 'BUY', 8, 395.00, 3160.00, '2026-05-15 11:05:12');

-- 4. Insert Mock Admin Logs
INSERT INTO admin_logs (admin_email, action, target, timestamp) VALUES
('40tarun02@gmail.com', 'PROMOTED_USER_TO_ADMIN', 'jane.smith@example.com', '2026-05-20 16:45:00'),
('40tarun02@gmail.com', 'RESET_USER_WALLET', 'john.doe@example.com', '2026-05-22 10:30:00');

-- 5. Insert Mock Help Desk Messages
INSERT INTO messages (name, email, subject, message, timestamp) VALUES
('Alice Green', 'alice.green@example.com', 'Prediction Accuracy Inquiry', 'Hi, I would like to know how often the LSTM prediction models are retrained. Thanks!', '2026-05-26 08:30:00'),
('Bob Miller', 'bob.miller@example.com', 'Login Issue', 'I am unable to login to my account since yesterday. Please help.', '2026-05-27 15:10:00');
