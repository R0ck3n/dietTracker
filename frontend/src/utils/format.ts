export function splitWeight(value: number | null): { kg: number; grams: number } {
  if (value == null) {
    return { kg: 0, grams: 0 };
  }

  const kg = Math.floor(value);
  const grams = Math.min(999, Math.round((value - kg) * 1000));
  return { kg, grams };
}

export function combineWeight(kg: number, grams: number): number {
  return kg + grams / 1000;
}

export function formatWeight(value: number | null): string {
  if (value == null) {
    return '—';
  }
  const { kg, grams } = splitWeight(value);
  return grams > 0 ? `${kg} Kg ${grams}` : `${kg} Kg`;
}

export function splitHydration(value: number | null): { liters: number; centiliters: number } {
  if (value == null) {
    return { liters: 0, centiliters: 0 };
  }

  const liters = Math.floor(value);
  const centiliters = Math.min(99, Math.round((value - liters) * 100));
  return { liters, centiliters };
}

export function combineHydration(liters: number, centiliters: number): number {
  return liters + centiliters / 100;
}

export function formatHydration(value: number | null): string {
  if (value == null) {
    return '—';
  }
  const { liters, centiliters } = splitHydration(value);
  return `${String(liters).padStart(2, '0')} L ${String(centiliters).padStart(2, '0')}`;
}

export function formatSleepMinutes(minutes: number | null): string {
  if (minutes == null) {
    return '—';
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')} h ${String(mins).padStart(2, '0')}`;
}

export function formatCalories(value: number): string {
  return `${Math.round(value)} KCal`;
}

export type FoodUnit = 'g' | 'ml';

export function computeFoodTotalCalories(quantity: number, caloriesPer100: number): number {
  return Math.round((quantity * caloriesPer100) / 100);
}

export function computeFoodCaloriesPer100(quantity: number, totalCalories: number): number {
  if (quantity <= 0) {
    return 0;
  }
  return Math.round((totalCalories * 100) / quantity);
}

export function formatFoodQuantity(quantity: number, unit: FoodUnit): string {
  return `${Math.round(quantity)} ${unit}`;
}

export function pad2(value: number): string {
  return String(value).padStart(2, '0');
}
