import { AppShell } from '../components/layout/AppShell';
import { ChartPeriodSelector } from '../components/dashboard/ChartPeriodSelector';
import { StatsChart } from '../components/dashboard/StatsChart';
import { useChartStats } from '../hooks/useChartStats';
import { todayString } from '../utils/dates';
import styles from './GraphsPage.module.css';

export function GraphsPage() {
  const { days, loading, period, setPeriod } = useChartStats('30d', todayString());

  return (
    <AppShell>
      <ChartPeriodSelector value={period} onChange={setPeriod} />
      <div className={styles.chartWrap}>
        {loading ? <p className={styles.status}>Chargement des graphiques...</p> : <StatsChart days={days} />}
      </div>
    </AppShell>
  );
}
