import { computeSleepMetrics, formatSleepDuration } from '../lib/calculations.js';
import { AppError } from '../lib/errors.js';
import { JournalRepository } from '../repositories/journal.repository.js';
import { SleepRepository, type SleepUpsertInput } from '../repositories/sleep.repository.js';
import type { SleepDto } from '../types/index.js';
import type { SleepRow } from '../types/index.js';

export class SleepService {
  constructor(
    private readonly sleep = new SleepRepository(),
    private readonly journals = new JournalRepository(),
  ) {}

  upsertForDate(userId: number, date: string, input: SleepUpsertInput): SleepDto {
    this.validateSleepInput(input);

    const journal = this.journals.ensure(userId, date);
    const row = this.sleep.upsertForJournal(journal.JournalID, input);
    return this.toDto(row);
  }

  update(userId: number, sleepId: number, input: SleepUpsertInput): SleepDto {
    this.validateSleepInput(input);

    const row = this.getOwnedSleep(userId, sleepId);
    const journal = this.journals.findById(row.JournalID)!;
    const updated = this.sleep.upsertForJournal(journal.JournalID, input);
    return this.toDto(updated);
  }

  private validateSleepInput(input: SleepUpsertInput): void {
    try {
      computeSleepMetrics(input.bedTime, input.wakeTime, input.interruptions ?? []);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Données de sommeil invalides.';
      throw new AppError(message, 400, 'INVALID_SLEEP');
    }
  }

  private getOwnedSleep(userId: number, sleepId: number): SleepRow {
    const row = this.sleep.findById(sleepId);
    if (!row) {
      throw new AppError('Sommeil introuvable.', 404, 'SLEEP_NOT_FOUND');
    }

    const journal = this.journals.findByIdForUser(row.JournalID, userId);
    if (!journal) {
      throw new AppError('Sommeil introuvable.', 404, 'SLEEP_NOT_FOUND');
    }

    return row;
  }

  private toDto(row: SleepRow): SleepDto {
    const interruptions = this.sleep.findInterruptions(row.SleepID).map((interruption) => {
      const durationMinutes = computeSleepMetrics(
        interruption.StartTime,
        interruption.EndTime,
        [],
      ).timeInBedMinutes;

      return {
        id: interruption.SleepInterruptionID,
        startTime: interruption.StartTime,
        endTime: interruption.EndTime,
        comment: interruption.Comment,
        durationMinutes,
      };
    });

    const metrics = computeSleepMetrics(row.BedTime, row.WakeTime, interruptions);

    return {
      id: row.SleepID,
      bedTime: row.BedTime,
      wakeTime: row.WakeTime,
      comment: row.Comment,
      interruptions,
      ...metrics,
      netSleepFormatted: formatSleepDuration(metrics.netSleepMinutes),
    };
  }
}
