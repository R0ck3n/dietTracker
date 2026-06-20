import { useEffect, useState } from 'react';
import { journalApi } from '../../api';
import type { JournalDay } from '../../api/types';
import { WaterIcon } from '../icons/Icons';
import { Card, CardBody, CardHeader } from '../ui/Card';
import { HydrationStepper } from '../ui/NumberStepper';
import { SaveButton } from '../ui/SaveButton';
import { combineHydration, splitHydration } from '../../utils/format';
import styles from './Sections.module.css';

type SectionProps = {
  date: string;
  day: JournalDay;
  onUpdate: (day: JournalDay) => void;
};

export function HydrationSection({ date, day, onUpdate }: SectionProps) {
  const initial = splitHydration(day.hydrationLiters);
  const [liters, setLiters] = useState(initial.liters);
  const [centiliters, setCentiliters] = useState(initial.centiliters);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const next = splitHydration(day.hydrationLiters);
    setLiters(next.liters);
    setCentiliters(next.centiliters);
  }, [day.hydrationLiters]);

  async function handleSave() {
    setSaving(true);
    try {
      const updated = await journalApi.updateHydration(date, combineHydration(liters, centiliters));
      onUpdate(updated);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card variant="hydration" className={styles.section}>
      <CardHeader icon={<WaterIcon />} title="Hydratation" accent="hydration" />
      <CardBody>
        <div className={styles.inlineSave}>
          <HydrationStepper
            liters={liters}
            centiliters={centiliters}
            onLitersChange={setLiters}
            onCentilitersChange={setCentiliters}
          />
          <SaveButton onClick={() => void handleSave()} disabled={saving} />
        </div>
      </CardBody>
    </Card>
  );
}
