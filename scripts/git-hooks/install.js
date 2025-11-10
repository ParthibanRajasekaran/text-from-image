#!/usr/bin/env node
/**
 * Git hooks installer
 * Copies pre-push hook to .git/hooks and sets executable bit
 * Skips if running in CI environment
 */

const fs = require('fs');
const path = require('path');

// Check if running in CI
if (process.env.CI || process.env.GITHUB_ACTIONS || process.env.GITLAB_CI) {
  console.log('ℹ️  Git hooks installation skipped in CI environment');
  process.exit(0);
}

// Determine repository root
const repoRoot = path.resolve(__dirname, '../../');
const gitHooksDir = path.join(repoRoot, '.git', 'hooks');
const sourceHook = path.join(__dirname, 'pre-push');
const targetHook = path.join(gitHooksDir, 'pre-push');

try {
  // Create .git/hooks directory if it doesn't exist
  if (!fs.existsSync(gitHooksDir)) {
    console.log(`📁 Creating ${gitHooksDir}...`);
    fs.mkdirSync(gitHooksDir, { recursive: true });
  }

  // Copy pre-push hook
  if (!fs.existsSync(sourceHook)) {
    console.error(`❌ Error: ${sourceHook} not found`);
    process.exit(1);
  }

  console.log(`📝 Installing pre-push hook to ${targetHook}...`);
  fs.copyFileSync(sourceHook, targetHook);

  // Make hook executable (chmod +x)
  fs.chmodSync(targetHook, 0o755);

  console.log('✅ Git pre-push hook installed successfully');
  process.exit(0);
} catch (error) {
  console.error(`❌ Error installing git hook: ${error.message}`);
  process.exit(1);
}
