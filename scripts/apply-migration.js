#!/usr/bin/env node

/**
 * Apply a single SQL migration file to the database.
 *
 * Unlike `supabase db push` (which replays ALL pending migrations and can fail
 * on already-existing objects), this script runs exactly ONE migration file.
 *
 * Usage:
 *   node scripts/apply-migration.js [migrationFile]
 *
 * Defaults to supabase/migrations/0004_products_schema.sql
 *
 * Connection string resolution (first match wins):
 *   1. SUPABASE_DB_URL   (recommended: the remote "Connection string" from
 *                         Supabase Dashboard > Project Settings > Database)
 *   2. DATABASE_URL
 *
 * Example (PowerShell):
 *   $env:SUPABASE_DB_URL="postgresql://postgres:PASSWORD@db.<ref>.supabase.co:5432/postgres"
 *   node scripts/apply-migration.js
 */

const fs = require('fs');
const path = require('path');

// Load env from .env.local first, then .env (without overriding existing vars)
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

let Client;
try {
  ({ Client } = require('pg'));
} catch (e) {
  console.error('\n❌ The "pg" package is required. Install it with:\n   npm install -D pg\n');
  process.exit(1);
}

const connectionString =
  process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ No connection string found.');
  console.error('   Set SUPABASE_DB_URL (or DATABASE_URL) to your Supabase Postgres connection string.');
  process.exit(1);
}

const migrationArg = process.argv[2] || '0004_products_schema.sql';
const migrationPath = path.isAbsolute(migrationArg)
  ? migrationArg
  : path.join(__dirname, '..', 'supabase', 'migrations', migrationArg);

if (!fs.existsSync(migrationPath)) {
  console.error(`❌ Migration file not found: ${migrationPath}`);
  process.exit(1);
}

const sql = fs.readFileSync(migrationPath, 'utf8');
const masked = connectionString.replace(/(:\/\/[^:]+:)[^@]+(@)/, '$1****$2');

async function main() {
  console.log(`🚀 Applying migration: ${path.basename(migrationPath)}`);
  console.log(`🔗 Target: ${masked}\n`);

  // Supabase requires SSL for direct connections
  const needsSsl = !/localhost|127\.0\.0\.1/.test(connectionString);
  const client = new Client({
    connectionString,
    ssl: needsSsl ? { rejectUnauthorized: false } : undefined,
  });

  try {
    await client.connect();
    await client.query(sql);
    console.log('✅ Migration applied successfully.');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exitCode = 1;
  } finally {
    await client.end().catch(() => {});
  }
}

main();
