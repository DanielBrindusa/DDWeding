import type { MealPreference, PersonAgeGroup } from '../../models/guest';

export interface MealFormValue {
  mealPreference: MealPreference;
  otherMealPreference: string;
  allergens: string;
}

export interface AdditionalGuestFormValue {
  id: string;
  displayName: string;
  ageGroup: PersonAgeGroup;
  meal: MealFormValue;
}

export interface QuestionnaireFormState {
  attendingInvitedPersonIds: string[];
  invitedMeals: Record<string, MealFormValue>;
  additionalGuests: AdditionalGuestFormValue[];
  transportationRequired: boolean;
  transportationSeatsRequired: number;
  babyChairRequired: boolean;
  babyChairCount: number;
  messageToCouple: string;
}

export const createDefaultMeal = (): MealFormValue => ({
  mealPreference: 'standard',
  otherMealPreference: '',
  allergens: '',
});
