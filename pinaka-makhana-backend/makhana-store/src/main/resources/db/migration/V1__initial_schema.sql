-- Initial schema baseline
-- This migration represents the current state of the database
-- Flyway will use this as the baseline and apply subsequent migrations

-- Create product table if it doesn't exist
CREATE TABLE IF NOT EXISTS product (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    flavor VARCHAR(255),
    description TEXT,
    short_description VARCHAR(500),
    price DOUBLE NOT NULL,
    original_price DOUBLE,
    image_url TEXT,
    rating DOUBLE DEFAULT 0.0,
    review_count INT DEFAULT 0,
    available BOOLEAN DEFAULT TRUE,
    stock_quantity INT DEFAULT 0,
    weight VARCHAR(50),
    sku VARCHAR(100) UNIQUE,
    category VARCHAR(50),
    is_premium BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    is_new_arrival BOOLEAN DEFAULT FALSE,
    calories DOUBLE,
    protein DOUBLE,
    carbohydrates DOUBLE,
    fat DOUBLE,
    fiber DOUBLE,
    meta_title VARCHAR(255),
    meta_description TEXT,
    min_order_quantity INT DEFAULT 1,
    shipping_weight DOUBLE,
    dimensions VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create user table if it doesn't exist
CREATE TABLE IF NOT EXISTS user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    role VARCHAR(50) DEFAULT 'USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
