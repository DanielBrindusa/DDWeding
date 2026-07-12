import { NavLink } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useGuestSession } from '../../app/providers/GuestSessionProvider';
import { acceptedNavigationRoutes } from '../../app/router/routes';
import styles from './AppShell.module.css';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { guestState } = useGuestSession();
  const showAcceptedNavigation = guestState.kind === 'accepted-complete';

  return (
    <div className={styles.shell}>
      <a className={styles.skipLink} href="#main-content">
        Skip to content
      </a>
      <header className={styles.header}>
        <NavLink className={styles.brand} to="/">
          Wedding RSVP
        </NavLink>
        {showAcceptedNavigation ? (
          <nav className={styles.nav} aria-label="Guest pages">
            {acceptedNavigationRoutes.map((item) => (
              <NavLink
                key={item.path}
                className={({ isActive }) => (isActive ? `${styles.navLink} ${styles.active}` : styles.navLink)}
                to={item.path}
                end={item.path === '/'}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        ) : null}
      </header>
      <main id="main-content" className={styles.main} tabIndex={-1}>
        {children}
      </main>
    </div>
  );
}
