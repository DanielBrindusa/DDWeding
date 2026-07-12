import type { InvitationGroup } from '../../models/guest';
import type { AttendanceQuestionnaireResponse } from '../../models/questionnaire';
import type { AdditionalGuestFormValue, QuestionnaireFormState } from './questionnaireFormModel';

export interface QuestionnaireValidationError {
  field: string;
  message: string;
}

export interface QuestionnaireValidationResult {
  valid: boolean;
  errors: QuestionnaireValidationError[];
}

const isBlank = (value: string) => value.trim().length === 0;

const getSelectedInvitedPeople = (group: InvitationGroup, formState: QuestionnaireFormState) =>
  group.invitedPeople.filter((person) => formState.attendingInvitedPersonIds.includes(person.id));

const getAdultCount = (group: InvitationGroup, formState: QuestionnaireFormState) => {
  const invitedAdultCount = getSelectedInvitedPeople(group, formState).filter(
    (person) => person.ageGroup === 'adult',
  ).length;
  const additionalAdultCount = formState.additionalGuests.filter((guest) => guest.ageGroup === 'adult').length;

  return invitedAdultCount + additionalAdultCount;
};

const getChildCount = (group: InvitationGroup, formState: QuestionnaireFormState) => {
  const invitedChildCount = getSelectedInvitedPeople(group, formState).filter(
    (person) => person.ageGroup === 'child',
  ).length;
  const additionalChildCount = formState.additionalGuests.filter((guest) => guest.ageGroup === 'child').length;

  return invitedChildCount + additionalChildCount;
};

export function getTotalAttendingCount(group: InvitationGroup, formState: QuestionnaireFormState) {
  return getSelectedInvitedPeople(group, formState).length + formState.additionalGuests.length;
}

export function getMaximumAdditionalGuestCount(group: InvitationGroup, selectedInvitedCount: number) {
  if (!group.plusOnesAllowed) {
    return 0;
  }

  return Math.max(0, Math.min(group.maxPlusOnes, group.maxAttendees - selectedInvitedCount));
}

export function validateQuestionnaireForm(
  group: InvitationGroup,
  formState: QuestionnaireFormState,
): QuestionnaireValidationResult {
  const errors: QuestionnaireValidationError[] = [];
  const attendingCount = getTotalAttendingCount(group, formState);
  const selectedInvitedCount = formState.attendingInvitedPersonIds.length;
  const maxAdditionalGuests = getMaximumAdditionalGuestCount(group, selectedInvitedCount);

  if (attendingCount < 1) {
    errors.push({
      field: 'attendingInvitedPersonIds',
      message: 'Select at least one attending guest.',
    });
  }

  if (attendingCount > group.maxAttendees) {
    errors.push({
      field: 'additionalGuestCount',
      message: `This invitation allows up to ${group.maxAttendees} attendee${group.maxAttendees === 1 ? '' : 's'}.`,
    });
  }

  if (formState.additionalGuests.length > maxAdditionalGuests) {
    errors.push({
      field: 'additionalGuestCount',
      message: 'The additional guest count is higher than this invitation allows.',
    });
  }

  formState.additionalGuests.forEach((guest, index) => {
    if (isBlank(guest.displayName)) {
      errors.push({
        field: `additionalGuests.${index}.displayName`,
        message: `Additional guest ${index + 1} name is required.`,
      });
    }

    if (guest.ageGroup === 'child' && !group.childrenAllowed) {
      errors.push({
        field: `additionalGuests.${index}.ageGroup`,
        message: 'This invitation is not configured for additional children.',
      });
    }
  });

  const invitedMealEntries = Object.entries(formState.invitedMeals).filter(([personId]) =>
    formState.attendingInvitedPersonIds.includes(personId),
  );

  invitedMealEntries.forEach(([personId, meal]) => {
    if (meal.mealPreference === 'other' && isBlank(meal.otherMealPreference)) {
      errors.push({
        field: `invitedMeals.${personId}.otherMealPreference`,
        message: 'Please describe the other meal preference.',
      });
    }
  });

  formState.additionalGuests.forEach((guest, index) => {
    if (guest.meal.mealPreference === 'other' && isBlank(guest.meal.otherMealPreference)) {
      errors.push({
        field: `additionalGuests.${index}.meal.otherMealPreference`,
        message: `Please describe the meal preference for additional guest ${index + 1}.`,
      });
    }
  });

  if (formState.transportationRequired) {
    if (formState.transportationSeatsRequired < 1 || formState.transportationSeatsRequired > attendingCount) {
      errors.push({
        field: 'transportationSeatsRequired',
        message: 'Transportation seats must match the number of guests who need a ride.',
      });
    }
  }

  const childCount = getChildCount(group, formState);

  if (formState.babyChairRequired) {
    if (childCount < 1) {
      errors.push({
        field: 'babyChairRequired',
        message: 'Baby chairs can only be requested when a child is attending.',
      });
    }

    if (formState.babyChairCount < 1 || formState.babyChairCount > Math.max(childCount, 1)) {
      errors.push({
        field: 'babyChairCount',
        message: 'Baby-chair count must match the children who need one.',
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

const countMeal = (meals: { mealPreference: string }[], mealPreference: string) =>
  meals.filter((meal) => meal.mealPreference === mealPreference).length;

const normalizeAdditionalGuest = (guest: AdditionalGuestFormValue) => ({
  id: guest.id,
  displayName: guest.displayName.trim(),
  ageGroup: guest.ageGroup,
});

export function buildQuestionnaireResponse(
  group: InvitationGroup,
  formState: QuestionnaireFormState,
): AttendanceQuestionnaireResponse {
  const selectedInvitedPeople = getSelectedInvitedPeople(group, formState);
  const additionalGuests = formState.additionalGuests.map(normalizeAdditionalGuest);
  const invitedMealDetails = selectedInvitedPeople.map((person) => {
    const meal = formState.invitedMeals[person.id];

    return {
      attendeeId: person.id,
      attendeeSource: 'invited' as const,
      displayName: person.displayName,
      ageGroup: person.ageGroup,
      mealPreference: meal.mealPreference,
      otherMealPreference: meal.otherMealPreference.trim() || undefined,
      allergens: meal.allergens.trim() || undefined,
    };
  });
  const additionalMealDetails = formState.additionalGuests.map((guest) => ({
    attendeeId: guest.id,
    attendeeSource: 'additional' as const,
    displayName: guest.displayName.trim(),
    ageGroup: guest.ageGroup,
    mealPreference: guest.meal.mealPreference,
    otherMealPreference: guest.meal.otherMealPreference.trim() || undefined,
    allergens: guest.meal.allergens.trim() || undefined,
  }));
  const allMeals = [...invitedMealDetails, ...additionalMealDetails];
  const attendingCount = getTotalAttendingCount(group, formState);

  return {
    invitationGroupId: group.id,
    attendingInvitedPersonIds: formState.attendingInvitedPersonIds,
    additionalGuests,
    attendeeDetails: allMeals,
    adultCount: getAdultCount(group, formState),
    childCount: getChildCount(group, formState),
    vegetarianCount: countMeal(allMeals, 'vegetarian'),
    veganCount: countMeal(allMeals, 'vegan'),
    transportation: {
      required: formState.transportationRequired,
      seatsRequired: formState.transportationRequired
        ? Math.min(formState.transportationSeatsRequired, attendingCount)
        : 0,
    },
    babyChairs: {
      required: formState.babyChairRequired,
      count: formState.babyChairRequired ? formState.babyChairCount : 0,
    },
    messageToCouple: formState.messageToCouple.trim() || undefined,
    completedAt: new Date().toISOString(),
    schemaVersion: 1,
  };
}
