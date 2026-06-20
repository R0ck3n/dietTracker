import { useEffect, useState } from 'react';
import { journalApi } from '../../api';
import type { JournalDay } from '../../api/types';
import { NoteIcon } from '../icons/Icons';
import { Card, CardBody, CardHeader, type CardLayout } from '../ui/Card';
import { SaveButton } from '../ui/SaveButton';
import styles from './Sections.module.css';

type SectionProps = {
  date: string;
  day: JournalDay;
  onUpdate: (day: JournalDay) => void;
  layout?: CardLayout;
};

export function NotesSection({ date, day, onUpdate, layout }: SectionProps) {
  const [notes, setNotes] = useState(day.notes ?? '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setNotes(day.notes ?? '');
  }, [day.notes]);

  async function handleSave() {
    setSaving(true);
    try {
      if (!day.journalId) {
        await journalApi.createDay(date);
      }
      const updated = await journalApi.updateNotes(date, notes.trim() || null);
      onUpdate(updated);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card
      variant="notes"
      className={`${styles.section} ${layout === 'fill' ? styles.notesFill : ''} ${layout === 'flat' ? styles.notesDesktop : ''}`}
      layout={layout}
    >
      <CardHeader icon={<NoteIcon />} title="Note du jour" accent="notes" />
      <CardBody>
        <div className={styles.notesWrap}>
          <textarea
            className={styles.notes}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Ecrire une note..."
            rows={5}
          />
          <SaveButton onClick={() => void handleSave()} disabled={saving} />
        </div>
      </CardBody>
    </Card>
  );
}
