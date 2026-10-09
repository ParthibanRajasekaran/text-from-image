#!/usr/bin/env node

/* eslint-disable no-console */

/**
 * Post-build bundle size report
 * 
 * Reads the dist/ directory after Vite build completes and prints
 * the top 10 largest chunks with their sizes in human-readable format.
 * 
 * Usage: npm run build:report
 *        or automatically runs after: npm run build
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, '..', 'dist');

/**
 * Convert bytes to human-readable format (KB, MB, etc.)
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
}

/**
 * Recursively collect all files from dist directory
 */
function collectFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      collectFiles(fullPath, files);
    } else if (entry.isFile()) {
      const stat = fs.statSync(fullPath);
      files.push({
        name: path.relative(distDir, fullPath),
        size: stat.size,
        fullPath,
      });
    }
  }
  
  return files;
}

/**
 * Main report generation
 */
function generateReport() {
  if (!fs.existsSync(distDir)) {
    console.error(`❌ dist/ directory not found at ${distDir}`);
    console.error('   Run "npm run build" first.');
    process.exit(1);
  }

  const files = collectFiles(distDir);
  
  if (files.length === 0) {
    console.warn('⚠️  No files found in dist/');
    return;
  }

  // Sort by size descending
  files.sort((a, b) => b.size - a.size);

  // Calculate totals
  const totalSize = files.reduce((sum, f) => sum + f.size, 0);
  const jsFiles = files.filter(f => f.name.endsWith('.js') || f.name.endsWith('.mjs'));
  const jsTotal = jsFiles.reduce((sum, f) => sum + f.size, 0);

  console.log('\n' + '═'.repeat(70));
  console.log('📊 VITE BUILD BUNDLE REPORT');
  console.log('═'.repeat(70) + '\n');

  // Top 10 largest chunks
  console.log('📈 Top 10 Largest Chunks:\n');
  console.log('  # │ File Name                                  │ Size');
  console.log('────┼────────────────────────────────────────────┼─────────────');

  for (let i = 0; i < Math.min(10, files.length); i++) {
    const file = files[i];
    const displayName = file.name.length > 40 
      ? '...' + file.name.slice(-37) 
      : file.name;
    const paddedName = displayName.padEnd(40);
    const paddedSize = formatBytes(file.size).padStart(11);
    console.log(`  ${(i + 1).toString().padEnd(1)} │ ${paddedName} │ ${paddedSize}`);
  }

  console.log('────┴────────────────────────────────────────────┴─────────────\n');

  // Summary statistics
  console.log('📋 Summary:\n');
  console.log(`  Total bundle size:      ${formatBytes(totalSize)}`);
  console.log(`  JavaScript files:       ${jsFiles.length} files (${formatBytes(jsTotal)})`);
  console.log(`  Other assets:           ${files.length - jsFiles.length} files (${formatBytes(totalSize - jsTotal)})`);
  console.log(`  Chunk size warning:     700 KB\n`);

  // Warnings for oversized chunks
  const oversized = jsFiles.filter(f => f.size > 700000);
  if (oversized.length > 0) {
    console.log('⚠️  WARNING: Oversized chunks detected!\n');
    oversized.forEach(file => {
      console.log(`     ${file.name} (${formatBytes(file.size)})`);
    });
    console.log('');
  }

  // Expected chunk breakdown
  console.log('✓ Expected Chunk Breakdown:\n');
  const expectedChunks = [
    { pattern: 'react-vendor', description: 'React framework' },
    { pattern: 'editor-vendor', description: 'Framer Motion animations' },
    { pattern: 'ocr-vendor', description: 'Tesseract (lazy-loaded)' },
    { pattern: 'vendor', description: 'Other dependencies' },
    { pattern: 'index-', description: 'Entry point' },
  ];

  for (const chunk of expectedChunks) {
    const file = jsFiles.find(f => f.name.includes(chunk.pattern));
    if (file) {
      console.log(`  ✓ ${chunk.pattern.padEnd(18)} ${formatBytes(file.size).padStart(10)}  (${chunk.description})`);
    }
  }

  console.log('\n' + '═'.repeat(70) + '\n');
}

// Run report
try {
  generateReport();
} catch (err) {
  console.error('❌ Error generating bundle report:', err.message);
  process.exit(1);
}
