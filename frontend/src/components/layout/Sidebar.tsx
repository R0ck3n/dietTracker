import { useNavigate } from 'react-router-dom';
import type { JournalDay } from '../../api/types';
import { formatCalories, formatHydration, formatSleepMinutes, formatWeight } from '../../utils/format';
import {
  FlameIcon,
  LogoutIcon,
  MoonIcon,
  RunIcon,
  WaterIcon,
  WeightIcon,
} from '../icons/Icons';
import { useAuth } from '../../context/AuthContext';
import styles from './Sidebar.module.css';

type SidebarProps = {
  day: JournalDay;
};

export function Sidebar({ day }: SidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <aside className={styles.sidebar}>
      {user ? <p className={styles.userName}>{user.username}</p> : null}
      <button type="button" className={styles.logoutBtn} onClick={() => void handleLogout()}>
        <LogoutIcon size={24} />
        <span>Déconnexion</span>
      </button>

      <RecapCard icon={<WeightIcon size={28} />} label="Poids :" value={formatWeight(day.weight)} accent="green" />
      <RecapCard
        icon={<FlameIcon size={28} />}
        label="Alimentation :"
        value={formatCalories(day.totals.caloriesConsumed)}
        accent="fire"
      />
      <RecapCard
        icon={<RunIcon size={28} />}
        label="Sport :"
        value={formatCalories(day.totals.caloriesBurned)}
        accent="energy"
      />
      <RecapCard
        icon={<MoonIcon size={28} />}
        label="Sommeil :"
        value={day.sleep ? formatSleepMinutes(day.sleep.netSleepMinutes) : '—'}
        accent="night"
      />
      <RecapCard
        icon={<WaterIcon size={28} />}
        label="Hydratation :"
        value={formatHydration(day.hydrationLiters)}
        accent="hydration"
      />
    </aside>
  );
}

function RecapCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className={`${styles.recap} ${styles[accent]}`}>
      <span className={styles.recapIcon}>{icon}</span>
      <div>
        <p className={styles.recapLabel}>{label}</p>
        <p className={styles.recapValue}>{value}</p>
      </div>
    </div>
  );
}
