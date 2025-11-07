import { lazy } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';

// Lazy load feature pages for code splitting
const ImageToText = lazy(() => import('./pages/ImageToText'));
const ImageToTextConverter = lazy(() => import('./pages/ImageToTextConverter'));
const JpgToWord = lazy(() => import('./pages/JpgToWord'));
const ImageToExcel = lazy(() => import('./pages/ImageToExcel'));
const ExtractTextFromImage = lazy(() => import('./pages/ExtractTextFromImage'));

/**
 * App router with SEO-friendly paths
 * - / (home)
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
    element: <App />,
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
