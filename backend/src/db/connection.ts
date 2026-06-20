import Database from 'better-sqlite3';
import { readFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { env } from '../config/env.js';

let db: Database.Database | null = null;

function schemaPath(): string {
  const currentDir = dirname(fileURLToPath(import.meta.url));
  return resolve(currentDir, '../../../diettracker.sql');
}

export function initDatabase(): Database.Database {
  if (db) {
    return db;
  }

  const dir = dirname(env.databasePath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  db = new Database(env.databasePath);
  db.pragma('foreign_keys = ON');

  const hasUserTable = db
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'User'")
    .get();

  if (!hasUserTable) {
    const schema = readFileSync(schemaPath(), 'utf-8');
    db.exec(schema);
  } else {
    const foodColumns = db.prepare('PRAGMA table_info(FoodEntry)').all() as Array<{ name: string }>;
    if (!foodColumns.some((column) => column.name === 'Unit')) {
      db.exec("ALTER TABLE FoodEntry ADD COLUMN Unit TEXT NOT NULL DEFAULT 'g' CHECK (Unit IN ('g', 'ml'))");
    }
  }

  return db;
}

export function getDb(): Database.Database {
  if (!db) {
    return initDatabase();
  }
  return db;
}

export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}
