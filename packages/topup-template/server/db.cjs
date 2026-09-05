/**
 * db.cjs — Database connection pool supporting MySQL and PostgreSQL
 */
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });

const dbUrl = process.env.DATABASE_URL || '';
const isPostgres = dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://');

let pool = null;
let isPgEngine = false;

if (isPostgres) {
  isPgEngine = true;
  const { Pool } = require('pg');
  pool = new Pool({
    connectionString: dbUrl,
    max: 10,
    idleTimeoutMillis: 30000,
  });
} else {
  const mysql = require('mysql2/promise');
  let config = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ahnajak_topup',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8mb4',
  };

  if (dbUrl.startsWith('mysql://')) {
    try {
      const parsed = new URL(dbUrl);
      config = {
        host: parsed.hostname || config.host,
        port: parseInt(parsed.port || '3306', 10),
        user: decodeURIComponent(parsed.username || config.user),
        password: decodeURIComponent(parsed.password || config.password),
        database: decodeURIComponent(parsed.pathname.replace(/^\//, '') || config.database),
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        charset: 'utf8mb4',
      };
    } catch (e) {}
  }

  pool = mysql.createPool(config);
}

/**
 * Run a parameterized query. Returns [rows, fields].
 */
async function query(sql, params = []) {
  if (isPgEngine) {
    let pIndex = 1;
    const pgSql = sql.replace(/\?/g, () => `$${pIndex++}`);
    const res = await pool.query(pgSql, params);
    return [res.rows, res.fields];
  }
  return pool.query(sql, params);
}

/**
 * Run a query and return the first row (or null).
 */
async function queryOne(sql, params = []) {
  const [rows] = await query(sql, params);
  return rows[0] || null;
}

/**
 * Generate a new UUID.
 */
function uuid() {
  return require('crypto').randomUUID();
}

/**
 * Health check probe for readiness endpoint
 */
async function checkHealth() {
  try {
    await query('SELECT 1');
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

module.exports = { pool, query, queryOne, uuid, checkHealth };

