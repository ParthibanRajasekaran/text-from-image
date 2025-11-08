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

export default defineConfig(({ mode }) => {
    const commitSHA = getCommitSHA();
    const isAnalyze = process.env.ANALYZE === 'true';
    
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
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
        // Increase chunk size warning limit since we're splitting properly
        chunkSizeWarningLimit: 600,
        rollupOptions: {
          output: {
            // Manual chunk splitting for better caching and lazy loading
            manualChunks: (id) => {
              // React vendor chunk - loaded on every page
              if (id.includes('node_modules/react') || 
                  id.includes('node_modules/react-dom') ||
                  id.includes('node_modules/react-router-dom')) {
                return 'react-vendor';
              }
              
              // Tesseract.js - only loaded when user starts OCR
              if (id.includes('node_modules/tesseract.js')) {
                return 'tesseract';
              }
              
              // ONNX Runtime - used by Transformers, split separately
              if (id.includes('node_modules/onnxruntime-web') ||
                  id.includes('node_modules/onnxruntime-common')) {
                return 'ort';
              }
              
              // Transformers - only loaded as fallback or when explicitly requested
              if (id.includes('node_modules/@xenova/transformers')) {
                return 'transformers';
              }
              
              // Framer Motion - loaded for animations
              if (id.includes('node_modules/framer-motion')) {
                return 'framer-motion';
              }
              
              // Keep other vendor dependencies in a shared chunk
              if (id.includes('node_modules')) {
                return 'vendor';
              }
            },
          },
        },
      },
    };
});
