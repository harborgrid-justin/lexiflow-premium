#!/usr/bin/env node

/**
 * Automated ESLint Error Fixer
 * Fixes common ESLint patterns across the codebase
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fixes = [
  {
    name: 'Remove unused index parameter in map',
    pattern: /\.map\(([^,)]+),\s*i\)\s*=>/g,
    replacement: '.map($1) =>',
    test: (content, match) => {
      // Only fix if 'i' is not used in the callback
      const matchIndex = content.indexOf(match);
      if (matchIndex === -1) return false;
      const afterArrow = content.substring(matchIndex + match.length, matchIndex + match.length + 200);
      return !afterArrow.includes('i}') && !afterArrow.includes('i-') && !afterArrow.includes('i,') && !afterArrow.includes('i)') && !afterArrow.includes('i`');
    }
  },
  {
    name: 'Fix unused isPending in useTransition',
    pattern: /const\s*\[isPending,\s*startTransition\]/g,
    replacement: 'const [, startTransition]'
  },
  {
    name: 'Remove unused error parameter in catch',
    pattern: /catch\s*\(\s*error\s*\)\s*\{/g,
    replacement: (match) => match.replace('(error)', '()')
  },
  {
    name: 'Fix empty object pattern in function params',
    pattern: /export\s+async\s+function\s+loader\s*\(\s*\{\s*\}\s*\)/g,
    replacement: 'export async function loader()'
  },
  {
    name: 'Remove unused variables with underscore prefix',
    pattern: /const\s+(\w+)\s*=/g,
    replacement: (match, varName) => {
      // This is a placeholder - actual implementation would need context
      return match;
    }
  }
];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  const originalContent = content;

  fixes.forEach(fix => {
    const before = content;
    if (typeof fix.replacement === 'function') {
      if (fix.test) {
        const matches = [...content.matchAll(fix.pattern)];
        matches.forEach(match => {
          if (fix.test(content, match[0])) {
            content = content.replace(match[0], match[0].replace(fix.pattern, fix.replacement));
          }
        });
      } else {
        content = content.replace(fix.pattern, fix.replacement);
      }
    } else {
      content = content.replace(fix.pattern, fix.replacement);
    }
    
    if (before !== content) {
      modified = true;
      console.log(`  ✓ Applied: ${fix.name}`);
    }
  });

  if (modified && content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  return false;
}

function walkDir(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!file.includes('node_modules') && !file.includes('.git')) {
        walkDir(filePath, fileList);
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Main execution
const frontendDir = path.join(process.cwd(), 'frontend', 'src');
console.log('🔧 Starting automated ESLint fixes...\n');

if (!fs.existsSync(frontendDir)) {
  console.error(`Error: Directory not found: ${frontendDir}`);
  process.exit(1);
}

const files = walkDir(frontendDir);
let fixedCount = 0;

files.forEach(file => {
  const relativePath = path.relative(process.cwd(), file);
  if (processFile(file)) {
    fixedCount++;
    console.log(`📝 Modified: ${relativePath}\n`);
  }
});

console.log(`\n✅ Complete! Fixed ${fixedCount} files.`);
console.log('Run "npm run lint" to verify remaining issues.');