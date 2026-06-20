import { getDb } from '../db/connection.js';
import type { SportActivityRow } from '../types/index.js';

export class ActivityRepository {
  findByJournal(journalId: number): SportActivityRow[] {
    return getDb()
      .prepare(`
        SELECT * FROM SportActivity
        WHERE JournalID = ?
        ORDER BY SportActivityID ASC
      `)
      .all(journalId) as SportActivityRow[];
  }

  findById(activityId: number): SportActivityRow | undefined {
    return getDb()
      .prepare('SELECT * FROM SportActivity WHERE SportActivityID = ?')
      .get(activityId) as SportActivityRow | undefined;
  }

  create(
    journalId: number,
    activityName: string,
    durationMinutes: number,
    caloriesBurned: number,
  ): SportActivityRow {
    const result = getDb()
      .prepare(`
        INSERT INTO SportActivity (JournalID, ActivityName, DurationMinutes, CaloriesBurned)
        VALUES (?, ?, ?, ?)
      `)
      .run(journalId, activityName, durationMinutes, caloriesBurned);

    return this.findById(Number(result.lastInsertRowid))!;
  }

  update(
    activityId: number,
    activityName: string,
    durationMinutes: number,
    caloriesBurned: number,
  ): SportActivityRow {
    getDb()
      .prepare(`
        UPDATE SportActivity
        SET ActivityName = ?, DurationMinutes = ?, CaloriesBurned = ?
        WHERE SportActivityID = ?
      `)
      .run(activityName, durationMinutes, caloriesBurned, activityId);

    return this.findById(activityId)!;
  }

  delete(activityId: number): void {
    getDb().prepare('DELETE FROM SportActivity WHERE SportActivityID = ?').run(activityId);
  }
}
