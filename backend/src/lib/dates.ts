import { AppError } from './errors.js';

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export function parseDateParam(date: string): string {
  if (!DATE_REGEX.test(date)) {
    throw new AppError('Date invalide. Format attendu : YYYY-MM-DD', 400, 'INVALID_DATE');
  }

  const parsed = new Date(`${date}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) {
    throw new AppError('Date invalide.', 400, 'INVALID_DATE');
  }

  return date;
}

export function parseOptionalDateRange(from?: string, to?: string): { from: string; to: string } {
  if (!from || !to) {
    throw new AppError('Les paramètres from et to sont requis.', 400, 'INVALID_RANGE');
  }

  const fromDate = parseDateParam(from);
  const toDate = parseDateParam(to);

  if (fromDate > toDate) {
    throw new AppError('from doit être antérieur ou égal à to.', 400, 'INVALID_RANGE');
  }

  return { from: fromDate, to: toDate };
}
