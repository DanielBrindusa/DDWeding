export const ROUTE_PATHS = {
  access: '/access',
  rsvp: '/rsvp',
  details: '/details',
  declined: '/declined',
  home: '/',
  story: '/story',
  schedule: '/schedule',
  venue: '/venue',
  restaurant: '/restaurant',
  hotel: '/hotel',
  places: '/places',
  seat: '/seat',
  photos: '/photos',
  faq: '/faq',
} as const;

export type RoutePath = (typeof ROUTE_PATHS)[keyof typeof ROUTE_PATHS];
