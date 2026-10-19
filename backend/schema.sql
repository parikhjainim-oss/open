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

-- Admin credentials will be provided via environment variables during deployment.
-- Example: a separate seed script reads ADMIN_EMAIL and ADMIN_PASSWORD from .env and runs:
-- INSERT INTO users (email, password_hash, role) VALUES (ADMIN_EMAIL, crypt(ADMIN_PASSWORD, gen_salt('bf')), 'admin');
