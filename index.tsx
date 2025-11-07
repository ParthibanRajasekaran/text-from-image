import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AppV2 } from './components/v2/AppV2';
import { isUXV2Enabled } from './utils/env';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Feature flag: Use UX v2 when VITE_UX_V2=1
const AppComponent = isUXV2Enabled() ? AppV2 : App;

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <AppComponent />
  </React.StrictMode>
);
