/**
 * SQLite database initialisation.
 * Creates tables if they don't already exist.
 * For the hackathon MVP, SQLite keeps the setup dependency-free.
 * Swap out for Postgres/MySQL in production by replacing this module.
 */
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH   = path.join(__dirname, '..', '..', 'data', '2am.db');

let db;

export function getDb() {
  if (!db) throw new Error('Database not initialised. Call initDb() first.');
  return db;
}

export function initDb() {
  // Ensure data directory exists
  import('fs').then(({ mkdirSync }) => {
    mkdirSync(path.dirname(DB_PATH), { recursive: true });
  });

  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id          TEXT PRIMARY KEY,
      name        TEXT NOT NULL,
      email       TEXT UNIQUE,
      mode        TEXT NOT NULL CHECK(mode IN ('student','working_adult')),
      timezone    TEXT DEFAULT 'UTC',
      preferences TEXT, -- JSON blob
      created_at  TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id                  TEXT PRIMARY KEY,
      user_id             TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title               TEXT NOT NULL,
      description         TEXT,
      due_date            TEXT,
      due_time            TEXT,
      estimated_minutes   INTEGER DEFAULT 60,
      priority            TEXT DEFAULT 'medium',
      weight              TEXT,
      status              TEXT DEFAULT 'pending',
      source_ref          TEXT, -- e.g. "slack:msg_id" or "manual"
      created_at          TEXT DEFAULT (datetime('now')),
      updated_at          TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS calendar_blocks (
      id          TEXT PRIMARY KEY,
      user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      task_id     TEXT REFERENCES tasks(id),
      title       TEXT NOT NULL,
      start_time  TEXT NOT NULL,
      end_time    TEXT NOT NULL,
      block_type  TEXT DEFAULT 'focus', -- 'focus' | 'buffer' | 'fixed'
      tool        TEXT,                 -- 'outlook' | 'google' | 'manual'
      external_id TEXT,
      created_at  TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS approvals (
      id          TEXT PRIMARY KEY,
      user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type        TEXT NOT NULL,
      title       TEXT NOT NULL,
      description TEXT,
      actions     TEXT NOT NULL, -- JSON array
      status      TEXT DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected')),
      source_ref  TEXT,
      created_at  TEXT DEFAULT (datetime('now')),
      resolved_at TEXT
    );

    CREATE TABLE IF NOT EXISTS activity_log (
      id          TEXT PRIMARY KEY,
      user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      icon        TEXT,
      title       TEXT NOT NULL,
      metadata    TEXT, -- JSON
      created_at  TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS integrations (
      id          TEXT PRIMARY KEY,
      user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      key         TEXT NOT NULL,
      connected   INTEGER DEFAULT 0,
      token_data  TEXT, -- encrypted in production
      UNIQUE(user_id, key)
    );
  `);

  console.log('[db] SQLite initialised at', DB_PATH);
}
