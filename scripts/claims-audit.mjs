#!/usr/bin/env node

/**
 * Claims Audit — Guard against overclaiming maturity
 *
 * Blocks specific strings that represent fake maturity signals
 * in source code (not in docs/evidence or comments).
 *
 * Blocked terms:
 * - "enterprise grade", "enterprise-grade" (no enterprise customer proof)
 * - "production ready", "production-ready" (beta phase)
 * - "trusted by" (no customer testimonials)
 * - "GDPR compliant", "GDPR-compliant" (legal review not done)
 * - "WCAG AA" (no audit yet, use "accessible" instead)
 * - "SLA" (no SLA agreement exists)
 * - "global users", "global usage" (not verified)
 * - "customers" (unless in attributed testimonial)
 * - "Sign In", "Log in" (unless auth exists)
 * - "Pricing" (unless /access route)
 *
 * Usage: node scripts/claims-audit.mjs
 * Exit: 0 (pass), 1 (blocked strings found)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC_ROOT = path.join(__dirname, '..');

// Strings that indicate overclaiming
const BLOCKED_PATTERNS = [
  /\benterprise\s+grade\b/gi,
  /\benterprise-grade\b/gi,
  /\bproduction\s+ready\b/gi,
  /\bproduction-ready\b/gi,
  /\btrusted\s+by\b/gi,
  /\bGDPR\s+compliant\b/gi,
  /\bGDPR-compliant\b/gi,
  /\bWCAG\s+AA\b/gi,
  /\bSLA\b/gi,
  /\bglobal\s+users\b/gi,
  /\bglobal\s+usage\b/gi,
];

// Strings that need context checking
const CONTEXT_PATTERNS = [
  { pattern: /\bcustomers?\b/gi, label: 'customers' },
  { pattern: /\bSign In\b/g, label: 'Sign In' },
  { pattern: /\bLog in\b/g, label: 'Log in' },
  { pattern: /\bPricing\b/g, label: 'Pricing' },
];

function shouldSkipFile(filePath) {
  const relPath = path.relative(SRC_ROOT, filePath);

  // Skip these directories
  if (
    relPath.includes('node_modules') ||
    relPath.includes('.git') ||
    relPath.includes('dist') ||
    relPath.includes('docs/evidence') ||
    relPath.includes('docs/build')
  ) {
    return true;
  }

  // Skip binary files
  const ext = path.extname(filePath).toLowerCase();
  if (['.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico', '.woff', '.woff2'].includes(ext)) {
    return true;
  }

  return false;
}

function extractContent(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');

    // Remove comments (both // and /* */)
    content = content.replace(/\/\/.*$/gm, '');
    content = content.replace(/\/\*[\s\S]*?\*\//g, '');

    return content;
  } catch {
    return '';
  }
}

function auditFile(filePath) {
  const content = extractContent(filePath);
  const violations = [];
  const relPath = path.relative(SRC_ROOT, filePath);

  // Check blocked patterns
  for (const pattern of BLOCKED_PATTERNS) {
    const matches = content.matchAll(pattern);
    for (const match of matches) {
      violations.push({
        file: relPath,
        pattern: match[0],
        line: content.substring(0, match.index).split('\n').length,
      });
    }
  }

  // Check context patterns
  for (const { pattern, label } of CONTEXT_PATTERNS) {
    const matches = content.matchAll(pattern);
    for (const match of matches) {
      // "customers" is OK in /case-studies testimonials
      if (label === 'customers' && relPath.includes('case-studies')) {
        continue;
      }

      // "Sign In" is OK if route exists (would need to check router)
      if (label === 'Sign In' && filePath.includes('router.tsx')) {
        continue;
      }

      // "Pricing" is OK if linking to /access
      if (label === 'Pricing' && content.includes('ROUTES.ACCESS')) {
        continue;
      }

      violations.push({
        file: relPath,
        pattern: match[0],
        label,
        line: content.substring(0, match.index).split('\n').length,
      });
    }
  }

  return violations;
}

function findAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (shouldSkipFile(filePath)) {
      continue;
    }

    if (stat.isDirectory()) {
      findAllFiles(filePath, fileList);
    } else if (stat.isFile()) {
      fileList.push(filePath);
    }
  }

  return fileList;
}

async function main() {
  console.log('🔍 Auditing claims for overclaiming maturity signals...\n');

  const files = findAllFiles(SRC_ROOT);
  const allViolations = [];

  for (const file of files) {
    const violations = auditFile(file);
    allViolations.push(...violations);
  }

  if (allViolations.length === 0) {
    console.log('✅ No overclaiming detected.\n');
    process.exit(0);
  }

  console.log(`❌ Found ${allViolations.length} overclaiming violation(s):\n`);

  for (const violation of allViolations) {
    console.log(`  ${violation.file}:${violation.line}`);
    console.log(`     "${violation.pattern}" (${violation.label || 'blocked'})`);
  }

  console.log('\n💡 Use honest alternatives:');
  console.log('  - "enterprise grade" → remove or use "professional"');
  console.log('  - "production ready" → "ready for beta testing" or remove');
  console.log('  - "trusted by" → only with verified customer testimonial');
  console.log('  - "GDPR compliant" → remove (legal review required)');
  console.log('  - "WCAG AA" → use "keyboard accessible" unless audited');
  console.log('  - "customers" → use "users" or "beta testers"');
  console.log('  - "Sign In" / "Log in" → remove if no auth exists\n');

  process.exit(1);
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
