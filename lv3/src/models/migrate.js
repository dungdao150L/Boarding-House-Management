const { close, initializeDatabase, openDatabase } = require('./database');

async function migrate() {
  const dbName = process.env.DB_NAME || 'quan_ly_phong_tro';
  const serverDb = openDatabase({ database: undefined });
  await serverDb.execute(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await close(serverDb);

  const db = openDatabase();
  await initializeDatabase(db);
  await close(db);
}

if (require.main === module) {
  migrate()
    .then(() => {
      console.log('Migration completed');
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { migrate };
