import { useEffect, useRef, type FormEvent, type ReactNode } from 'react';
import styles from './Modal.module.css';

type ModalVariant = 'default' | 'sport' | 'danger';

type ModalProps = {
  title: string;
  open: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  children: ReactNode;
  submitLabel?: string;
  variant?: ModalVariant;
};

export function Modal({
  title,
  open,
  onClose,
  onSubmit,
  children,
  submitLabel = 'Enregistrer',
  variant = 'default',
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const ignoreCloseRef = useRef(false);

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

  if (!open) {
    return null;
  }

  return (
    <dialog
      ref={dialogRef}
      className={`${styles.dialog} ${variant === 'sport' ? styles.dialogSport : ''} ${variant === 'danger' ? styles.dialogDanger : ''}`}
      onClose={handleDialogClose}
    >
      <form className={styles.form} onSubmit={onSubmit}>
        <header className={styles.header}>
          <h3>{title}</h3>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Fermer">
            ×
          </button>
        </header>
        <div className={styles.body}>{children}</div>
        <footer className={styles.footer}>
          <button type="button" className={styles.cancel} onClick={onClose}>
            Annuler
          </button>
          <button
            type="submit"
            className={`${styles.submit} ${variant === 'danger' ? styles.submitDanger : ''}`}
          >
            {submitLabel}
          </button>
        </footer>
      </form>
    </dialog>
  );
}

type FieldProps = {
  label: string;
  children: ReactNode;
};

export function Field({ label, children }: FieldProps) {
  return (
    <label className={styles.field}>
      <span>{label}</span>
      {children}
    </label>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={styles.input} {...props} />;
}
