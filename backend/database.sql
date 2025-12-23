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
