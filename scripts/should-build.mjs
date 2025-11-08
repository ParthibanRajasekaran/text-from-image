#!/usr/bin/env node
/**
 * Vercel Ignore Command - Smart Build Detection
 * 
 * Purpose: Skip Vercel builds when only docs or non-app files changed.
 * This prevents burning deploys on README updates, etc.
 * 
 * How it works:
 * 1. Check VERCEL_GIT_PREVIOUS_SHA and VERCEL_GIT_COMMIT_SHA
 * 2. If available, get changed files via git diff
 * 3. If only non-app paths changed, exit 0 (skip build)
 * 4. Otherwise exit 1 (proceed with build)
 * 
 * Exit codes:
 * - 0 = SKIP build (Vercel will not deploy)
 * - 1 = PROCEED with build (Vercel will deploy)
 * 
 * Fallback: In Vercel's shallow clone, if we can't determine changes,
 * we PROCEED with build (conservative approach).
 * 
 * Vercel docs:
 * - Ignore builds: https://vercel.com/docs/deployments/configure-a-build#ignore-builds
 * - Environment variables: https://vercel.com/docs/projects/environment-variables/system-environment-variables
 * 
 * Usage in vercel.json:
 * {
 *   "ignoreCommand": "node scripts/should-build.mjs"
 * }
 */

import { execSync } from 'child_process';

// Define app paths that should trigger builds
const APP_PATHS = [
  'app/',
  'pages/',
  'components/',
  'lib/',
  'hooks/',
  'services/',
  'utils/',
  'types/',
  'public/',
  'index.html',
  '.config.',  // Match vite.config.ts, etc.
  'package.json',
  'package-lock.json',
  'pnpm-lock.yaml',
  'yarn.lock',
];

// Define docs/non-app paths that should NOT trigger builds
const SKIP_PATHS = [
  'README',
  'CHANGELOG',
  'LICENSE',
  'docs/',
  '.github/',
  '.vscode/',
  '.md',
  '.txt',
  'scripts/verify-prod.mjs',  // Verification scripts don't affect app
  'scripts/should-build.mjs', // This file itself
];

function log(message) {
  console.log(`[should-build] ${message}`);
}

function shouldSkipBuild(changedFiles) {
  if (changedFiles.length === 0) {
    log('No files changed. Proceeding with build (conservative).');
    return false;
  }

  log(`Changed files (${changedFiles.length}):`);
  changedFiles.forEach(file => log(`  - ${file}`));

  // Check if ALL changed files match skip patterns
  const allSkippable = changedFiles.every(file => {
    return SKIP_PATHS.some(skipPath => file.includes(skipPath));
  });

  if (allSkippable) {
    log('✓ All changes are docs/non-app files. Skipping build.');
    return true;
  }

  // Check if ANY changed file matches app patterns
  const hasAppChanges = changedFiles.some(file => {
    return APP_PATHS.some(appPath => file.includes(appPath));
  });

  if (hasAppChanges) {
    log('✓ App files changed. Proceeding with build.');
    return false;
  }

  // Default: proceed with build if unclear
  log('⚠ Could not determine if changes affect app. Proceeding with build (conservative).');
  return false;
}

function getChangedFiles() {
  const previousSHA = process.env.VERCEL_GIT_PREVIOUS_SHA;
  const currentSHA = process.env.VERCEL_GIT_COMMIT_SHA;

  if (!previousSHA || !currentSHA) {
    log('⚠ VERCEL_GIT_PREVIOUS_SHA or VERCEL_GIT_COMMIT_SHA not set.');
    log('This might be the first deploy or Vercel shallow clone.');
    return null;
  }

  try {
    // Get list of changed files between commits
    const output = execSync(
      `git diff --name-only ${previousSHA} ${currentSHA}`,
      { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }
    );

    const files = output
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    return files;

  } catch (error) {
    log(`⚠ Git diff failed: ${error.message}`);
    log('This is expected in Vercel shallow clones.');
    return null;
  }
}

function main() {
  log('--- Vercel Ignore Command ---');
  log(`Previous SHA: ${process.env.VERCEL_GIT_PREVIOUS_SHA || 'N/A'}`);
  log(`Current SHA:  ${process.env.VERCEL_GIT_COMMIT_SHA || 'N/A'}`);
  log(`Branch:       ${process.env.VERCEL_GIT_COMMIT_REF || 'N/A'}`);
  log('');

  const changedFiles = getChangedFiles();

  // Fallback: If we can't determine changes, proceed with build
  if (changedFiles === null) {
    log('');
    log('⚠ Cannot determine changed files. Proceeding with build (conservative fallback).');
    log('This ensures we never accidentally skip important deploys.');
    process.exit(1); // Proceed with build
  }

  // Decide whether to skip build
  const shouldSkip = shouldSkipBuild(changedFiles);

  log('');
  if (shouldSkip) {
    log('✅ SKIP BUILD - Only docs/non-app files changed.');
    log('This saves you a deploy! 🎉');
    process.exit(0); // Skip build
  } else {
    log('✅ PROCEED WITH BUILD - App files changed.');
    process.exit(1); // Proceed with build
  }
}

main();
