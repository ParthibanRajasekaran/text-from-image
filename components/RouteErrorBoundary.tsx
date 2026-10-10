import { isRouteErrorResponse, useRouteError } from 'react-router-dom';

/**
 * RouteErrorBoundary
 *
 * Used as the `errorElement` for the root route and for the child routes in
 * router.tsx. It replaces React Router's default "Unexpected Application Error"
 * page, which prints the raw error and stack trace to visitors.
 *
 * Design constraints:
 * - Self-contained: no theme, shell or app hooks. This component renders when
 *   something else has already failed, so it must not depend on anything that
 *   could be the cause (the `useTheme is not defined` crash was exactly that).
 * - Plain anchors, not <Link>: a full page load also recovers from a stale
 *   lazy-loaded chunk after a new deploy.
 * - Technical detail is only shown in development builds.
 */

type ErrorKind = 'not-found' | 'stale-chunk' | 'runtime';

interface ErrorSummary {
  kind: ErrorKind;
  status?: number;
  title: string;
  message: string;
  detail?: string;
}

const CHUNK_ERROR_PATTERN =
  /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|Loading chunk [\w-]+ failed/i;

export function summariseRouteError(error: unknown): ErrorSummary {
  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      return {
        kind: 'not-found',
        status: 404,
        title: 'Page not found',
        message: 'The page you asked for does not exist or has moved.',
      };
    }
    return {
      kind: 'runtime',
      status: error.status,
      title: `Something went wrong (${error.status})`,
      message: error.statusText || 'The page could not be loaded.',
    };
  }

  const text = error instanceof Error ? error.message : String(error);

  if (CHUNK_ERROR_PATTERN.test(text)) {
    return {
      kind: 'stale-chunk',
      title: 'A new version is available',
      message: 'This page needs to reload to pick up the latest version of the site.',
      detail: text,
    };
  }

  return {
    kind: 'runtime',
    title: 'This page hit a problem',
    message: 'An unexpected error stopped this page from loading. Reloading usually fixes it.',
    detail: error instanceof Error ? error.stack || error.message : text,
  };
}

export function RouteErrorBoundary() {
  const error = useRouteError();
  const summary = summariseRouteError(error);

  // Always log, so the failure is visible to monitoring and in the console.
  console.error('[RouteErrorBoundary]', error);

  return (
    <div
      role="alert"
      data-testid="route-error-boundary"
      className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-start justify-center gap-4 px-6 py-16"
    >
      <p className="text-sm font-medium text-muted-foreground">
        {summary.status ? `Error ${summary.status}` : 'Error'}
      </p>
      <h1 className="text-3xl font-semibold tracking-tight">{summary.title}</h1>
      <p className="text-base text-muted-foreground">{summary.message}</p>

      <div className="flex flex-wrap gap-3 pt-2">
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-md border border-current px-4 py-2 text-sm font-medium"
        >
          Reload page
        </button>
        <a href="/" className="rounded-md px-4 py-2 text-sm font-medium underline">
          Go to the home page
        </a>
      </div>

      {import.meta.env.DEV && summary.detail ? (
        <pre className="mt-4 max-h-64 w-full overflow-auto rounded-md border p-3 text-xs">
          {summary.detail}
        </pre>
      ) : null}
    </div>
  );
}

export default RouteErrorBoundary;
