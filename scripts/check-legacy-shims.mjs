#!/usr/bin/env node
/**
 * CI Check: Warn if new code imports from src/legacy-shims/*
 * Helps prevent new dependencies on deprecated code during refactor window.
 * 
 * Non-blocking warning — doesn't fail CI but alerts developers.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get changed files in this PR (only works in GitHub Actions)
function getChangedFiles() {
  if (!process.env.GITHUB_BASE_REF || !process.env.GITHUB_HEAD_REF) {
    // Not in GitHub Actions context
    return [];
  }

  try {
    const output = execSync(
      `git diff --name-only origin/${process.env.GITHUB_BASE_REF}...HEAD`,
      { encoding: 'utf-8' }
    );
    return output.trim().split('\n').filter(Boolean);
  } catch (err) {
    console.warn('⚠️  Could not get changed files; skipping legacy-shims check');
    return [];
  }
}

// Check if file imports from legacy-shims
function hasLegacyImports(filePath) {
  if (!fs.existsSync(filePath)) return false;
  if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx') && !filePath.endsWith('.js')) return false;

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return /from\s+['"](.*\/)?src\/legacy-shims\//.test(content);
  } catch {
    return false;
  }
}

// Main check
const changedFiles = getChangedFiles();
const legacyImportFiles = changedFiles.filter(hasLegacyImports);

if (legacyImportFiles.length > 0) {
  console.warn('⚠️  WARNING: New imports from legacy-shims detected:');
  legacyImportFiles.forEach((file) => {
    console.warn(`   - ${file}`);
  });
  console.warn('\n📖 See docs/DEPRECATED.md for migration paths.');
  console.warn('⏱️  Legacy-shims will be removed in v2.1.\n');

  // Non-blocking — exit 0
  process.exit(0);
}

console.log('✅ No new legacy-shims imports detected.');
process.exit(0);
