/**
 * RenderCheck + Cypress example. Runs on your machine: a local server for the mock page, local OCR,
 * no API key and no network call.
 *
 * In your own project:
 *   const { registerRenderCheck } = require('@rendercheck/sdk/cypress/plugin');
 */
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { registerRenderCheck } = require('../../dist/cypress/plugin');

const PORT = 4783;
const page = fs.readFileSync(path.join(__dirname, '..', 'playwright', 'checkout.html'));

module.exports = {
  e2e: {
    baseUrl: `http://127.0.0.1:${PORT}`,
    supportFile: 'cypress/support/e2e.js',
    specPattern: 'cypress/e2e/**/*.cy.js',
    video: false,
    viewportWidth: 1000,
    viewportHeight: 700,
    setupNodeEvents(on) {
      const server = http.createServer((_req, res) => {
        res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
        res.end(page);
      });
      server.listen(PORT, '127.0.0.1');
      on('after:run', () => new Promise((resolve) => server.close(() => resolve())));
      registerRenderCheck(on);
    },
  },
};
