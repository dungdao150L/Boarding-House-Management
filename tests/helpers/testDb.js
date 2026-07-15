const { newDb } = require('pg-mem');

const { initializeDatabase, toPostgresSql } = require('../../src/models/database');

function normalizeSql(sql) {
  return sql
    .replace(/`/g, '"')
    .replace(/\bCURRENT_DATE\b/g, 'CURRENT_DATE');
}

function extractInsertTable(sql) {
  const match = sql.match(/^\s*INSERT\s+INTO\s+([a-z_]+)/i);
  return match ? match[1] : null;
}

async function createTestDb() {
  const memoryDb = newDb({
    autoCreateForeignKeyIndices: true,
    noAstCoverageCheck: true,
  });
  const { Pool } = memoryDb.adapters.createPg();
  const pool = new Pool();

  const db = {
    __dialect: 'postgres-test',
    async end() {
      await pool.end();
    },
    async execute(sql, params = []) {
      const normalizedSql = normalizeSql(sql);
      const result = await pool.query(toPostgresSql(normalizedSql), params);
      const insertTable = extractInsertTable(normalizedSql);
      let insertId = result.rows[0]?.id;

      if (insertTable && insertId === undefined) {
        const idResult = await pool.query(`SELECT MAX(id) AS id FROM ${insertTable}`);
        insertId = idResult.rows[0]?.id;
      }

      if (normalizedSql.trim().toUpperCase().startsWith('SELECT')) {
        return [result.rows, { affectedRows: result.rowCount, insertId }];
      }

      return [{ affectedRows: result.rowCount, insertId }, undefined];
    },
  };

  await initializeDatabase(db);
  return db;
}

async function closeTestDb(db) {
  await db.end();
}

module.exports = { closeTestDb, createTestDb };
