import { AppShell } from '../components/layout/AppShell';
import { AccountActions } from '../components/layout/AccountActions';
import { ChartPeriodSelector } from '../components/dashboard/ChartPeriodSelector';
import { StatsChart } from '../components/dashboard/StatsChart';
import { useChartStats } from '../hooks/useChartStats';
import { todayString } from '../utils/dates';
import styles from './GraphsPage.module.css';

export function GraphsPage() {
  const { days, loading, period, setPeriod } = useChartStats('30d', todayString());

  function refreshPage() {
    window.location.reload();
  }

  return (
    <>
      <div className={styles.desktopTopBar}>
        <AccountActions onDataDeleted={refreshPage} />
      </div>
      <AppShell onDataDeleted={refreshPage}>
        <ChartPeriodSelector value={period} onChange={setPeriod} />
        <div className={styles.chartWrap}>
          {loading ? <p className={styles.status}>Chargement des graphiques...</p> : <StatsChart days={days} />}
        </div>
      </AppShell>
    </>
  );
}
