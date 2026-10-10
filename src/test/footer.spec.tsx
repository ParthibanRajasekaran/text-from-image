import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Footer } from '../../components/shell/Footer';
import { router } from '../../router';

function paths(): Set<string> {
  const out = new Set<string>(['/']);
  const walk = (routes: any[], base = '') => {
    for (const r of routes) {
      const full = r.path ? `${base}/${r.path}`.replace(/\/+/g, '/') : base;
      if (r.path !== undefined) out.add(full === '' ? '/' : full);
      if (r.children) walk(r.children, full);
    }
  };
  walk(router.routes as any[]);
  return out;
}

describe('footer', () => {
  it('has the four columns and every internal link points at a real route', () => {
    const { container } = render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );
    for (const t of ['Product', 'Developers', 'Trust', 'About']) {
      expect(screen.getByRole('heading', { name: t })).toBeTruthy();
    }
    const known = paths();
    const internal = [...container.querySelectorAll('a[href^="/"]')].map((a) => a.getAttribute('href')!);
    expect(internal.length).toBeGreaterThan(10);
    for (const href of internal) expect(known.has(href), href).toBe(true);
  });

  it('no longer lists a feature claim or a personal profile as a link', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );
    expect(screen.queryByText('No data persistence by default')).toBeNull();
    expect(screen.queryByRole('link', { name: 'Author Profile' })).toBeNull();
    expect(screen.queryByRole('link', { name: 'Case Studies' })).toBeNull();
  });
});
