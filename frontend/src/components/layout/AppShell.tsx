import { NavLink, useNavigate } from 'react-router-dom';
import { GraphIcon, HomeIcon, LogoutIcon, LogoIcon } from '../icons/Icons';
import { AppTitle } from './AppTitle';
import { useAuth } from '../../context/AuthContext';
import styles from './AppShell.module.css';

type AppShellProps = {
  children: React.ReactNode;
  subtitle?: string;
};

export function AppShell({ children, subtitle = 'Suivi nutritionnel personnel' }: AppShellProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <LogoIcon size={44} />
        <AppTitle size="sm" />
        <p className={styles.subtitle}>{user ? `${user.username} · ${subtitle}` : subtitle}</p>
      </header>

      <nav className={styles.nav} aria-label="Navigation principale">
        <NavLink to="/" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`} end>
          <HomeIcon size={28} />
          <span className="sr-only">Accueil</span>
        </NavLink>
        <NavLink to="/graphiques" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
          <GraphIcon size={28} />
          <span className="sr-only">Graphiques</span>
        </NavLink>
        <button type="button" className={`${styles.navItem} ${styles.logout}`} onClick={() => void handleLogout()}>
          <LogoutIcon size={28} />
          <span className="sr-only">Déconnexion</span>
        </button>
      </nav>

      <main className={styles.main}>{children}</main>
    </div>
  );
}
