import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGuestSession } from '../app/providers/GuestSessionProvider';
import { ROUTE_PATHS } from '../app/router/routePaths';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import styles from './RsvpPage.module.css';

export function RsvpPage() {
  useDocumentTitle('RSVP');
  const navigate = useNavigate();
  const { guestState, submitRsvpDecision } = useGuestSession();
  const [error, setError] = useState('');
  const [submittingDecision, setSubmittingDecision] = useState<'accept' | 'decline' | undefined>();

  if (guestState.kind !== 'identified') {
    return null;
  }

  const { group } = guestState;

  const submitDecision = async (decision: 'accept' | 'decline') => {
    setError('');
    setSubmittingDecision(decision);

    try {
      await submitRsvpDecision(decision);
      navigate(decision === 'accept' ? ROUTE_PATHS.details : ROUTE_PATHS.declined, { replace: true });
    } catch {
      setError('We could not save this demo RSVP. Please try again.');
    } finally {
      setSubmittingDecision(undefined);
    }
  };

  return (
    <section className="page-surface" aria-labelledby="rsvp-heading">
      <p className="page-kicker">RSVP</p>
      <h1 className="page-title" id="rsvp-heading">
        Will {group.displayName} attend?
      </h1>
      <p className="page-lede">
        Please start with the simple attendance decision. Details such as meals and transportation come next only if
        you can join us.
      </p>

      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}

      <div className={styles.actions} aria-label="RSVP choices">
        <button
          className={styles.acceptButton}
          type="button"
          onClick={() => void submitDecision('accept')}
          disabled={Boolean(submittingDecision)}
        >
          <span>Yes, we will attend</span>
          <small>Continue to the attendance details</small>
        </button>
        <button
          className={styles.declineButton}
          type="button"
          onClick={() => void submitDecision('decline')}
          disabled={Boolean(submittingDecision)}
        >
          <span>Unfortunately, we cannot attend</span>
          <small>Send a warm decline</small>
        </button>
      </div>
    </section>
  );
}
