import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import seoSpec from '../../specs/seo.spec.json';
import CopyTextFromImageGuide from '../../pages/CopyTextFromImageGuide';

describe('seo.spec - required SEO tags', () => {
  it('guide page has all required SEO tags with absolute canonical', () => {
    render(
      <MemoryRouter>
        <CopyTextFromImageGuide />
      </MemoryRouter>
    );

    // Check title
    expect(document.title).toBeTruthy();
    expect(document.title.length).toBeGreaterThan(0);

    // Check meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    expect(metaDesc).toBeTruthy();
    expect(metaDesc?.getAttribute('content')).toBeTruthy();

    // Check canonical is absolute
    const canonical = document.querySelector('link[rel="canonical"]');
    expect(canonical).toBeTruthy();
    const href = canonical?.getAttribute('href');
    expect(href).toBeTruthy();
    expect(href?.startsWith('http://') || href?.startsWith('https://')).toBe(true);

    // Check og:image
    const ogImage = document.querySelector('meta[property="og:image"]');
    expect(ogImage).toBeTruthy();
    expect(ogImage?.getAttribute('content')).toBeTruthy();

    // Check twitter:card
    const twitterCard = document.querySelector('meta[name="twitter:card"]');
    expect(twitterCard).toBeTruthy();
    expect(twitterCard?.getAttribute('content')).toBeTruthy();

    // Verify all required tags from spec
    seoSpec.requiredTags.forEach((tag) => {
      if (tag === 'title') {
        expect(document.title.length).toBeGreaterThan(0);
      } else if (tag === 'description') {
        const meta = document.querySelector('meta[name="description"]');
        expect(meta?.getAttribute('content')).toBeTruthy();
      } else if (tag === 'canonical') {
        const link = document.querySelector('link[rel="canonical"]');
        expect(link?.getAttribute('href')).toBeTruthy();
      } else if (tag.startsWith('og:')) {
        const meta = document.querySelector(`meta[property="${tag}"]`);
        expect(meta?.getAttribute('content')).toBeTruthy();
      } else if (tag.startsWith('twitter:')) {
        const meta = document.querySelector(`meta[name="${tag}"]`);
        expect(meta?.getAttribute('content')).toBeTruthy();
      }
    });
  });
});
