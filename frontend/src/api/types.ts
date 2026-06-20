export interface User {
  userId: number;
  username: string;
}

export type FoodUnit = 'g' | 'ml';

export interface FoodEntry {
  id: number;
  foodName: string;
  weightGrams: number;
  caloriesPer100g: number;
  unit: FoodUnit;
  totalCalories: number;
  createdAt: string;
}

export interface SportActivity {
  id: number;
  activityName: string;
  durationMinutes: number;
  caloriesBurned: number;
  createdAt: string;
}

export interface SleepInterruption {
  id: number;
  startTime: string;
  endTime: string;
  comment: string | null;
  durationMinutes: number;
}

export interface SleepEntry {
  id: number;
  bedTime: string;
  wakeTime: string;
  comment: string | null;
  interruptions: SleepInterruption[];
  timeInBedMinutes: number;
  interruptionMinutes: number;
  netSleepMinutes: number;
  netSleepFormatted: string;
}

export interface JournalTotals {
  caloriesConsumed: number;
  caloriesBurned: number;
  sportDurationMinutes: number;
}

export interface JournalDay {
  date: string;
  journalId: number | null;
  weight: number | null;
  hydrationLiters: number | null;
  notes: string | null;
  foods: FoodEntry[];
  activities: SportActivity[];
  sleep: SleepEntry | null;
  totals: JournalTotals;
}

export interface DailyStat {
  date: string;
  weight: number | null;
  hydrationLiters: number | null;
  caloriesConsumed: number;
  caloriesBurned: number;
  netSleepMinutes: number | null;
}

export interface StatsResponse {
  from: string;
  to: string;
  days: DailyStat[];
}

export interface ApiError {
  error: string;
  message: string;
}

export interface FoodInput {
  foodName: string;
  weightGrams: number;
  caloriesPer100g: number;
  unit: FoodUnit;
}

export interface ActivityInput {
  activityName: string;
  durationMinutes: number;
  caloriesBurned: number;
}

export interface SleepInput {
  bedTime: string;
  wakeTime: string;
  comment?: string | null;
  interruptions?: Array<{
    startTime: string;
    endTime: string;
    comment?: string | null;
  }>;
}
