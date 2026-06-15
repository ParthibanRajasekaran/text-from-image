import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// Global shell
import { AppShell } from './components/shell/AppShell';

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
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));

// Phase 5.9 pages
const VerificationDebtScore = lazy(() => import('./pages/VerificationDebtScore'));
const RenderCheck = lazy(() => import('./pages/RenderCheck'));

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
  ABOUT: '/about',
  CONTACT: '/contact',
  VERIFY_DEBT_SCORE: '/verify-debt-score',
  RENDERCHECK: '/rendercheck',
  DEVELOPERS: '/developers',
  ACCESS: '/access',
  CASE_STUDIES: '/case-studies',
  LABS: '/labs',
  CHANGELOG: '/changelog',
} as const;

// Always use HeroOCR as the home component
const HomeComponent = HeroOCR;

/**
 * App router with nested layout routes
 * - AppShell wraps all routes (provides global header, footer, main landmark)
 * - All child routes render within AppShell's main element
 * - No route paths have leading slash (relative routing within AppShell)
 */
export const router = createBrowserRouter([
  {
    path: ROUTES.HOME,
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <HomeComponent />,
      },
      {
        path: 'image-to-text',
        element: <ImageToText />,
      },
      {
        path: 'image-to-text-converter',
        element: <ImageToTextConverter />,
      },
      {
        path: 'jpg-to-word',
        element: <JpgToWord />,
      },
      {
        path: 'image-to-excel',
        element: <ImageToExcel />,
      },
      {
        path: 'extract-text-from-image',
        element: <ExtractTextFromImage />,
      },
      {
        path: 'copy-text-from-image',
        element: <CopyTextFromImageGuide />,
      },
      {
        path: 'jpg-to-excel',
        element: <JpgToExcelGuide />,
      },
      {
        path: 'about',
        element: <About />,
      },
      {
        path: 'contact',
        element: <Contact />,
      },
      {
        path: 'verify-debt-score',
        element: <VerificationDebtScore />,
      },
      {
        path: 'rendercheck',
        element: <RenderCheck />,
      },
      {
        path: 'developers',
        element: (
          <Suspense fallback={<div className="p-8">Loading...</div>}>
            <div>Developers page (placeholder for PR 3)</div>
          </Suspense>
        ),
      },
      {
        path: 'access',
        element: (
          <Suspense fallback={<div className="p-8">Loading...</div>}>
            <div>Access page (placeholder for PR 3)</div>
          </Suspense>
        ),
      },
      {
        path: 'case-studies',
        element: (
          <Suspense fallback={<div className="p-8">Loading...</div>}>
            <div>Case Studies page (placeholder for PR 3)</div>
          </Suspense>
        ),
      },
      {
        path: 'labs',
        element: (
          <Suspense fallback={<div className="p-8">Loading...</div>}>
            <div>Labs page (placeholder for PR 5)</div>
          </Suspense>
        ),
      },
      {
        path: 'changelog',
        element: (
          <Suspense fallback={<div className="p-8">Loading...</div>}>
            <div>Changelog page (placeholder for PR 6)</div>
          </Suspense>
        ),
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
]);

/**
 * Router wrapper component with Suspense boundary
 */
export function AppRouter() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      }
    >
      <RouterProvider router={router} />
    </Suspense>
  );
}
