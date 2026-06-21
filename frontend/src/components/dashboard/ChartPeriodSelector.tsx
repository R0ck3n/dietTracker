import type { ChartPeriodPreset } from '../../utils/dates';
import { clampDateRange, getPresetRange, todayString } from '../../utils/dates';
import styles from './ChartPeriodSelector.module.css';

export type ChartPeriodValue = {
  preset: ChartPeriodPreset;
  from: string;
  to: string;
};

type ChartPeriodSelectorProps = {
  value: ChartPeriodValue;
  endDate?: string;
  onChange: (value: ChartPeriodValue) => void;
  compact?: boolean;
};

const PRESETS: { id: Exclude<ChartPeriodPreset, 'custom'>; label: string }[] = [
  { id: '7d', label: '7 j' },
  { id: '30d', label: '30 j' },
  { id: 'month', label: 'Mois' },
  { id: '3m', label: '3 m' },
  { id: '6m', label: '6 m' },
  { id: '1y', label: '1 an' },
];

export function ChartPeriodSelector({ value, endDate = todayString(), onChange, compact = false }: ChartPeriodSelectorProps) {
  function selectPreset(preset: Exclude<ChartPeriodPreset, 'custom'>) {
    onChange({ preset, ...getPresetRange(preset, endDate) });
  }

  function selectCustom() {
    onChange({ ...value, preset: 'custom' });
  }

  function updateCustomDate(field: 'from' | 'to', next: string) {
    if (!next) {
      return;
    }
    const nextRange = clampDateRange(field === 'from' ? next : value.from, field === 'to' ? next : value.to);
    onChange({ preset: 'custom', ...nextRange });
  }

  return (
    <div className={`${styles.wrapper} ${compact ? styles.compact : ''}`}>
      <div className={styles.presets} role="group" aria-label="Échelle du graphique">
        {PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            className={`${styles.preset} ${value.preset === preset.id ? styles.active : ''}`}
            onClick={() => selectPreset(preset.id)}
          >
            {preset.label}
          </button>
        ))}
        <button
          type="button"
          className={`${styles.preset} ${value.preset === 'custom' ? styles.active : ''}`}
          onClick={selectCustom}
        >
          Perso
        </button>
      </div>

      {value.preset === 'custom' && (
        <div className={styles.customRange}>
          <label className={styles.dateField}>
            <span>Début</span>
            <input type="date" value={value.from} max={value.to} onChange={(event) => updateCustomDate('from', event.target.value)} />
          </label>
          <label className={styles.dateField}>
            <span>Fin</span>
            <input type="date" value={value.to} min={value.from} max={todayString()} onChange={(event) => updateCustomDate('to', event.target.value)} />
          </label>
        </div>
      )}
    </div>
  );
}
