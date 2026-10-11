import { describe, it, expect, beforeAll } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { ROUTES, router } from '../../router';

describe('For AI agents section', () => {
  beforeAll(() => {
    (globalThis as any).IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} takeRecords() { return []; } };
  });

  [ROUTES.RENDERCHECK, ROUTES.DEVELOPERS].forEach((path) => {
    it(`${path} documents the commands, MCP config and the 0.6.0 release`, async () => {
      const r = createMemoryRouter(router.routes, { initialEntries: [path] });
      const { container } = render(<RouterProvider router={r} />);
      await waitFor(() => expect(screen.getByRole('heading', { level: 2, name: 'For AI agents' })).toBeTruthy());
      const text = container.textContent ?? '';
      expect(text).toContain('npx @rendercheck/sdk verify shot.png --expect "Total: $14.00"');
      expect(text).toContain('npx @rendercheck/sdk mcp');
      expect(text).toContain('npx @rendercheck/sdk init');
      expect(text).toContain('"mcpServers"');
      expect(text).toContain('Available from 0.6.0');
      expect(text).not.toMatch(/not (yet )?on npm/i);
      expect(text).toContain('io.github.ParthibanRajasekaran/rendercheck');
      expect(screen.getByRole('button', { name: 'Copy MCP config' })).toBeTruthy();
      expect(text).not.toContain('—');
    });
  });

  it('llms.txt mentions the agent tooling and 0.6.0', () => {
    const txt = readFileSync(resolve(__dirname, '../../public/llms.txt'), 'utf8');
    expect(txt).toMatch(/For AI agents/);
    expect(txt).toMatch(/0\.6\.0/);
    expect(txt).not.toMatch(/not yet on npm/i);
    expect(txt).not.toContain('—');
  });
});
