import type { PersonalizationProfile, InvitationLanguage } from './personalization';

export type PersonAgeGroup = 'adult' | 'child';
export type MealPreference = 'standard' | 'vegetarian' | 'vegan' | 'other';

export interface InvitedPerson {
  id: string;
  displayName: string;
  ageGroup: PersonAgeGroup;
  explicitlyInvited: boolean;
  separateRsvpAllowed: boolean;
  dietaryPreference?: MealPreference;
  allergens?: string;
  babyChairRequired?: boolean;
}

export type InvitationProgress =
  | {
      rsvp: 'unanswered';
      questionnaire: 'not-started';
    }
  | {
      rsvp: 'declined';
      questionnaire: 'not-applicable';
    }
  | {
      rsvp: 'accepted';
      questionnaire: 'incomplete' | 'completed';
    };

export interface InvitationGroup {
  id: string;
  displayName: string;
  invitedPeople: InvitedPerson[];
  maxAttendees: number;
  plusOnesAllowed: boolean;
  maxPlusOnes: number;
  childrenAllowed: boolean;
  progress: InvitationProgress;
  languagePreference: InvitationLanguage;
  personalizationProfileId: string;
}

export type GuestState =
  | {
      kind: 'unidentified';
    }
  | {
      kind: 'identified';
      group: InvitationGroup;
    }
  | {
      kind: 'declined';
      group: InvitationGroup;
    }
  | {
      kind: 'accepted-incomplete';
      group: InvitationGroup;
    }
  | {
      kind: 'accepted-complete';
      group: InvitationGroup;
      personalization: PersonalizationProfile;
    };

export function deriveGuestState(
  group: InvitationGroup | undefined,
  personalization: PersonalizationProfile | undefined,
): GuestState {
  if (!group) {
    return { kind: 'unidentified' };
  }

  if (group.progress.rsvp === 'unanswered') {
    return { kind: 'identified', group };
  }

  if (group.progress.rsvp === 'declined') {
    return { kind: 'declined', group };
  }

  if (group.progress.questionnaire === 'incomplete') {
    return { kind: 'accepted-incomplete', group };
  }

  if (!personalization) {
    return { kind: 'accepted-incomplete', group };
  }

  return { kind: 'accepted-complete', group, personalization };
}

export function getGroupFromGuestState(state: GuestState): InvitationGroup | undefined {
  return state.kind === 'unidentified' ? undefined : state.group;
}
