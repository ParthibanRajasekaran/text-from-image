import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    'core/index': 'src/core/index.ts',
    'playwright/index': 'src/playwright/index.ts',
    'cypress/index': 'src/cypress/index.ts',
    'cypress/plugin': 'src/cypress/plugin.ts',
    'cli/index': 'src/cli/index.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  shims: true, // import.meta.url in the CJS build
  noExternal: ['@modelcontextprotocol/sdk', 'zod'],
  external: ['@playwright/test', 'cypress', 'tesseract.js', 'pngjs', 'jpeg-js', '@tesseract.js-data/eng'],
});
