import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { isUXV3Enabled } from '../utils/env';

/**
 * 404 Not Found page
 * Dedicated error page for invalid routes with proper SEO metadata
 */
export default function NotFound() {
  const isV3 = isUXV3Enabled();

  // Set document title for SEO
  useEffect(() => {
    document.title = '404 - Page Not Found | Free Text From Image';
    
    // Add meta robots to prevent indexing 404 pages
    // Check if robots meta tag already exists
    let metaRobots = document.querySelector('meta[name="robots"]') as HTMLMetaElement;
    let isNewElement = false;
    
    if (!metaRobots) {
      metaRobots = document.createElement('meta');
      metaRobots.name = 'robots';
      isNewElement = true;
    }
    
    const originalContent = metaRobots.content;
    metaRobots.content = 'noindex, nofollow';
    
    if (isNewElement) {
      document.head.appendChild(metaRobots);
    }

    return () => {
      if (isNewElement && metaRobots.parentNode) {
        document.head.removeChild(metaRobots);
      } else if (metaRobots) {
        metaRobots.content = originalContent;
      }
    };
  }, []);

  if (!isV3) {
    // Legacy fallback for non-V3 users
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Page Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Link
            to="/"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            Go Back Home
          </Link>
        </div>
      </div>
    );
  }

  // V3 enhanced UI with glass-morphism and animations
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-950">
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
          className="text-9xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4"
        >
          404
        </motion.h1>

        {/* Glass card with error message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="backdrop-blur-lg bg-white/70 dark:bg-gray-800/70 rounded-2xl p-8 shadow-xl border border-white/20 dark:border-gray-700/20"
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Page Not Found
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Oops! The page you're looking for doesn't exist or has been moved.
          </p>

          {/* Helpful links */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
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
              to="/image-to-text"
              className="inline-flex items-center justify-center bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-semibold px-8 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 transition-all duration-200"
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
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Looking for something specific? Try these popular pages:
            </p>
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              <Link
                to="/jpg-to-word"
                className="text-sm px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                JPG to Word
              </Link>
              <Link
                to="/image-to-excel"
                className="text-sm px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Image to Excel
              </Link>
              <Link
                to="/extract-text-from-image"
                className="text-sm px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
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
