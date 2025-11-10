import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

/**
 * Deprecation tests
 * Ensures deprecated components are properly marked and shims exist
 * Forbids legacy-shims imports in production code
 */

describe('deprecation.spec - legacy-shims rules', () => {
  it('deprecated components have @deprecated JSDoc banners', () => {
    const components = ['App.tsx', 'FileInput.tsx', 'Dropzone.tsx', 'ProgressBar.tsx'];
    const srcDir = path.join(__dirname, '..', '..');
    
    components.forEach((comp) => {
      const filePath = path.join(srcDir, 'components', comp);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');
        expect(content).toContain('@deprecated');
      }
    });
  });

  it('legacy-shims directory has been removed (deprecated components deleted)', () => {
    const srcDir = path.join(__dirname, '..', '..');
    const shimsDir = path.join(srcDir, 'src', 'legacy-shims');
    
    // legacy-shims should not exist (removed in v2.1)
    expect(fs.existsSync(shimsDir)).toBe(false);
  });

  it('DEPRECATED.md migration guide exists', () => {
    const srcDir = path.join(__dirname, '..', '..');
    const docPath = path.join(srcDir, 'docs', 'DEPRECATED.md');
    
    expect(fs.existsSync(docPath)).toBe(true);
    const content = fs.readFileSync(docPath, 'utf-8');
    expect(content.length).toBeGreaterThan(0);
    expect(content.toLowerCase()).toContain('deprecated');
  });

  it('production code no longer imports legacy-shims (removed in v2.1)', () => {
    // legacy-shims were removed in v2.1, so this check verifies
    // no old imports remain in codebase
    const srcDir = path.join(__dirname, '..', '..');
    
    function checkDir(dir: string): string[] {
      const violations: string[] = [];
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      entries.forEach((entry) => {
        const fullPath = path.join(dir, entry.name);
        
        // Skip test files and certain directories
        if (entry.name.includes('.spec') || entry.name === 'test' || entry.name === 'node_modules') {
          return;
        }
        
        if (entry.isDirectory()) {
          violations.push(...checkDir(fullPath));
        } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
          const content = fs.readFileSync(fullPath, 'utf-8');
          if (content.includes("from 'src/legacy-shims") || content.includes('from "../legacy-shims')) {
            violations.push(`${fullPath.replace(srcDir, '')}`);
          }
        }
      });
      
      return violations;
    }
    
    const violations = checkDir(path.join(srcDir, 'src'));
    if (violations.length > 0) {
      expect.fail(`Stale legacy-shims imports found:\n${violations.join('\n')}`);
    }
    expect(violations.length).toBe(0);
  });
});
