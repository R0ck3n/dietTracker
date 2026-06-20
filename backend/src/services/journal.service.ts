import {
  computeFoodCalories,
  computeSleepMetrics,
  formatSleepDuration,
} from '../lib/calculations.js';
import { ActivityRepository } from '../repositories/activity.repository.js';
import { FoodRepository } from '../repositories/food.repository.js';
import { JournalRepository } from '../repositories/journal.repository.js';
import { SleepRepository } from '../repositories/sleep.repository.js';
import type {
  DailyStatDto,
  FoodEntryDto,
  JournalDayDto,
  SleepDto,
  SportActivityDto,
} from '../types/index.js';
import type { FoodEntryRow, SportActivityRow, SleepRow } from '../types/index.js';

export class JournalService {
  constructor(
    private readonly journals = new JournalRepository(),
    private readonly foods = new FoodRepository(),
    private readonly activities = new ActivityRepository(),
    private readonly sleep = new SleepRepository(),
  ) {}

  getDay(userId: number, date: string): JournalDayDto {
    const journal = this.journals.findByUserAndDate(userId, date);

    if (!journal) {
      return this.emptyDay(date);
    }

    const foods = this.foods.findByJournal(journal.JournalID).map((row) => this.toFoodDto(row));
    const activities = this.activities
      .findByJournal(journal.JournalID)
      .map((row) => this.toActivityDto(row));
    const sleepRow = this.sleep.findByJournal(journal.JournalID);

    return {
      date: journal.Date,
      journalId: journal.JournalID,
      weight: journal.Weight,
      hydrationLiters: journal.HydrationLiters,
      notes: journal.Notes,
      foods,
      activities,
      sleep: sleepRow ? this.toSleepDto(sleepRow) : null,
      totals: this.computeTotals(foods, activities),
    };
  }

  createDay(userId: number, date: string): JournalDayDto {
    this.journals.ensure(userId, date);
    return this.getDay(userId, date);
  }

  updateDay(userId: number, date: string, notes?: string | null): JournalDayDto {
    const journal = this.journals.ensure(userId, date);
    this.journals.updateNotes(journal.JournalID, notes ?? null);
    return this.getDay(userId, date);
  }

  updateWeight(userId: number, date: string, weight: number | null): JournalDayDto {
    const journal = this.journals.ensure(userId, date);
    this.journals.updateWeight(journal.JournalID, weight);
    return this.getDay(userId, date);
  }

  updateHydration(userId: number, date: string, hydrationLiters: number | null): JournalDayDto {
    const journal = this.journals.ensure(userId, date);
    this.journals.updateHydration(journal.JournalID, hydrationLiters);
    return this.getDay(userId, date);
  }

  getStats(userId: number, from: string, to: string): DailyStatDto[] {
    const journals = this.journals.findInRange(userId, from, to);
    const statsByDate = new Map<string, DailyStatDto>();

    for (const journal of journals) {
      const foods = this.foods.findByJournal(journal.JournalID).map((row) => this.toFoodDto(row));
      const activities = this.activities
        .findByJournal(journal.JournalID)
        .map((row) => this.toActivityDto(row));
      const sleepRow = this.sleep.findByJournal(journal.JournalID);
      const totals = this.computeTotals(foods, activities);

      statsByDate.set(journal.Date, {
        date: journal.Date,
        weight: journal.Weight,
        hydrationLiters: journal.HydrationLiters,
        caloriesConsumed: totals.caloriesConsumed,
        caloriesBurned: totals.caloriesBurned,
        netSleepMinutes: sleepRow ? this.toSleepDto(sleepRow).netSleepMinutes : null,
      });
    }

    const result: DailyStatDto[] = [];
    const cursor = new Date(`${from}T00:00:00.000Z`);

    while (cursor.toISOString().slice(0, 10) <= to) {
      const date = cursor.toISOString().slice(0, 10);
      result.push(
        statsByDate.get(date) ?? {
          date,
          weight: null,
          hydrationLiters: null,
          caloriesConsumed: 0,
          caloriesBurned: 0,
          netSleepMinutes: null,
        },
      );
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }

    return result;
  }

  private emptyDay(date: string): JournalDayDto {
    return {
      date,
      journalId: null,
      weight: null,
      hydrationLiters: null,
      notes: null,
      foods: [],
      activities: [],
      sleep: null,
      totals: {
        caloriesConsumed: 0,
        caloriesBurned: 0,
        sportDurationMinutes: 0,
      },
    };
  }

  private computeTotals(foods: FoodEntryDto[], activities: SportActivityDto[]) {
    return {
      caloriesConsumed: foods.reduce((sum, food) => sum + food.totalCalories, 0),
      caloriesBurned: activities.reduce((sum, activity) => sum + activity.caloriesBurned, 0),
      sportDurationMinutes: activities.reduce((sum, activity) => sum + activity.durationMinutes, 0),
    };
  }

  private toFoodDto(row: FoodEntryRow): FoodEntryDto {
    const unit = row.Unit ?? 'g';
    return {
      id: row.FoodEntryID,
      foodName: row.FoodName,
      weightGrams: row.WeightGrams,
      caloriesPer100g: row.CaloriesPer100g,
      unit,
      totalCalories: computeFoodCalories(row.WeightGrams, row.CaloriesPer100g),
      createdAt: row.CreatedAt,
    };
  }

  private toActivityDto(row: SportActivityRow): SportActivityDto {
    return {
      id: row.SportActivityID,
      activityName: row.ActivityName,
      durationMinutes: row.DurationMinutes,
      caloriesBurned: row.CaloriesBurned,
      createdAt: row.CreatedAt,
    };
  }

  private toSleepDto(row: SleepRow): SleepDto {
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
