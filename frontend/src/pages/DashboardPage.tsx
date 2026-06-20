import { useCallback, useEffect, useState } from 'react';
import type { DailyStat, JournalDay } from '../api/types';
import { statsApi } from '../api';
import { useJournal } from '../hooks/useJournal';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { getMonthRange, parseDateString, todayString } from '../utils/dates';
import { AppShell } from '../components/layout/AppShell';
import { DateSelector } from '../components/layout/DateSelector';
import { Sidebar } from '../components/layout/Sidebar';
import { DailySummary } from '../components/dashboard/DailySummary';
import { FoodSection } from '../components/dashboard/FoodSection';
import { SportSection } from '../components/dashboard/SportSection';
import { HydrationSection } from '../components/dashboard/HydrationSection';
import { SleepSection } from '../components/dashboard/SleepSection';
import { WeightSection } from '../components/dashboard/WeightSection';
import { NotesSection } from '../components/dashboard/NotesSection';
import { StatsChart } from '../components/dashboard/StatsChart';
import { AppTitle } from '../components/layout/AppTitle';
import { LogoIcon } from '../components/icons/Icons';
import styles from './DashboardPage.module.css';

function DashboardSections({
  date,
  day,
  onUpdate,
}: {
  date: string;
  day: JournalDay;
  onUpdate: (day: JournalDay) => void;
}) {
  return (
    <>
      <FoodSection date={date} day={day} onUpdate={onUpdate} />
      <SportSection date={date} day={day} onUpdate={onUpdate} />
      <HydrationSection date={date} day={day} onUpdate={onUpdate} />
      <SleepSection date={date} day={day} onUpdate={onUpdate} />
      <WeightSection date={date} day={day} onUpdate={onUpdate} />
      <NotesSection date={date} day={day} onUpdate={onUpdate} />
    </>
  );
}

export function DashboardPage() {
  const [date, setDate] = useState(todayString());
  const { day, loading, error, mutate } = useJournal(date);
  const [chartDays, setChartDays] = useState<DailyStat[]>([]);
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  useEffect(() => {
    const parsed = parseDateString(date);
    const range = getMonthRange(parsed.getFullYear(), parsed.getMonth());
    statsApi.getRange(range.from, range.to).then((stats) => setChartDays(stats.days));
  }, [date]);

  const update = useCallback(
    (next: JournalDay) => {
      mutate(next);
    },
    [mutate],
  );

  if (loading && !day) {
    return (
      <div className={styles.page}>
        <p className={styles.status}>Chargement...</p>
      </div>
    );
  }

  if (error && !day) {
    return (
      <div className={styles.page}>
        <p className={styles.error}>{error}</p>
      </div>
    );
  }

  if (!day) {
    return null;
  }

  return (
    <div className={styles.page}>
      <Sidebar day={day} />

      <div className={styles.content}>
        {isDesktop ? (
          <>
            <header className={styles.desktopHeader}>
              <LogoIcon size={64} />
              <div>
                <AppTitle size="md" />
                <p className={styles.desktopSubtitle}>Suivi nutritionnel personnel</p>
              </div>
            </header>

            <div className={styles.desktopBody}>
              <DateSelector date={date} onChange={setDate} />
              <div className={styles.grid}>
                <div className={styles.gridWeight}>
                  <WeightSection date={date} day={day} onUpdate={update} layout="stretch" />
                </div>
                <div className={styles.gridFood}>
                  <FoodSection date={date} day={day} onUpdate={update} layout="stretch" />
                </div>
                <div className={styles.gridSport}>
                  <SportSection date={date} day={day} onUpdate={update} layout="stretch" />
                </div>
                <div className={styles.chartArea}>
                  <StatsChart days={chartDays} compact />
                </div>
                <div className={styles.rightStack}>
                  <HydrationSection date={date} day={day} onUpdate={update} layout="flat" />
                  <SleepSection date={date} day={day} onUpdate={update} layout="flat" />
                  <NotesSection date={date} day={day} onUpdate={update} layout="flat" />
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className={styles.mobileShell}>
            <AppShell>
              <DateSelector date={date} onChange={setDate} />
              <DailySummary day={day} />
              <DashboardSections date={date} day={day} onUpdate={update} />
            </AppShell>
          </div>
        )}
      </div>
    </div>
  );
}
