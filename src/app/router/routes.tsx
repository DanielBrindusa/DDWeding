/* eslint-disable react-refresh/only-export-components */
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import type { ReactElement } from 'react';
import { LoadingState } from '../../components/common/LoadingState';
import { AppErrorState } from '../../components/common/AppErrorState';
import { useGuestSession } from '../providers/GuestSessionProvider';
import { getRedirectForRouteAccess, type RouteAccess } from './accessRules';
import { ROUTE_PATHS } from './routePaths';
import { AccessPage } from '../../pages/AccessPage';
import { DeclinedPage } from '../../pages/DeclinedPage';
import { HomePage } from '../../pages/HomePage';
import { NotFoundPage } from '../../pages/NotFoundPage';
import { ProtectedContentPage } from '../../pages/ProtectedContentPage';
import { QuestionnairePage } from '../../pages/QuestionnairePage';
import { RsvpPage } from '../../pages/RsvpPage';

interface AppRoute {
  id: string;
  path: string;
  access: RouteAccess;
  element: ReactElement;
}

export const acceptedNavigationRoutes = [
  { label: 'Home', path: ROUTE_PATHS.home },
  { label: 'Our story', path: ROUTE_PATHS.story },
  { label: 'Venue', path: ROUTE_PATHS.venue },
  { label: 'Schedule', path: ROUTE_PATHS.schedule },
  { label: 'FAQ', path: ROUTE_PATHS.faq },
];

export const routeDefinitions: AppRoute[] = [
  {
    id: 'access',
    path: ROUTE_PATHS.access,
    access: 'access',
    element: <AccessPage />,
  },
  {
    id: 'rsvp',
    path: ROUTE_PATHS.rsvp,
    access: 'rsvp',
    element: <RsvpPage />,
  },
  {
    id: 'details',
    path: ROUTE_PATHS.details,
    access: 'details',
    element: <QuestionnairePage />,
  },
  {
    id: 'declined',
    path: ROUTE_PATHS.declined,
    access: 'declined',
    element: <DeclinedPage />,
  },
  {
    id: 'home',
    path: ROUTE_PATHS.home,
    access: 'accepted',
    element: <HomePage />,
  },
  {
    id: 'story',
    path: ROUTE_PATHS.story,
    access: 'accepted',
    element: <ProtectedContentPage pageId="story" />,
  },
  {
    id: 'schedule',
    path: ROUTE_PATHS.schedule,
    access: 'accepted',
    element: <ProtectedContentPage pageId="schedule" />,
  },
  {
    id: 'venue',
    path: ROUTE_PATHS.venue,
    access: 'accepted',
    element: <ProtectedContentPage pageId="venue" />,
  },
  {
    id: 'restaurant',
    path: ROUTE_PATHS.restaurant,
    access: 'accepted',
    element: <ProtectedContentPage pageId="restaurant" />,
  },
  {
    id: 'hotel',
    path: ROUTE_PATHS.hotel,
    access: 'accepted',
    element: <ProtectedContentPage pageId="hotel" />,
  },
  {
    id: 'places',
    path: ROUTE_PATHS.places,
    access: 'accepted',
    element: <ProtectedContentPage pageId="places" />,
  },
  {
    id: 'seat',
    path: ROUTE_PATHS.seat,
    access: 'accepted',
    element: <ProtectedContentPage pageId="seat" />,
  },
  {
    id: 'photos',
    path: ROUTE_PATHS.photos,
    access: 'accepted',
    element: <ProtectedContentPage pageId="photos" />,
  },
  {
    id: 'faq',
    path: ROUTE_PATHS.faq,
    access: 'accepted',
    element: <ProtectedContentPage pageId="faq" />,
  },
];

function RouteGate({ route }: { route: AppRoute }) {
  const { status, guestState } = useGuestSession();
  const location = useLocation();

  if (status === 'loading') {
    return <LoadingState message="Preparing your invitation..." />;
  }

  if (status === 'error') {
    return <AppErrorState />;
  }

  const redirect = getRedirectForRouteAccess(route.access, guestState);

  if (redirect && redirect !== location.pathname) {
    return <Navigate to={redirect} replace state={{ from: location.pathname }} />;
  }

  return route.element;
}

export function AppRoutes() {
  return (
    <Routes>
      {routeDefinitions.map((route) => (
        <Route key={route.id} path={route.path} element={<RouteGate route={route} />} />
      ))}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
