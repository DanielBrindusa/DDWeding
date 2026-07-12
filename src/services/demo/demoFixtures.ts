import type { InvitationGroup } from '../../models/guest';
import type { PersonalizationProfile } from '../../models/personalization';
import type { HomeJourneyEntry, WeddingContentPage } from '../../models/weddingContent';
import type { DemoAccessOption } from '../contracts/GuestAccessService';

export const demoAccessOptions: DemoAccessOption[] = [
  {
    label: 'Demo Guest',
    description: 'A single fictional invited adult.',
    accessToken: 'DEMO-GUEST',
  },
  {
    label: 'Demo Couple',
    description: 'Two fictional adults with one possible additional guest.',
    accessToken: 'DEMO-COUPLE',
  },
  {
    label: 'Demo Family',
    description: 'A fictional family invitation that includes a child.',
    accessToken: 'DEMO-FAMILY',
  },
];

export const demoTokenToGroupId: Record<string, string> = {
  'DEMO-GUEST': 'demo-guest',
  'DEMO-COUPLE': 'demo-couple',
  'DEMO-FAMILY': 'demo-family',
};

export const demoInvitationGroups: Record<string, InvitationGroup> = {
  'demo-guest': {
    id: 'demo-guest',
    displayName: 'Demo Guest',
    invitedPeople: [
      {
        id: 'demo-guest-adult',
        displayName: 'Demo Guest',
        ageGroup: 'adult',
        explicitlyInvited: true,
        separateRsvpAllowed: false,
      },
    ],
    maxAttendees: 1,
    plusOnesAllowed: false,
    maxPlusOnes: 0,
    childrenAllowed: false,
    progress: {
      rsvp: 'unanswered',
      questionnaire: 'not-started',
    },
    languagePreference: 'en',
    personalizationProfileId: 'profile-demo-guest',
  },
  'demo-couple': {
    id: 'demo-couple',
    displayName: 'Demo Couple',
    invitedPeople: [
      {
        id: 'demo-couple-adult-1',
        displayName: 'Demo Partner One',
        ageGroup: 'adult',
        explicitlyInvited: true,
        separateRsvpAllowed: true,
      },
      {
        id: 'demo-couple-adult-2',
        displayName: 'Demo Partner Two',
        ageGroup: 'adult',
        explicitlyInvited: true,
        separateRsvpAllowed: true,
      },
    ],
    maxAttendees: 3,
    plusOnesAllowed: true,
    maxPlusOnes: 1,
    childrenAllowed: false,
    progress: {
      rsvp: 'unanswered',
      questionnaire: 'not-started',
    },
    languagePreference: 'en',
    personalizationProfileId: 'profile-demo-couple',
  },
  'demo-family': {
    id: 'demo-family',
    displayName: 'Demo Family',
    invitedPeople: [
      {
        id: 'demo-family-adult-1',
        displayName: 'Demo Adult One',
        ageGroup: 'adult',
        explicitlyInvited: true,
        separateRsvpAllowed: true,
      },
      {
        id: 'demo-family-adult-2',
        displayName: 'Demo Adult Two',
        ageGroup: 'adult',
        explicitlyInvited: true,
        separateRsvpAllowed: true,
      },
      {
        id: 'demo-family-child-1',
        displayName: 'Demo Child',
        ageGroup: 'child',
        explicitlyInvited: true,
        separateRsvpAllowed: true,
      },
    ],
    maxAttendees: 3,
    plusOnesAllowed: false,
    maxPlusOnes: 0,
    childrenAllowed: true,
    progress: {
      rsvp: 'unanswered',
      questionnaire: 'not-started',
    },
    languagePreference: 'en',
    personalizationProfileId: 'profile-demo-family',
  },
};

export const demoPersonalizationProfiles: Record<string, PersonalizationProfile> = {
  'profile-demo-guest': {
    id: 'profile-demo-guest',
    greeting: 'Welcome, Demo Guest',
    welcomeMessage: 'We are so happy to share this first glimpse of the celebration with you.',
    selectedHomepageContentIds: ['story', 'schedule', 'venue', 'faq'],
    themeVariant: 'classic',
    approvedEffectIds: ['soft-section-reveal'],
    language: 'en',
    travelInfoTags: ['general'],
    invitationGroupNotes: ['Demo-only personalization profile.'],
  },
  'profile-demo-couple': {
    id: 'profile-demo-couple',
    greeting: 'Welcome, Demo Couple',
    welcomeMessage: 'Your invitation experience can later become personal without exposing private data here.',
    selectedHomepageContentIds: ['story', 'restaurant', 'hotel', 'photos'],
    themeVariant: 'garden',
    approvedEffectIds: ['soft-section-reveal', 'quiet-glow'],
    language: 'en',
    travelInfoTags: ['hotel', 'restaurant'],
    invitationGroupNotes: ['Demo-only couple profile.'],
  },
  'profile-demo-family': {
    id: 'profile-demo-family',
    greeting: 'Welcome, Demo Family',
    welcomeMessage: 'This demo includes child-aware questionnaire and baby-chair options.',
    selectedHomepageContentIds: ['schedule', 'venue', 'places', 'faq'],
    themeVariant: 'city-evening',
    approvedEffectIds: ['soft-section-reveal'],
    language: 'en',
    travelInfoTags: ['family'],
    invitationGroupNotes: ['Demo-only family profile.'],
  },
};

export const demoHomeJourneyEntries: HomeJourneyEntry[] = [
  {
    id: 'story',
    title: 'Our Story',
    eyebrow: 'Chapter one',
    summary: 'A calm place for the couple story, memories, and the moments that brought everyone here.',
    route: '/story',
    status: 'foundation',
    accent: 'rose',
  },
  {
    id: 'schedule',
    title: 'Wedding Schedule',
    eyebrow: 'The day',
    summary: 'The future timeline for ceremony, dinner, music, and key guest moments.',
    route: '/schedule',
    status: 'foundation',
    accent: 'sage',
  },
  {
    id: 'venue',
    title: 'Venue',
    eyebrow: 'Arrival',
    summary: 'A future home for venue details, directions, parking, and accessibility notes.',
    route: '/venue',
    status: 'foundation',
    accent: 'gold',
  },
  {
    id: 'restaurant',
    title: 'Restaurant',
    eyebrow: 'Dinner',
    summary: 'A future section for dinner location, timing, and guest guidance.',
    route: '/restaurant',
    status: 'foundation',
    accent: 'ink',
  },
  {
    id: 'hotel',
    title: 'Hotel',
    eyebrow: 'Stay',
    summary: 'A future travel page for accommodations, booking notes, and transport options.',
    route: '/hotel',
    status: 'foundation',
    accent: 'sage',
  },
  {
    id: 'places',
    title: 'Places to Visit',
    eyebrow: 'Around town',
    summary: 'A curated guide can later help guests discover nearby places at their own pace.',
    route: '/places',
    status: 'foundation',
    accent: 'rose',
  },
  {
    id: 'seat',
    title: 'Find Your Seat',
    eyebrow: 'Reception',
    summary: 'A secure future feature for table guidance after seating assignments are ready.',
    route: '/seat',
    status: 'foundation',
    accent: 'gold',
  },
  {
    id: 'photos',
    title: 'Photos',
    eyebrow: 'Memories',
    summary: 'A future gallery area with privacy-aware upload and moderation boundaries.',
    route: '/photos',
    status: 'foundation',
    accent: 'ink',
  },
  {
    id: 'faq',
    title: 'FAQ',
    eyebrow: 'Helpful notes',
    summary: 'Short answers for dress code, timing, travel, children, gifts, and other guest questions.',
    route: '/faq',
    status: 'foundation',
    accent: 'sage',
  },
];

export const demoContentPages: Record<string, WeddingContentPage> = Object.fromEntries(
  demoHomeJourneyEntries.map((entry) => [
    entry.id,
    {
      id: entry.id,
      title: entry.title,
      summary: entry.summary,
      status: entry.status,
    },
  ]),
);
