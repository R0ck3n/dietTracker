import { getDb } from '../db/connection.js';
import type { UserRow } from '../types/index.js';

export class UserRepository {
  findByUsername(username: string): UserRow | undefined {
    return getDb()
      .prepare('SELECT * FROM User WHERE Username = ?')
      .get(username) as UserRow | undefined;
  }

  findById(userId: number): UserRow | undefined {
    return getDb()
      .prepare('SELECT * FROM User WHERE UserID = ?')
      .get(userId) as UserRow | undefined;
  }

  create(username: string, passwordHash: string): UserRow {
    const result = getDb()
      .prepare('INSERT INTO User (Username, PasswordHash) VALUES (?, ?)')
      .run(username, passwordHash);

    return this.findById(Number(result.lastInsertRowid))!;
  }

  count(): number {
    const row = getDb().prepare('SELECT COUNT(*) as count FROM User').get() as { count: number };
    return row.count;
  }
}
