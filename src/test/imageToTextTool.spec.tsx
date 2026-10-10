import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProofStrip } from '../../components/ui/ProofStrip';
import { MemoryRouter } from 'react-router-dom';
import { Header } from '../../components/shell/Header';

describe('ProofStrip', () => {
  it('shows a waiting state before any image', () => {
    render(<ProofStrip audit={null} />);
    expect(screen.getByTestId('proof-requests').textContent).toBe('-');
    expect(screen.getByTestId('proof-status').textContent).toMatch(/Waiting/);
  });

  it('reports the measured numbers for a clean run', () => {
    render(<ProofStrip audit={{ totalOutboundBytes: 0, requests: [{ url: '/a.js', method: 'GET', size: 0 }], verifiedZeroUpload: true }} />);
    expect(screen.getByTestId('proof-requests').textContent).toBe('1');
    expect(screen.getByTestId('proof-bytes').textContent).toBe('0');
    expect(screen.getByTestId('proof-status').textContent).toMatch(/nothing was uploaded/);
  });

  it('does not claim success when bytes left the page', () => {
    render(<ProofStrip audit={{ totalOutboundBytes: 42, requests: [{ url: 'https://x.test', method: 'POST', size: 42 }], verifiedZeroUpload: false }} />);
    expect(screen.getByTestId('proof-bytes').textContent).toBe('42');
    expect(screen.getByTestId('proof-status').textContent).toMatch(/should not happen/);
    expect(screen.getByTestId('proof-status').textContent).not.toMatch(/Verified/);
  });
});

describe('Header beta badge', () => {
  beforeAll(() => {
    (globalThis as any).matchMedia ??= vi.fn().mockReturnValue({ matches: false, addEventListener() {}, removeEventListener() {} });
  });
  const badge = (path: string) => {
    const { container, unmount } = render(
      <MemoryRouter initialEntries={[path]}>
        <Header theme="light" onToggleTheme={() => {}} />
      </MemoryRouter>
    );
    const has = /beta/i.test(container.textContent ?? '');
    unmount();
    return has;
  };
  it('hides the beta tag on consumer pages and shows it on developer pages', () => {
    expect(badge('/image-to-text')).toBe(false);
    expect(badge('/')).toBe(false);
    expect(badge('/developers')).toBe(true);
    expect(badge('/rendercheck')).toBe(true);
  });
});
