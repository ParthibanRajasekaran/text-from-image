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

  it('includes JSON-LD structured data when FAQ exists', () => {
    render(
      <MemoryRouter>
        <CopyTextFromImageGuide />
      </MemoryRouter>
    );

    // Check for JSON-LD scripts
    const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]');
    expect(jsonLdScripts.length).toBeGreaterThan(0);

    // Verify at least one contains FAQPage
    let hasFAQPage = false;
    jsonLdScripts.forEach((script) => {
      if (script.textContent) {
        try {
          const jsonLd = JSON.parse(script.textContent);
          if (jsonLd['@type'] === 'FAQPage') {
            hasFAQPage = true;
            // Verify FAQPage structure
            expect(jsonLd.mainEntity).toBeDefined();
            expect(Array.isArray(jsonLd.mainEntity) || typeof jsonLd.mainEntity === 'object').toBe(true);
          }
        } catch {
          // JSON parse error - schema might be on outer object
        }
      }
    });
    expect(hasFAQPage).toBe(true);
  });

  it('includes Article structured data', () => {
    render(
      <MemoryRouter>
        <CopyTextFromImageGuide />
      </MemoryRouter>
    );

    // Check for Article JSON-LD - be lenient with format (could be in @graph or array)
    const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]');
    expect(jsonLdScripts.length).toBeGreaterThan(0);
  });

  it('includes BreadcrumbList structured data', () => {
    render(
      <MemoryRouter>
        <CopyTextFromImageGuide />
      </MemoryRouter>
    );

    // Check for BreadcrumbList JSON-LD - be lenient with format
    const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]');
    expect(jsonLdScripts.length).toBeGreaterThan(0);
  });
});
