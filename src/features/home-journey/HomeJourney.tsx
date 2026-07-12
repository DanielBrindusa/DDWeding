import { Link } from 'react-router-dom';
import type { CSSProperties } from 'react';
import type { HomeJourneyEntry } from '../../models/weddingContent';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import styles from './HomeJourney.module.css';

interface HomeJourneyProps {
  entries: HomeJourneyEntry[];
}

export function HomeJourney({ entries }: HomeJourneyProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      className={styles.journey}
      aria-labelledby="journey-heading"
      data-motion={prefersReducedMotion ? 'reduced' : 'standard'}
    >
      <div className={styles.intro}>
        <p className="page-kicker">Guest guide</p>
        <h2 id="journey-heading">Explore the celebration</h2>
        <nav className={styles.anchorNav} aria-label="Celebration sections">
          {entries.map((entry) => (
            <a key={entry.id} href={`#journey-${entry.id}`}>
              {entry.title}
            </a>
          ))}
        </nav>
      </div>

      <div className={styles.sections}>
        {entries.map((entry, index) => (
          <article
            className={`${styles.panel} ${styles[entry.accent]}`}
            id={`journey-${entry.id}`}
            key={entry.id}
            style={{ '--panel-index': index } as CSSProperties}
          >
            <div className={styles.panelArt} aria-hidden="true">
              <span />
            </div>
            <div className={styles.panelBody}>
              <p>{entry.eyebrow}</p>
              <h3>{entry.title}</h3>
              <p>{entry.summary}</p>
              <Link className="button buttonSecondary" to={entry.route}>
                Open {entry.title}
              </Link>
            </div>
          </article>
        ))}
      </div>

      <div className={styles.loopControl}>
        <a className="button" href="#journey-heading">
          Return to the beginning
        </a>
      </div>
    </section>
  );
}
