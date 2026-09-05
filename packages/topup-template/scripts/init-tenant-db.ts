/**
 * scripts/init-tenant-db.ts — Database Auto-Migrator for Tenant Instances
 *
 * Responsibilities:
 * 1. Reads DATABASE_URL from environment (or DB_* vars)
 * 2. Connects to PostgreSQL / MySQL database
 * 3. Applies database/schema.sql and database/seed.sql
 * 4. Configures default Administrator (ADMIN_EMAIL, ADMIN_INITIAL_PASSWORD)
 * 5. Applies custom SITE_NAME and TOPUP_API_* configurations
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

interface DbConfig {
  type: 'mysql' | 'postgres';
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  url?: string;
}

function parseDatabaseConfig(): DbConfig {
  const dbUrl = process.env.DATABASE_URL;

  let config: DbConfig = {
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ahnajak_topup',
  };

  if (dbUrl) {
    config.url = dbUrl;
    try {
      const parsed = new URL(dbUrl);
      if (parsed.protocol.startsWith('postgres')) {
        config.type = 'postgres';
        config.port = parseInt(parsed.port || '5432', 10);
      } else {
        config.type = 'mysql';
        config.port = parseInt(parsed.port || '3306', 10);
      }
      if (parsed.hostname) config.host = parsed.hostname;
      if (parsed.username) config.user = decodeURIComponent(parsed.username);
      if (parsed.password) config.password = decodeURIComponent(parsed.password);
      if (parsed.pathname && parsed.pathname.length > 1) {
        config.database = decodeURIComponent(parsed.pathname.replace(/^\//, ''));
      }
    } catch (err: any) {
      console.warn(`[DB Init] Warning: could not parse DATABASE_URL as URL: ${err.message}`);
    }
  }

  return config;
}

async function initMysql(config: DbConfig) {
  console.log(`[DB Init] Connecting to MySQL at ${config.host}:${config.port}, Database: "${config.database}"...`);

  // Step 1: Ensure database exists by connecting to MySQL instance
  try {
    const rootConn = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      multipleStatements: true,
    });
    await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${config.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log(`  ✓ Database \`${config.database}\` ensured`);
    await rootConn.end();
  } catch (err: any) {
    console.warn(`  ⚠ Could not verify database creation (insufficient privileges or DB exists): ${err.message}`);
  }

  // Step 2: Connect to target database
  const conn = await mysql.createConnection({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: config.database,
    multipleStatements: true,
  });

  // Check if database is already initialized
  let isInitialized = false;
  try {
    const [tables]: any = await conn.query("SHOW TABLES LIKE 'site_settings'");
    if (tables && tables.length > 0) {
      isInitialized = true;
      console.log('  ✓ Database schema already initialized, skipping schema and seed reload.');
    }
  } catch (err: any) {
    console.warn(`  ⚠ Warning checking database tables: ${err.message}`);
  }

  if (!isInitialized) {
    // Step 3: Run schema.sql
    const schemaPath = path.resolve(process.cwd(), 'database', 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      try {
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        await conn.query(schemaSql);
        console.log('  ✓ Schema applied (database/schema.sql)');
      } catch (err: any) {
        console.warn(`  ⚠ Error applying schema.sql: ${err.message}`);
      }
    } else {
      console.warn(`  ⚠ schema.sql not found at ${schemaPath}`);
    }

    // Step 4: Run seed.sql
    const seedPath = path.resolve(process.cwd(), 'database', 'seed.sql');
    if (fs.existsSync(seedPath)) {
      try {
        const seedSql = fs.readFileSync(seedPath, 'utf8');
        await conn.query(seedSql);
        console.log('  ✓ Seed data loaded (database/seed.sql)');
      } catch (err: any) {
        console.warn(`  ⚠ Error applying seed.sql: ${err.message}`);
      }
    } else {
      console.warn(`  ⚠ seed.sql not found at ${seedPath}`);
    }
  }

  // Step 5: Provision or update store administrator
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@ahnajak.com';
  const rawAdminPass = process.env.ADMIN_INITIAL_PASSWORD || 'AdminSecurePass123!';
  const hashedPassword = await bcrypt.hash(rawAdminPass, 10);
  const adminId = '00000000-0000-0000-0000-000000000001';

  const [existingUsers]: any = await conn.query('SELECT id, email FROM users WHERE id = ? OR email = ?', [adminId, adminEmail]);
  if (existingUsers && existingUsers.length > 0) {
    const targetId = existingUsers[0].id;
    await conn.query('UPDATE users SET email = ?, password_hash = ?, display_name = ? WHERE id = ?', [
      adminEmail,
      hashedPassword,
      'Admin',
      targetId,
    ]);
    console.log(`  ✓ Updated Administrator account: ${adminEmail}`);
  } else {
    await conn.query('INSERT INTO users (id, email, password_hash, display_name) VALUES (?, ?, ?, ?)', [
      adminId,
      adminEmail,
      hashedPassword,
      'Admin',
    ]);
    await conn.query('INSERT IGNORE INTO profiles (id, user_id, email, display_name, wallet_balance, reward_points) VALUES (?, ?, ?, ?, 0, 0)', [
      '00000000-0000-0000-0000-000000000011',
      adminId,
      adminEmail,
      'Admin',
    ]);
    await conn.query('INSERT IGNORE INTO user_roles (id, user_id, role) VALUES (?, ?, ?)', [
      '00000000-0000-0000-0000-000000000021',
      adminId,
      'admin',
    ]);
    console.log(`  ✓ Provisioned Administrator account: ${adminEmail}`);
  }

  // Step 6: Apply custom Site Name if configured
  const siteName = process.env.SITE_NAME;
  if (siteName) {
    await conn.query(
      "INSERT INTO site_settings (`key`, value) VALUES ('siteName', ?) ON DUPLICATE KEY UPDATE value = ?",
      [JSON.stringify(siteName), JSON.stringify(siteName)]
    );
    console.log(`  ✓ Configured Site Name: "${siteName}"`);
  }

  // Step 7: Apply Provider API Keys if configured
  const apiKey = process.env.TOPUP_API_KEY || process.env.G2BULK_API_KEY;
  const apiSecret = process.env.TOPUP_API_SECRET || process.env.G2BULK_WEBHOOK_SECRET;
  if (apiKey || apiSecret) {
    await conn.query(
      `INSERT INTO api_configurations (id, api_name, api_uid, api_secret, is_enabled, use_sandbox)
       VALUES (?, 'g2bulk', ?, ?, 1, 0)
       ON DUPLICATE KEY UPDATE api_uid = VALUES(api_uid), api_secret = VALUES(api_secret), is_enabled = 1`,
      [crypto.randomUUID(), apiKey || '', apiSecret || '']
    );
    console.log('  ✓ Configured Topup Provider API Credentials');
  }

  await conn.end();
}

async function initPostgres(config: DbConfig) {
  console.log(`[DB Init] Connecting to PostgreSQL at ${config.host}:${config.port}, Database: "${config.database}"...`);
  // Dynamically import pg if postgresql URL is supplied
  const { Client } = await import('pg');
  const client = new Client({
    connectionString: config.url || `postgresql://${config.user}:${config.password}@${config.host}:${config.port}/${config.database}`,
  });
  await client.connect();

  console.log('  ✓ Connected to PostgreSQL');
  // Check if users table exists or schema needs initial setup
  const res = await client.query("SELECT to_regclass('public.users') as exists");
  if (!res.rows[0]?.exists) {
    console.log('  → Initializing core tables on PostgreSQL...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        display_name VARCHAR(255),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        email TEXT,
        display_name TEXT,
        wallet_balance NUMERIC(12,2) NOT NULL DEFAULT 0,
        reward_points INT NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS user_roles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        role VARCHAR(50) NOT NULL DEFAULT 'user',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (user_id, role)
      );
      CREATE TABLE IF NOT EXISTS site_settings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        key VARCHAR(255) NOT NULL UNIQUE,
        value TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    console.log('  ✓ PostgreSQL core tables initialized');
  }

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@ahnajak.com';
  const rawAdminPass = process.env.ADMIN_INITIAL_PASSWORD || 'AdminSecurePass123!';
  const hashedPassword = await bcrypt.hash(rawAdminPass, 10);

  await client.query(`
    INSERT INTO users (email, password_hash, display_name)
    VALUES ($1, $2, 'Admin')
    ON CONFLICT (email) DO UPDATE SET password_hash = $2;
  `, [adminEmail, hashedPassword]);

  console.log(`  ✓ Administrator (${adminEmail}) configured on PostgreSQL`);
  await client.end();
}

async function main() {
  console.log('\n==================================================');
  console.log('        TENANT DATABASE AUTO-MIGRATOR             ');
  console.log('==================================================');

  const config = parseDatabaseConfig();

  if (config.type === 'postgres') {
    await initPostgres(config);
  } else {
    await initMysql(config);
  }

  console.log('==================================================');
  console.log('  ✓ Database auto-migration completed successfully');
  console.log('==================================================\n');
}

main().catch((err) => {
  console.error('\n✗ Database Auto-Migration Failed:', err.message);
  process.exit(1);
});
