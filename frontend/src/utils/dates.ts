const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function todayString(): string {
  return toDateString(new Date());
}

export function parseDateString(value: string): Date {
  if (!DATE_REGEX.test(value)) {
    throw new Error('Date invalide');
  }
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function addDays(value: string, delta: number): string {
  const date = parseDateString(value);
  date.setDate(date.getDate() + delta);
  return toDateString(date);
}

export function formatDisplayDate(value: string): string {
  return parseDateString(value).toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function isToday(value: string): boolean {
  return value === todayString();
}

export function formatYear(value: string): string {
  return String(parseDateString(value).getFullYear());
}

export function getMonthRange(year: number, monthIndex: number): { from: string; to: string } {
  const from = new Date(year, monthIndex, 1);
  const to = new Date(year, monthIndex + 1, 0);
  return { from: toDateString(from), to: toDateString(to) };
}

export function getYearRange(year: number): { from: string; to: string } {
  return {
    from: `${year}-01-01`,
    to: `${year}-12-31`,
  };
}

export function dateToIsoTime(date: string, hours: number, minutes: number): string {
  const base = parseDateString(date);
  base.setHours(hours, minutes, 0, 0);
  return base.toISOString();
}

export function parseIsoTime(iso: string): { hours: number; minutes: number } {
  const parsed = new Date(iso);
  return { hours: parsed.getHours(), minutes: parsed.getMinutes() };
}

export function combineBedWake(date: string, bedHours: number, bedMinutes: number, wakeHours: number, wakeMinutes: number) {
  const bedTime = dateToIsoTime(date, bedHours, bedMinutes);
  let wakeDate = date;
  if (wakeHours < bedHours || (wakeHours === bedHours && wakeMinutes <= bedMinutes)) {
    wakeDate = addDays(date, 1);
  }
  const wakeTime = dateToIsoTime(wakeDate, wakeHours, wakeMinutes);
  return { bedTime, wakeTime };
}
