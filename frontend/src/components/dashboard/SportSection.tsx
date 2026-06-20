import { useState, type FormEvent } from 'react';
import { activityApi, journalApi } from '../../api';
import type { JournalDay, SportActivity } from '../../api/types';
import { PlusIcon, RunIcon } from '../icons/Icons';
import { Button } from '../ui/Button';
import { Card, CardBody, CardFooter, CardHeader } from '../ui/Card';
import { ListRow } from '../ui/ListRow';
import { Field, Modal, TextInput } from '../ui/Modal';
import { formatCalories } from '../../utils/format';
import styles from './Sections.module.css';

type SectionProps = {
  date: string;
  day: JournalDay;
  onUpdate: (day: JournalDay) => void;
};

export function SportSection({ date, day, onUpdate }: SectionProps) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<SportActivity | null>(null);
  const [name, setName] = useState('');
  const [minutes, setMinutes] = useState('30');
  const [calories, setCalories] = useState('200');

  function openCreate() {
    setEditing(null);
    setName('');
    setMinutes('30');
    setCalories('200');
    setOpen(true);
  }

  function openEdit(item: SportActivity) {
    setEditing(item);
    setName(item.activityName);
    setMinutes(String(item.durationMinutes));
    setCalories(String(item.caloriesBurned));
    setOpen(true);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const input = {
      activityName: name.trim(),
      durationMinutes: Number(minutes),
      caloriesBurned: Number(calories),
    };

    if (editing) {
      await activityApi.update(editing.id, input);
    } else {
      await activityApi.create(date, input);
    }

    const updated = await journalApi.getDay(date);
    onUpdate(updated);
    setOpen(false);
  }

  async function handleDelete(id: number) {
    await activityApi.delete(id);
    const updated = await journalApi.getDay(date);
    onUpdate(updated);
  }

  return (
    <>
      <Card variant="sport" className={styles.section}>
        <CardHeader icon={<RunIcon />} title="Sport" accent="sport" />
        <CardBody>
          <Button variant="sport" fullWidth icon={<PlusIcon />} onClick={openCreate}>
            Nouvelle activité
          </Button>
          {day.activities.map((activity) => (
            <ListRow
              key={activity.id}
              label={activity.activityName}
              meta={`${activity.durationMinutes} min`}
              value={formatCalories(activity.caloriesBurned)}
              onEdit={() => openEdit(activity)}
              onDelete={() => void handleDelete(activity.id)}
            />
          ))}
        </CardBody>
        <CardFooter>
          <span>Total</span>
          <span>{formatCalories(day.totals.caloriesBurned)}</span>
        </CardFooter>
      </Card>

      <Modal
        variant="sport"
        title={editing ? 'Modifier l\'activité' : 'Nouvelle activité'}
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={(event) => void handleSubmit(event)}
      >
        <Field label="Activité">
          <TextInput value={name} onChange={(e) => setName(e.target.value)} required />
        </Field>
        <Field label="Durée (min)">
          <TextInput type="number" min="1" value={minutes} onChange={(e) => setMinutes(e.target.value)} required />
        </Field>
        <Field label="Calories dépensées">
          <TextInput type="number" min="0" value={calories} onChange={(e) => setCalories(e.target.value)} required />
        </Field>
      </Modal>
    </>
  );
}
