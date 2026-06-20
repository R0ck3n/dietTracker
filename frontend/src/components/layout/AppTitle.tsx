import styles from './AppTitle.module.css';

type AppTitleProps = {
  size?: 'sm' | 'md' | 'lg';
};

export function AppTitle({ size = 'md' }: AppTitleProps) {
  return (
    <h1 className={`${styles.title} ${styles[size]}`}>
      Diet <span className={styles.accent}>Tracker</span>
    </h1>
  );
}
