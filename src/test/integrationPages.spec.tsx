import { describe, it, expect, beforeAll } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { ROUTES, router } from '../../router';

describe('integration pages', () => {
  beforeAll(() => {
    // jsdom has no IntersectionObserver; ScrollNav needs one.
    (globalThis as any).IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} takeRecords() { return []; } };
  });

  const cases = [
    [ROUTES.PLAYWRIGHT_OCR_TESTING, 'Playwright OCR testing', 'toShowText'],
    [ROUTES.CYPRESS_OCR_TESTING, 'Cypress OCR testing', 'cy.matchText'],
    [ROUTES.WHAT_IS_VERIFICATION_DEBT, 'What is verification debt?', 'Verification debt'],
  ] as const;

  cases.forEach(([path, h1, api]) => {
    it(`${path} renders one h1, the API name, and FAQ markup`, async () => {
      const r = createMemoryRouter(router.routes, { initialEntries: [path] });
      const { container } = render(<RouterProvider router={r} />);
      await waitFor(() => expect(screen.getByRole('heading', { level: 1, name: h1 })).toBeTruthy());
      expect(container.textContent).toContain(api);
      const ld = [...container.querySelectorAll('script[type="application/ld+json"]')].map((s) => s.textContent).join('');
      expect(ld).toContain('FAQPage');
      expect(ld).toContain('TechArticle');
    });
  });
});
