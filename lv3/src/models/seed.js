require('dotenv').config();

const bcrypt = require('bcryptjs');

const { close, get, initializeDatabase, openDatabase, run } = require('./database');

async function seed() {
  const db = openDatabase();
  await initializeDatabase(db);

  const adminPasswordHash = await bcrypt.hash('Admin@123', 10);
  const existingAdmin = await get(db, 'SELECT id FROM users WHERE username = ?', ['admin']);
  if (existingAdmin) {
    await run(db, 'UPDATE users SET password_hash = ?, role = ?, full_name = ? WHERE id = ?', [
      adminPasswordHash,
      'admin',
      'Administrator',
      existingAdmin.id,
    ]);
  } else {
    await run(
      db,
      'INSERT INTO users (username, password_hash, role, full_name, email, phone) VALUES (?, ?, ?, ?, ?, ?)',
      ['admin', adminPasswordHash, 'admin', 'Administrator', 'admin@example.com', '0900000000'],
    );
  }

  const existingRoom = await get(db, 'SELECT id FROM rooms WHERE room_number = ?', ['A101']);
  if (!existingRoom) {
    await run(
      db,
      'INSERT INTO rooms (room_number, floor, area, base_price, status, description) VALUES (?, ?, ?, ?, ?, ?)',
      ['A101', 1, 20, 2500000, 'available', 'Seed room'],
    );
  }

  await close(db);
}

if (require.main === module) {
  seed()
    .then(() => {
      console.log('Seed completed');
    })
    .catch((error) => {
      console.error('Seed failed:', error);
      process.exit(1);
    });
}

module.exports = { seed };
