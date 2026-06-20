import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { AppTitle } from '../layout/AppTitle';
import { LogoIcon } from '../icons/Icons';
import styles from './AuthPage.module.css';

type AuthLayoutProps = {
  children: ReactNode;
};

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className={styles.page}>
      <section className={styles.brandPanel}>
        <LogoIcon size={72} />
        <AppTitle size="lg" />
        <p className={styles.tagline}>Suivi nutritionnel personnel</p>
        <p className={styles.tagline}>Saisissez votre journée en moins d&apos;une minute</p>
      </section>

      <section className={styles.formPanel}>{children}</section>
    </div>
  );
}

type AuthSwitchLinkProps = {
  to: string;
  children: ReactNode;
  className?: string;
};

export function AuthSwitchLink({ to, children, className }: AuthSwitchLinkProps) {
  return (
    <Link to={to} className={className ?? styles.switchMode}>
      {children}
    </Link>
  );
}
