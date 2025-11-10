import { lazy } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// V3: Futuristic Hero UI (feature-gated)
import { HeroOCR } from './components/v3/HeroOCR';

// Lazy load feature pages for code splitting
// See pages/_structure.md for organization
const ImageToText = lazy(() => import('./pages/ImageToText'));
const ImageToTextConverter = lazy(() => import('./pages/ImageToTextConverter'));
const JpgToWord = lazy(() => import('./pages/JpgToWord'));
const ImageToExcel = lazy(() => import('./pages/ImageToExcel'));
const ExtractTextFromImage = lazy(() => import('./pages/ExtractTextFromImage'));
const NotFound = lazy(() => import('./pages/NotFound'));
const CopyTextFromImageGuide = lazy(() => import('./pages/CopyTextFromImageGuide'));
const JpgToExcelGuide = lazy(() => import('./pages/JpgToExcelGuide'));

// Route path constants - single source of truth for all route paths
export const ROUTES = {
  HOME: '/',
  IMAGE_TO_TEXT: '/image-to-text',
  IMAGE_TO_TEXT_CONVERTER: '/image-to-text-converter',
  JPG_TO_WORD: '/jpg-to-word',
  IMAGE_TO_EXCEL: '/image-to-excel',
  EXTRACT_TEXT_FROM_IMAGE: '/extract-text-from-image',
  COPY_TEXT_FROM_IMAGE: '/copy-text-from-image',
  JPG_TO_EXCEL: '/jpg-to-excel',
} as const;

// Always use HeroOCR as the home component
const HomeComponent = HeroOCR;

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
    path: ROUTES.HOME,
    element: <HomeComponent />,
  },
  {
    path: ROUTES.IMAGE_TO_TEXT,
    element: <ImageToText />,
  },
  {
    path: ROUTES.IMAGE_TO_TEXT_CONVERTER,
    element: <ImageToTextConverter />,
  },
  {
    path: ROUTES.JPG_TO_WORD,
    element: <JpgToWord />,
  },
  {
    path: ROUTES.IMAGE_TO_EXCEL,
    element: <ImageToExcel />,
  },
  {
    path: ROUTES.EXTRACT_TEXT_FROM_IMAGE,
    element: <ExtractTextFromImage />,
  },
  {
    path: ROUTES.COPY_TEXT_FROM_IMAGE,
    element: <CopyTextFromImageGuide />,
  },
  {
    path: ROUTES.JPG_TO_EXCEL,
    element: <JpgToExcelGuide />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);

/**
 * Router wrapper component
 */
export function AppRouter() {
  return <RouterProvider router={router} />;
}
