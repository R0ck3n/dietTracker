import type { JournalDay } from '../../api/types';
import { FlameIcon, MoonIcon, RunIcon, WaterIcon, WeightIcon } from '../icons/Icons';
import { Card, CardBody, CardHeader } from '../ui/Card';
import { formatCalories, formatHydration, formatSleepMinutes, formatWeight } from '../../utils/format';
import styles from './DailySummary.module.css';

type DailySummaryProps = {
  day: JournalDay;
};

export function DailySummary({ day }: DailySummaryProps) {
  return (
    <Card variant="summary" className={styles.summary}>
      <CardHeader icon={<WeightIcon />} title="Résumé du jour" accent="summary" />
      <CardBody>
        <div className={styles.grid}>
          <SummaryItem icon={<WeightIcon />} label="Poids" value={formatWeight(day.weight)} accent="green" />
          <SummaryItem
            icon={<FlameIcon />}
            label="Alimentation"
            value={formatCalories(day.totals.caloriesConsumed)}
            accent="fire"
          />
          <SummaryItem
            icon={<RunIcon />}
            label="Sport"
            value={formatCalories(day.totals.caloriesBurned)}
            accent="energy"
          />
          <SummaryItem
            icon={<MoonIcon />}
            label="Sommeil"
            value={day.sleep ? formatSleepMinutes(day.sleep.netSleepMinutes) : '—'}
            accent="night"
          />
          <SummaryItem
            icon={<WaterIcon />}
            label="Hydratation"
            value={formatHydration(day.hydrationLiters)}
            accent="hydration"
          />
        </div>
      </CardBody>
    </Card>
  );
}

function SummaryItem({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className={`${styles.item} ${styles[accent]}`}>
      <span className={styles.icon}>{icon}</span>
      <div>
        <p className={styles.label}>{label}</p>
        <p className={styles.value}>{value}</p>
      </div>
    </div>
  );
}
