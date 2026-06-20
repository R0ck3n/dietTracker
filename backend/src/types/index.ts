export interface UserRow {
  UserID: number;
  Username: string;
  PasswordHash: string;
  CreatedAt: string;
}

export interface JournalRow {
  JournalID: number;
  UserID: number;
  Date: string;
  Weight: number | null;
  HydrationLiters: number | null;
  Notes: string | null;
  CreatedAt: string;
  UpdatedAt: string;
}

export type FoodUnit = 'g' | 'ml';

export interface FoodEntryRow {
  FoodEntryID: number;
  JournalID: number;
  FoodName: string;
  WeightGrams: number;
  CaloriesPer100g: number;
  Unit: FoodUnit;
  CreatedAt: string;
}

export interface SportActivityRow {
  SportActivityID: number;
  JournalID: number;
  ActivityName: string;
  DurationMinutes: number;
  CaloriesBurned: number;
  CreatedAt: string;
}

export interface SleepRow {
  SleepID: number;
  JournalID: number;
  BedTime: string;
  WakeTime: string;
  Comment: string | null;
  CreatedAt: string;
}

export interface SleepInterruptionRow {
  SleepInterruptionID: number;
  SleepID: number;
  StartTime: string;
  EndTime: string;
  Comment: string | null;
  CreatedAt: string;
}

export interface FoodEntryDto {
  id: number;
  foodName: string;
  weightGrams: number;
  caloriesPer100g: number;
  unit: FoodUnit;
  totalCalories: number;
  createdAt: string;
}

export interface SportActivityDto {
  id: number;
  activityName: string;
  durationMinutes: number;
  caloriesBurned: number;
  createdAt: string;
}

export interface SleepInterruptionDto {
  id: number;
  startTime: string;
  endTime: string;
  comment: string | null;
  durationMinutes: number;
}

export interface SleepDto {
  id: number;
  bedTime: string;
  wakeTime: string;
  comment: string | null;
  interruptions: SleepInterruptionDto[];
  timeInBedMinutes: number;
  interruptionMinutes: number;
  netSleepMinutes: number;
  netSleepFormatted: string;
}

export interface JournalTotalsDto {
  caloriesConsumed: number;
  caloriesBurned: number;
  sportDurationMinutes: number;
}

export interface JournalDayDto {
  date: string;
  journalId: number | null;
  weight: number | null;
  hydrationLiters: number | null;
  notes: string | null;
  foods: FoodEntryDto[];
  activities: SportActivityDto[];
  sleep: SleepDto | null;
  totals: JournalTotalsDto;
}

export interface DailyStatDto {
  date: string;
  weight: number | null;
  hydrationLiters: number | null;
  caloriesConsumed: number;
  caloriesBurned: number;
  netSleepMinutes: number | null;
}

declare module '@fastify/session' {
  interface FastifySessionObject {
    userId?: number;
    username?: string;
  }
}
