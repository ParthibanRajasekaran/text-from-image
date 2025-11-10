import { describe, it, expect, beforeEach, vi } from 'vitest';
import { customRender } from './utils';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

describe('InArticle integration (page-level gating)', () => {
  beforeEach(() => {
    // Clear any previously loaded scripts and reset module cache
    document.head.querySelectorAll("script[src^='https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=']").forEach(s => s.remove());
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it('renders reserved InArticle container when preview + enable preview flag is set', async () => {
    vi.stubEnv('MODE', 'preview');
    vi.stubEnv('VITE_ENABLE_ADS_IN_PREVIEW', 'true');
    vi.stubEnv('VITE_ADS_SLOTS_ENABLED', 'false');

    const { default: CopyTextFromImageGuide } = await import('../../pages/CopyTextFromImageGuide');
    const { container } = customRender(
      <MemoryRouter>
        <CopyTextFromImageGuide />
      </MemoryRouter>
    );
    const slot = container.querySelector('[data-testid="inarticle-slot"]');
    expect(slot).toBeInTheDocument();

    vi.unstubAllEnvs();
  });

  it('does not render InArticle container when flags are not set', async () => {
    vi.stubEnv('MODE', 'production');
    vi.stubEnv('VITE_ENABLE_ADS_IN_PREVIEW', 'false');
    vi.stubEnv('VITE_ADS_SLOTS_ENABLED', 'false');

    const { default: CopyTextFromImageGuide } = await import('../../pages/CopyTextFromImageGuide');
    const { container } = customRender(
      <MemoryRouter>
        <CopyTextFromImageGuide />
      </MemoryRouter>
    );
    const slot = container.querySelector('[data-testid="inarticle-slot"]');
    expect(slot).not.toBeInTheDocument();

    vi.unstubAllEnvs();
  });
});
