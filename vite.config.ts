import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { execSync } from 'child_process';
import { visualizer } from 'rollup-plugin-visualizer';

// Get git commit SHA for version display
function getCommitSHA() {
  try {
    return execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim();
  } catch {
    return 'unknown';
  }
}

export default defineConfig(({ mode: _mode }) => {
    const commitSHA = getCommitSHA();
    const isAnalyze = process.env.ANALYZE === 'true';
    
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      // Configure workers for code splitting
      worker: {
        format: 'es', // Use ES modules for workers in code-splitting builds
      },
        test: {
          environment: 'jsdom',
          setupFiles: 'src/test/setupTests.ts',
          globals: true,
          include: [
            // Core unit & integration tests
            'src/**/*.spec.ts',
            'src/**/*.spec.tsx',
            // Accessibility tests
            'src/**/*.a11y.spec.tsx',
            // Spec-driven tests
            'src/**/*.spec.json',
            // __tests__ directory tests
            '__tests__/**/*.spec.ts',
            '__tests__/**/*.spec.tsx',
            '__tests__/**/*.a11y.spec.tsx',
          ],
        },
      plugins: [
        react(),
        // Bundle analyzer - generates stats.html when ANALYZE=true
        isAnalyze && visualizer({
          open: true,
          filename: 'stats.html',
          gzipSize: true,
          brotliSize: true,
        }),
      ].filter(Boolean),
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      define: {
        // Inject commit SHA as environment variable
        'import.meta.env.VITE_COMMIT': JSON.stringify(commitSHA),
        'import.meta.env.VITE_BUILD_TIME': JSON.stringify(new Date().toISOString()),
      },
      build: {
        // Disable Vite's built-in compression reporting (we use check-budgets.mjs instead)
        reportCompressedSize: false,
        // Conservative chunk size warning limit (600–800k range)
        chunkSizeWarningLimit: 900, // Increased to accommodate split OCR vendors
        rollupOptions: {
          output: {
            // Manual chunk splitting for better caching and lazy loading
            manualChunks: (id) => {
              // React vendor chunk - core framework (loaded on every page)
              if (id.includes('node_modules/react') || 
                  id.includes('node_modules/react-dom') ||
                  id.includes('node_modules/react-router-dom')) {
                return 'react-vendor';
              }
              
              // Split heavy OCR dependencies into separate lazy-loaded chunks
              // Each chunk loads only when user performs OCR on tool pages
              if (id.includes('node_modules/onnxruntime-web') ||
                  id.includes('node_modules/onnxruntime-common')) {
                return 'onnx-vendor';
              }
              
              if (id.includes('node_modules/tesseract.js')) {
                return 'tesseract-vendor';
              }
              
              if (id.includes('node_modules/@xenova/transformers')) {
                return 'transformers-vendor';
              }
              
              // Editor & UI vendor chunk - framer-motion for animations
              if (id.includes('node_modules/framer-motion')) {
                return 'motion-vendor';
              }
              
              // Other vendor dependencies in shared chunk
              if (id.includes('node_modules')) {
                return 'vendor';
              }
              
              // Default: let Rollup decide for app code
            },
          },
        },
      },
    };
});
