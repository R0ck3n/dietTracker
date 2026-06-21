import { useEffect, useState } from 'react';
import { statsApi } from '../api';
import type { DailyStat } from '../api/types';
import type { ChartPeriodValue } from '../components/dashboard/ChartPeriodSelector';
import type { ChartPeriodPreset } from '../utils/dates';
import { getPresetRange } from '../utils/dates';

export function useChartStats(initialPreset: Exclude<ChartPeriodPreset, 'custom'>, endDate: string) {
  const [period, setPeriod] = useState<ChartPeriodValue>(() => ({
    preset: initialPreset,
    ...getPresetRange(initialPreset, endDate),
  }));
  const [days, setDays] = useState<DailyStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (period.preset === 'custom') {
      return;
    }

    const next = getPresetRange(period.preset as Exclude<ChartPeriodPreset, 'custom'>, endDate);
    setPeriod((current) => {
      if (current.preset === 'custom') {
        return current;
      }
      if (current.from === next.from && current.to === next.to) {
        return current;
      }
      return { preset: current.preset, ...next };
    });
  }, [endDate, period.preset]);

  useEffect(() => {
    setLoading(true);
    statsApi
      .getRange(period.from, period.to)
      .then((stats) => setDays(stats.days))
      .finally(() => setLoading(false));
  }, [period.from, period.to]);

  return { days, loading, period, setPeriod };
}
