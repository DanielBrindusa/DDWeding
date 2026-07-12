import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGuestSession } from '../app/providers/GuestSessionProvider';
import { getDefaultPathForGuestState } from '../app/router/accessRules';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import styles from './AccessPage.module.css';

export function AccessPage() {
  useDocumentTitle('Invitation access');
  const navigate = useNavigate();
  const { identifyDemoGuest, demoAccessOptions, warning } = useGuestSession();
  const [accessToken, setAccessToken] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const identify = async (token: string) => {
    setError('');
    setIsSubmitting(true);

    try {
      const nextState = await identifyDemoGuest(token);
      navigate(getDefaultPathForGuestState(nextState), { replace: true });
    } catch {
      setError('That demo invitation was not recognized. Choose one of the demo invitations below.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void identify(accessToken);
  };

  return (
    <section className="page-surface" aria-labelledby="access-heading">
      <p className="page-kicker">Private invitation</p>
      <h1 className="page-title" id="access-heading">
        Find your invitation
      </h1>
      <p className="page-lede">
        This demo shows how invitation links, QR codes, or access codes can identify a guest group before any
        private wedding content is shown.
      </p>

      {warning ? (
        <div className={styles.notice} role="status">
          Your browser demo session was reset because the saved data was missing, outdated, or could not be read.
        </div>
      ) : null}

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <label className={styles.label} htmlFor="demo-access-token">
          Demo invitation
        </label>
        <p className={styles.hint} id="demo-access-token-hint">
          Use a fictional demo invitation. Real invitation codes must be validated by a secure backend later.
        </p>
        <input
          aria-describedby={`demo-access-token-hint${error ? ' demo-access-token-error' : ''}`}
          className={styles.input}
          id="demo-access-token"
          name="demo-access-token"
          value={accessToken}
          onChange={(event) => setAccessToken(event.target.value)}
          placeholder="DEMO-GUEST"
          autoComplete="off"
        />
        {error ? (
          <p className={styles.error} id="demo-access-token-error">
            {error}
          </p>
        ) : null}
        <button className="button" type="submit" disabled={isSubmitting || !accessToken.trim()}>
          Continue
        </button>
      </form>

      <div className={styles.demoOptions} aria-label="Demo invitations">
        {demoAccessOptions.map((option) => (
          <button
            key={option.accessToken}
            className={styles.demoOption}
            type="button"
            onClick={() => void identify(option.accessToken)}
            disabled={isSubmitting}
          >
            <span>{option.label}</span>
            <small>{option.description}</small>
          </button>
        ))}
      </div>
    </section>
  );
}
