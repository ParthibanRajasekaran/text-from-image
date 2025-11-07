import './index.css';
import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AppRouter } from './router';
import { isUXV2Enabled } from './utils/env';

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

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    {AppComponent}
  </React.StrictMode>
);
