import { useEffect, useRef, useState, type FormEvent } from 'react';
import type { FoodEntry, FoodInput } from '../../api/types';
import {
  computeFoodCaloriesPer100,
  computeFoodTotalCalories,
  type FoodUnit,
} from '../../utils/format';
import { CancelIcon, ValidIcon } from '../icons/Icons';
import { UnitSelect } from '../ui/UnitSelect';
import styles from './FoodProductModal.module.css';

type FoodProductModalProps = {
  open: boolean;
  editing: FoodEntry | null;
  onClose: () => void;
  onSubmit: (input: FoodInput) => Promise<void>;
};

export function FoodProductModal({ open, editing, onClose, onSubmit }: FoodProductModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const ignoreCloseRef = useRef(false);
  const [name, setName] = useState('');
  const [qty, setQty] = useState('100');
  const [unit, setUnit] = useState<FoodUnit>('g');
  const [energyPer100, setEnergyPer100] = useState('100');
  const [totalEnergy, setTotalEnergy] = useState('100');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      ignoreCloseRef.current = false;
      dialog.showModal();
    } else if (!open && dialog.open) {
      ignoreCloseRef.current = true;
      dialog.close();
    }
  }, [open]);

  function handleDialogClose() {
    if (ignoreCloseRef.current) {
      ignoreCloseRef.current = false;
      return;
    }
    onClose();
  }

  useEffect(() => {
    if (!open) {
      return;
    }

    if (editing) {
      setName(editing.foodName);
      setQty(String(editing.weightGrams));
      setUnit(editing.unit ?? 'g');
      setEnergyPer100(String(editing.caloriesPer100g));
      setTotalEnergy(String(editing.totalCalories));
      return;
    }

    setName('');
    setQty('100');
    setUnit('g');
    setEnergyPer100('100');
    setTotalEnergy('100');
  }, [open, editing?.id]);

  function parseQty() {
    const value = Number(qty);
    return Number.isFinite(value) && value > 0 ? value : 0;
  }

  function syncTotalFromPer100(nextQty: number, per100: string) {
    const per100Value = Number(per100);
    if (!Number.isFinite(per100Value) || nextQty <= 0) {
      return;
    }
    setTotalEnergy(String(computeFoodTotalCalories(nextQty, per100Value)));
  }

  function syncPer100FromTotal(nextQty: number, total: string) {
    const totalValue = Number(total);
    if (!Number.isFinite(totalValue) || nextQty <= 0) {
      return;
    }
    setEnergyPer100(String(computeFoodCaloriesPer100(nextQty, totalValue)));
  }

  function handleQtyChange(value: string) {
    setQty(value);
    const nextQty = Number(value);
    if (!Number.isFinite(nextQty) || nextQty <= 0) {
      return;
    }
    syncTotalFromPer100(nextQty, energyPer100);
  }

  function handleEnergyPer100Change(value: string) {
    setEnergyPer100(value);
    syncTotalFromPer100(parseQty(), value);
  }

  function handleTotalEnergyChange(value: string) {
    setTotalEnergy(value);
    syncPer100FromTotal(parseQty(), value);
  }

  function handleUnitChange(nextUnit: FoodUnit) {
    setUnit(nextUnit);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const quantity = parseQty();
    const per100 = Number(energyPer100);
    const total = Number(totalEnergy);

    if (!name.trim() || quantity <= 0) {
      return;
    }

    let caloriesPer100g = per100;
    if (Number.isFinite(total) && total >= 0) {
      caloriesPer100g = computeFoodCaloriesPer100(quantity, total);
    } else if (!Number.isFinite(caloriesPer100g) || caloriesPer100g < 0) {
      return;
    }

    setSaving(true);
    try {
      await onSubmit({
        foodName: name.trim(),
        weightGrams: quantity,
        caloriesPer100g,
        unit,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  const energyHint = unit === 'g' ? 'Kcal / 100 g' : 'Kcal / 100 ml';

  return (
    <dialog ref={dialogRef} className={styles.dialog} onClose={handleDialogClose}>
      <form className={styles.form} onSubmit={(event) => void handleSubmit(event)}>
        <h3 className={styles.title}>{editing ? 'Modifier une ligne' : 'Ajouter une ligne'}</h3>

        <div className={styles.body}>
          <div className={styles.row}>
            <span className={styles.label}>label*</span>
            <div className={styles.fieldCol}>
              <input
                className={`${styles.input} ${styles.inputText}`}
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Saisir label..."
                required
              />
            </div>
          </div>

          <div className={styles.row}>
            <span className={styles.label}>qty*</span>
            <div className={`${styles.fieldCol} ${styles.qtyControl}`}>
              <input
                className={`${styles.input} ${styles.inputQty}`}
                type="number"
                min="1"
                step="any"
                value={qty}
                onChange={(event) => handleQtyChange(event.target.value)}
                required
              />
              <UnitSelect value={unit} onChange={handleUnitChange} />
            </div>
          </div>

          <div className={styles.row}>
            <span className={styles.label}>Énergie</span>
            <div className={`${styles.fieldCol} ${styles.inputWithHint}`}>
              <input
                className={`${styles.input} ${styles.inputQty}`}
                type="number"
                min="0"
                step="any"
                value={energyPer100}
                onChange={(event) => handleEnergyPer100Change(event.target.value)}
              />
              <span className={styles.hint}>{energyHint}</span>
            </div>
          </div>

          <div className={styles.row}>
            <span className={styles.label}>Énergie totale*</span>
            <div className={`${styles.fieldCol} ${styles.inputWithHint}`}>
              <input
                className={`${styles.input} ${styles.inputQty}`}
                type="number"
                min="0"
                step="any"
                value={totalEnergy}
                onChange={(event) => handleTotalEnergyChange(event.target.value)}
                required
              />
              <span className={styles.hint}>Kcal</span>
            </div>
          </div>
        </div>

        <footer className={styles.footer}>
          <button
            type="submit"
            className={`${styles.iconBtn} ${styles.iconBtnValid}`}
            disabled={saving}
            aria-label="Enregistrer"
          >
            <ValidIcon size={24} />
          </button>
          <button
            type="button"
            className={`${styles.iconBtn} ${styles.iconBtnCancel}`}
            onClick={onClose}
            aria-label="Annuler"
          >
            <CancelIcon size={24} />
          </button>
        </footer>
      </form>
    </dialog>
  );
}
