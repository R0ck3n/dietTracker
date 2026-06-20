import { useState } from 'react';
import { foodApi, journalApi } from '../../api';
import type { FoodInput, JournalDay } from '../../api/types';
import { FlameIcon, PlusIcon } from '../icons/Icons';
import { Button } from '../ui/Button';
import { Card, CardBody, CardFooter, CardHeader, type CardLayout } from '../ui/Card';
import { ListRow } from '../ui/ListRow';
import { formatCalories, formatFoodQuantity } from '../../utils/format';
import { FoodProductModal } from './FoodProductModal';
import styles from './Sections.module.css';

type SectionProps = {
  date: string;
  day: JournalDay;
  onUpdate: (day: JournalDay) => void;
  layout?: CardLayout;
};

export function FoodSection({ date, day, onUpdate, layout }: SectionProps) {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const editing = editingId != null ? day.foods.find((food) => food.id === editingId) ?? null : null;

  function openCreate() {
    setEditingId(null);
    setOpen(true);
  }

  function openEdit(id: number) {
    setEditingId(id);
    setOpen(true);
  }

  async function handleSubmit(input: FoodInput) {
    if (editing) {
      await foodApi.update(editing.id, input);
    } else {
      await foodApi.create(date, input);
    }

    const updated = await journalApi.getDay(date);
    onUpdate(updated);
  }

  async function handleDelete(id: number) {
    await foodApi.delete(id);
    const updated = await journalApi.getDay(date);
    onUpdate(updated);
  }

  return (
    <>
      <Card variant="food" className={styles.section} layout={layout}>
        <CardHeader icon={<FlameIcon />} title="Alimentation" accent="food" />
        <CardBody>
          <Button variant="food" fullWidth icon={<PlusIcon />} onClick={openCreate}>
            Nouveau plat
          </Button>
          <div className={`${styles.listScroll} ${styles.listScrollFood}`}>
            {day.foods.map((food) => (
              <ListRow
                key={food.id}
                label={food.foodName}
                meta={formatFoodQuantity(food.weightGrams, food.unit ?? 'g')}
                value={formatCalories(food.totalCalories)}
                onEdit={() => openEdit(food.id)}
                onDelete={() => void handleDelete(food.id)}
              />
            ))}
          </div>
        </CardBody>
        <CardFooter>
          <span>Total</span>
          <span>{formatCalories(day.totals.caloriesConsumed)}</span>
        </CardFooter>
      </Card>

      <FoodProductModal
        open={open}
        editing={editing}
        onClose={() => setOpen(false)}
        onSubmit={handleSubmit}
      />
    </>
  );
}
