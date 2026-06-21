import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api';
import { ApiClientError } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Field, Modal, TextInput } from '../ui/Modal';
import styles from './AccountActions.module.css';

type AccountActionsProps = {
  onDataDeleted?: () => void;
};

type ConfirmAction = 'data' | 'account' | null;

export function AccountActions({ onDataDeleted }: AccountActionsProps) {
  const { logout, refresh } = useAuth();
  const navigate = useNavigate();
  const [action, setAction] = useState<ConfirmAction>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function closeModal() {
    setAction(null);
    setPassword('');
    setError(null);
    setLoading(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!action || !password) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (action === 'data') {
        await authApi.deleteData(password);
        closeModal();
        onDataDeleted?.();
        await refresh();
      } else {
        await authApi.deleteAccount(password);
        closeModal();
        await logout();
        navigate('/login');
      }
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Action impossible');
      setLoading(false);
    }
  }

  const isDataAction = action === 'data';

  return (
    <>
      <div className={styles.actions}>
        <button type="button" className={styles.link} onClick={() => setAction('data')}>
          Supprimer mes données
        </button>
        <button type="button" className={`${styles.link} ${styles.danger}`} onClick={() => setAction('account')}>
          Supprimer mon compte
        </button>
      </div>

      <Modal
        title={isDataAction ? 'Supprimer toutes mes données' : 'Supprimer mon compte'}
        open={action !== null}
        onClose={closeModal}
        onSubmit={(event) => void handleSubmit(event)}
        submitLabel={loading ? 'Suppression...' : 'Confirmer'}
        variant="danger"
      >
        <p className={styles.warning}>
          {isDataAction
            ? 'Toutes vos journées, repas, activités, sommeil et statistiques seront définitivement supprimés. Votre compte sera conservé.'
            : 'Votre compte et toutes vos données seront définitivement supprimés. Cette action est irréversible.'}
        </p>
        <Field label="Mot de passe">
          <TextInput
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Confirmez avec votre mot de passe"
            autoComplete="current-password"
            required
            disabled={loading}
          />
        </Field>
        {error ? <p className={styles.error}>{error}</p> : null}
      </Modal>
    </>
  );
}
