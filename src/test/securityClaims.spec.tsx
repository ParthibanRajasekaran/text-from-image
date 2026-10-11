import { describe, expect, it, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import fs from 'node:fs';
import path from 'node:path';
import { router } from '../../router';

const root = path.resolve(__dirname, '../..');

describe('/security claims', () => {
  beforeAll(() => {
    (globalThis as any).IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} takeRecords() { return []; } };
  });

  it('states the usage log, how to turn it off and the honest limits', async () => {
    const r = createMemoryRouter(router.routes, { initialEntries: ['/security'] });
    const { container } = render(<RouterProvider router={r} />);
    await screen.findByRole('heading', { level: 1 });
    const text = container.textContent ?? '';
    expect(text).toContain('~/.rendercheck/usage.jsonl');
    expect(text).toContain('RENDERCHECK_NO_USAGE_LOG=1');
    expect(text).toMatch(/no third-party penetration test/);
    expect(text).toMatch(/if it is enabled/);
    expect(text).not.toMatch(/\bwe\b|\bour team\b/i);
    expect(text).not.toMatch(/SOC 2[- ]compliant|certified/i);
    expect(text).not.toContain('—');
  });

  it('matches the code and config it describes', () => {
    const usage = fs.readFileSync(path.join(root, 'packages/rendercheck/src/cli/usage.ts'), 'utf8');
    expect(usage).toContain('.rendercheck');
    expect(usage).toContain('usage.jsonl');
    expect(usage).toContain('RENDERCHECK_NO_USAGE_LOG');
    const vercel = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'));
    const csp = vercel.headers[0].headers.find((h: { key: string }) => h.key === 'Content-Security-Policy').value as string;
    expect(csp).toContain("connect-src 'self'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("img-src 'self' data: blob:");
  });
});
