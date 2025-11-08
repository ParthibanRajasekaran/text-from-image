#!/usr/bin/env node

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * BUNDLE SIZE BUDGET CHECKER
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * PURPOSE:
 * --------
 * Enforce bundle size budgets to prevent performance regressions. This script
 * analyzes the production build and fails if any initial route chunk exceeds
 * the specified thresholds.
 * 
 * WHAT IT CHECKS:
 * ---------------
 * ✅ Initial route chunks must be ≤ 300 KB gzipped
 * ✅ React vendor chunk can be ≤ 150 KB gzipped (framework overhead)
 * ✅ Lazy-loaded chunks (tesseract, transformers) are exempt (not in initial load)
 * ✅ Total first-load JavaScript ≤ 450 KB gzipped
 * 
 * RATIONALE:
 * ----------
 * - Google recommends < 100-150 KB for critical path
 * - Real-world React apps need ~250-300 KB for initial route
 * - Lazy chunks don't block page load, so they can be larger
 * - Total budget ensures we don't bloat over time
 * 
 * USAGE:
 * ------
 * npm run build && node scripts/check-bundle.mjs
 * 
 * In CI (GitHub Actions):
 * - Run after build step
 * - Set continue-on-error: true to warn without blocking (optional)
 * 
 * ADJUSTING BUDGETS:
 * ------------------
 * Change the constants below if your app legitimately needs more:
 * - MAX_INITIAL_CHUNK_KB: Single chunk limit
 * - MAX_REACT_VENDOR_KB: React framework overhead
 * - MAX_TOTAL_INITIAL_KB: All initial chunks combined
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, basename } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { gzipSync } from 'zlib';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

/** @type {string} Project root directory */
const ROOT_DIR = join(__dirname, '..');

/** @type {string} Build output directory for Vite */
const BUILD_DIR = join(ROOT_DIR, 'dist');

/** @type {string} Assets directory within build */
const ASSETS_DIR = join(BUILD_DIR, 'assets');

/** @type {number} Max size for any single initial chunk (KB gzipped) */
const MAX_INITIAL_CHUNK_KB = 300;

/** @type {number} Max size for React vendor chunk (KB gzipped) */
const MAX_REACT_VENDOR_KB = 150;

/** @type {number} Max size for ALL initial chunks combined (KB gzipped) */
const MAX_TOTAL_INITIAL_KB = 450;

// Lazy-loaded chunks that don't count toward initial budget
const LAZY_CHUNK_PATTERNS = [
  'tesseract',
  'transformers',
  'ort', // onnxruntime-web
  'jspdf',
  'pdfjs',
];

// ═══════════════════════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(msg, color = 'reset') {
  console.log(`${colors[color]}${msg}${colors.reset}`);
}

function formatKB(bytes) {
  return (bytes / 1024).toFixed(2);
}

function formatPercentage(value, max) {
  return ((value / max) * 100).toFixed(1);
}

/**
 * Check if a chunk is lazy-loaded (doesn't block initial render)
 */
function isLazyChunk(filename) {
  return LAZY_CHUNK_PATTERNS.some(pattern => filename.includes(pattern));
}

/**
 * Get gzipped size of a file
 */
function getGzippedSize(filePath) {
  try {
    const content = readFileSync(filePath);
    const gzipped = gzipSync(content, { level: 9 });
    return gzipped.length;
  } catch (error) {
    log(`⚠️  Could not read ${basename(filePath)}: ${error.message}`, 'yellow');
    return 0;
  }
}

/**
 * Analyze bundle and return chunk information
 */
function analyzeBundles() {
  // Check if build directory exists
  if (!statSync(BUILD_DIR, { throwIfNoEntry: false })?.isDirectory()) {
    log(`❌ Build directory not found: ${BUILD_DIR}`, 'red');
    log('Run "npm run build" first', 'yellow');
    process.exit(1);
  }

  // Get all JS files from assets directory
  const files = readdirSync(ASSETS_DIR)
    .filter(file => file.endsWith('.js'))
    .map(file => {
      const filePath = join(ASSETS_DIR, file);
      const rawSize = statSync(filePath).size;
      const gzippedSize = getGzippedSize(filePath);
      const isLazy = isLazyChunk(file);

      return {
        filename: file,
        filePath,
        rawSize,
        gzippedSize,
        isLazy,
      };
    });

  return files;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN BUDGET CHECK
// ═══════════════════════════════════════════════════════════════════════════

function main() {
  console.log('\n' + '═'.repeat(70));
  log('📊 BUNDLE SIZE BUDGET CHECK', 'blue');
  console.log('═'.repeat(70) + '\n');

  const chunks = analyzeBundles();

  if (chunks.length === 0) {
    log('❌ No JavaScript files found in build', 'red');
    process.exit(1);
  }

  // Separate initial and lazy chunks
  const initialChunks = chunks.filter(c => !c.isLazy);
  const lazyChunks = chunks.filter(c => c.isLazy);

  // Calculate totals
  const totalInitialGzipped = initialChunks.reduce((sum, c) => sum + c.gzippedSize, 0);
  const totalInitialRaw = initialChunks.reduce((sum, c) => sum + c.rawSize, 0);

  let hasErrors = false;

  // ─────────────────────────────────────────────────────────────────────────
  // Display Initial Chunks (Critical Path)
  // ─────────────────────────────────────────────────────────────────────────
  log('📦 INITIAL CHUNKS (block page load):', 'cyan');
  console.log('');

  initialChunks
    .sort((a, b) => b.gzippedSize - a.gzippedSize)
    .forEach(chunk => {
      const gzippedKB = formatKB(chunk.gzippedSize);
      const rawKB = formatKB(chunk.rawSize);
      const percentage = formatPercentage(chunk.gzippedSize, MAX_INITIAL_CHUNK_KB * 1024);

      // Determine budget for this chunk
      const isReactVendor = chunk.filename.includes('react-vendor');
      const budget = isReactVendor ? MAX_REACT_VENDOR_KB : MAX_INITIAL_CHUNK_KB;
      const budgetBytes = budget * 1024;

      const exceeds = chunk.gzippedSize > budgetBytes;

      if (exceeds) {
        hasErrors = true;
        log(`  ❌ ${chunk.filename}`, 'red');
        log(`     ${rawKB} KB → ${gzippedKB} KB gzipped (exceeds ${budget} KB budget by ${percentage}%)`, 'red');
      } else {
        const icon = percentage > 80 ? '⚠️ ' : '✅';
        log(`  ${icon} ${chunk.filename}`, percentage > 80 ? 'yellow' : 'green');
        log(`     ${rawKB} KB → ${gzippedKB} KB gzipped (${percentage}% of ${budget} KB budget)`, 'reset');
      }
    });

  console.log('');
  log(`  TOTAL: ${formatKB(totalInitialRaw)} KB → ${formatKB(totalInitialGzipped)} KB gzipped`, 'cyan');

  if (totalInitialGzipped > MAX_TOTAL_INITIAL_KB * 1024) {
    hasErrors = true;
    log(`  ❌ Total exceeds ${MAX_TOTAL_INITIAL_KB} KB budget!`, 'red');
  } else {
    const totalPercentage = formatPercentage(totalInitialGzipped, MAX_TOTAL_INITIAL_KB * 1024);
    log(`  ✅ Within ${MAX_TOTAL_INITIAL_KB} KB total budget (${totalPercentage}%)`, 'green');
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Display Lazy Chunks (Not Critical)
  // ─────────────────────────────────────────────────────────────────────────
  if (lazyChunks.length > 0) {
    console.log('');
    log('⏳ LAZY CHUNKS (loaded on demand, not counted in budget):', 'cyan');
    console.log('');

    lazyChunks
      .sort((a, b) => b.gzippedSize - a.gzippedSize)
      .forEach(chunk => {
        const gzippedKB = formatKB(chunk.gzippedSize);
        const rawKB = formatKB(chunk.rawSize);
        log(`  ℹ️  ${chunk.filename}`, 'blue');
        log(`     ${rawKB} KB → ${gzippedKB} KB gzipped`, 'reset');
      });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Summary
  // ─────────────────────────────────────────────────────────────────────────
  console.log('');
  console.log('═'.repeat(70));

  if (hasErrors) {
    log('❌ BUNDLE SIZE BUDGET EXCEEDED', 'red');
    console.log('═'.repeat(70));
    console.log('');
    log('ACTIONS TO REDUCE BUNDLE SIZE:', 'yellow');
    log('  1. Convert large libraries to dynamic imports (await import(...))', 'reset');
    log('  2. Code-split routes and heavy components', 'reset');
    log('  3. Analyze with: npm run analyze', 'reset');
    log('  4. Remove unused dependencies', 'reset');
    log('  5. Check for duplicate packages: npm ls <package-name>', 'reset');
    console.log('');
    log('If increases are intentional, update budgets in scripts/check-bundle.mjs', 'yellow');
    console.log('');
    process.exit(1);
  } else {
    log('✅ ALL CHUNKS WITHIN BUDGET', 'green');
    console.log('═'.repeat(70));
    console.log('');
    log('📈 PERFORMANCE TIPS:', 'cyan');
    log('  • Initial load: ' + formatKB(totalInitialGzipped) + ' KB gzipped', 'reset');
    log('  • Target for "Fast 3G": < 100 KB', 'reset');
    log('  • Target for "Good": < 200 KB', 'reset');
    log('  • Your budget: < 450 KB', 'reset');
    console.log('');
    log('Keep monitoring with: npm run analyze', 'blue');
    console.log('');
    process.exit(0);
  }
}

main();
