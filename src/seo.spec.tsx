
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useSEO } from './seo';
import { render } from '@testing-library/react';

function TestSEO(props: Parameters<typeof useSEO>[0]) {
  useSEO(props);
  return null;
}

const ORIGIN = 'https://freetextfromimage.com';

describe('useSEO', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
    document.title = '';
    vi.stubEnv('VITE_SITE_URL', ORIGIN);
  });

  it('defaults OG image and canonical to absolute', () => {
    render(<TestSEO title="T" description="D" />);
    const og = document.querySelector('meta[property="og:image"]');
    const tw = document.querySelector('meta[name="twitter:image"]');
    expect(og).toBeTruthy();
    expect(tw).toBeTruthy();
    expect(og.getAttribute('content')).toBe(`${ORIGIN}/og/default.png`);
    expect(tw.getAttribute('content')).toBe(`${ORIGIN}/og/default.png`);
    const canonical = document.querySelector('link[rel="canonical"]');
    expect(canonical).toBeTruthy();
    expect(canonical.getAttribute('href')).toBe(ORIGIN);
  });

  it('overrides OG image and canonical with absolute URLs', () => {
    render(<TestSEO title="T" description="D" canonical="/image-to-text" ogImage="/og/image-to-text.png" />);
    const og = document.querySelector('meta[property="og:image"]');
    expect(og.getAttribute('content')).toBe(`${ORIGIN}/og/image-to-text.png`);
    const canonical = document.querySelector('link[rel="canonical"]');
    expect(canonical.getAttribute('href')).toBe(`${ORIGIN}/image-to-text`);
  });

  it('sets og:image:alt from prop or default', () => {
    render(<TestSEO title="T" description="D" ogImageAlt="Custom Alt" />);
    const ogAlt = document.querySelector('meta[property="og:image:alt"]');
    expect(ogAlt).toBeTruthy();
    expect(ogAlt.getAttribute('content')).toBe('Custom Alt');
    // Default fallback
    document.head.innerHTML = '';
    render(<TestSEO title="T" description="D" />);
    const ogAltDefault = document.querySelector('meta[property="og:image:alt"]');
    expect(ogAltDefault.getAttribute('content')).toBe('Extract text from image — Free OCR');
  });

  it('sets title and description', () => {
    render(<TestSEO title="SEO Title" description="SEO Desc" />);
    expect(document.title).toBe('SEO Title');
    const meta = document.querySelector('meta[name="description"]');
    expect(meta).toBeTruthy();
    expect(meta.getAttribute('content')).toBe('SEO Desc');
  });

  it('emits rich OG/Twitter tags', () => {
    render(<TestSEO title="T" description="D" />);
    expect(document.querySelector('meta[property="og:type"]')).toBeTruthy();
    expect(document.querySelector('meta[property="og:site_name"]')).toBeTruthy();
    expect(document.querySelector('meta[property="og:title"]')).toBeTruthy();
    expect(document.querySelector('meta[property="og:description"]')).toBeTruthy();
    expect(document.querySelector('meta[property="og:url"]')).toBeTruthy();
    expect(document.querySelector('meta[property="og:image:width"]')).toBeTruthy();
    expect(document.querySelector('meta[property="og:image:height"]')).toBeTruthy();
    expect(document.querySelector('meta[property="og:image:type"]')).toBeTruthy();
    expect(document.querySelector('meta[property="og:locale"]')).toBeTruthy();
    expect(document.querySelector('meta[name="twitter:card"]')).toBeTruthy();
    expect(document.querySelector('meta[name="twitter:title"]')).toBeTruthy();
    expect(document.querySelector('meta[name="twitter:description"]')).toBeTruthy();
    expect(document.querySelector('meta[name="twitter:image"]')).toBeTruthy();
  });
});
