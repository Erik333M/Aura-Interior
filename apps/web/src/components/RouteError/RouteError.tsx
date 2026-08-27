import { isRouteErrorResponse, useRouteError } from 'react-router-dom';
import styles from './RouteError.module.scss';

/**
 * Per-route error boundary. Keeps the failure inside the route instead of
 * blanking the whole app, and shows the real error in development only.
 */
export function RouteError() {
  const error = useRouteError();

  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : 'Unknown error';

  return (
    <div className={styles.wrap}>
      <h1>Something went wrong</h1>
      <p>This route failed to render. The rest of the site still works.</p>
      {import.meta.env.DEV && <pre className={styles.detail}>{message}</pre>}
    </div>
  );
}
