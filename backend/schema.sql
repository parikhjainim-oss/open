-- schema.sql - PostgreSQL schema for Rapido-like app
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('rider', 'driver', 'admin')),
    extra_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed a default admin (password: admin123 – you should change it)
INSERT INTO users (email, password_hash, role)
VALUES (
    'admin@example.com',
    crypt('admin123', gen_salt('bf')),
    'admin'
);
