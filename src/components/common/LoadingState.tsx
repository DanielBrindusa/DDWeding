import styles from './LoadingState.module.css';

interface LoadingStateProps {
  message: string;
}

export function LoadingState({ message }: LoadingStateProps) {
  return (
    <section className={styles.loading} aria-live="polite" aria-busy="true">
      <span className={styles.mark} aria-hidden="true" />
      <p>{message}</p>
    </section>
  );
}
