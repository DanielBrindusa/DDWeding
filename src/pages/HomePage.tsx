import { useEffect, useState } from 'react';
import { HomeJourney } from '../features/home-journey/HomeJourney';
import { useGuestSession } from '../app/providers/GuestSessionProvider';
import type { HomeJourneyEntry } from '../models/weddingContent';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import styles from './HomePage.module.css';

export function HomePage() {
  useDocumentTitle('Home');
  const { guestState, services } = useGuestSession();
  const [entries, setEntries] = useState<HomeJourneyEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadContent() {
      setIsLoading(true);
      const nextEntries = await services.weddingContentRepository.getHomeJourneyEntries();

      if (!cancelled) {
        setEntries(nextEntries);
        setIsLoading(false);
      }
    }

    void loadContent();

    return () => {
      cancelled = true;
    };
  }, [services]);

  if (guestState.kind !== 'accepted-complete') {
    return null;
  }

  return (
    <div className={styles.home}>
      <section className={styles.hero} aria-labelledby="home-heading">
        <div className={styles.heroArt} aria-hidden="true" />
        <div className={styles.heroBody}>
          <p className="page-kicker">Welcome</p>
          <h1 id="home-heading">{guestState.personalization.greeting}</h1>
          <p>{guestState.personalization.welcomeMessage}</p>
        </div>
      </section>

      {isLoading ? (
        <p className={styles.loading} role="status">
          Preparing the guest guide...
        </p>
      ) : (
        <HomeJourney entries={entries} />
      )}
    </div>
  );
}
