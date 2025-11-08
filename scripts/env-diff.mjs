#!/usr/bin/env node

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ENVIRONMENT VARIABLES DIFF CHECKER
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * PURPOSE:
 * --------
 * Compare local environment variables with production environment to identify
 * mismatches that could cause UI/behavior differences between dev and prod.
 * 
 * WHAT IT DOES:
 * -------------
 * ✅ Reads `.env.local` (local development)
 * ✅ Reads `.vercel/.env.production.local` (pulled from Vercel)
 * ✅ Identifies UI-critical flags (VITE_UX_V2, etc.)
 * ✅ Highlights missing or different values
 * ✅ Shows impact analysis for each difference
 * 
 * USAGE:
 * ------
 * npm run vercel:pull:prod  # Pull production env first
 * npm run env:diff          # Compare environments
 * 
 * EXIT CODES:
 * -----------
 * 0 - Environments match or differences are non-critical
 * 1 - Critical UI flags differ (VITE_UX_V2, etc.)
 * 2 - Cannot read environment files
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..');

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

/** Critical flags that affect UI/behavior */
const CRITICAL_FLAGS = [
  'VITE_UX_V2',
  'VITE_UX_V3',
  'VITE_UI_VARIANT',
];

/** Important flags that should match but won't break UI */
const IMPORTANT_FLAGS = [
  'VITE_ANALYTICS_ENABLED',
  'VITE_DEBUG',
  'VITE_OCR_MIN_CONFIDENCE',
  'VITE_OCR_MIN_TEXT_LENGTH',
];

/** Build-time flags (auto-generated, differences expected) */
const BUILD_FLAGS = [
  'VITE_COMMIT',
  'VITE_BUILD_TIME',
  'VITE_VERCEL_GIT_COMMIT_SHA',
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
  gray: '\x1b[90m',
};

function log(msg, color = 'reset') {
  console.log(`${colors[color]}${msg}${colors.reset}`);
}

/**
 * Parse .env file into key-value object
 */
function parseEnvFile(filePath) {
  if (!existsSync(filePath)) {
    return null;
  }

  try {
    const content = readFileSync(filePath, 'utf-8');
    const env = {};

    content.split('\n').forEach(line => {
      // Skip comments and empty lines
      line = line.trim();
      if (!line || line.startsWith('#')) return;

      // Parse KEY=VALUE
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        let value = match[2].trim();

        // Remove quotes
        if ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }

        env[key] = value;
      }
    });

    return env;
  } catch (error) {
    log(`Error reading ${filePath}: ${error.message}`, 'red');
    return null;
  }
}

/**
 * Get all unique keys from both environments
 */
function getAllKeys(local, production) {
  const keys = new Set();
  if (local) Object.keys(local).forEach(k => keys.add(k));
  if (production) Object.keys(production).forEach(k => keys.add(k));
  return Array.from(keys).sort();
}

/**
 * Determine flag severity
 */
function getFlagSeverity(key) {
  if (CRITICAL_FLAGS.includes(key)) return 'critical';
  if (IMPORTANT_FLAGS.includes(key)) return 'important';
  if (BUILD_FLAGS.includes(key)) return 'build';
  return 'other';
}

/**
 * Get impact description for a flag
 */
function getImpactDescription(key) {
  const impacts = {
    'VITE_UX_V2': '🎨 Toggles between OLD UI (App.tsx) and NEW UI (HeroOCR)',
    'VITE_UX_V3': '✨ Enables V3 premium UI variant',
    'VITE_UI_VARIANT': '🎨 Controls UI variant selection',
    'VITE_ANALYTICS_ENABLED': '📊 Web Vitals tracking',
    'VITE_DEBUG': '🐛 Debug logging verbosity',
    'VITE_OCR_MIN_CONFIDENCE': '🎯 Tesseract confidence threshold',
    'VITE_OCR_MIN_TEXT_LENGTH': '📏 Minimum text length for OCR results',
  };
  return impacts[key] || '⚙️ Configuration value';
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN DIFF LOGIC
// ═══════════════════════════════════════════════════════════════════════════

function main() {
  console.log('\n' + '═'.repeat(70));
  log('🔍 ENVIRONMENT VARIABLES DIFF', 'blue');
  console.log('═'.repeat(70) + '\n');

  // ─────────────────────────────────────────────────────────────────────────
  // Read Environment Files
  // ─────────────────────────────────────────────────────────────────────────
  
  const localEnvPath = join(ROOT_DIR, '.env.local');
  const prodEnvPath = join(ROOT_DIR, '.vercel', '.env.production.local');

  log('📁 Reading environment files...', 'cyan');
  console.log('');

  const localEnv = parseEnvFile(localEnvPath);
  const prodEnv = parseEnvFile(prodEnvPath);

  if (!localEnv) {
    log(`⚠️  Local env not found: ${localEnvPath}`, 'yellow');
    log('   This is OK if you don\'t use .env.local', 'gray');
  } else {
    log(`✅ Local: ${localEnvPath} (${Object.keys(localEnv).length} variables)`, 'green');
  }

  if (!prodEnv) {
    log(`❌ Production env not found: ${prodEnvPath}`, 'red');
    log('   Run: npm run vercel:pull:prod', 'yellow');
    console.log('');
    process.exit(2);
  } else {
    log(`✅ Production: ${prodEnvPath} (${Object.keys(prodEnv).length} variables)`, 'green');
  }

  console.log('');

  // ─────────────────────────────────────────────────────────────────────────
  // Compare Environments
  // ─────────────────────────────────────────────────────────────────────────

  const allKeys = getAllKeys(localEnv || {}, prodEnv);
  const differences = {
    critical: [],
    important: [],
    build: [],
    other: [],
  };

  allKeys.forEach(key => {
    const localValue = localEnv?.[key];
    const prodValue = prodEnv?.[key];

    // Skip if values match
    if (localValue === prodValue) return;

    const severity = getFlagSeverity(key);
    differences[severity].push({
      key,
      localValue: localValue || '(not set)',
      prodValue: prodValue || '(not set)',
      impact: getImpactDescription(key),
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Display Results
  // ─────────────────────────────────────────────────────────────────────────

  let hasCriticalDiff = false;

  // Critical Differences
  if (differences.critical.length > 0) {
    hasCriticalDiff = true;
    log('🚨 CRITICAL DIFFERENCES (UI-BREAKING)', 'red');
    console.log('');

    differences.critical.forEach(diff => {
      log(`  ❌ ${diff.key}`, 'red');
      log(`     Local:      ${diff.localValue}`, 'gray');
      log(`     Production: ${diff.prodValue}`, 'gray');
      log(`     Impact:     ${diff.impact}`, 'yellow');
      console.log('');
    });
  }

  // Important Differences
  if (differences.important.length > 0) {
    log('⚠️  IMPORTANT DIFFERENCES (BEHAVIOR)', 'yellow');
    console.log('');

    differences.important.forEach(diff => {
      log(`  ⚠️  ${diff.key}`, 'yellow');
      log(`     Local:      ${diff.localValue}`, 'gray');
      log(`     Production: ${diff.prodValue}`, 'gray');
      log(`     Impact:     ${diff.impact}`, 'gray');
      console.log('');
    });
  }

  // Build-time Differences (Expected)
  if (differences.build.length > 0) {
    log('ℹ️  BUILD-TIME DIFFERENCES (EXPECTED)', 'cyan');
    console.log('');

    differences.build.forEach(diff => {
      log(`  ℹ️  ${diff.key}`, 'cyan');
      log(`     Local:      ${diff.localValue}`, 'gray');
      log(`     Production: ${diff.prodValue}`, 'gray');
      console.log('');
    });
  }

  // Other Differences
  if (differences.other.length > 0) {
    log('📋 OTHER DIFFERENCES', 'gray');
    console.log('');

    differences.other.forEach(diff => {
      log(`  • ${diff.key}`, 'gray');
      log(`     Local:      ${diff.localValue}`, 'gray');
      log(`     Production: ${diff.prodValue}`, 'gray');
      console.log('');
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Summary
  // ─────────────────────────────────────────────────────────────────────────

  console.log('═'.repeat(70));

  if (hasCriticalDiff) {
    log('❌ CRITICAL DIFFERENCES FOUND', 'red');
    console.log('═'.repeat(70));
    console.log('');
    log('PRODUCTION WILL SHOW DIFFERENT UI/BEHAVIOR', 'red');
    console.log('');
    log('TO FIX:', 'yellow');
    differences.critical.forEach(diff => {
      log(`  1. Go to Vercel Dashboard → Project → Environment Variables`, 'reset');
      log(`  2. Set: ${diff.key} = ${diff.localValue}`, 'cyan');
    });
    console.log('');
    log('  3. Redeploy: npm run deploy:prod', 'cyan');
    console.log('');
    process.exit(1);
  } else if (differences.important.length > 0) {
    log('⚠️  DIFFERENCES FOUND (NON-CRITICAL)', 'yellow');
    console.log('═'.repeat(70));
    console.log('');
    log('Production will work but behavior may differ slightly', 'yellow');
    log('Review differences above and update Vercel env vars if needed', 'reset');
    console.log('');
    process.exit(0);
  } else {
    log('✅ ENVIRONMENTS MATCH', 'green');
    console.log('═'.repeat(70));
    console.log('');
    log('Local and production environments are in sync', 'green');
    log('UI and behavior should be identical', 'reset');
    console.log('');
    process.exit(0);
  }
}

main();
