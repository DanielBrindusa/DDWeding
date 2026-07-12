import type { MealPreference, PersonAgeGroup } from './guest';

export interface AdditionalGuest {
  id: string;
  displayName: string;
  ageGroup: PersonAgeGroup;
}

export interface AttendeeMealDetails {
  attendeeId: string;
  attendeeSource: 'invited' | 'additional';
  displayName: string;
  ageGroup: PersonAgeGroup;
  mealPreference: MealPreference;
  otherMealPreference?: string;
  allergens?: string;
}

export interface AttendanceQuestionnaireResponse {
  invitationGroupId: string;
  attendingInvitedPersonIds: string[];
  additionalGuests: AdditionalGuest[];
  attendeeDetails: AttendeeMealDetails[];
  adultCount: number;
  childCount: number;
  vegetarianCount: number;
  veganCount: number;
  transportation: {
    required: boolean;
    seatsRequired: number;
  };
  babyChairs: {
    required: boolean;
    count: number;
  };
  messageToCouple?: string;
  completedAt: string;
  schemaVersion: 1;
}
