-- M3 Ride PostgreSQL schema. Safe to run repeatedly.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL, role VARCHAR(16) NOT NULL CHECK (role IN ('rider', 'driver', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS driver_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE, name VARCHAR(120) NOT NULL,
  phone VARCHAR(24), licence_number VARCHAR(80), vehicle_type VARCHAR(24) CHECK (vehicle_type IN ('bike', 'auto', 'cab')),
  vehicle_number VARCHAR(32), status VARCHAR(16) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'blocked')),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS rider_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE, name VARCHAR(120) NOT NULL,
  phone VARCHAR(24), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS pricing_rules (
  vehicle_type VARCHAR(24) PRIMARY KEY CHECK (vehicle_type IN ('bike', 'auto', 'cab')),
  base_fare NUMERIC(10,2) NOT NULL CHECK (base_fare >= 0), per_km_rate NUMERIC(10,2) NOT NULL CHECK (per_km_rate >= 0),
  minimum_fare NUMERIC(10,2) NOT NULL CHECK (minimum_fare >= 0), platform_levy NUMERIC(10,2) NOT NULL CHECK (platform_levy >= 0), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
INSERT INTO pricing_rules (vehicle_type, base_fare, per_km_rate, minimum_fare, platform_levy) VALUES
  ('bike', 25, 5, 25, 3), ('auto', 40, 8.5, 40, 4), ('cab', 65, 14, 65, 6) ON CONFLICT (vehicle_type) DO NOTHING;
CREATE TABLE IF NOT EXISTS rides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), rider_id UUID NOT NULL REFERENCES users(id), driver_id UUID REFERENCES users(id),
  vehicle_type VARCHAR(24) NOT NULL CHECK (vehicle_type IN ('bike', 'auto', 'cab')), pickup JSONB NOT NULL, dropoff JSONB NOT NULL,
  distance_km NUMERIC(8,2) NOT NULL CHECK (distance_km > 0), duration_mins INTEGER NOT NULL CHECK (duration_mins > 0), fare JSONB NOT NULL,
  pin_hash VARCHAR(255) NOT NULL, status VARCHAR(24) NOT NULL DEFAULT 'searching' CHECK (status IN ('searching', 'assigned', 'arrived', 'in_progress', 'completed', 'cancelled')),
  payment_method VARCHAR(32) NOT NULL DEFAULT 'cash', payment_status VARCHAR(16) NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  cancellation_reason TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), assigned_at TIMESTAMPTZ, arrived_at TIMESTAMPTZ, started_at TIMESTAMPTZ, completed_at TIMESTAMPTZ, cancelled_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS rides_rider_created_idx ON rides (rider_id, created_at DESC);
CREATE INDEX IF NOT EXISTS rides_driver_status_idx ON rides (driver_id, status);
CREATE INDEX IF NOT EXISTS rides_status_created_idx ON rides (status, created_at DESC);
CREATE TABLE IF NOT EXISTS ride_events (
  id BIGSERIAL PRIMARY KEY, ride_id UUID NOT NULL REFERENCES rides(id) ON DELETE CASCADE, actor_id UUID REFERENCES users(id),
  status VARCHAR(24) NOT NULL, note TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ride_events_ride_created_idx ON ride_events (ride_id, created_at);
