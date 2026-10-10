import '@fontsource-variable/inter/wght.css';
import '@fontsource-variable/space-grotesk/wght.css';
import '@fontsource-variable/jetbrains-mono/wght.css';
import '@fontsource-variable/jetbrains-mono/wght-italic.css';
import './index.css';
import React, { Suspense } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import App from './App';
import { AppRouter } from './router';
import { isUXV2Enabled } from './utils/env';
import { initWebVitals } from './utils/webVitals';

// Initialize Web Vitals monitoring
if (isUXV2Enabled()) {
  initWebVitals();
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Feature flag: Use UX v2 with routing when VITE_UX_V2=1
// Otherwise use original App without routing
const AppComponent = isUXV2Enabled() ? (
  <Suspense fallback={
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  }>
    <AppRouter />
  </Suspense>
) : <App />;

const tree = (
  <React.StrictMode>
    {AppComponent}
  </React.StrictMode>
);

// A prerendered page (scripts/prerender.mjs) already has its markup in #root. Hydrate it so the content
// stays on screen while the route's code loads, instead of being cleared for a spinner.
if (rootElement.querySelector('h1')) {
  hydrateRoot(rootElement, tree, {
    // A mismatch (for example a timestamp) makes React re-render that part on the client. That is
    // recoverable and expected here, so it is not reported as an error.
    onRecoverableError: () => {},
  });
} else {
  createRoot(rootElement).render(tree);
}
