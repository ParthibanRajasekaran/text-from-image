import { describe, it, expect, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { router } from '../../router';

describe('legal pages', () => {
  beforeAll(() => {
    (globalThis as any).IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} takeRecords() { return []; } };
  });

  ['/privacy-policy', '/terms', '/security'].forEach((path) => {
    it(`${path}: one h1, version line, and every contents link has a target`, async () => {
      const r = createMemoryRouter(router.routes, { initialEntries: [path] });
      const { container } = render(<RouterProvider router={r} />);
      await screen.findByRole('heading', { level: 1 });
      expect(container.querySelectorAll('h1')).toHaveLength(1);
      expect(container.textContent).toMatch(/Version 2\.0/);
      const links = [...container.querySelectorAll('aside a[href^="#"]')];
      expect(links.length).toBeGreaterThan(4);
      for (const a of links) {
        expect(container.querySelector(a.getAttribute('href')!), a.getAttribute('href')!).toBeTruthy();
      }
    });
  });

  it('the privacy policy does not claim cookies, analytics or ads that the site does not use', async () => {
    const r = createMemoryRouter(router.routes, { initialEntries: ['/privacy-policy'] });
    const { container } = render(<RouterProvider router={r} />);
    await screen.findByRole('heading', { level: 1 });
    const text = container.textContent ?? '';
    expect(text).toMatch(/does not set cookies/);
    expect(text).not.toMatch(/analytics and advertising cookies|ad-related cookies|consent to ads/i);
  });
});
