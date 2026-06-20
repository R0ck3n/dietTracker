import { EditIcon, TrashIcon } from '../icons/Icons';
import { Button } from './Button';
import styles from './ListRow.module.css';

type ListRowProps = {
  label: string;
  meta: string;
  value: string;
  onEdit: () => void;
  onDelete: () => void;
};

export function ListRow({ label, meta, value, onEdit, onDelete }: ListRowProps) {
  return (
    <div className={styles.row}>
      <div className={styles.content}>
        <span className={styles.label}>{label}</span>
        <span className={styles.meta}>{meta}</span>
        <span className={styles.value}>{value}</span>
      </div>
      <div className={styles.actions}>
        <Button type="button" variant="ghost" onClick={onDelete} aria-label="Supprimer">
          <TrashIcon />
        </Button>
        <Button type="button" variant="ghost" onClick={onEdit} aria-label="Modifier">
          <EditIcon />
        </Button>
      </div>
    </div>
  );
}
