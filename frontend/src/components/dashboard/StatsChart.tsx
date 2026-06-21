import { memo, useMemo } from 'react';
import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import type { DailyStat } from '../../api/types';
import styles from './StatsChart.module.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

type StatsChartProps = {
  days: DailyStat[];
  compact?: boolean;
};

const chartOptions = (dayCount: number, compact: boolean) => ({
  responsive: true,
  maintainAspectRatio: false,
  animation: false as const,
  plugins: {
    legend: {
      labels: { color: '#848b95', boxWidth: 12 },
    },
  },
  scales: {
    x: {
      ticks: {
        color: '#848b95',
        maxTicksLimit: compact ? 5 : dayCount > 90 ? 10 : dayCount > 30 ? 8 : undefined,
      },
      grid: { color: 'rgba(66, 66, 66, 0.5)' },
    },
    y: {
      position: 'left' as const,
      ticks: { color: '#55b78d' },
      grid: { color: 'rgba(66, 66, 66, 0.3)' },
    },
    y1: {
      position: 'right' as const,
      ticks: { color: '#848b95' },
      grid: { drawOnChartArea: false },
    },
  },
});

export const StatsChart = memo(function StatsChart({ days, compact = false }: StatsChartProps) {
  const labels = useMemo(
    () =>
      days.map((day) =>
        new Date(`${day.date}T00:00:00`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
      ),
    [days],
  );

  const data = useMemo(
    () => ({
      labels,
      datasets: [
        {
          label: 'Poids',
          data: days.map((day) => day.weight),
          borderColor: '#55b78d',
          backgroundColor: '#55b78d',
          yAxisID: 'y',
          tension: 0.3,
        },
        {
          label: 'Alim Kcal',
          data: days.map((day) => day.caloriesConsumed),
          borderColor: '#ec7e56',
          backgroundColor: '#ec7e56',
          yAxisID: 'y1',
          tension: 0.3,
        },
        {
          label: 'Sommeil (h)',
          data: days.map((day) => (day.netSleepMinutes == null ? null : day.netSleepMinutes / 60)),
          borderColor: '#7061d0',
          backgroundColor: '#7061d0',
          yAxisID: 'y1',
          tension: 0.3,
        },
      ],
    }),
    [days, labels],
  );

  const options = useMemo(() => chartOptions(days.length, compact), [days.length, compact]);

  return (
    <div className={`${styles.chartCard} ${compact ? styles.compact : ''}`}>
      <div className={styles.canvasWrap}>
        <Line data={data} options={options} />
      </div>
    </div>
  );
});
