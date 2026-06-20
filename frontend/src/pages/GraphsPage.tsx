import { useEffect, useState } from 'react';
import { statsApi } from '../api';
import type { DailyStat } from '../api/types';
import { getYearRange, parseDateString, todayString } from '../utils/dates';
import { AppShell } from '../components/layout/AppShell';
import { YearSelector } from '../components/layout/DateSelector';
import { StatsChart } from '../components/dashboard/StatsChart';
import styles from './GraphsPage.module.css';

export function GraphsPage() {
  const currentYear = parseDateString(todayString()).getFullYear();
  const [year, setYear] = useState(currentYear);
  const [days, setDays] = useState<DailyStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const range = getYearRange(year);
    statsApi
      .getRange(range.from, range.to)
      .then((stats) => setDays(stats.days))
      .finally(() => setLoading(false));
  }, [year]);

  return (
    <AppShell>
      <YearSelector year={year} onChange={setYear} />
      <div className={styles.chartWrap}>
        {loading ? <p className={styles.status}>Chargement des graphiques...</p> : <StatsChart days={days} />}
      </div>
    </AppShell>
  );
}
