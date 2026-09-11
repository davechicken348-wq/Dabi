import { isRouteErrorResponse, Link, useRouteError } from 'react-router-dom';
import { Logo } from '../Logo/Logo';
import './RouteError.css';

export function RouteError() {
  const error = useRouteError();
  const notFound = isRouteErrorResponse(error) && error.status === 404;
  const title = notFound ? 'We could not find that page.' : 'Something interrupted the journey.';
  const description = notFound
    ? 'The room or page you are looking for may have moved, or the link may be outdated.'
    : 'Dabi could not load this view right now. Try returning to FindRoom or the home page.';
  const technicalMessage = isRouteErrorResponse(error)
    ? error.statusText
    : error instanceof Error
      ? error.message
      : null;

  return (
    <main className="route-error-page">
      <div className="route-error-orbit route-error-orbit-one" />
      <div className="route-error-orbit route-error-orbit-two" />
      <div className="route-error-panel">
        <Link to="/marketing" className="route-error-brand" aria-label="Dabi home">
          <Logo size="md" />
        </Link>
        <div className="route-error-code">{notFound ? '404' : 'DABI'}</div>
        <p className="route-error-eyebrow">A small detour</p>
        <h1>{title}</h1>
        <p className="route-error-description">{description}</p>
        <div className="route-error-actions">
          <Link to="/findroom" className="route-error-primary">Go to FindRoom</Link>
          <Link to="/marketing" className="route-error-secondary">Back to home</Link>
        </div>
        {technicalMessage && !notFound && (
          <details className="route-error-details">
            <summary>View error details</summary>
            <code>{technicalMessage}</code>
          </details>
        )}
      </div>
    </main>
  );
}