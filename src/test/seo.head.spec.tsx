import React from 'react';
import { customRender } from './utils';
import { axe } from 'jest-axe';
import { SEO } from '../../components/SEO';

describe('SEO head tags', () => {
  it('sets title, description, canonical', async () => {
    customRender(
      <SEO
        title="Test Title"
        description="Test description for SEO."
        canonical="https://freetextfromimage.com/test"
      />
    );
    expect(document.title).toBe('Test Title');
    const metaDesc = document.querySelector('meta[name="description"]');
    expect(metaDesc).toBeTruthy();
    expect(metaDesc?.getAttribute('content')).toBe('Test description for SEO.');
    const canonical = document.querySelector('link[rel="canonical"]');
    expect(canonical).toBeTruthy();
    expect(canonical?.getAttribute('href')).toBe('https://freetextfromimage.com/test');
    const results = await axe(document.head);
    expect(results).toHaveNoViolations();
  });
});
