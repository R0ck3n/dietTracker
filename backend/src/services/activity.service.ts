import { AppError } from '../lib/errors.js';
import { ActivityRepository } from '../repositories/activity.repository.js';
import { JournalRepository } from '../repositories/journal.repository.js';
import type { SportActivityDto, SportActivityRow } from '../types/index.js';

export class ActivityService {
  constructor(
    private readonly activities = new ActivityRepository(),
    private readonly journals = new JournalRepository(),
  ) {}

  add(
    userId: number,
    date: string,
    input: { activityName: string; durationMinutes: number; caloriesBurned: number },
  ): SportActivityDto {
    const journal = this.journals.ensure(userId, date);
    const row = this.activities.create(
      journal.JournalID,
      input.activityName,
      input.durationMinutes,
      input.caloriesBurned,
    );
    return this.toDto(row);
  }

  update(
    userId: number,
    activityId: number,
    input: { activityName: string; durationMinutes: number; caloriesBurned: number },
  ): SportActivityDto {
    const row = this.getOwnedActivity(userId, activityId);
    const updated = this.activities.update(
      row.SportActivityID,
      input.activityName,
      input.durationMinutes,
      input.caloriesBurned,
    );
    return this.toDto(updated);
  }

  delete(userId: number, activityId: number): void {
    const row = this.getOwnedActivity(userId, activityId);
    this.activities.delete(row.SportActivityID);
  }

  private getOwnedActivity(userId: number, activityId: number): SportActivityRow {
    const row = this.activities.findById(activityId);
    if (!row) {
      throw new AppError('Activité introuvable.', 404, 'ACTIVITY_NOT_FOUND');
    }

    const journal = this.journals.findByIdForUser(row.JournalID, userId);
    if (!journal) {
      throw new AppError('Activité introuvable.', 404, 'ACTIVITY_NOT_FOUND');
    }

    return row;
  }

  private toDto(row: SportActivityRow): SportActivityDto {
    return {
      id: row.SportActivityID,
      activityName: row.ActivityName,
      durationMinutes: row.DurationMinutes,
      caloriesBurned: row.CaloriesBurned,
      createdAt: row.CreatedAt,
    };
  }
}
