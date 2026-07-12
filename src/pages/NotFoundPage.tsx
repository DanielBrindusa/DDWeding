import { Link } from 'react-router-dom';
import { useGuestSession } from '../app/providers/GuestSessionProvider';
import { getDefaultPathForGuestState } from '../app/router/accessRules';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export function NotFoundPage() {
  useDocumentTitle('Page not found');
  const { guestState } = useGuestSession();

  return (
    <section className="page-surface" aria-labelledby="not-found-heading">
      <p className="page-kicker">Not found</p>
      <h1 className="page-title" id="not-found-heading">
        We could not find that page
      </h1>
      <p className="page-lede">The invitation link may be incomplete or the section may not exist yet.</p>
      <Link className="button" to={getDefaultPathForGuestState(guestState)}>
        Continue
      </Link>
    </section>
  );
}
