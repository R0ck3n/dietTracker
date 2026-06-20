import { useEffect, useState } from 'react';
import { journalApi } from '../../api';
import type { JournalDay } from '../../api/types';
import { combineWeight, splitWeight } from '../../utils/format';
import { WeightIcon } from '../icons/Icons';
import { Card, CardBody, CardHeader } from '../ui/Card';
import { WeightStepper } from '../ui/NumberStepper';
import { SaveButton } from '../ui/SaveButton';
import styles from './Sections.module.css';

type SectionProps = {
  date: string;
  day: JournalDay;
  onUpdate: (day: JournalDay) => void;
};

export function WeightSection({ date, day, onUpdate }: SectionProps) {
  const initial = splitWeight(day.weight);
  const [kg, setKg] = useState(initial.kg);
  const [grams, setGrams] = useState(initial.grams);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const next = splitWeight(day.weight);
    setKg(next.kg);
    setGrams(next.grams);
  }, [day.weight]);

  async function handleSave() {
    setSaving(true);
    try {
      const updated = await journalApi.updateWeight(date, combineWeight(kg, grams));
      onUpdate(updated);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card variant="weight" className={styles.section}>
      <CardHeader icon={<WeightIcon />} title="Poids" accent="weight" />
      <CardBody>
        <div className={styles.inlineSave}>
          <WeightStepper kg={kg} grams={grams} onKgChange={setKg} onGramsChange={setGrams} />
          <SaveButton onClick={() => void handleSave()} disabled={saving} />
        </div>
      </CardBody>
    </Card>
  );
}
