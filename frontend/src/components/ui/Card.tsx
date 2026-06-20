import type { ReactNode } from 'react';
import styles from './Card.module.css';

type CardVariant = 'default' | 'food' | 'sport' | 'hydration' | 'sleep' | 'weight' | 'notes' | 'summary';

type CardProps = {
  variant?: CardVariant;
  children: ReactNode;
  className?: string;
};

export function Card({ variant = 'default', children, className }: CardProps) {
  return <section className={`${styles.card} ${styles[variant]} ${className ?? ''}`}>{children}</section>;
}

type CardHeaderProps = {
  icon: ReactNode;
  title: string;
  accent?: CardVariant;
};

export function CardHeader({ icon, title, accent = 'default' }: CardHeaderProps) {
  return (
    <header className={`${styles.header} ${styles[`header_${accent}`]}`}>
      <span className={styles.headerIcon}>{icon}</span>
      <h2 className={styles.headerTitle}>{title}</h2>
    </header>
  );
}

export function CardBody({ children }: { children: ReactNode }) {
  return <div className={styles.body}>{children}</div>;
}

export function CardFooter({ children }: { children: ReactNode }) {
  return <footer className={styles.footer}>{children}</footer>;
}
