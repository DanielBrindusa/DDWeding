import type { GuestState } from '../../models/guest';
import { ROUTE_PATHS } from './routePaths';

export type RouteAccess = 'public' | 'access' | 'rsvp' | 'details' | 'declined' | 'accepted';

export function getDefaultPathForGuestState(guestState: GuestState): string {
  switch (guestState.kind) {
    case 'unidentified':
      return ROUTE_PATHS.access;
    case 'identified':
      return ROUTE_PATHS.rsvp;
    case 'declined':
      return ROUTE_PATHS.declined;
    case 'accepted-incomplete':
      return ROUTE_PATHS.details;
    case 'accepted-complete':
      return ROUTE_PATHS.home;
  }
}

export function getRedirectForRouteAccess(routeAccess: RouteAccess, guestState: GuestState): string | undefined {
  if (routeAccess === 'public') {
    return undefined;
  }

  if (routeAccess === 'access') {
    return guestState.kind === 'unidentified' ? undefined : getDefaultPathForGuestState(guestState);
  }

  if (guestState.kind === 'unidentified') {
    return ROUTE_PATHS.access;
  }

  if (routeAccess === 'rsvp') {
    return guestState.kind === 'identified' ? undefined : getDefaultPathForGuestState(guestState);
  }

  if (routeAccess === 'details') {
    return guestState.kind === 'accepted-incomplete' ? undefined : getDefaultPathForGuestState(guestState);
  }

  if (routeAccess === 'declined') {
    return guestState.kind === 'declined' ? undefined : getDefaultPathForGuestState(guestState);
  }

  if (routeAccess === 'accepted') {
    return guestState.kind === 'accepted-complete' ? undefined : getDefaultPathForGuestState(guestState);
  }

  return undefined;
}
