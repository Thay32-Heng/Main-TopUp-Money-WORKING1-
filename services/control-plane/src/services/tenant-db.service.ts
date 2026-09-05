import mysql from 'mysql2/promise';
import { Client as PgClient } from 'pg';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { TENANT_SCHEMA_SQL, TENANT_SEED_SQL } from '@/database/tenant-schema';

export interface TenantDbResult {
  databaseName: string;
  databaseUrl: string;
  dbUser?: string;
}

export class TenantDbService {
  private getAdminDbConfig(): {
    type: 'mysql' | 'postgres';
    host: string;
    port: number;
    user: string;
    password: string;
    adminUrl: string;
    defaultDb: string;
  } {
    const adminUrl =
      process.env.TENANT_DB_ADMIN_URL ||
      'mysql://root:tenantdbpassword@tenant-db:3306/mysql';

    const isPostgres = adminUrl.startsWith('postgres://') || adminUrl.startsWith('postgresql://');
    const defaultPort = isPostgres ? 5432 : 3306;
    const defaultUser = isPostgres ? 'postgres' : 'root';
    const defaultDb = isPostgres ? 'postgres' : 'mysql';

    try {
      const parsed = new URL(adminUrl);
      return {
        type: isPostgres ? 'postgres' : 'mysql',
        host: parsed.hostname || 'tenant-db',
        port: parseInt(parsed.port || String(defaultPort), 10),
        user: decodeURIComponent(parsed.username || defaultUser),
        password: decodeURIComponent(parsed.password || 'tenantdbpassword'),
        adminUrl,
        defaultDb: decodeURIComponent(parsed.pathname.replace(/^\//, '')) || defaultDb,
      };
    } catch {
      return {
        type: isPostgres ? 'postgres' : 'mysql',
        host: 'tenant-db',
        port: defaultPort,
        user: defaultUser,
        password: 'tenantdbpassword',
        adminUrl,
        defaultDb,
      };
    }
  }

  /**
   * 1. STEP_DATABASE: Ensure tenant database and user exist
   */
  async ensureDatabase(slug: string): Promise<TenantDbResult> {
    const rawSlug = slug.toLowerCase().replace(/[^a-z0-9_]/g, '_');
    const databaseName = `tenant_${rawSlug}`;
    const dbUser = `user_${rawSlug}`.slice(0, 32);
    const dbPassword = crypto.randomBytes(16).toString('hex');

    const adminConfig = this.getAdminDbConfig();

    const containerDbHost =
      process.env.TENANT_CONTAINER_DB_HOST ||
      (adminConfig.host === 'localhost' || adminConfig.host === '127.0.0.1'
        ? 'tenant-db'
        : adminConfig.host);
    const containerDbPort =
      process.env.TENANT_CONTAINER_DB_PORT ||
      (adminConfig.host === 'localhost' || adminConfig.host === '127.0.0.1'
        ? String(adminConfig.port)
        : String(adminConfig.port));

    if (adminConfig.type === 'postgres') {
      console.log(`[TenantDB] Checking PostgreSQL database "${databaseName}" on ${adminConfig.host}:${adminConfig.port}...`);
      const client = new PgClient({
        host: adminConfig.host,
        port: adminConfig.port,
        user: adminConfig.user,
        password: adminConfig.password,
        database: adminConfig.defaultDb,
      });

      await client.connect();
      try {
        const checkRes = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [databaseName]);
        if (checkRes.rowCount === 0) {
          console.log(`[TenantDB] Creating PostgreSQL database "${databaseName}"...`);
          await client.query(`CREATE DATABASE "${databaseName}"`);
          console.log(`[TenantDB] PostgreSQL database "${databaseName}" created.`);
        } else {
          console.log(`[TenantDB] PostgreSQL database "${databaseName}" already exists.`);
        }
      } finally {
        await client.end();
      }

      const databaseUrl = `postgresql://${encodeURIComponent(adminConfig.user)}:${encodeURIComponent(
        adminConfig.password
      )}@${containerDbHost}:${containerDbPort}/${databaseName}`;

      return {
        databaseName,
        databaseUrl,
        dbUser: adminConfig.user,
      };
    }

    // Default: MySQL Engine
    const conn = await mysql.createConnection({
      host: adminConfig.host,
      port: adminConfig.port,
      user: adminConfig.user,
      password: adminConfig.password,
      multipleStatements: true,
    });

    try {
      console.log(`[TenantDB] Creating MySQL database "${databaseName}" if not exists...`);
      await conn.query(
        `CREATE DATABASE IF NOT EXISTS \`${databaseName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
      );

      console.log(`[TenantDB] Provisioning dedicated MySQL user "${dbUser}"...`);
      await conn.query(`CREATE USER IF NOT EXISTS '${dbUser}'@'%' IDENTIFIED BY '${dbPassword}';`);
      await conn.query(`ALTER USER '${dbUser}'@'%' IDENTIFIED BY '${dbPassword}';`);
      await conn.query(`GRANT ALL PRIVILEGES ON \`${databaseName}\`.* TO '${dbUser}'@'%';`);
      await conn.query(`FLUSH PRIVILEGES;`);

      console.log(`[TenantDB] Database and user for "${slug}" ready.`);

      const databaseUrl = `mysql://${encodeURIComponent(dbUser)}:${encodeURIComponent(
        dbPassword
      )}@${containerDbHost}:${containerDbPort}/${databaseName}`;

      return {
        databaseName,
        databaseUrl,
        dbUser,
      };
    } finally {
      await conn.end();
    }
  }

  /**
   * 2. STEP_MIGRATE_AND_SEED: Initialize schema and seed store administrator
   */
  async migrateAndSeed(
    tenantDbUrl: string,
    adminEmail: string,
    adminPassword?: string,
    siteName?: string,
    topupApiKey?: string,
    topupApiSecret?: string
  ): Promise<{ adminEmail: string; adminPassword: string }> {
    let databaseName = '';
    const isPostgres = tenantDbUrl.startsWith('postgres://') || tenantDbUrl.startsWith('postgresql://');
    try {
      const parsed = new URL(tenantDbUrl);
      databaseName = decodeURIComponent(parsed.pathname.replace(/^\//, ''));
    } catch {
      const match = tenantDbUrl.match(/\/([^/?#]+)(?:\?.*)?$/);
      if (match) databaseName = match[1];
    }

    if (!databaseName) {
      throw new Error(`Could not determine database name from URL: ${tenantDbUrl}`);
    }

    const adminConfig = this.getAdminDbConfig();
    const passwordToUse = adminPassword || `Admin_${crypto.randomBytes(6).toString('hex')}!`;
    const passwordHash = await bcrypt.hash(passwordToUse, 10);
    const adminId = '00000000-0000-0000-0000-000000000001';

    if (isPostgres) {
      console.log(`[TenantDB] Applying PostgreSQL schema & seed on "${databaseName}"...`);
      const client = new PgClient({
        host: adminConfig.host,
        port: adminConfig.port,
        user: adminConfig.user,
        password: adminConfig.password,
        database: databaseName,
      });

      await client.connect();
      try {
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

        await client.query(`
          INSERT INTO users (email, password_hash, display_name)
          VALUES ($1, $2, 'Admin')
          ON CONFLICT (email) DO UPDATE SET password_hash = $2;
        `, [adminEmail, passwordHash]);

        console.log(`[TenantDB] PostgreSQL schema and Administrator (${adminEmail}) seeded.`);
        return { adminEmail, adminPassword: passwordToUse };
      } finally {
        await client.end();
      }
    }

    // Default: MySQL Migration & Seed
    const conn = await mysql.createConnection({
      host: adminConfig.host,
      port: adminConfig.port,
      user: adminConfig.user,
      password: adminConfig.password,
      database: databaseName,
      multipleStatements: true,
    });

    try {
      console.log(`[TenantDB] Applying MySQL schema on "${databaseName}"...`);
      await conn.query(TENANT_SCHEMA_SQL);

      console.log(`[TenantDB] Applying seed defaults on "${databaseName}"...`);
      await conn.query(TENANT_SEED_SQL);

      console.log(`[TenantDB] Upserting administrator account (${adminEmail})...`);
      await conn.query(
        `INSERT INTO users (id, email, password_hash, display_name)
         VALUES (?, ?, ?, 'Admin')
         ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), display_name = 'Admin'`,
        [adminId, adminEmail, passwordHash]
      );

      const [userRows]: any = await conn.query(
        `SELECT id FROM users WHERE email = ? LIMIT 1`,
        [adminEmail]
      );
      const resolvedUserId = userRows[0]?.id || adminId;

      await conn.query(
        `INSERT INTO profiles (id, user_id, email, display_name, wallet_balance, reward_points)
         VALUES (UUID(), ?, ?, 'Admin', 0, 0)
         ON DUPLICATE KEY UPDATE display_name = 'Admin'`,
        [resolvedUserId, adminEmail]
      );

      await conn.query(
        `INSERT INTO user_roles (id, user_id, role)
         VALUES (UUID(), ?, 'admin')
         ON DUPLICATE KEY UPDATE role = 'admin'`,
        [resolvedUserId]
      );

      if (siteName) {
        await conn.query(
          `INSERT INTO site_settings (\`key\`, value)
           VALUES ('siteName', ?)
           ON DUPLICATE KEY UPDATE value = VALUES(value)`,
          [JSON.stringify(siteName)]
        );
      }

      if (topupApiKey || topupApiSecret) {
        await conn.query(
          `INSERT INTO api_configurations (id, api_name, api_uid, api_secret, is_enabled, use_sandbox)
           VALUES (UUID(), 'g2bulk', ?, ?, 1, 0)
           ON DUPLICATE KEY UPDATE api_uid = VALUES(api_uid), api_secret = VALUES(api_secret), is_enabled = 1`,
          [topupApiKey || '', topupApiSecret || '']
        );
      }

      console.log(`[TenantDB] Schema and Administrator (${adminEmail}) seeded successfully in MySQL.`);

      return {
        adminEmail,
        adminPassword: passwordToUse,
      };
    } finally {
      await conn.end();
    }
  }
}

export const tenantDbService = new TenantDbService();
