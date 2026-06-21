import { useEffect, useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ApiClientError } from '../api/client';
import { AuthLayout, AuthSwitchLink } from '../components/auth/AuthLayout';
import { EyeIcon, LoginIcon, LockIcon, UserIcon } from '../components/icons/Icons';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import styles from '../components/auth/AuthPage.module.css';

export function AuthPage() {
  const { login, register, hasAccount, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isRegister = pathname === '/register';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setError(null);
  }, [pathname]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (isRegister) {
      if (password.length < 6) {
        setError('Le mot de passe doit contenir au moins 6 caractères');
        return;
      }
      if (password !== confirmPassword) {
        setError('Les mots de passe ne correspondent pas');
        return;
      }
    }

    setLoading(true);

    try {
      if (isRegister) {
        await register(username.trim(), password);
      } else {
        await login(username.trim(), password);
      }
      navigate('/');
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Action impossible');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <form
        key={isRegister ? 'register' : 'login'}
        className={styles.card}
        onSubmit={(event) => void handleSubmit(event)}
      >
        <h2 className={styles.title}>{isRegister ? 'Créer un compte' : 'Connexion'}</h2>

        {isRegister ? (
          <p className={styles.modeHint}>Créez votre accès personnel pour commencer le suivi.</p>
        ) : hasAccount === false ? (
          <p className={styles.modeHint}>
            Aucun compte configuré.{' '}
            <AuthSwitchLink to="/register" className={styles.inlineLink}>
              Créez votre accès personnel
            </AuthSwitchLink>{' '}
            pour commencer.
          </p>
        ) : null}

        <label className={styles.field}>
          <span>Nom d&apos;utilisateur</span>
          <div className={styles.inputWrap}>
            <UserIcon size={16} />
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="nom d'utilisateur"
              autoComplete="username"
              required
            />
          </div>
        </label>

        <label className={styles.field}>
          <span>Mot de passe</span>
          <div className={styles.inputWrap}>
            <LockIcon size={16} />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="mot de passe"
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              minLength={isRegister ? 6 : 1}
              required
            />
            <button
              type="button"
              className={styles.eyeBtn}
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            >
              <EyeIcon size={16} />
            </button>
          </div>
        </label>

        {isRegister ? (
          <>
            <label className={styles.field}>
              <span>Confirmer le mot de passe</span>
              <div className={styles.inputWrap}>
                <LockIcon size={16} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="confirmer le mot de passe"
                  autoComplete="new-password"
                  minLength={6}
                  required
                />
              </div>
            </label>
            <p className={styles.passwordHint}>Minimum 6 caractères</p>
          </>
        ) : null}

        {error ? <p className={styles.error}>{error}</p> : null}

        <Button
          type="submit"
          fullWidth
          icon={<LoginIcon size={16} />}
          disabled={loading || authLoading}
        >
          {loading
            ? isRegister
              ? 'Création...'
              : 'Connexion...'
            : isRegister
              ? 'Créer mon compte'
              : 'Se connecter'}
        </Button>

        {isRegister ? (
          <AuthSwitchLink to="/login">Déjà un compte ? Se connecter</AuthSwitchLink>
        ) : (
          <AuthSwitchLink to="/register">Créer un compte</AuthSwitchLink>
        )}

        <p className={styles.hint}>Authentification locale · Session sécurisée</p>
      </form>
    </AuthLayout>
  );
}
