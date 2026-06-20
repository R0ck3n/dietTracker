import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from '../icons/Icons';
import { addDays, formatDisplayDate, isToday, todayString } from '../../utils/dates';
import styles from './DateSelector.module.css';

type DateSelectorProps = {
  date: string;
  onChange: (date: string) => void;
};

export function DateSelector({ date, onChange }: DateSelectorProps) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.controls}>
        <button type="button" className={styles.arrow} onClick={() => onChange(addDays(date, -1))} aria-label="Jour précédent">
          <ChevronLeftIcon size={24} />
        </button>
        <button
          type="button"
          className={styles.today}
          onClick={() => onChange(todayString())}
          disabled={isToday(date)}
        >
          {isToday(date) ? 'Aujourd\'hui' : 'Aller à aujourd\'hui'}
        </button>
        <button type="button" className={styles.arrow} onClick={() => onChange(addDays(date, 1))} aria-label="Jour suivant">
          <ChevronRightIcon size={24} />
        </button>
      </div>
      <p className={styles.dateLine}>
        <CalendarIcon size={16} />
        <span>{formatDisplayDate(date)}</span>
      </p>
    </div>
  );
}

type YearSelectorProps = {
  year: number;
  onChange: (year: number) => void;
};

export function YearSelector({ year, onChange }: YearSelectorProps) {
  return (
    <div className={styles.yearControls}>
      <button type="button" className={styles.arrow} onClick={() => onChange(year - 1)} aria-label="Année précédente">
        <ChevronLeftIcon size={24} />
      </button>
      <span className={styles.year}>{year}</span>
      <button type="button" className={styles.arrow} onClick={() => onChange(year + 1)} aria-label="Année suivante">
        <ChevronRightIcon size={24} />
      </button>
    </div>
  );
}
