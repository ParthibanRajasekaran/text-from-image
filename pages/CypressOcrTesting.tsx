import React from 'react';
import { IntegrationDoc } from '../components/IntegrationDoc';
import { ROUTES } from '../router';

export default function CypressOcrTesting() {
  return (
    <IntegrationDoc
      path={ROUTES.CYPRESS_OCR_TESTING}
      tool="Cypress"
      seoTitle="Cypress OCR Testing: cy.matchText for Rendered Text | RenderCheck"
      seoDescription="Add cy.matchText to Cypress and fail tests when the rendered text is wrong, too faint, or missing. OCR runs locally. No API key, no upload."
      h1="Cypress OCR testing"
      lead="Assert the text users actually see on screen, not just what is in the DOM, with cy.matchText."
      setup={[
        {
          title: 'Register the plugin',
          intro: 'The plugin takes the screenshot and runs OCR in the Node process.',
          filename: 'cypress.config.ts',
          language: 'typescript',
          code: `import { defineConfig } from 'cypress';
import { registerRenderCheck } from '@freetextfromimage/rendercheck/cypress/plugin';

export default defineConfig({
  e2e: { setupNodeEvents(on) { registerRenderCheck(on); } },
});`,
        },
        {
          title: 'Load the commands',
          intro: 'Import once in your support file.',
          filename: 'cypress/support/e2e.ts',
          language: 'typescript',
          code: `import '@freetextfromimage/rendercheck/cypress';`,
        },
      ]}
      usage={[
        {
          title: 'Check text on a page or an element',
          intro: 'Chain from cy or from a selected element.',
          filename: 'checkout.cy.ts',
          language: 'typescript',
          code: `cy.visit('/checkout');
cy.matchText('Total: $14.00', { minConfidence: 85, minContrastRatio: 4.5 });
cy.get('#total').matchText('Total: $14.00');`,
        },
        {
          title: 'Prices and dates in the right locale',
          intro: 'The expected text comes from Intl, so each locale\'s separators and date order are applied.',
          filename: 'locale.cy.ts',
          language: 'typescript',
          code: `cy.matchCurrency(1234.5, { currency: 'EUR', locale: 'de-DE' });
cy.matchDate('2026-03-04', { locale: 'en-GB' });`,
        },
      ]}
      gotchas={[
        'Tested in Cypress 13.17 (Electron, Linux). Other Cypress versions and browsers are untested.',
        'Requires cypress 12 or newer and Node 18+.',
        'Only English OCR data ships in the package. For other scripts, download the .traineddata file and set langPath.',
        'OCR is probabilistic. Set minConfidence to a level that suits your fonts.',
        'The SDK is in developer beta and has no public adoption numbers yet.',
      ]}
      faqs={[
        { question: 'Does Cypress OCR testing send screenshots anywhere?', answer: 'No. OCR runs locally in the Cypress Node process. There is no API key and no network call.' },
        { question: 'How is cy.matchText different from cy.contains?', answer: 'cy.contains reads the DOM. cy.matchText reads the rendered pixels, so it fails when text is hidden, covered, the wrong symbol, or too faint to read.' },
        { question: 'Which Cypress versions are supported?', answer: 'It targets Cypress 12 and newer and has been run in a real Cypress 13.17 on Electron and Linux. Other versions and browsers are untested.' },
      ]}
    />
  );
}
