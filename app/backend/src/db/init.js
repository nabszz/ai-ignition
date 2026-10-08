/**
 * SQLite database for The 2am Shoppers MVP.
 * Creates all tables if they don't exist.
 * For production: swap out for PostgreSQL/MySQL by replacing this module.
 */
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync } from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH   = path.join(__dirname, '..', '..', 'data', '2am-shoppers.db');

let db;

export function getDb() {
  if (!db) throw new Error('Database not initialised. Call initDb() first.');
  return db;
}

export function initDb() {
  mkdirSync(path.dirname(DB_PATH), { recursive: true });

  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    -- ── Customer side ─────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS customer_profiles (
      id          TEXT PRIMARY KEY,
      name        TEXT NOT NULL,
      interests   TEXT, -- JSON array
      budget      REAL,
      quiet_start TEXT,
      quiet_end   TEXT,
      payday_date TEXT,
      notif_freq  TEXT DEFAULT 'occasional',
      created_at  TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS wishlist (
      id              TEXT PRIMARY KEY,
      customer_id     TEXT NOT NULL REFERENCES customer_profiles(id) ON DELETE CASCADE,
      title           TEXT NOT NULL,
      url             TEXT,
      price           REAL,
      budget          REAL,
      reminder_date   TEXT,
      notes           TEXT,
      saved_at        TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS conversations (
      id          TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL REFERENCES customer_profiles(id) ON DELETE CASCADE,
      product_id  TEXT,
      title       TEXT,
      status      TEXT DEFAULT 'active', -- 'active' | 'closed'
      created_at  TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS messages (
      id              TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
      role            TEXT NOT NULL, -- 'user' | 'ai'
      text            TEXT NOT NULL,
      created_at      TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS reminders (
      id          TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL REFERENCES customer_profiles(id) ON DELETE CASCADE,
      product_id  TEXT,
      date        TEXT NOT NULL,
      fired       INTEGER DEFAULT 0,
      created_at  TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS purchase_history (
      id          TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL REFERENCES customer_profiles(id) ON DELETE CASCADE,
      product_id  TEXT,
      amount      REAL,
      confirmed_at TEXT DEFAULT (datetime('now'))
    );

    -- ── Business side ─────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS merchant_profiles (
      id                  TEXT PRIMARY KEY,
      name                TEXT NOT NULL,
      support_email       TEXT,
      contact_limit_daily INTEGER DEFAULT 2,
      goal                TEXT,
      created_at          TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS catalogue (
      id          TEXT PRIMARY KEY,
      merchant_id TEXT NOT NULL REFERENCES merchant_profiles(id) ON DELETE CASCADE,
      name        TEXT NOT NULL,
      category    TEXT,
      price       REAL NOT NULL,
      description TEXT,
      in_stock    INTEGER DEFAULT 1,
      created_at  TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS customers (
      id          TEXT PRIMARY KEY,
      merchant_id TEXT NOT NULL REFERENCES merchant_profiles(id) ON DELETE CASCADE,
      name        TEXT NOT NULL,
      email       TEXT,
      segment     TEXT DEFAULT 'first_time',
      orders      INTEGER DEFAULT 0,
      last_order  TEXT,
      notes       TEXT,
      created_at  TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS journeys (
      id            TEXT PRIMARY KEY,
      merchant_id   TEXT NOT NULL REFERENCES merchant_profiles(id) ON DELETE CASCADE,
      customer_id   TEXT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
      customer_name TEXT,
      product_id    TEXT REFERENCES catalogue(id),
      product_name  TEXT,
      trigger       TEXT,
      reason        TEXT,
      status        TEXT DEFAULT 'active', -- 'active' | 'closed'
      outcome       TEXT,
      created_at    TEXT DEFAULT (datetime('now')),
      closed_at     TEXT
    );

    CREATE TABLE IF NOT EXISTS journey_events (
      id          TEXT PRIMARY KEY,
      journey_id  TEXT NOT NULL REFERENCES journeys(id) ON DELETE CASCADE,
      type        TEXT NOT NULL,
      note        TEXT,
      created_at  TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS support_handovers (
      id            TEXT PRIMARY KEY,
      merchant_id   TEXT NOT NULL REFERENCES merchant_profiles(id) ON DELETE CASCADE,
      journey_id    TEXT REFERENCES journeys(id),
      customer_name TEXT,
      reason        TEXT,
      context       TEXT,
      resolved      INTEGER DEFAULT 0,
      created_at    TEXT DEFAULT (datetime('now')),
      resolved_at   TEXT
    );
  `);

  console.log('[db] SQLite initialised at', DB_PATH);
}
