/**
 * Version and Build Information
 * 
 * This module exports the current deployment version for display and verification.
 * 
 * Environment variables:
 * - VITE_COMMIT: Set during build via vite.config.ts (from git)
 * - VITE_VERCEL_GIT_COMMIT_SHA: Automatically set by Vercel during deployment
 * 
 * Vercel Git integration docs:
 * https://vercel.com/docs/concepts/projects/environment-variables#system-environment-variables
 */

/**
 * Current deployment commit SHA (short form)
 * - In production: Shows the deployed commit
 * - In development: Shows 'dev'
 * - Displayed in footer for easy verification
 */
export const COMMIT = 
  import.meta.env.VITE_COMMIT || 
  import.meta.env.VITE_VERCEL_GIT_COMMIT_SHA || 
  'dev';

/**
 * Full commit SHA (if available)
 */
export const COMMIT_FULL = 
  import.meta.env.VITE_VERCEL_GIT_COMMIT_SHA || 
  'unknown';

/**
 * Build timestamp
 */
export const BUILD_TIME = import.meta.env.VITE_BUILD_TIME || new Date().toISOString();

/**
 * Returns formatted version string for display
 */
export function getVersionString(): string {
  return COMMIT === 'dev' ? 'Development' : `v${COMMIT}`;
}
