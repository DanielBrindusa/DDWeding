import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTE_PATHS } from '../app/router/routePaths';
import { useGuestSession } from '../app/providers/GuestSessionProvider';
import type { WeddingContentPage } from '../models/weddingContent';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

interface ProtectedContentPageProps {
  pageId: string;
}

export function ProtectedContentPage({ pageId }: ProtectedContentPageProps) {
  const { services } = useGuestSession();
  const [page, setPage] = useState<WeddingContentPage | undefined>();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadPage() {
      const nextPage = await services.weddingContentRepository.getContentPage(pageId);

      if (!cancelled) {
        setPage(nextPage);
        setLoaded(true);
      }
    }

    void loadPage();

    return () => {
      cancelled = true;
    };
  }, [pageId, services]);

  useDocumentTitle(page?.title ?? 'Guest page');

  if (!loaded) {
    return (
      <section className="page-surface">
        <p role="status">Preparing this section...</p>
      </section>
    );
  }

  if (!page) {
    return (
      <section className="page-surface" aria-labelledby="content-not-found-heading">
        <h1 className="page-title" id="content-not-found-heading">
          Section not found
        </h1>
        <p className="page-lede">That guest section is not part of this invitation foundation.</p>
        <Link className="button" to={ROUTE_PATHS.home}>
          Return home
        </Link>
      </section>
    );
  }

  return (
    <section className="page-surface" aria-labelledby={`${page.id}-heading`}>
      <p className="page-kicker">Foundation section</p>
      <h1 className="page-title" id={`${page.id}-heading`}>
        {page.title}
      </h1>
      <p className="page-lede">{page.summary}</p>
      <p>
        This section is intentionally lightweight in the foundation. It has a valid protected route and content
        boundary, but final wedding details should be added in a future content phase.
      </p>
      <Link className="button buttonSecondary" to={ROUTE_PATHS.home}>
        Return home
      </Link>
    </section>
  );
}
