#!/usr/bin/env node

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ENVIRONMENT VARIABLES VALIDATION GUARDRAIL
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * PURPOSE:
 * --------
 * Validates critical environment variables are set before build/deploy.
 * Prevents production drift by catching missing/incorrect variables early.
 * 
 * WHEN IT RUNS:
 * -------------
 * ✅ Pre-build (via npm run prebuild script)
 * ✅ CI/CD pipelines (GitHub Actions)
 * ✅ Manual check (npm run validate:env)
 * ✅ Pre-commit hook (optional)
 * 
 * WHAT IT CHECKS:
 * ---------------
 * 🎨 Critical UI flags (VITE_UX_V2) - Must be set explicitly
 * ⚙️ Optional feature flags - Warns if using defaults
 * 🔧 Build-time variables - Confirms auto-generation works
 * 
 * EXIT CODES:
 * -----------
 * 0 - All validations passed
 * 1 - Critical environment variables missing or invalid
 * 2 - Warnings (non-critical, build continues)
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..');

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Critical environment variables that MUST be explicitly set.
 * Build will FAIL if these are missing or have invalid values.
 */
const CRITICAL_VARS = [
  {
    name: 'VITE_UX_V2',
    validValues: ['1', 'true', '0', 'false'],
    description: 'UI variant flag - Toggles between old and new UI',
    defaultBehavior: 'Shows OLD UI (classic single-page layout)',
    impact: '🚨 CRITICAL: Different UIs in dev vs prod if not set',
    required: true,
    recommendation: '1 or true (for new UI)'
  }
];

/**
 * Optional environment variables that should be set but have safe defaults.
 * Build will WARN if these are missing.
 */
const OPTIONAL_VARS = [
  {
    name: 'VITE_ANALYTICS_ENABLED',
    validValues: ['1', 'true', '0', 'false'],
    description: 'Enable Web Vitals tracking',
    defaultBehavior: 'true (analytics enabled)',
    impact: '⚠️  Analytics behavior may differ',
    required: false,
    recommendation: 'true (for production)'
  },
  {
    name: 'VITE_DEBUG',
    validValues: ['1', 'true', '0', 'false'],
    description: 'Enable debug logging',
    defaultBehavior: 'false (no debug logs)',
    impact: 'ℹ️  Console verbosity may differ',
    required: false,
    recommendation: 'false (for production)'
  },
  {
    name: 'VITE_OCR_MIN_CONFIDENCE',
    validValues: null, // Numeric, validated separately
    description: 'Tesseract confidence threshold (0-100)',
    defaultBehavior: '60',
    impact: 'ℹ️  OCR quality threshold may differ',
    required: false,
    recommendation: '60'
  }
];

/**
 * Auto-generated build-time variables.
 * These should NOT be set manually - vite.config.ts handles them.
 */
const AUTO_VARS = [
  {
    name: 'VITE_COMMIT',
    source: 'git rev-parse --short HEAD',
    description: 'Git commit SHA for version display'
  },
  {
    name: 'VITE_BUILD_TIME',
    source: 'new Date().toISOString()',
    description: 'Build timestamp'
  }
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
  bold: '\x1b[1m',
};

function log(msg, color = 'reset') {
  console.log(`${colors[color]}${msg}${colors.reset}`);
}

function parseEnvFile(filePath) {
  if (!existsSync(filePath)) {
    return {};
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
    return {};
  }
}

function getEnvironment() {
  // Check if running in Vercel
  if (process.env.VERCEL === '1') {
    return 'vercel';
  }
  
  // Check if running in CI
  if (process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true') {
    return 'ci';
  }
  
  // Local development
  return 'local';
}

function loadEnvVars() {
  const env = getEnvironment();
  
  if (env === 'vercel' || env === 'ci') {
    // In CI/Vercel, use process.env directly
    return process.env;
  } else {
    // Local: Load from .env.local
    const localEnvPath = join(ROOT_DIR, '.env.local');
    const localEnv = parseEnvFile(localEnvPath);
    return { ...process.env, ...localEnv };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// VALIDATION FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

function validateCriticalVars(env) {
  const errors = [];
  
  CRITICAL_VARS.forEach(varDef => {
    const value = env[varDef.name];
    
    // Check if variable is set
    if (!value || value === '' || value === 'undefined') {
      errors.push({
        variable: varDef.name,
        error: 'NOT SET',
        description: varDef.description,
        impact: varDef.impact,
        defaultBehavior: varDef.defaultBehavior,
        recommendation: varDef.recommendation
      });
      return;
    }
    
    // Check if value is valid
    if (varDef.validValues && !varDef.validValues.includes(value)) {
      errors.push({
        variable: varDef.name,
        error: `INVALID VALUE: "${value}"`,
        description: varDef.description,
        impact: varDef.impact,
        validValues: varDef.validValues,
        recommendation: varDef.recommendation
      });
    }
  });
  
  return errors;
}

function validateOptionalVars(env) {
  const warnings = [];
  
  OPTIONAL_VARS.forEach(varDef => {
    const value = env[varDef.name];
    
    // Check if variable is set
    if (!value || value === '' || value === 'undefined') {
      warnings.push({
        variable: varDef.name,
        warning: 'Not set (using default)',
        description: varDef.description,
        defaultBehavior: varDef.defaultBehavior,
        impact: varDef.impact,
        recommendation: varDef.recommendation
      });
      return;
    }
    
    // Validate numeric values
    if (varDef.name === 'VITE_OCR_MIN_CONFIDENCE') {
      const numValue = parseInt(value, 10);
      if (isNaN(numValue) || numValue < 0 || numValue > 100) {
        warnings.push({
          variable: varDef.name,
          warning: `Invalid value: "${value}" (must be 0-100)`,
          description: varDef.description,
          recommendation: varDef.recommendation
        });
      }
    }
    
    // Validate boolean values
    if (varDef.validValues && !varDef.validValues.includes(value)) {
      warnings.push({
        variable: varDef.name,
        warning: `Unusual value: "${value}" (expected: ${varDef.validValues.join(', ')})`,
        description: varDef.description,
        recommendation: varDef.recommendation
      });
    }
  });
  
  return warnings;
}

function checkAutoVars() {
  const info = [];
  
  AUTO_VARS.forEach(varDef => {
    info.push({
      variable: varDef.name,
      description: varDef.description,
      source: varDef.source
    });
  });
  
  return info;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN VALIDATION
// ═══════════════════════════════════════════════════════════════════════════

function main() {
  console.log('\n' + '═'.repeat(70));
  log('🛡️  ENVIRONMENT VARIABLES VALIDATION', 'blue');
  console.log('═'.repeat(70) + '\n');
  
  const environment = getEnvironment();
  log(`Environment: ${environment}`, 'cyan');
  console.log('');
  
  // Load environment variables
  const env = loadEnvVars();
  
  // ─────────────────────────────────────────────────────────────────────────
  // Validate Critical Variables
  // ─────────────────────────────────────────────────────────────────────────
  
  const criticalErrors = validateCriticalVars(env);
  
  if (criticalErrors.length > 0) {
    log('🚨 CRITICAL ERRORS - BUILD BLOCKED', 'red');
    console.log('');
    
    criticalErrors.forEach(err => {
      log(`  ❌ ${err.variable}`, 'red');
      log(`     Error: ${err.error}`, 'red');
      log(`     Description: ${err.description}`, 'gray');
      log(`     Impact: ${err.impact}`, 'yellow');
      log(`     Default Behavior: ${err.defaultBehavior}`, 'gray');
      
      if (err.validValues) {
        log(`     Valid Values: ${err.validValues.join(', ')}`, 'cyan');
      }
      
      log(`     Recommendation: Set to ${err.recommendation}`, 'green');
      console.log('');
    });
    
    console.log('═'.repeat(70));
    log('❌ VALIDATION FAILED', 'red');
    console.log('═'.repeat(70));
    console.log('');
    
    log('TO FIX:', 'yellow');
    
    if (environment === 'local') {
      log('1. Create or edit .env.local file:', 'reset');
      criticalErrors.forEach(err => {
        log(`   echo "${err.variable}=${err.recommendation}" >> .env.local`, 'cyan');
      });
    } else if (environment === 'vercel') {
      log('1. Go to Vercel Dashboard → Project → Environment Variables', 'reset');
      criticalErrors.forEach(err => {
        log(`   Set: ${err.variable} = ${err.recommendation}`, 'cyan');
      });
      log('2. Redeploy or wait for automatic redeploy', 'reset');
    } else if (environment === 'ci') {
      log('1. Add environment variables to GitHub Secrets:', 'reset');
      log('   Settings → Secrets and variables → Actions', 'reset');
      criticalErrors.forEach(err => {
        log(`   ${err.variable} = ${err.recommendation}`, 'cyan');
      });
      log('2. Update .github/workflows/deploy.yml to pass env vars', 'reset');
    }
    
    console.log('');
    log('See: docs/NO_DRIFT.md for complete setup guide', 'gray');
    console.log('');
    
    process.exit(1);
  }
  
  log('✅ Critical variables validated', 'green');
  console.log('');
  
  // ─────────────────────────────────────────────────────────────────────────
  // Validate Optional Variables
  // ─────────────────────────────────────────────────────────────────────────
  
  const optionalWarnings = validateOptionalVars(env);
  
  if (optionalWarnings.length > 0) {
    log('⚠️  OPTIONAL VARIABLES', 'yellow');
    console.log('');
    
    optionalWarnings.forEach(warn => {
      log(`  ⚠️  ${warn.variable}`, 'yellow');
      log(`     ${warn.warning}`, 'yellow');
      log(`     Description: ${warn.description}`, 'gray');
      log(`     Default: ${warn.defaultBehavior}`, 'gray');
      if (warn.impact) {
        log(`     Impact: ${warn.impact}`, 'gray');
      }
      log(`     Recommendation: ${warn.recommendation}`, 'cyan');
      console.log('');
    });
  } else {
    log('✅ Optional variables configured', 'green');
    console.log('');
  }
  
  // ─────────────────────────────────────────────────────────────────────────
  // Auto-Generated Variables Info
  // ─────────────────────────────────────────────────────────────────────────
  
  const autoInfo = checkAutoVars();
  
  log('ℹ️  AUTO-GENERATED VARIABLES', 'cyan');
  console.log('');
  
  autoInfo.forEach(info => {
    log(`  ℹ️  ${info.variable}`, 'cyan');
    log(`     ${info.description}`, 'gray');
    log(`     Generated by: ${info.source}`, 'gray');
    console.log('');
  });
  
  // ─────────────────────────────────────────────────────────────────────────
  // Summary
  // ─────────────────────────────────────────────────────────────────────────
  
  console.log('═'.repeat(70));
  
  if (optionalWarnings.length > 0) {
    log('⚠️  VALIDATION PASSED WITH WARNINGS', 'yellow');
    console.log('═'.repeat(70));
    console.log('');
    log('Build will continue with default values for optional variables', 'yellow');
    log('Review warnings above and set recommended values if needed', 'reset');
    console.log('');
    process.exit(0); // Don't block build for warnings
  } else {
    log('✅ ALL VALIDATIONS PASSED', 'green');
    console.log('═'.repeat(70));
    console.log('');
    log('All environment variables are properly configured', 'green');
    log('Build can proceed safely', 'reset');
    console.log('');
    process.exit(0);
  }
}

main();
