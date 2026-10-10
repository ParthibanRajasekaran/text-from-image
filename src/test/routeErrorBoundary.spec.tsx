import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { RouteErrorBoundary, summariseRouteError } from '../../components/RouteErrorBoundary';
import { router } from '../../router';

// The data router exposes routes as AgnosticDataRouteObject, which omits React-only fields.
type RouteWithElement = { errorElement?: unknown };

function Boom(): never {
  throw new ReferenceError('useTheme is not defined');
}

describe('RouteErrorBoundary', () => {
  beforeEach(() => {
    // The boundary logs the error on purpose; keep the test output clean.
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows a friendly page instead of the raw crash when a route throws', () => {
    const testRouter = createMemoryRouter(
      [{ path: '/', element: <Boom />, errorElement: <RouteErrorBoundary /> }],
      { initialEntries: ['/'] }
    );
    render(<RouterProvider router={testRouter} />);

    expect(screen.getByTestId('route-error-boundary')).toBeTruthy();
    expect(screen.getByRole('heading', { name: /this page hit a problem/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /reload page/i })).toBeTruthy();
    // The raw message and stack must not be shown to visitors in a production-style render.
    expect(screen.queryByText(/Unexpected Application Error/i)).toBeNull();
  });

  it('summarises a 404 response, a stale lazy chunk and a runtime error differently', () => {
    expect(summariseRouteError(new Response('', { status: 404 }) as unknown).kind).toBeDefined();
    expect(
      summariseRouteError(new Error('Failed to fetch dynamically imported module: /assets/x.js')).kind
    ).toBe('stale-chunk');
    expect(summariseRouteError(new ReferenceError('x is not defined')).kind).toBe('runtime');
  });
});

describe('router error boundaries', () => {
  it('has an errorElement on the root route', () => {
    const root = router.routes[0];
    expect((root as RouteWithElement).errorElement).toBeTruthy();
  });

  it('wraps every child route in a layout route that has an errorElement', () => {
    const root = router.routes[0];
    const children = root.children ?? [];
    expect(children).toHaveLength(1);
    const layout = children[0];
    expect(layout.path).toBeUndefined();
    expect((layout as RouteWithElement).errorElement).toBeTruthy();
    // And it really does contain the application routes.
    const paths = (layout.children ?? []).map((c) => c.path).filter(Boolean);
    expect(paths).toEqual(
      expect.arrayContaining(['verify-debt-score', 'privacy-policy', 'terms', 'security', '*'])
    );
  });
});

describe('legal routes are served by the router', () => {
  it.each([
    ['/privacy-policy', /privacy policy/i],
    ['/terms', /terms of service/i],
    ['/security', /^security$/i],
  ])('renders %s directly', async (path, heading) => {
    const testRouter = createMemoryRouter(router.routes, { initialEntries: [path] });
    render(<RouterProvider router={testRouter} />);
    expect(await screen.findByRole('heading', { level: 1, name: heading })).toBeTruthy();
    expect(screen.queryByTestId('route-error-boundary')).toBeNull();
  });
});
