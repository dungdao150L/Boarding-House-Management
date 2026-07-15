const { close, initializeDatabase, openDatabase } = require('../../src/models/database');

async function createTestDb() {
  const db = openDatabase(':memory:');
  await initializeDatabase(db);
  return db;
}

async function closeTestDb(db) {
  await close(db);
}

module.exports = { closeTestDb, createTestDb };
