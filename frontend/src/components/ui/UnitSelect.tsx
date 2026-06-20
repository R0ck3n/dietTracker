import type { FoodUnit } from '../../utils/format';
import styles from './UnitSelect.module.css';

type UnitSelectProps = {
  value: FoodUnit;
  onChange: (unit: FoodUnit) => void;
};

export function UnitSelect({ value, onChange }: UnitSelectProps) {
  return (
    <div className={styles.root} role="group" aria-label="Unité de mesure">
      <button
        type="button"
        className={`${styles.option} ${value === 'g' ? styles.active : ''}`}
        onClick={() => onChange('g')}
        aria-pressed={value === 'g'}
      >
        g
      </button>
      <button
        type="button"
        className={`${styles.option} ${value === 'ml' ? styles.active : ''}`}
        onClick={() => onChange('ml')}
        aria-pressed={value === 'ml'}
      >
        ml
      </button>
    </div>
  );
}
