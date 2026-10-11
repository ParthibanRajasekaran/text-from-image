import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ROUTES } from '../router';
import { SEO } from '../components/SEO';

/**
 * 404 Not Found page
 * Dedicated error page for invalid routes with proper SEO metadata
 */
export default function NotFound() {
  // Add noindex meta to prevent indexing 404 pages
  useEffect(() => {
    const metaRobots = document.createElement('meta');
    metaRobots.name = 'robots';
    metaRobots.content = 'noindex, nofollow';
    document.head.appendChild(metaRobots);

    return () => {
      if (metaRobots.parentNode) {
        document.head.removeChild(metaRobots);
      }
    };
  }, []);

  // V3 enhanced UI with glass-morphism and animations
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <SEO
        title="404 - Page Not Found"
        description="The page you're looking for doesn't exist. Return to our free image to text converter."
        canonical="https://getrendercheck.com/404"
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-2xl"
      >
        {/* 404 Number with gradient */}
        <motion.h1
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="text-9xl font-semibold tracking-[-0.05em] text-foreground mb-4"
        >
          404
        </motion.h1>

        {/* Glass card with error message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="bg-surface rounded-2xl p-8 border border-border"
        >
          <h2 className="text-3xl font-semibold tracking-[-0.03em] text-foreground mb-4">
            Page Not Found
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Oops! The page you're looking for doesn't exist or has been moved.
          </p>

          {/* Helpful links */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to={ROUTES.HOME}
              className="inline-flex items-center justify-center bg-primary text-primary-foreground font-medium px-8 py-3 rounded-full transition duration-150 hover:opacity-85 active:scale-[0.98]"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              Go Back Home
            </Link>

            <Link
              to={ROUTES.IMAGE_TO_TEXT}
              className="inline-flex items-center justify-center text-foreground font-medium px-8 py-3 rounded-full border border-border transition duration-150 hover:bg-foreground/[0.04] active:scale-[0.98]"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Try Image to Text
            </Link>
          </div>

          {/* Additional helpful info */}
          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Looking for something specific? Try these popular pages:
            </p>
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              <Link
                to={ROUTES.JPG_TO_WORD}
                className="text-sm px-4 py-2 rounded-full border border-border text-foreground hover:bg-foreground/[0.04] transition-colors"
              >
                JPG to Word
              </Link>
              <Link
                to={ROUTES.IMAGE_TO_EXCEL}
                className="text-sm px-4 py-2 rounded-full border border-border text-foreground hover:bg-foreground/[0.04] transition-colors"
              >
                Image to Excel
              </Link>
              <Link
                to={ROUTES.EXTRACT_TEXT_FROM_IMAGE}
                className="text-sm px-4 py-2 rounded-full border border-border text-foreground hover:bg-foreground/[0.04] transition-colors"
              >
                Extract Text
              </Link>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
