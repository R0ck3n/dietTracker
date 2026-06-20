import { getDb } from '../db/connection.js';
import type { SleepInterruptionRow, SleepRow } from '../types/index.js';

export interface SleepUpsertInput {
  bedTime: string;
  wakeTime: string;
  comment?: string | null;
  interruptions?: Array<{
    startTime: string;
    endTime: string;
    comment?: string | null;
  }>;
}

export class SleepRepository {
  findByJournal(journalId: number): SleepRow | undefined {
    return getDb()
      .prepare('SELECT * FROM Sleep WHERE JournalID = ?')
      .get(journalId) as SleepRow | undefined;
  }

  findById(sleepId: number): SleepRow | undefined {
    return getDb()
      .prepare('SELECT * FROM Sleep WHERE SleepID = ?')
      .get(sleepId) as SleepRow | undefined;
  }

  findInterruptions(sleepId: number): SleepInterruptionRow[] {
    return getDb()
      .prepare(`
        SELECT * FROM SleepInterruption
        WHERE SleepID = ?
        ORDER BY SleepInterruptionID ASC
      `)
      .all(sleepId) as SleepInterruptionRow[];
  }

  upsertForJournal(journalId: number, input: SleepUpsertInput): SleepRow {
    const db = getDb();
    const transaction = db.transaction(() => {
      const existing = this.findByJournal(journalId);
      let sleepId: number;

      if (existing) {
        db.prepare(`
          UPDATE Sleep
          SET BedTime = ?, WakeTime = ?, Comment = ?
          WHERE SleepID = ?
        `).run(input.bedTime, input.wakeTime, input.comment ?? null, existing.SleepID);

        sleepId = existing.SleepID;
        db.prepare('DELETE FROM SleepInterruption WHERE SleepID = ?').run(sleepId);
      } else {
        const result = db.prepare(`
          INSERT INTO Sleep (JournalID, BedTime, WakeTime, Comment)
          VALUES (?, ?, ?, ?)
        `).run(journalId, input.bedTime, input.wakeTime, input.comment ?? null);

        sleepId = Number(result.lastInsertRowid);
      }

      const insertInterruption = db.prepare(`
        INSERT INTO SleepInterruption (SleepID, StartTime, EndTime, Comment)
        VALUES (?, ?, ?, ?)
      `);

      for (const interruption of input.interruptions ?? []) {
        insertInterruption.run(
          sleepId,
          interruption.startTime,
          interruption.endTime,
          interruption.comment ?? null,
        );
      }

      return this.findById(sleepId)!;
    });

    return transaction();
  }
}
