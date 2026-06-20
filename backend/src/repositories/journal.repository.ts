import { getDb } from '../db/connection.js';
import type { JournalRow } from '../types/index.js';

export class JournalRepository {
  findByUserAndDate(userId: number, date: string): JournalRow | undefined {
    return getDb()
      .prepare('SELECT * FROM Journal WHERE UserID = ? AND Date = ?')
      .get(userId, date) as JournalRow | undefined;
  }

  findById(journalId: number): JournalRow | undefined {
    return getDb()
      .prepare('SELECT * FROM Journal WHERE JournalID = ?')
      .get(journalId) as JournalRow | undefined;
  }

  findByIdForUser(journalId: number, userId: number): JournalRow | undefined {
    return getDb()
      .prepare('SELECT * FROM Journal WHERE JournalID = ? AND UserID = ?')
      .get(journalId, userId) as JournalRow | undefined;
  }

  create(userId: number, date: string): JournalRow {
    const result = getDb()
      .prepare(`
        INSERT INTO Journal (UserID, Date)
        VALUES (?, ?)
      `)
      .run(userId, date);

    return this.findById(Number(result.lastInsertRowid))!;
  }

  ensure(userId: number, date: string): JournalRow {
    return this.findByUserAndDate(userId, date) ?? this.create(userId, date);
  }

  updateNotes(journalId: number, notes: string | null): JournalRow {
    getDb()
      .prepare(`
        UPDATE Journal
        SET Notes = ?, UpdatedAt = CURRENT_TIMESTAMP
        WHERE JournalID = ?
      `)
      .run(notes, journalId);

    return this.findById(journalId)!;
  }

  updateWeight(journalId: number, weight: number | null): JournalRow {
    getDb()
      .prepare(`
        UPDATE Journal
        SET Weight = ?, UpdatedAt = CURRENT_TIMESTAMP
        WHERE JournalID = ?
      `)
      .run(weight, journalId);

    return this.findById(journalId)!;
  }

  updateHydration(journalId: number, hydrationLiters: number | null): JournalRow {
    getDb()
      .prepare(`
        UPDATE Journal
        SET HydrationLiters = ?, UpdatedAt = CURRENT_TIMESTAMP
        WHERE JournalID = ?
      `)
      .run(hydrationLiters, journalId);

    return this.findById(journalId)!;
  }

  findInRange(userId: number, from: string, to: string): JournalRow[] {
    return getDb()
      .prepare(`
        SELECT * FROM Journal
        WHERE UserID = ? AND Date BETWEEN ? AND ?
        ORDER BY Date ASC
      `)
      .all(userId, from, to) as JournalRow[];
  }
}
