require('dotenv').config();

const mysql = require('mysql2/promise');

function openDatabase(config = {}) {
  return mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    database: process.env.DB_NAME || 'quan_ly_phong_tro',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    waitForConnections: true,
    connectionLimit: Number(process.env.DB_POOL_SIZE || 10),
    namedPlaceholders: false,
    ...config,
  });
}

async function execute(db, sql, params = []) {
  if (typeof db.execute === 'function') {
    return db.execute(sql, params);
  }

  const result = await db.query(toPostgresSql(sql), params);
  return [result.rows, {
    affectedRows: result.rowCount,
    insertId: result.rows[0]?.id,
  }];
}

async function run(db, sql, params = []) {
  const [rowsOrResult, meta] = await execute(db, sql, params);
  const result = Array.isArray(rowsOrResult) ? meta : rowsOrResult;

  return {
    changes: result?.affectedRows ?? result?.rowCount ?? 0,
    id: result?.insertId ?? rowsOrResult?.[0]?.id,
    rows: Array.isArray(rowsOrResult) ? rowsOrResult : [],
  };
}

async function get(db, sql, params = []) {
  const [rows] = await execute(db, sql, params);
  return rows[0];
}

async function all(db, sql, params = []) {
  const [rows] = await execute(db, sql, params);
  return rows;
}

async function close(db) {
  if (typeof db.end === 'function') {
    await db.end();
  }
}

function toPostgresSql(sql) {
  let index = 0;
  return sql.replace(/`/g, '"').replace(/\?/g, () => {
    index += 1;
    return `$${index}`;
  });
}

async function initializeDatabase(db) {
  if (db.__dialect === 'postgres-test') {
    await initializePostgresTestDatabase(db);
    return;
  }

  await run(db, `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(100) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      role ENUM('admin', 'staff', 'tenant') NOT NULL,
      full_name VARCHAR(150) NOT NULL DEFAULT '',
      email VARCHAR(150) UNIQUE,
      phone VARCHAR(20),
      status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await run(db, `
    CREATE TABLE IF NOT EXISTS rooms (
      id INT AUTO_INCREMENT PRIMARY KEY,
      room_number VARCHAR(50) NOT NULL UNIQUE,
      floor INT,
      area DECIMAL(10, 2),
      base_price DECIMAL(12, 2) NOT NULL CHECK (base_price >= 0),
      status ENUM('available', 'occupied', 'maintenance') NOT NULL DEFAULT 'available',
      description TEXT,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await run(db, `
    CREATE TABLE IF NOT EXISTS tenants (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT UNIQUE,
      full_name VARCHAR(150) NOT NULL,
      phone VARCHAR(20) NOT NULL,
      email VARCHAR(150),
      identity_number VARCHAR(30) UNIQUE,
      date_of_birth DATE,
      address TEXT,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_tenants_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await run(db, `
    CREATE TABLE IF NOT EXISTS contracts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      room_id INT NOT NULL,
      tenant_id INT NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE,
      deposit_amount DECIMAL(12, 2) NOT NULL DEFAULT 0 CHECK (deposit_amount >= 0),
      monthly_rent DECIMAL(12, 2) NOT NULL CHECK (monthly_rent >= 0),
      status ENUM('active', 'ended', 'cancelled') NOT NULL DEFAULT 'active',
      note TEXT,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_contracts_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE RESTRICT,
      CONSTRAINT fk_contracts_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
      CONSTRAINT chk_contract_dates CHECK (end_date IS NULL OR end_date >= start_date)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await run(db, `
    CREATE TABLE IF NOT EXISTS utility_readings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      room_id INT NOT NULL,
      month VARCHAR(7) NOT NULL,
      electricity_old DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (electricity_old >= 0),
      electricity_new DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (electricity_new >= 0),
      water_old DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (water_old >= 0),
      water_new DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (water_new >= 0),
      electricity_unit_price DECIMAL(12, 2) NOT NULL DEFAULT 0 CHECK (electricity_unit_price >= 0),
      water_unit_price DECIMAL(12, 2) NOT NULL DEFAULT 0 CHECK (water_unit_price >= 0),
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_utility_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
      CONSTRAINT uq_utility_room_month UNIQUE (room_id, month),
      CONSTRAINT chk_electricity_reading CHECK (electricity_new >= electricity_old),
      CONSTRAINT chk_water_reading CHECK (water_new >= water_old)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await run(db, `
    CREATE TABLE IF NOT EXISTS invoices (
      id INT AUTO_INCREMENT PRIMARY KEY,
      room_id INT NOT NULL,
      tenant_id INT NOT NULL,
      contract_id INT NOT NULL,
      month VARCHAR(7) NOT NULL,
      issue_date DATE NOT NULL,
      due_date DATE,
      total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
      paid_amount DECIMAL(12, 2) NOT NULL DEFAULT 0 CHECK (paid_amount >= 0),
      status ENUM('unpaid', 'partial', 'paid', 'overdue', 'cancelled') NOT NULL DEFAULT 'unpaid',
      note TEXT,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_invoices_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE RESTRICT,
      CONSTRAINT fk_invoices_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
      CONSTRAINT fk_invoices_contract FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE RESTRICT,
      CONSTRAINT uq_invoice_contract_month UNIQUE (contract_id, month),
      CONSTRAINT chk_invoice_paid_amount CHECK (paid_amount <= total_amount),
      CONSTRAINT chk_invoice_due_date CHECK (due_date IS NULL OR due_date >= issue_date)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await run(db, `
    CREATE TABLE IF NOT EXISTS invoice_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      invoice_id INT NOT NULL,
      item_type ENUM('rent', 'electricity', 'water', 'service', 'other') NOT NULL,
      description TEXT,
      quantity DECIMAL(10, 2) NOT NULL DEFAULT 1 CHECK (quantity >= 0),
      unit_price DECIMAL(12, 2) NOT NULL DEFAULT 0 CHECK (unit_price >= 0),
      amount DECIMAL(12, 2) NOT NULL DEFAULT 0 CHECK (amount >= 0),
      CONSTRAINT fk_invoice_items_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await run(db, `
    CREATE TABLE IF NOT EXISTS payments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      invoice_id INT NOT NULL,
      payment_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
      method ENUM('cash', 'bank_transfer', 'momo', 'other') NOT NULL DEFAULT 'cash',
      note TEXT,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_payments_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await run(db, `
    CREATE TABLE IF NOT EXISTS maintenance_requests (
      id INT AUTO_INCREMENT PRIMARY KEY,
      room_id INT NOT NULL,
      tenant_id INT,
      title VARCHAR(200) NOT NULL,
      description TEXT,
      status ENUM('pending', 'processing', 'done', 'cancelled') NOT NULL DEFAULT 'pending',
      priority ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'medium',
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_maintenance_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
      CONSTRAINT fk_maintenance_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await run(db, `
    CREATE TABLE IF NOT EXISTS rental_requests (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      room_id INT NOT NULL,
      tenant_id INT,
      status ENUM('pending', 'approved', 'rejected', 'cancelled') NOT NULL DEFAULT 'pending',
      message TEXT,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_rental_requests_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      CONSTRAINT fk_rental_requests_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
      CONSTRAINT fk_rental_requests_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
}

async function initializePostgresTestDatabase(db) {
  await run(db, `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('admin', 'staff', 'tenant')),
      full_name TEXT NOT NULL DEFAULT '',
      email TEXT UNIQUE,
      phone TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(db, `
    CREATE TABLE IF NOT EXISTS rooms (
      id SERIAL PRIMARY KEY,
      room_number TEXT NOT NULL UNIQUE,
      floor INTEGER,
      area NUMERIC,
      base_price NUMERIC NOT NULL CHECK (base_price >= 0),
      status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'maintenance')),
      description TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(db, `
    CREATE TABLE IF NOT EXISTS tenants (
      id SERIAL PRIMARY KEY,
      user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE SET NULL,
      full_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      identity_number TEXT UNIQUE,
      date_of_birth DATE,
      address TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(db, `
    CREATE TABLE IF NOT EXISTS contracts (
      id SERIAL PRIMARY KEY,
      room_id INTEGER NOT NULL REFERENCES rooms(id) ON DELETE RESTRICT,
      tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
      start_date DATE NOT NULL,
      end_date DATE,
      deposit_amount NUMERIC NOT NULL DEFAULT 0 CHECK (deposit_amount >= 0),
      monthly_rent NUMERIC NOT NULL CHECK (monthly_rent >= 0),
      status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'ended', 'cancelled')),
      note TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(db, `
    CREATE TABLE IF NOT EXISTS utility_readings (
      id SERIAL PRIMARY KEY,
      room_id INTEGER NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
      month TEXT NOT NULL,
      electricity_old NUMERIC NOT NULL DEFAULT 0,
      electricity_new NUMERIC NOT NULL DEFAULT 0,
      water_old NUMERIC NOT NULL DEFAULT 0,
      water_new NUMERIC NOT NULL DEFAULT 0,
      electricity_unit_price NUMERIC NOT NULL DEFAULT 0,
      water_unit_price NUMERIC NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (room_id, month)
    )
  `);

  await run(db, `
    CREATE TABLE IF NOT EXISTS invoices (
      id SERIAL PRIMARY KEY,
      room_id INTEGER NOT NULL REFERENCES rooms(id) ON DELETE RESTRICT,
      tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
      contract_id INTEGER NOT NULL REFERENCES contracts(id) ON DELETE RESTRICT,
      month TEXT NOT NULL,
      issue_date DATE NOT NULL,
      due_date DATE,
      total_amount NUMERIC NOT NULL DEFAULT 0,
      paid_amount NUMERIC NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'unpaid',
      note TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (contract_id, month)
    )
  `);

  await run(db, `
    CREATE TABLE IF NOT EXISTS invoice_items (
      id SERIAL PRIMARY KEY,
      invoice_id INTEGER NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
      item_type TEXT NOT NULL,
      description TEXT,
      quantity NUMERIC NOT NULL DEFAULT 1,
      unit_price NUMERIC NOT NULL DEFAULT 0,
      amount NUMERIC NOT NULL DEFAULT 0
    )
  `);

  await run(db, `
    CREATE TABLE IF NOT EXISTS payments (
      id SERIAL PRIMARY KEY,
      invoice_id INTEGER NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
      payment_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      amount NUMERIC NOT NULL CHECK (amount > 0),
      method TEXT NOT NULL DEFAULT 'cash',
      note TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(db, `
    CREATE TABLE IF NOT EXISTS rental_requests (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      room_id INTEGER NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
      tenant_id INTEGER REFERENCES tenants(id) ON DELETE SET NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      message TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

module.exports = {
  all,
  close,
  get,
  initializeDatabase,
  openDatabase,
  run,
  toPostgresSql,
};
