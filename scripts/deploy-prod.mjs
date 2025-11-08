#!/usr/bin/env node
/**
 * Production Deployment Script for Vercel (Vite + React)
 * 
 * This script ensures the EXACT local code (current working tree) is deployed to Production,
 * even if there are uncommitted changes or unpushed commits.
 * 
 * Relevant Vercel CLI docs:
 * - vercel --prod: https://vercel.com/docs/cli#commands/deploy
 * - vercel link: https://vercel.com/docs/cli#commands/link
 * - vercel pull: https://vercel.com/docs/cli#commands/pull
 * - vercel env: https://vercel.com/docs/cli#commands/env
 * 
 * Usage: npm run deploy:prod
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Change this if your app is in a subfolder (e.g., './packages/web')
const rootDir = resolve(__dirname, '..');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function error(message) {
  log(`❌ ERROR: ${message}`, 'red');
  process.exit(1);
}

function success(message) {
  log(`✅ ${message}`, 'green');
}

function info(message) {
  log(`ℹ️  ${message}`, 'cyan');
}

function warning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function exec(command, options = {}) {
  try {
    return execSync(command, {
      cwd: rootDir,
      encoding: 'utf-8',
      stdio: options.silent ? 'pipe' : 'inherit',
      ...options,
    });
  } catch (err) {
    if (!options.ignoreError) {
      error(`Command failed: ${command}\n${err.message}`);
    }
    throw err;
  }
}

function checkVercelCLI() {
  info('Checking Vercel CLI installation...');
  try {
    exec('vercel --version', { silent: true });
    success('Vercel CLI is installed');
  } catch {
    error(
      'Vercel CLI is not installed.\n' +
      '   Please run: npm install -g vercel\n' +
      '   Docs: https://vercel.com/docs/cli'
    );
  }
}

function linkVercelProject() {
  info('Linking to Vercel project...');
  
  const vercelDir = resolve(rootDir, '.vercel');
  if (existsSync(vercelDir)) {
    success('Already linked to Vercel project');
    return;
  }
  
  warning('Not linked to a Vercel project. Running vercel link...');
  try {
    exec('vercel link --yes');
    success('Successfully linked to Vercel project');
  } catch (err) {
    error(
      'Failed to link to Vercel project.\n' +
      '   Run manually: npm run vercel:link\n' +
      '   Or: vercel link --yes'
    );
  }
}

function pullProductionSettings() {
  info('Pulling production environment and settings...');
  info('Docs: https://vercel.com/docs/cli#commands/pull');
  
  try {
    exec('vercel pull --environment=production --yes');
    success('Production settings pulled successfully');
  } catch (err) {
    warning('Failed to pull production settings. Continuing anyway...');
  }
}

function detectPackageManager() {
  if (existsSync(resolve(rootDir, 'pnpm-lock.yaml'))) return 'pnpm';
  if (existsSync(resolve(rootDir, 'yarn.lock'))) return 'yarn';
  return 'npm';
}

function buildApp() {
  info('Building app for production (matching Vercel build)...');
  
  const pm = detectPackageManager();
  const buildCmd = pm === 'npm' ? 'npm run build' : `${pm} build`;
  
  info(`Using package manager: ${pm}`);
  info(`Build command: ${buildCmd}`);
  
  try {
    exec(buildCmd, { env: { ...process.env, NODE_ENV: 'production' } });
    success('Build completed successfully');
  } catch (err) {
    error(
      'Build failed. Please fix build errors before deploying.\n' +
      `   Run locally: ${buildCmd}`
    );
  }
}

function getLocalCommit() {
  try {
    return exec('git rev-parse --short HEAD', { silent: true }).trim();
  } catch {
    return 'unknown';
  }
}

function deployToProduction() {
  info('Deploying current working tree to Production...');
  info('Docs: https://vercel.com/docs/cli#commands/deploy');
  
  const localCommit = getLocalCommit();
  info(`Local commit: ${localCommit}`);
  
  try {
    // Deploy with --prod flag to target Production environment
    // --yes skips confirmation prompts (safe because we already built)
    const output = exec('vercel --prod --yes', { silent: true });
    
    // Extract deployment URL from output
    const urlMatch = output.match(/https:\/\/[^\s]+/);
    const deploymentUrl = urlMatch ? urlMatch[0] : null;
    
    success('Deployment completed!');
    
    if (deploymentUrl) {
      log('\n🚀 Production URL:', 'green');
      log(`   ${deploymentUrl}\n`, 'cyan');
    }
    
    log('📋 Deployment Info:', 'blue');
    log(`   Local commit:  ${localCommit}`, 'cyan');
    
    // Check if VERCEL_GIT_COMMIT_SHA is available (it won't be in local deploy)
    const vercelCommit = process.env.VERCEL_GIT_COMMIT_SHA || 'N/A (local deploy)';
    log(`   Vercel commit: ${vercelCommit}`, 'cyan');
    
    log('\n✨ Verification steps:', 'yellow');
    log('   1. Visit your production domain (e.g., https://freetextfromimage.com)');
    log('   2. Check the footer for the commit SHA');
    log(`   3. Verify it shows: ${localCommit}`);
    log('   4. If different, clear your browser cache (Cmd+Shift+R / Ctrl+F5)');
    log('   5. Or run: npm run verify:prod\n');
    
  } catch (err) {
    error(
      'Deployment failed.\n' +
      '   Check the error above and try again.\n' +
      '   Docs: https://vercel.com/docs/cli#commands/deploy'
    );
  }
}

function main() {
  log('\n🚀 Starting Production Deployment Process\n', 'blue');
  log('═'.repeat(60), 'blue');
  
  // Step 1: Check prerequisites
  checkVercelCLI();
  
  // Step 2: Link to Vercel project
  linkVercelProject();
  
  // Step 3: Pull production settings
  pullProductionSettings();
  
  // Step 4: Build the app
  buildApp();
  
  // Step 5: Deploy to production
  deployToProduction();
  
  log('═'.repeat(60), 'green');
  success('Production deployment complete! 🎉\n');
}

main();
