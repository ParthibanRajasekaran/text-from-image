#!/usr/bin/env node

/**
 * Performance Budget Checker
 * 
 * Validates that built assets don't exceed configured size budgets.
 * Uses Node.js built-in zlib for gzip compression (no external dependencies).
 * 
 * Budgets (configurable via environment variables):
 * - ROUTE_JS_MAX_GZIP: max gzip size per route/app chunk (default: 150 KB)
 * - VENDOR_JS_MAX_GZIP: max gzip size per vendor chunk (default: 700 KB)
 * - TOTAL_GUIDE_INIT_MAX_GZIP: optional total init budget (default: 200 KB, informational)
 * 
 * Usage:
 *   node scripts/check-budgets.mjs
 *   npm run check:budgets
 */

import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.join(__dirname, '..', 'dist', 'assets');

// Budget configuration (in bytes)
const ROUTE_JS_MAX_GZIP = parseInt(process.env.ROUTE_JS_MAX_GZIP || '153600', 10); // 150 KB
const VENDOR_JS_MAX_GZIP = parseInt(process.env.VENDOR_JS_MAX_GZIP || '716800', 10); // 700 KB
const TOTAL_GUIDE_INIT_MAX_GZIP = parseInt(process.env.TOTAL_GUIDE_INIT_MAX_GZIP || '204800', 10); // 200 KB

// Vendor identifiers
const VENDOR_PATTERNS = [
  'vendor',
  'react-vendor',
  'onnx',
  'tesseract',
  'transformers',
  'motion',
  'editor-vendor',
];

/**
 * Categorize a file as 'vendor', 'route', or 'ignore'
 */
function categorizeFile(filename) {
  // Ignore maps, css, html, and other non-JS assets
  if (filename.endsWith('.map') || filename.endsWith('.css') || filename.endsWith('.html')) {
    return 'ignore';
  }

  // Must be JavaScript
  if (!filename.endsWith('.js')) {
    return 'ignore';
  }

  // Skip runtime and polyfill files
  if (filename.includes('runtime') || filename.includes('polyfill')) {
    return 'ignore';
  }

  // Check if vendor
  for (const pattern of VENDOR_PATTERNS) {
    if (filename.includes(pattern)) {
      return 'vendor';
    }
  }

  // Everything else is a route/app chunk
  return 'route';
}

/**
 * Format bytes as human-readable string
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

/**
 * Get gzip size of a buffer
 */
function getGzipSize(buffer) {
  try {
    return zlib.gzipSync(buffer, { level: 6 }).length;
  } catch (err) {
    console.error(`Error gzipping: ${err.message}`);
    return -1;
  }
}

/**
 * Main function
 */
async function main() {
  // Check if dist/assets exists
  if (!fs.existsSync(DIST_DIR)) {
    console.error(`❌ Build directory not found: ${DIST_DIR}`);
    console.error('Please run: npm run build');
    process.exit(1);
  }

  // Read all files in dist/assets
  const files = fs.readdirSync(DIST_DIR);

  // Collect file data
  const results = {
    vendor: [],
    route: [],
    ignore: [],
  };

  let totalVendorGzip = 0;
  let totalRouteGzip = 0;
  let violations = [];

  console.log('\n📊 Performance Budget Report\n');
  console.log(`Configuration:`);
  console.log(`  ROUTE_JS_MAX_GZIP: ${formatBytes(ROUTE_JS_MAX_GZIP)}`);
  console.log(`  VENDOR_JS_MAX_GZIP: ${formatBytes(VENDOR_JS_MAX_GZIP)}`);
  console.log(`  TOTAL_GUIDE_INIT_MAX_GZIP: ${formatBytes(TOTAL_GUIDE_INIT_MAX_GZIP)} (informational)\n`);

  // Process each file
  for (const filename of files) {
    const filepath = path.join(DIST_DIR, filename);
    const stat = fs.statSync(filepath);

    // Skip directories
    if (!stat.isFile()) continue;

    const category = categorizeFile(filename);

    if (category === 'ignore') {
      results.ignore.push(filename);
      continue;
    }

    // Read file and compute gzip size
    const buffer = fs.readFileSync(filepath);
    const rawSize = buffer.length;
    const gzipSize = getGzipSize(buffer);

    const fileData = {
      filename,
      rawSize,
      gzipSize,
      category,
    };

    results[category].push(fileData);

    // Accumulate totals
    if (category === 'vendor') {
      totalVendorGzip += gzipSize;
    } else if (category === 'route') {
      totalRouteGzip += gzipSize;
    }

    // Check budget
    const budget = category === 'vendor' ? VENDOR_JS_MAX_GZIP : ROUTE_JS_MAX_GZIP;
    if (gzipSize > budget) {
      violations.push({
        filename,
        category,
        gzipSize,
        budget,
        exceeded: gzipSize - budget,
      });
    }
  }

  // Print vendor chunks
  console.log('🏗️  Vendor Chunks:');
  if (results.vendor.length === 0) {
    console.log('  (none)\n');
  } else {
    console.log(`${'File'.padEnd(40)} ${'Raw'.padEnd(12)} ${'Gzip'.padEnd(12)} Status`);
    console.log('-'.repeat(70));
    for (const item of results.vendor) {
      const status = item.gzipSize > VENDOR_JS_MAX_GZIP ? '❌' : '✅';
      console.log(
        `${item.filename.substring(0, 40).padEnd(40)} ${formatBytes(item.rawSize).padEnd(12)} ${formatBytes(item.gzipSize).padEnd(12)} ${status}`
      );
    }
    console.log(`${'TOTAL'.padEnd(40)} ${formatBytes(results.vendor.reduce((sum, f) => sum + f.rawSize, 0)).padEnd(12)} ${formatBytes(totalVendorGzip).padEnd(12)}\n`);
  }

  // Print route chunks
  console.log('🛣️  Route/App Chunks:');
  if (results.route.length === 0) {
    console.log('  (none)\n');
  } else {
    console.log(`${'File'.padEnd(40)} ${'Raw'.padEnd(12)} ${'Gzip'.padEnd(12)} Status`);
    console.log('-'.repeat(70));
    for (const item of results.route) {
      const status = item.gzipSize > ROUTE_JS_MAX_GZIP ? '❌' : '✅';
      console.log(
        `${item.filename.substring(0, 40).padEnd(40)} ${formatBytes(item.rawSize).padEnd(12)} ${formatBytes(item.gzipSize).padEnd(12)} ${status}`
      );
    }
    console.log(`${'TOTAL'.padEnd(40)} ${formatBytes(results.route.reduce((sum, f) => sum + f.rawSize, 0)).padEnd(12)} ${formatBytes(totalRouteGzip).padEnd(12)}\n`);
  }

  // Print ignored files count
  if (results.ignore.length > 0) {
    console.log(`✓ Ignored ${results.ignore.length} non-JS assets\n`);
  }

  // Print summary
  console.log('📈 Summary:');
  console.log(`  Vendor chunks: ${results.vendor.length} file(s), ${formatBytes(totalVendorGzip)} gzip`);
  console.log(`  Route chunks: ${results.route.length} file(s), ${formatBytes(totalRouteGzip)} gzip`);
  console.log(`  Total JS (gzip): ${formatBytes(totalVendorGzip + totalRouteGzip)}\n`);

  // Print violations
  if (violations.length > 0) {
    console.log('⚠️  Budget Violations:');
    for (const violation of violations) {
      const budget = violation.category === 'vendor' ? VENDOR_JS_MAX_GZIP : ROUTE_JS_MAX_GZIP;
      console.log(
        `  ❌ ${violation.filename}`
      );
      console.log(
        `     Gzip: ${formatBytes(violation.gzipSize)} (budget: ${formatBytes(budget)}, exceeded by ${formatBytes(violation.exceeded)})`
      );
    }
    console.log();
    process.exit(1);
  }

  console.log('✅ All budgets respected!\n');
  process.exit(0);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
