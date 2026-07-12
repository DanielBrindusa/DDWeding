import { useNavigate } from 'react-router-dom';
import { useGuestSession } from '../app/providers/GuestSessionProvider';
import { ROUTE_PATHS } from '../app/router/routePaths';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export function DeclinedPage() {
  useDocumentTitle('Thank you');
  const navigate = useNavigate();
  const { guestState, clearDemoSession } = useGuestSession();
  const groupName = guestState.kind === 'declined' ? guestState.group.displayName : 'your invitation';

  const resetDemo = async () => {
    await clearDemoSession();
    navigate(ROUTE_PATHS.access, { replace: true });
  };

  return (
    <section className="page-surface" aria-labelledby="declined-heading">
      <p className="page-kicker">RSVP received</p>
      <h1 className="page-title" id="declined-heading">
        Thank you for letting us know
      </h1>
      <p className="page-lede">
        We are sorry {groupName} cannot attend, and we are grateful that you replied. We hope to celebrate together in
        another way soon.
      </p>
      <button className="button buttonSecondary" type="button" onClick={() => void resetDemo()}>
        Use another demo invitation
      </button>
    </section>
  );
}
