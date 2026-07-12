export function AppErrorState() {
  return (
    <section className="page-surface" aria-labelledby="app-error-heading">
      <h1 id="app-error-heading">Something needs a refresh</h1>
      <p>
        We could not prepare the invitation experience. Please refresh the page, or return to the access page and
        try again.
      </p>
      <a className="button buttonSecondary" href="#/access">
        Return to access
      </a>
    </section>
  );
}
