import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// Global shell
import { AppShell } from './components/shell/AppShell';

// V3: Futuristic Hero UI (feature-gated) — now replaced by minimal-premium homepage
import { HomepageMinimalPremium } from './components/home/HomepageMinimalPremium';

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

// Phase 5: Product pages
const VerificationDebtScore = lazy(() => import('./pages/VerificationDebtScore'));
const RenderCheck = lazy(() => import('./pages/RenderCheck'));
const Developers = lazy(() => import('./pages/Developers'));
const Access = lazy(() => import('./pages/Access'));
const CaseStudies = lazy(() => import('./pages/CaseStudies'));

// Phase 5: X-Factor Loop (Labs)
const AIUIBugGallery = lazy(() => import('./pages/AIUIBugGallery'));
const OcrChallengeLab = lazy(() => import('./pages/OcrChallengeLab'));
const Labs = lazy(() => import('./pages/Labs'));
const Changelog = lazy(() => import('./pages/Changelog'));

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
  AI_UI_BUG_GALLERY: '/ai-ui-bug-gallery',
  OCR_CHALLENGE_LAB: '/ocr-challenge-lab',
  CHANGELOG: '/changelog',
} as const;

// Always use HomepageMinimalPremium as the home component (minimal-premium redesign)
const HomeComponent = HomepageMinimalPremium;

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
            <Developers />
          </Suspense>
        ),
      },
      {
        path: 'access',
        element: (
          <Suspense fallback={<div className="p-8">Loading...</div>}>
            <Access />
          </Suspense>
        ),
      },
      {
        path: 'case-studies',
        element: (
          <Suspense fallback={<div className="p-8">Loading...</div>}>
            <CaseStudies />
          </Suspense>
        ),
      },
      {
        path: 'labs',
        element: (
          <Suspense fallback={<div className="p-8">Loading...</div>}>
            <Labs />
          </Suspense>
        ),
      },
      {
        path: 'ai-ui-bug-gallery',
        element: (
          <Suspense fallback={<div className="p-8">Loading...</div>}>
            <AIUIBugGallery />
          </Suspense>
        ),
      },
      {
        path: 'ocr-challenge-lab',
        element: (
          <Suspense fallback={<div className="p-8">Loading...</div>}>
            <OcrChallengeLab />
          </Suspense>
        ),
      },
      {
        path: 'changelog',
        element: (
          <Suspense fallback={<div className="p-8">Loading...</div>}>
            <Changelog />
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
