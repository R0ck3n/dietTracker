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

  updatePassword(userId: number, passwordHash: string): UserRow {
    getDb()
      .prepare('UPDATE User SET PasswordHash = ? WHERE UserID = ?')
      .run(passwordHash, userId);

    return this.findById(userId)!;
  }

  deleteById(userId: number): void {
    getDb().prepare('DELETE FROM User WHERE UserID = ?').run(userId);
  }

  count(): number {
    const row = getDb().prepare('SELECT COUNT(*) as count FROM User').get() as { count: number };
    return row.count;
  }
}
