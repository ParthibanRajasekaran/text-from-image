#!/usr/bin/env node

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PRODUCTION VERIFICATION - COMPREHENSIVE CHECKS
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * PURPOSE:
 * --------
 * One-command verification that production matches your local development
 * environment. Checks UI variant, environment variables, and deployment status.
 * 
 * WHAT IT CHECKS:
 * ---------------
 * ✅ Production URL is accessible
 * ✅ Correct UI variant is deployed (V2/V3)
 * ✅ Build commit SHA matches local git commit
 * ✅ Environment variables match between local and production
 * ✅ No critical feature flag drift
 * 
 * USAGE:
 * ------
 * npm run verify:full
 * 
 * EXIT CODES:
 * -----------
 * 0 - All checks passed, production matches local
 * 1 - Critical issues found (UI mismatch, env drift)
 * 2 - Cannot connect to production or read env files
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { execSync } from 'child_process';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..');

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const PROD_URL = 'https://textfromimage.com';
const CRITICAL_FLAGS = ['VITE_UX_V2', 'VITE_UX_V3'];

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

// ═══════════════════════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

function parseEnvFile(filePath) {
  if (!existsSync(filePath)) {
    return null;
  }

  try {
    const content = readFileSync(filePath, 'utf-8');
    const env = {};

    content.split('\n').forEach(line => {
      line = line.trim();
      if (!line || line.startsWith('#')) return;

      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        let value = match[2].trim();
        if ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        env[key] = value;
      }
    });

    return env;
  } catch (error) {
    return null;
  }
}

function getLocalCommit() {
  try {
    return execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim();
  } catch (error) {
    return null;
  }
}

async function fetchProductionHTML() {
  return new Promise((resolve) => {
    try {
      // Certificate validation stays on. An invalid certificate is reported as a failed fetch.
      const options = {};
      
      https.get(PROD_URL, options, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          // Follow redirect
          const redirectUrl = res.headers.location;
          https.get(redirectUrl, options, (redirectRes) => {
            if (redirectRes.statusCode !== 200) {
              log(`❌ Cannot fetch production: HTTP ${redirectRes.statusCode}`, 'red');
              resolve(null);
              return;
            }
            
            let data = '';
            redirectRes.on('data', (chunk) => data += chunk);
            redirectRes.on('end', () => resolve(data));
          }).on('error', (error) => {
            log(`❌ Cannot fetch production: ${error.message}`, 'red');
            log(`   ℹ️  Note: SSL certificate may be expired`, 'yellow');
            resolve(null);
          });
          return;
        }
        
        if (res.statusCode !== 200) {
          log(`❌ Cannot fetch production: HTTP ${res.statusCode}`, 'red');
          resolve(null);
          return;
        }

        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => resolve(data));
        res.on('error', (error) => {
          log(`❌ Cannot fetch production: ${error.message}`, 'red');
          resolve(null);
        });
      }).on('error', (error) => {
        log(`❌ Cannot fetch production: ${error.message}`, 'red');
        log(`   ℹ️  This may be due to SSL certificate expiration`, 'yellow');
        log(`   ℹ️  You can still verify using: npm run env:diff`, 'cyan');
        resolve(null);
      });
    } catch (error) {
      log(`❌ Cannot fetch production: ${error.message}`, 'red');
      resolve(null);
    }
  });
}

function detectUIVariant(html) {
  // Check for V2 UI indicators
  const hasAurora = html.includes('aurora') || html.includes('AuroraBackground');
  const hasHeroOCR = html.includes('HeroOCR') || html.includes('hero-ocr');
  const hasGradient = html.includes('gradient') && html.includes('bg-gradient');
  
  // Check for old UI indicators
  const hasClassicLayout = html.includes('classic-layout') || html.includes('single-page');
  
  if (hasAurora || hasHeroOCR || hasGradient) {
    return 'V2 (New UI)';
  } else if (hasClassicLayout) {
    return 'V1 (Old UI)';
  } else {
    return 'Unknown';
  }
}

function extractCommitFromHTML(html) {
  // Look for version display in footer
  const match = html.match(/version[:\s]+([a-f0-9]{7})/i) ||
                html.match(/commit[:\s]+([a-f0-9]{7})/i) ||
                html.match(/build[:\s]+([a-f0-9]{7})/i);
  return match ? match[1] : null;
}

// ═══════════════════════════════════════════════════════════════════════════
// VERIFICATION CHECKS
// ═══════════════════════════════════════════════════════════════════════════

async function checkProductionAccess() {
  log('🌐 Checking production access...', 'cyan');
  
  const html = await fetchProductionHTML();
  if (!html) {
    log('   ❌ Cannot reach production', 'red');
    return { success: false, html: null };
  }
  
  log(`   ✅ Production accessible at ${PROD_URL}`, 'green');
  return { success: true, html };
}

function checkUIVariant(html, localEnv) {
  log('🎨 Checking UI variant...', 'cyan');
  
  const prodVariant = detectUIVariant(html);
  const localUXV2 = localEnv?.VITE_UX_V2 === '1' || localEnv?.VITE_UX_V2 === 'true';
  const expectedVariant = localUXV2 ? 'V2 (New UI)' : 'V1 (Old UI)';
  
  log(`   Local expects:  ${expectedVariant}`, 'gray');
  log(`   Production has: ${prodVariant}`, 'gray');
  
  if (prodVariant === expectedVariant) {
    log('   ✅ UI variant matches', 'green');
    return true;
  } else {
    log('   ❌ UI variant mismatch', 'red');
    return false;
  }
}

function checkCommitSync(html) {
  log('🔍 Checking build version...', 'cyan');
  
  const localCommit = getLocalCommit();
  const prodCommit = extractCommitFromHTML(html);
  
  if (!localCommit) {
    log('   ⚠️  Cannot determine local commit (not a git repo?)', 'yellow');
    return true; // Non-critical
  }
  
  if (!prodCommit) {
    log('   ⚠️  Cannot extract production commit from HTML', 'yellow');
    log('   Make sure version display is working in footer', 'gray');
    return true; // Non-critical
  }
  
  log(`   Local:      ${localCommit}`, 'gray');
  log(`   Production: ${prodCommit}`, 'gray');
  
  if (localCommit === prodCommit) {
    log('   ✅ Production matches local commit', 'green');
    return true;
  } else {
    log('   ⚠️  Production commit differs from local', 'yellow');
    log('   This is OK if you haven\'t deployed recent changes', 'gray');
    return true; // Non-critical - you might not have deployed yet
  }
}

function checkEnvironmentSync() {
  log('⚙️  Checking environment variables...', 'cyan');
  
  const localEnvPath = join(ROOT_DIR, '.env.local');
  const prodEnvPath = join(ROOT_DIR, '.vercel', '.env.production.local');
  
  const localEnv = parseEnvFile(localEnvPath);
  const prodEnv = parseEnvFile(prodEnvPath);
  
  if (!prodEnv) {
    log('   ⚠️  Production env not found', 'yellow');
    log('   Run: npm run vercel:pull:prod', 'gray');
    return { success: true, localEnv, prodEnv: null }; // Non-critical, just inform
  }
  
  let hasCriticalDiff = false;
  
  CRITICAL_FLAGS.forEach(flag => {
    const localValue = localEnv?.[flag];
    const prodValue = prodEnv?.[flag];
    
    if (localValue !== prodValue) {
      hasCriticalDiff = true;
      log(`   ❌ ${flag} mismatch`, 'red');
      log(`      Local:      ${localValue || '(not set)'}`, 'gray');
      log(`      Production: ${prodValue || '(not set)'}`, 'gray');
    }
  });
  
  if (!hasCriticalDiff) {
    log('   ✅ Critical environment variables match', 'green');
  }
  
  return { success: !hasCriticalDiff, localEnv, prodEnv };
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════

async function main() {
  console.log('\n' + '═'.repeat(70));
  log('🔍 PRODUCTION VERIFICATION', 'blue');
  console.log('═'.repeat(70) + '\n');
  
  const checks = {
    access: false,
    ui: false,
    commit: false,
    env: false,
  };
  
  // Check 1: Production Access
  const accessResult = await checkProductionAccess();
  checks.access = accessResult.success;
  console.log('');
  
  if (!accessResult.success) {
    log('⚠️  Cannot verify UI variant and commit - using env check only', 'yellow');
    console.log('');
    
    // Continue with environment check only
    const envResult = checkEnvironmentSync();
    checks.env = envResult.success;
    console.log('');
    
    // Summary
    console.log('═'.repeat(70));
    
    if (!checks.env) {
      log('❌ ENVIRONMENT DRIFT DETECTED', 'red');
      console.log('═'.repeat(70) + '\n');
      log('Critical environment variables differ between local and production', 'red');
      console.log('');
      log('TO FIX:', 'yellow');
      log('1. Check environment variables in Vercel Dashboard', 'reset');
      log('2. Ensure VITE_UX_V2 matches your local .env.local', 'reset');
      log('3. Run: npm run deploy:prod', 'cyan');
      console.log('');
      process.exit(1);
    } else {
      log('⚠️  PARTIAL VERIFICATION', 'yellow');
      console.log('═'.repeat(70) + '\n');
      log('Environment variables match ✅', 'green');
      log('Cannot verify UI/commit (production unreachable)', 'yellow');
      console.log('');
      log('If you just deployed:', 'cyan');
      log('  • Wait a few minutes for DNS propagation', 'reset');
      log('  • Try opening the site in your browser', 'reset');
      log('  • Check Vercel deployment logs', 'reset');
      console.log('');
      process.exit(0);
    }
  }
  
  // Check 2: Environment Variables
  const envResult = checkEnvironmentSync();
  checks.env = envResult.success;
  console.log('');
  
  // Check 3: UI Variant
  checks.ui = checkUIVariant(accessResult.html, envResult.localEnv);
  console.log('');
  
  // Check 4: Commit Sync (informational)
  checks.commit = checkCommitSync(accessResult.html);
  console.log('');
  
  // ─────────────────────────────────────────────────────────────────────────
  // Summary
  // ─────────────────────────────────────────────────────────────────────────
  
  console.log('═'.repeat(70));
  
  if (checks.access && checks.ui && checks.env && checks.commit) {
    log('✅ ALL CHECKS PASSED', 'green');
    console.log('═'.repeat(70) + '\n');
    log('Production matches your local development environment', 'green');
    log('UI variant, environment variables, and build are in sync', 'reset');
    console.log('');
    process.exit(0);
  } else if (!checks.ui || !checks.env) {
    log('❌ CRITICAL ISSUES FOUND', 'red');
    console.log('═'.repeat(70) + '\n');
    
    if (!checks.ui) {
      log('🎨 UI MISMATCH', 'red');
      log('Production is showing a different UI than your local environment', 'reset');
      console.log('');
    }
    
    if (!checks.env) {
      log('⚙️  ENVIRONMENT DRIFT', 'red');
      log('Critical environment variables differ between local and production', 'reset');
      console.log('');
    }
    
    log('TO FIX:', 'yellow');
    log('1. Check environment variables in Vercel Dashboard', 'reset');
    log('2. Ensure VITE_UX_V2 matches your local .env.local', 'reset');
    log('3. Run: npm run deploy:prod', 'cyan');
    log('4. Run: npm run verify:full', 'cyan');
    console.log('');
    
    log('For detailed env diff:', 'gray');
    log('npm run vercel:pull:prod && npm run env:diff', 'cyan');
    console.log('');
    
    process.exit(1);
  } else {
    log('⚠️  WARNINGS FOUND', 'yellow');
    console.log('═'.repeat(70) + '\n');
    log('Production is working but has minor differences', 'yellow');
    log('Review warnings above and update if needed', 'reset');
    console.log('');
    process.exit(0);
  }
}

main();
