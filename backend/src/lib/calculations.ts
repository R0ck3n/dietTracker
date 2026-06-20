export interface SleepInterruptionInput {
  startTime: string;
  endTime: string;
  comment?: string | null;
}

export interface SleepMetrics {
  timeInBedMinutes: number;
  interruptionMinutes: number;
  netSleepMinutes: number;
}

function toMs(iso: string): number {
  const ms = new Date(iso).getTime();
  if (Number.isNaN(ms)) {
    throw new Error(`Date/heure invalide : ${iso}`);
  }
  return ms;
}

function diffMinutes(startIso: string, endIso: string): number {
  const diff = toMs(endIso) - toMs(startIso);
  if (diff < 0) {
    throw new Error('La fin doit être postérieure au début.');
  }
  return Math.round(diff / 60_000);
}

export function computeSleepMetrics(
  bedTime: string,
  wakeTime: string,
  interruptions: SleepInterruptionInput[] = [],
): SleepMetrics {
  const timeInBedMinutes = diffMinutes(bedTime, wakeTime);

  const interruptionMinutes = interruptions.reduce((total, interruption) => {
    return total + diffMinutes(interruption.startTime, interruption.endTime);
  }, 0);

  const netSleepMinutes = Math.max(0, timeInBedMinutes - interruptionMinutes);

  return { timeInBedMinutes, interruptionMinutes, netSleepMinutes };
}

export function formatSleepDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}h ${String(mins).padStart(2, '0')}m`;
}

export function computeFoodCalories(weightGrams: number, caloriesPer100g: number): number {
  return Math.round((weightGrams * caloriesPer100g) / 100);
}
