CREATE TABLE IF NOT EXISTS tenants (
  id SERIAL PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  identity_number TEXT,
  address TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'staff', 'tenant')),
  tenant_id INTEGER REFERENCES tenants(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rooms (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  floor INTEGER,
  area NUMERIC,
  price INTEGER NOT NULL CHECK (price >= 0),
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'rented', 'maintenance')),
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contracts (
  id SERIAL PRIMARY KEY,
  room_id INTEGER NOT NULL REFERENCES rooms(id) ON DELETE RESTRICT,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  start_date DATE NOT NULL,
  end_date DATE,
  deposit INTEGER NOT NULL DEFAULT 0 CHECK (deposit >= 0),
  monthly_rent INTEGER NOT NULL CHECK (monthly_rent >= 0),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'ended')),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS meter_readings (
  id SERIAL PRIMARY KEY,
  contract_id INTEGER NOT NULL REFERENCES contracts(id) ON DELETE RESTRICT,
  month TEXT NOT NULL,
  electricity_usage NUMERIC NOT NULL DEFAULT 0 CHECK (electricity_usage >= 0),
  electricity_unit_price INTEGER NOT NULL DEFAULT 0 CHECK (electricity_unit_price >= 0),
  water_usage NUMERIC NOT NULL DEFAULT 0 CHECK (water_usage >= 0),
  water_unit_price INTEGER NOT NULL DEFAULT 0 CHECK (water_unit_price >= 0),
  service_fee INTEGER NOT NULL DEFAULT 0 CHECK (service_fee >= 0),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (contract_id, month)
);

CREATE TABLE IF NOT EXISTS invoices (
  id SERIAL PRIMARY KEY,
  contract_id INTEGER NOT NULL REFERENCES contracts(id) ON DELETE RESTRICT,
  meter_reading_id INTEGER REFERENCES meter_readings(id) ON DELETE SET NULL,
  month TEXT NOT NULL,
  room_fee INTEGER NOT NULL CHECK (room_fee >= 0),
  electricity_usage NUMERIC NOT NULL DEFAULT 0 CHECK (electricity_usage >= 0),
  electricity_unit_price INTEGER NOT NULL DEFAULT 0 CHECK (electricity_unit_price >= 0),
  electricity_fee INTEGER NOT NULL DEFAULT 0 CHECK (electricity_fee >= 0),
  water_usage NUMERIC NOT NULL DEFAULT 0 CHECK (water_usage >= 0),
  water_unit_price INTEGER NOT NULL DEFAULT 0 CHECK (water_unit_price >= 0),
  water_fee INTEGER NOT NULL DEFAULT 0 CHECK (water_fee >= 0),
  service_fee INTEGER NOT NULL DEFAULT 0 CHECK (service_fee >= 0),
  total_amount INTEGER NOT NULL CHECK (total_amount >= 0),
  payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid')),
  paid_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (contract_id, month)
);
