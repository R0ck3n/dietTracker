import { useEffect, useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '../icons/Icons';
import styles from './NumberStepper.module.css';

type NumberStepperProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  pad?: boolean;
  accent?: 'green' | 'hydration' | 'sleep';
};

export function NumberStepper({
  value,
  onChange,
  min = 0,
  max = 999,
  step = 1,
  suffix,
  pad = true,
  accent = 'green',
}: NumberStepperProps) {
  const [draft, setDraft] = useState<string | null>(null);

  useEffect(() => {
    setDraft(null);
  }, [value]);

  function formatValue(next: number) {
    return pad ? String(next).padStart(2, '0') : String(next);
  }

  function commitDraft() {
    if (draft === null) return;

    const parsed = Number.parseInt(draft, 10);
    if (!Number.isNaN(parsed)) {
      onChange(Math.min(max, Math.max(min, parsed)));
    }

    setDraft(null);
  }

  function update(delta: number) {
    setDraft(null);
    onChange(Math.min(max, Math.max(min, value + delta)));
  }

  return (
    <div className={`${styles.stepper} ${styles[accent]}`}>
      <button type="button" className={styles.arrow} onClick={() => update(-step)} aria-label="Diminuer">
        <ChevronLeftIcon size={20} />
      </button>
      <input
        type="text"
        inputMode="numeric"
        className={styles.valueInput}
        style={{ width: `${Math.max(pad ? 2 : String(max).length, 2)}.2ch` }}
        value={draft ?? formatValue(value)}
        aria-label="Valeur"
        onFocus={(event) => {
          setDraft(formatValue(value));
          event.target.select();
        }}
        onChange={(event) => setDraft(event.target.value.replace(/\D/g, ''))}
        onBlur={commitDraft}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.currentTarget.blur();
          }
        }}
      />
      {suffix ? <span className={styles.suffix}>{suffix}</span> : null}
      <button type="button" className={styles.arrow} onClick={() => update(step)} aria-label="Augmenter">
        <ChevronRightIcon size={20} />
      </button>
    </div>
  );
}

type TimeStepperProps = {
  hours: number;
  minutes: number;
  onHoursChange: (value: number) => void;
  onMinutesChange: (value: number) => void;
};

export function TimeStepper({ hours, minutes, onHoursChange, onMinutesChange }: TimeStepperProps) {
  return (
    <div className={`${styles.timeRow} ${styles.sleep}`}>
      <NumberStepper value={hours} onChange={onHoursChange} min={0} max={23} accent="sleep" />
      <span className={styles.colon}>:</span>
      <NumberStepper value={minutes} onChange={onMinutesChange} min={0} max={59} step={1} accent="sleep" />
    </div>
  );
}

type WeightStepperProps = {
  kg: number;
  grams: number;
  onKgChange: (value: number) => void;
  onGramsChange: (value: number) => void;
};

export function WeightStepper({ kg, grams, onKgChange, onGramsChange }: WeightStepperProps) {
  return (
    <div className={styles.weightRow}>
      <NumberStepper value={kg} onChange={onKgChange} min={0} max={300} pad={false} accent="green" />
      <span className={styles.suffix}>Kg</span>
      <NumberStepper value={grams} onChange={onGramsChange} min={0} max={999} step={50} pad={false} accent="green" />
    </div>
  );
}

type HydrationStepperProps = {
  liters: number;
  centiliters: number;
  onLitersChange: (value: number) => void;
  onCentilitersChange: (value: number) => void;
};

export function HydrationStepper({
  liters,
  centiliters,
  onLitersChange,
  onCentilitersChange,
}: HydrationStepperProps) {
  return (
    <div className={styles.weightRow}>
      <NumberStepper value={liters} onChange={onLitersChange} min={0} max={20} accent="hydration" />
      <span className={styles.suffix}>L</span>
      <NumberStepper
        value={centiliters}
        onChange={onCentilitersChange}
        min={0}
        max={99}
        step={10}
        accent="hydration"
      />
    </div>
  );
}
