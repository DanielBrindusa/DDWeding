import { HashRouter } from 'react-router-dom';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { AppShell } from '../components/layout/AppShell';
import { GuestSessionProvider } from './providers/GuestSessionProvider';
import { AppRoutes } from './router/routes';

export function App() {
  return (
    <ErrorBoundary>
      <HashRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <GuestSessionProvider>
          <AppShell>
            <AppRoutes />
          </AppShell>
        </GuestSessionProvider>
      </HashRouter>
    </ErrorBoundary>
  );
}
