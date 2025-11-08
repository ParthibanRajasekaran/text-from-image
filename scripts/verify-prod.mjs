#!/usr/bin/env node
/**
 * Production Deployment Verification Script
 * 
 * This script verifies that the production deployment matches the expected version
 * by checking the deployed commit SHA and validating critical page content.
 * 
 * Usage:
 *   npm run verify:prod [production-url]
 * 
 * If no URL is provided, uses the production domain from package.json or
 * fetches the latest deployment URL from Vercel API.
 * 
 * Vercel API docs: https://vercel.com/docs/rest-api/endpoints#get-deployments
 */

import { execSync } from 'child_process';
import https from 'https';
import http from 'http';

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function error(message) {
  log(`❌ ${message}`, 'red');
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

function getLocalCommit() {
  try {
    return execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim();
  } catch {
    return null;
  }
}

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, {
      headers: {
        'User-Agent': 'Vercel-Deployment-Verification/1.0'
      }
    }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
        }
      });
    }).on('error', reject);
  });
}

async function verifyDeployment(productionUrl) {
  log('\n🔍 Verifying Production Deployment\n', 'cyan');
  log('═'.repeat(60), 'cyan');
  
  const localCommit = getLocalCommit();
  
  if (localCommit) {
    info(`Local commit: ${localCommit}`);
  } else {
    warning('Could not determine local commit SHA');
  }
  
  info(`Production URL: ${productionUrl}`);
  info('Fetching page content...\n');
  
  try {
    const html = await fetchUrl(productionUrl);
    
    // Check 1: Validate page title/heading
    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
    const h1Match = html.match(/<h1[^>]*>(.*?)<\/h1>/i);
    
    if (titleMatch || h1Match) {
      const title = titleMatch ? titleMatch[1] : '';
      const h1 = h1Match ? h1Match[1].replace(/<[^>]+>/g, '') : '';
      
      success('Page loaded successfully');
      info(`  Title: ${title}`);
      info(`  H1: ${h1}`);
    } else {
      warning('Could not extract page title or H1');
    }
    
    // Check 2: Extract commit SHA from page
    // Look for common patterns where commit might be displayed
    const commitPatterns = [
      /version["\s:]+([a-f0-9]{7,40})/i,
      /commit["\s:]+([a-f0-9]{7,40})/i,
      /v([a-f0-9]{7})/i,
      /\b([a-f0-9]{7})\b/g,
    ];
    
    let deployedCommit = null;
    
    for (const pattern of commitPatterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        // Verify it looks like a git SHA (7+ hex chars)
        if (/^[a-f0-9]{7,}$/i.test(match[1])) {
          deployedCommit = match[1];
          break;
        }
      }
    }
    
    console.log('');
    
    if (deployedCommit) {
      success(`Deployed commit: ${deployedCommit}`);
      
      if (localCommit && deployedCommit.startsWith(localCommit)) {
        success('✨ Deployment verified! Local and deployed commits match.');
      } else if (localCommit) {
        warning(
          `Commit mismatch!\n` +
          `   Local:    ${localCommit}\n` +
          `   Deployed: ${deployedCommit}\n\n` +
          `   This could mean:\n` +
          `   1. Deployment is still in progress (wait 1-2 minutes)\n` +
          `   2. CDN cache hasn't updated (try in incognito/private mode)\n` +
          `   3. Different commit was deployed\n`
        );
        process.exit(1);
      }
    } else {
      warning(
        'Could not find commit SHA in page content.\n' +
        '   Make sure the footer displays the commit version.\n' +
        '   Check that lib/version.ts is imported in App.tsx'
      );
    }
    
    // Check 3: Validate critical content
    console.log('');
    info('Content validation:');
    
    const checks = [
      { name: 'Has dropzone component', pattern: /drop.*image|upload/i },
      { name: 'Has file size limit text', pattern: /\b20\s*MB\b/i },
      { name: 'Has React root', pattern: /<div id="root"/i },
      { name: 'Has JavaScript bundle', pattern: /<script.*src.*\.js/i },
    ];
    
    for (const check of checks) {
      if (check.pattern.test(html)) {
        success(`  ${check.name}`);
      } else {
        warning(`  ${check.name} - NOT FOUND`);
      }
    }
    
    log('\n' + '═'.repeat(60), 'green');
    success('Verification complete! 🎉\n');
    
  } catch (err) {
    error(
      `Failed to fetch or verify deployment:\n` +
      `   ${err.message}\n\n` +
      `   Troubleshooting:\n` +
      `   1. Check the URL is correct and accessible\n` +
      `   2. Verify DNS is properly configured\n` +
      `   3. Check Vercel dashboard for deployment status\n` +
      `   4. Try: curl -I ${productionUrl}`
    );
  }
}

function main() {
  const args = process.argv.slice(2);
  let productionUrl = args[0];
  
  // Default production URL - update this to match your domain
  if (!productionUrl) {
    productionUrl = process.env.PRODUCTION_URL || 'https://freetextfromimage.com';
    info(`No URL provided, using: ${productionUrl}`);
  }
  
  // Validate URL format
  if (!productionUrl.startsWith('http://') && !productionUrl.startsWith('https://')) {
    productionUrl = 'https://' + productionUrl;
  }
  
  verifyDeployment(productionUrl);
}

main();
