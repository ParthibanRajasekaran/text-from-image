import { lazy } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';
import { isUXV3Enabled } from './utils/env';

// V3: Futuristic Hero UI (feature-gated)
import { HeroOCR } from './components/v3/HeroOCR';

// Lazy load feature pages for code splitting
const ImageToText = lazy(() => import('./pages/ImageToText'));
const ImageToTextConverter = lazy(() => import('./pages/ImageToTextConverter'));
const JpgToWord = lazy(() => import('./pages/JpgToWord'));
const ImageToExcel = lazy(() => import('./pages/ImageToExcel'));
const ExtractTextFromImage = lazy(() => import('./pages/ExtractTextFromImage'));

// Select home component based on feature flag
const HomeComponent = isUXV3Enabled() ? HeroOCR : App;

/**
 * App router with SEO-friendly paths
 * - / (home) - Uses V3 HeroOCR if VITE_UX_V2=1, otherwise legacy App
 * - /image-to-text
 * - /image-to-text-converter
 * - /jpg-to-word
 * - /image-to-excel
 * - /extract-text-from-image
 * 
 * All routes use same OCR component with different metadata
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomeComponent />,
  },
  {
    path: '/image-to-text',
    element: <ImageToText />,
  },
  {
    path: '/image-to-text-converter',
    element: <ImageToTextConverter />,
  },
  {
    path: '/jpg-to-word',
    element: <JpgToWord />,
  },
  {
    path: '/image-to-excel',
    element: <ImageToExcel />,
  },
  {
    path: '/extract-text-from-image',
    element: <ExtractTextFromImage />,
  },
  {
    path: '*',
    element: <App />, // Fallback to home for 404s
  },
]);

/**
 * Router wrapper component
 */
export function AppRouter() {
  return <RouterProvider router={router} />;
}
