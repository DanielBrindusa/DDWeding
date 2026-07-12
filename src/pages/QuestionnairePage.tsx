import { ChangeEvent, FormEvent, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGuestSession } from '../app/providers/GuestSessionProvider';
import { ROUTE_PATHS } from '../app/router/routePaths';
import {
  buildQuestionnaireResponse,
  getMaximumAdditionalGuestCount,
  getTotalAttendingCount,
  validateQuestionnaireForm,
  type QuestionnaireValidationError,
} from '../features/questionnaire/questionnaireValidation';
import {
  createDefaultMeal,
  type AdditionalGuestFormValue,
  type MealFormValue,
  type QuestionnaireFormState,
} from '../features/questionnaire/questionnaireFormModel';
import type { InvitedPerson, MealPreference, PersonAgeGroup } from '../models/guest';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import formStyles from '../styles/forms.module.css';
import styles from './QuestionnairePage.module.css';

const mealOptions: { value: MealPreference; label: string }[] = [
  { value: 'standard', label: 'Standard meal' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'other', label: 'Other preference' },
];

const createInitialFormState = (invitedPeople: InvitedPerson[]): QuestionnaireFormState => ({
  attendingInvitedPersonIds: invitedPeople.map((person) => person.id),
  invitedMeals: Object.fromEntries(invitedPeople.map((person) => [person.id, createDefaultMeal()])),
  additionalGuests: [],
  transportationRequired: false,
  transportationSeatsRequired: 1,
  babyChairRequired: false,
  babyChairCount: 1,
  messageToCouple: '',
});

const createAdditionalGuest = (index: number): AdditionalGuestFormValue => ({
  id: `additional-${index + 1}`,
  displayName: '',
  ageGroup: 'adult',
  meal: createDefaultMeal(),
});

const errorIdFor = (field: string) => `${field.replaceAll('.', '-')}-error`;

export function QuestionnairePage() {
  useDocumentTitle('Attendance details');
  const navigate = useNavigate();
  const { guestState, submitQuestionnaire } = useGuestSession();
  const [errors, setErrors] = useState<QuestionnaireValidationError[]>([]);
  const [submissionError, setSubmissionError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const group = guestState.kind === 'accepted-incomplete' ? guestState.group : undefined;
  const [formState, setFormState] = useState<QuestionnaireFormState>(() =>
    createInitialFormState(group?.invitedPeople ?? []),
  );
  const errorMap = useMemo(
    () =>
      errors.reduce<Record<string, string>>((accumulator, error) => {
        accumulator[error.field] = error.message;
        return accumulator;
      }, {}),
    [errors],
  );

  if (!group) {
    return null;
  }

  const selectedInvitedCount = formState.attendingInvitedPersonIds.length;
  const maxAdditionalGuests = getMaximumAdditionalGuestCount(group, selectedInvitedCount);
  const totalAttending = getTotalAttendingCount(group, formState);
  const invitedChildCount = group.invitedPeople.filter(
    (person) => person.ageGroup === 'child' && formState.attendingInvitedPersonIds.includes(person.id),
  ).length;
  const additionalChildCount = formState.additionalGuests.filter((guest) => guest.ageGroup === 'child').length;
  const childCount = invitedChildCount + additionalChildCount;

  const getError = (field: string) => errorMap[field];

  const describedBy = (field: string, hintId?: string) => {
    const ids = [hintId, getError(field) ? errorIdFor(field) : undefined].filter(Boolean);
    return ids.length ? ids.join(' ') : undefined;
  };

  const setInvitedAttendance = (personId: string, checked: boolean) => {
    setFormState((current) => {
      const nextSelected = checked
        ? [...current.attendingInvitedPersonIds, personId]
        : current.attendingInvitedPersonIds.filter((id) => id !== personId);
      const nextMaxAdditional = getMaximumAdditionalGuestCount(group, nextSelected.length);

      return {
        ...current,
        attendingInvitedPersonIds: nextSelected,
        additionalGuests: current.additionalGuests.slice(0, nextMaxAdditional),
      };
    });
  };

  const setInvitedMeal = (personId: string, patch: Partial<MealFormValue>) => {
    setFormState((current) => ({
      ...current,
      invitedMeals: {
        ...current.invitedMeals,
        [personId]: {
          ...current.invitedMeals[personId],
          ...patch,
        },
      },
    }));
  };

  const setAdditionalGuestCount = (count: number) => {
    setFormState((current) => {
      const nextCount = Math.min(count, maxAdditionalGuests);
      const nextGuests = [...current.additionalGuests];

      while (nextGuests.length < nextCount) {
        nextGuests.push(createAdditionalGuest(nextGuests.length));
      }

      return {
        ...current,
        additionalGuests: nextGuests.slice(0, nextCount),
      };
    });
  };

  const updateAdditionalGuest = (index: number, patch: Partial<AdditionalGuestFormValue>) => {
    setFormState((current) => ({
      ...current,
      additionalGuests: current.additionalGuests.map((guest, guestIndex) =>
        guestIndex === index ? { ...guest, ...patch } : guest,
      ),
    }));
  };

  const updateAdditionalMeal = (index: number, patch: Partial<MealFormValue>) => {
    setFormState((current) => ({
      ...current,
      additionalGuests: current.additionalGuests.map((guest, guestIndex) =>
        guestIndex === index
          ? {
              ...guest,
              meal: {
                ...guest.meal,
                ...patch,
              },
            }
          : guest,
      ),
    }));
  };

  const focusFirstError = (nextErrors: QuestionnaireValidationError[]) => {
    const firstField = nextErrors[0]?.field;

    if (firstField) {
      const field = document.querySelector<HTMLElement>(`[name="${firstField}"]`);

      if (field) {
        field.focus();
        return;
      }
    }

    errorSummaryRef.current?.focus();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmissionError('');

    const validation = validateQuestionnaireForm(group, formState);

    if (!validation.valid) {
      setErrors(validation.errors);
      window.requestAnimationFrame(() => focusFirstError(validation.errors));
      return;
    }

    setErrors([]);
    setIsSubmitting(true);

    try {
      await submitQuestionnaire(buildQuestionnaireResponse(group, formState));
      navigate(ROUTE_PATHS.home, { replace: true });
    } catch {
      setSubmissionError('We could not save these demo details. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderMealFields = (
    fieldPrefix: string,
    meal: MealFormValue,
    onChange: (patch: Partial<MealFormValue>) => void,
  ) => (
    <div className={formStyles.inlineFields}>
      <div className={formStyles.field}>
        <label className={formStyles.label} htmlFor={`${fieldPrefix}.mealPreference`}>
          Meal preference
        </label>
        <select
          className={formStyles.control}
          id={`${fieldPrefix}.mealPreference`}
          name={`${fieldPrefix}.mealPreference`}
          value={meal.mealPreference}
          onChange={(event: ChangeEvent<HTMLSelectElement>) =>
            onChange({ mealPreference: event.target.value as MealPreference })
          }
        >
          {mealOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      {meal.mealPreference === 'other' ? (
        <div className={formStyles.field}>
          <label className={formStyles.label} htmlFor={`${fieldPrefix}.otherMealPreference`}>
            Describe the preference
          </label>
          <input
            aria-describedby={describedBy(`${fieldPrefix}.otherMealPreference`)}
            aria-invalid={Boolean(getError(`${fieldPrefix}.otherMealPreference`))}
            className={formStyles.control}
            id={`${fieldPrefix}.otherMealPreference`}
            name={`${fieldPrefix}.otherMealPreference`}
            value={meal.otherMealPreference}
            onChange={(event) => onChange({ otherMealPreference: event.target.value })}
          />
          {getError(`${fieldPrefix}.otherMealPreference`) ? (
            <p className={formStyles.errorText} id={errorIdFor(`${fieldPrefix}.otherMealPreference`)}>
              {getError(`${fieldPrefix}.otherMealPreference`)}
            </p>
          ) : null}
        </div>
      ) : null}
      <div className={formStyles.field}>
        <label className={formStyles.label} htmlFor={`${fieldPrefix}.allergens`}>
          Allergens or dietary restrictions
        </label>
        <input
          className={formStyles.control}
          id={`${fieldPrefix}.allergens`}
          name={`${fieldPrefix}.allergens`}
          value={meal.allergens}
          onChange={(event) => onChange({ allergens: event.target.value })}
          placeholder="Optional"
        />
      </div>
    </div>
  );

  return (
    <section className="page-surface" aria-labelledby="details-heading">
      <p className="page-kicker">Attendance details</p>
      <h1 className="page-title" id="details-heading">
        A few details for {group.displayName}
      </h1>
      <p className="page-lede">
        Please tell us who is attending and share any important meal, transportation, or child seating needs.
      </p>

      {errors.length ? (
        <div
          className={formStyles.errorSummary}
          ref={errorSummaryRef}
          role="alert"
          tabIndex={-1}
          aria-labelledby="details-error-summary-heading"
        >
          <h2 id="details-error-summary-heading">Please check these details</h2>
          <ul>
            {errors.map((error) => (
              <li key={`${error.field}-${error.message}`}>{error.message}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {submissionError ? (
        <p className={styles.submissionError} role="alert">
          {submissionError}
        </p>
      ) : null}

      <form className={formStyles.form} onSubmit={handleSubmit} noValidate>
        <section className={formStyles.section} aria-labelledby="attendees-heading">
          <h2 className={formStyles.sectionTitle} id="attendees-heading">
            Who will attend?
          </h2>
          <p className={formStyles.sectionDescription}>
            Select the invited people who will join. The total number cannot exceed this invitation.
          </p>
          <div className={formStyles.choiceList}>
            {group.invitedPeople.map((person) => (
              <label className={formStyles.choice} key={person.id}>
                <input
                  aria-describedby={describedBy('attendingInvitedPersonIds')}
                  name="attendingInvitedPersonIds"
                  type="checkbox"
                  checked={formState.attendingInvitedPersonIds.includes(person.id)}
                  onChange={(event) => setInvitedAttendance(person.id, event.target.checked)}
                />
                <span className={formStyles.choiceText}>
                  <span>{person.displayName}</span>
                  <span>{person.ageGroup === 'child' ? 'Child' : 'Adult'}</span>
                </span>
              </label>
            ))}
          </div>
          {getError('attendingInvitedPersonIds') ? (
            <p className={formStyles.errorText} id={errorIdFor('attendingInvitedPersonIds')}>
              {getError('attendingInvitedPersonIds')}
            </p>
          ) : null}

          {group.plusOnesAllowed ? (
            <div className={styles.additionalGuests}>
              <label className={formStyles.label} htmlFor="additionalGuestCount">
                Additional guests
              </label>
              <p className={formStyles.hint} id="additionalGuestCount-hint">
                This invitation allows up to {maxAdditionalGuests} additional guest
                {maxAdditionalGuests === 1 ? '' : 's'} with the current selection.
              </p>
              <select
                aria-describedby={describedBy('additionalGuestCount', 'additionalGuestCount-hint')}
                aria-invalid={Boolean(getError('additionalGuestCount'))}
                className={formStyles.control}
                id="additionalGuestCount"
                name="additionalGuestCount"
                value={formState.additionalGuests.length}
                onChange={(event) => setAdditionalGuestCount(Number(event.target.value))}
              >
                {Array.from({ length: maxAdditionalGuests + 1 }, (_, value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
              {getError('additionalGuestCount') ? (
                <p className={formStyles.errorText} id={errorIdFor('additionalGuestCount')}>
                  {getError('additionalGuestCount')}
                </p>
              ) : null}
            </div>
          ) : null}
        </section>

        {formState.additionalGuests.length ? (
          <section className={formStyles.section} aria-labelledby="additional-guests-heading">
            <h2 className={formStyles.sectionTitle} id="additional-guests-heading">
              Additional guest details
            </h2>
            <div className={formStyles.fieldGrid}>
              {formState.additionalGuests.map((guest, index) => (
                <div className={styles.guestDetail} key={guest.id}>
                  <div className={formStyles.inlineFields}>
                    <div className={formStyles.field}>
                      <label className={formStyles.label} htmlFor={`additionalGuests.${index}.displayName`}>
                        Additional guest {index + 1} name
                      </label>
                      <input
                        aria-describedby={describedBy(`additionalGuests.${index}.displayName`)}
                        aria-invalid={Boolean(getError(`additionalGuests.${index}.displayName`))}
                        className={formStyles.control}
                        id={`additionalGuests.${index}.displayName`}
                        name={`additionalGuests.${index}.displayName`}
                        value={guest.displayName}
                        onChange={(event) => updateAdditionalGuest(index, { displayName: event.target.value })}
                      />
                      {getError(`additionalGuests.${index}.displayName`) ? (
                        <p className={formStyles.errorText} id={errorIdFor(`additionalGuests.${index}.displayName`)}>
                          {getError(`additionalGuests.${index}.displayName`)}
                        </p>
                      ) : null}
                    </div>
                    <div className={formStyles.field}>
                      <label className={formStyles.label} htmlFor={`additionalGuests.${index}.ageGroup`}>
                        Guest type
                      </label>
                      <select
                        aria-describedby={describedBy(`additionalGuests.${index}.ageGroup`)}
                        aria-invalid={Boolean(getError(`additionalGuests.${index}.ageGroup`))}
                        className={formStyles.control}
                        id={`additionalGuests.${index}.ageGroup`}
                        name={`additionalGuests.${index}.ageGroup`}
                        value={guest.ageGroup}
                        onChange={(event) =>
                          updateAdditionalGuest(index, {
                            ageGroup: event.target.value as PersonAgeGroup,
                          })
                        }
                      >
                        <option value="adult">Adult</option>
                        {group.childrenAllowed ? <option value="child">Child</option> : null}
                      </select>
                      {getError(`additionalGuests.${index}.ageGroup`) ? (
                        <p className={formStyles.errorText} id={errorIdFor(`additionalGuests.${index}.ageGroup`)}>
                          {getError(`additionalGuests.${index}.ageGroup`)}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  {renderMealFields(`additionalGuests.${index}.meal`, guest.meal, (patch) =>
                    updateAdditionalMeal(index, patch),
                  )}
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <section className={formStyles.section} aria-labelledby="meals-heading">
          <h2 className={formStyles.sectionTitle} id="meals-heading">
            Meals and allergens
          </h2>
          <p className={formStyles.sectionDescription}>
            Add meal notes per person where possible, especially for allergens.
          </p>
          <div className={formStyles.fieldGrid}>
            {group.invitedPeople
              .filter((person) => formState.attendingInvitedPersonIds.includes(person.id))
              .map((person) => (
                <div className={styles.guestDetail} key={person.id}>
                  <h3 className={styles.personHeading}>{person.displayName}</h3>
                  {renderMealFields(`invitedMeals.${person.id}`, formState.invitedMeals[person.id], (patch) =>
                    setInvitedMeal(person.id, patch),
                  )}
                </div>
              ))}
          </div>
        </section>

        <section className={formStyles.section} aria-labelledby="transport-heading">
          <h2 className={formStyles.sectionTitle} id="transport-heading">
            Transportation
          </h2>
          <div className={formStyles.choiceList}>
            <label className={formStyles.choice}>
              <input
                checked={!formState.transportationRequired}
                name="transportationRequired"
                type="radio"
                onChange={() =>
                  setFormState((current) => ({
                    ...current,
                    transportationRequired: false,
                  }))
                }
              />
              <span className={formStyles.choiceText}>
                <span>No ride needed</span>
                <span>We will arrange our own transportation.</span>
              </span>
            </label>
            <label className={formStyles.choice}>
              <input
                checked={formState.transportationRequired}
                name="transportationRequired"
                type="radio"
                onChange={() =>
                  setFormState((current) => ({
                    ...current,
                    transportationRequired: true,
                  }))
                }
              />
              <span className={formStyles.choiceText}>
                <span>We may need transportation</span>
                <span>Share how many seats might be needed.</span>
              </span>
            </label>
          </div>
          {formState.transportationRequired ? (
            <div className={styles.conditionalField}>
              <label className={formStyles.label} htmlFor="transportationSeatsRequired">
                Transportation seats required
              </label>
              <input
                aria-describedby={describedBy('transportationSeatsRequired')}
                aria-invalid={Boolean(getError('transportationSeatsRequired'))}
                className={formStyles.control}
                id="transportationSeatsRequired"
                name="transportationSeatsRequired"
                type="number"
                min={1}
                max={Math.max(totalAttending, 1)}
                value={formState.transportationSeatsRequired}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    transportationSeatsRequired: Number(event.target.value),
                  }))
                }
              />
              {getError('transportationSeatsRequired') ? (
                <p className={formStyles.errorText} id={errorIdFor('transportationSeatsRequired')}>
                  {getError('transportationSeatsRequired')}
                </p>
              ) : null}
            </div>
          ) : null}
        </section>

        {childCount > 0 ? (
          <section className={formStyles.section} aria-labelledby="children-heading">
            <h2 className={formStyles.sectionTitle} id="children-heading">
              Child seating
            </h2>
            <div className={formStyles.choiceList}>
              <label className={formStyles.choice}>
                <input
                  checked={!formState.babyChairRequired}
                  name="babyChairRequired"
                  type="radio"
                  onChange={() =>
                    setFormState((current) => ({
                      ...current,
                      babyChairRequired: false,
                    }))
                  }
                />
                <span className={formStyles.choiceText}>
                  <span>No baby chair needed</span>
                  <span>Standard seating is fine.</span>
                </span>
              </label>
              <label className={formStyles.choice}>
                <input
                  checked={formState.babyChairRequired}
                  name="babyChairRequired"
                  type="radio"
                  onChange={() =>
                    setFormState((current) => ({
                      ...current,
                      babyChairRequired: true,
                    }))
                  }
                />
                <span className={formStyles.choiceText}>
                  <span>Baby chair needed</span>
                  <span>Tell us how many chairs to prepare.</span>
                </span>
              </label>
            </div>
            {formState.babyChairRequired ? (
              <div className={styles.conditionalField}>
                <label className={formStyles.label} htmlFor="babyChairCount">
                  Number of baby chairs
                </label>
                <input
                  aria-describedby={describedBy('babyChairCount')}
                  aria-invalid={Boolean(getError('babyChairCount'))}
                  className={formStyles.control}
                  id="babyChairCount"
                  name="babyChairCount"
                  type="number"
                  min={1}
                  max={childCount}
                  value={formState.babyChairCount}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      babyChairCount: Number(event.target.value),
                    }))
                  }
                />
                {getError('babyChairCount') ? (
                  <p className={formStyles.errorText} id={errorIdFor('babyChairCount')}>
                    {getError('babyChairCount')}
                  </p>
                ) : null}
              </div>
            ) : null}
          </section>
        ) : null}

        <section className={formStyles.section} aria-labelledby="message-heading">
          <h2 className={formStyles.sectionTitle} id="message-heading">
            Message for the couple
          </h2>
          <label className={formStyles.label} htmlFor="messageToCouple">
            Optional note
          </label>
          <textarea
            className={`${formStyles.control} ${formStyles.textarea}`}
            id="messageToCouple"
            name="messageToCouple"
            value={formState.messageToCouple}
            onChange={(event) =>
              setFormState((current) => ({
                ...current,
                messageToCouple: event.target.value,
              }))
            }
          />
        </section>

        <div className="buttonRow">
          <button className="button" type="submit" disabled={isSubmitting}>
            Save attendance details
          </button>
        </div>
      </form>
    </section>
  );
}
