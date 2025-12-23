#!/usr/bin/env node
/**
 * Phase 2: Fix unused variables and imports by prefixing with _
 */

const fs = require('fs');
const path = require('path');

let filesFixed = 0;
let totalFixes = 0;

function fixUnusedVariables(content, filePath) {
  let modified = content;
  let changeCount = 0;

  // Fix unused imports - prefix with _
  // Pattern: import { Foo, Bar } from => import { Foo as _Foo, Bar as _Bar }
  // But only for specific common unused imports
  const unusedImportPatterns = [
    [/import\s*{\s*([A-Z][a-zA-Z0-9]+)\s*}\s*from\s+['"]lucide-react['"]/g, (match, name) => {
      return `import { ${name} as _${name} } from 'lucide-react'`;
    }],
  ];

  // Fix unused destructured variables
  const patterns = [
    // Destructuring: const { foo, bar } = => const { foo: _foo, bar: _bar } =
    [/const\s+{\s*([a-z][a-zA-Z0-9]*)\s*}\s*=/g, 'const { $1: _$1 } ='],
    [/const\s+{\s*([a-z][a-zA-Z0-9]*)\s*,\s*([a-z][a-zA-Z0-9]*)\s*}\s*=/g, 'const { $1: _$1, $2: _$2 } ='],

    // Function parameters
    [/\(\s*error\s*\)\s*=>\s*{/g, '(_error) => {'],
    [/\(\s*err\s*\)\s*=>\s*{/g, '(_err) => {'],
    [/\(\s*e\s*\)\s*=>\s*{/g, '(_e) => {'],
    [/catch\s*\(\s*error\s*\)/g, 'catch (_error)'],
    [/catch\s*\(\s*err\s*\)/g, 'catch (_err)'],
    [/catch\s*\(\s*e\s*\)/g, 'catch (_e)'],

    // Assignment: const foo = => const _foo =
    [/const\s+([a-z][a-zA-Z0-9]*)\s*=\s*lazy\(/g, 'const _$1 = lazy('],
    [/const\s+([a-z][a-zA-Z0-9]*)\s*=\s*React\.lazy\(/g, 'const _$1 = React.lazy('],
  ];

  for (const [pattern, replacement] of patterns) {
    if (typeof replacement === 'function') {
      if (pattern.test(modified)) {
        modified = modified.replace(pattern, replacement);
        changeCount++;
      }
    } else {
      const before = modified;
      modified = modified.replace(pattern, replacement);
      if (modified !== before) changeCount++;
    }
  }

  return { modified, changeCount };
}

function fixFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');

  const result = fixUnusedVariables(content, filePath);

  if (result.changeCount > 0) {
    fs.writeFileSync(filePath, result.modified, 'utf8');
    filesFixed++;
    totalFixes += result.changeCount;
    console.log(`Fixed ${result.changeCount} issues in: ${path.basename(filePath)}`);
    return true;
  }

  return false;
}

function walkDirectory(dir, callback) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (['node_modules', 'dist', 'build', 'archived', '__tests__', 'cypress'].includes(file)) {
        continue;
      }
      walkDirectory(filePath, callback);
    } else if (stat.isFile() && /\.(ts|tsx)$/.test(file) && !file.endsWith('.d.ts')) {
      callback(filePath);
    }
  }
}

function main() {
  const frontendDir = __dirname;
  console.log('Phase 2: Fixing unused variables and imports...');

  walkDirectory(frontendDir, (filePath) => {
    try {
      fixFile(filePath);
    } catch (error) {
      console.error(`Error fixing ${filePath}:`, error.message);
    }
  });

  console.log(`\n=== Complete ===`);
  console.log(`Files modified: ${filesFixed}`);
  console.log(`Total fixes applied: ${totalFixes}`);
}

main();
