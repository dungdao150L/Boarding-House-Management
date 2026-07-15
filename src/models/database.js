const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

function openDatabase(filename = process.env.DB_FILE || path.join(__dirname, '../../data/boarding_house.sqlite')) {
  if (filename !== ':memory:') {
    fs.mkdirSync(path.dirname(filename), { recursive: true });
  }

  return new sqlite3.Database(filename);
}

function run(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(error) {
      if (error) {
        reject(error);
        return;
      }

      resolve({
        id: this.lastID,
        changes: this.changes,
      });
    });
  });
}

function get(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (error, row) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(row);
    });
  });
}

function all(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (error, rows) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(rows);
    });
  });
}

function close(db) {
  return new Promise((resolve, reject) => {
    db.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

async function initializeDatabase(db) {
  await run(db, 'PRAGMA foreign_keys = ON');

  await run(db, `
    CREATE TABLE IF NOT EXISTS rooms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      floor INTEGER,
      area REAL,
      price INTEGER NOT NULL CHECK (price >= 0),
      status TEXT NOT NULL DEFAULT 'available'
        CHECK (status IN ('available', 'rented', 'maintenance')),
      description TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(db, `
    CREATE TABLE IF NOT EXISTS tenants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      identity_number TEXT,
      address TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(db, `
    CREATE TABLE IF NOT EXISTS contracts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      room_id INTEGER NOT NULL,
      tenant_id INTEGER NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT,
      deposit INTEGER NOT NULL DEFAULT 0 CHECK (deposit >= 0),
      monthly_rent INTEGER NOT NULL CHECK (monthly_rent >= 0),
      status TEXT NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'ended')),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE RESTRICT,
      FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT
    )
  `);

  await run(db, `
    CREATE TABLE IF NOT EXISTS invoices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      contract_id INTEGER NOT NULL,
      month TEXT NOT NULL,
      room_fee INTEGER NOT NULL CHECK (room_fee >= 0),
      electricity_fee INTEGER NOT NULL DEFAULT 0 CHECK (electricity_fee >= 0),
      water_fee INTEGER NOT NULL DEFAULT 0 CHECK (water_fee >= 0),
      service_fee INTEGER NOT NULL DEFAULT 0 CHECK (service_fee >= 0),
      total_amount INTEGER NOT NULL CHECK (total_amount >= 0),
      payment_status TEXT NOT NULL DEFAULT 'unpaid'
        CHECK (payment_status IN ('unpaid', 'paid')),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE RESTRICT,
      UNIQUE (contract_id, month)
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
};
