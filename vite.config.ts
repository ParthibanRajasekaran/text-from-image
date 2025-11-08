import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { execSync } from 'child_process';

// Get git commit SHA for version display
function getCommitSHA() {
  try {
    return execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim();
  } catch {
    return 'unknown';
  }
}

export default defineConfig(() => {
    const commitSHA = getCommitSHA();
    
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
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
    };
});
