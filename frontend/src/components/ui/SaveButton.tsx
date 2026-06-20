import { ValidIcon } from '../icons/Icons';
import styles from './SaveButton.module.css';

type SaveButtonProps = {
  onClick: () => void;
  disabled?: boolean;
  label?: string;
};

export function SaveButton({ onClick, disabled, label = 'Enregistrer' }: SaveButtonProps) {
  return (
    <button type="button" className={styles.save} onClick={onClick} disabled={disabled} aria-label={label}>
      <ValidIcon size={24} />
    </button>
  );
}
