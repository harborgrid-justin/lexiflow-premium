const fs = require('fs');
const path = require('path');

function findPageFiles(dir) {
  let files = [];
  try {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        files = files.concat(findPageFiles(fullPath));
      } else if (item === 'page.tsx') {
        files.push(fullPath);
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error.message);
  }
  return files;
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // 1. Remove unused PageProps
  if (content.includes('interface PageProps')) {
    const matches = content.match(/PageProps/g);
    if (matches && matches.length === 1) {
      const regex = /interface PageProps\s*\{[^}]*\}/;
      if (regex.test(content)) {
        content = content.replace(regex, '');
        content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
        changed = true;
        console.log(`Removed unused PageProps from ${filePath}`);
      }
    }
  }

  // 2. Fix JSX namespace
  if (content.includes('Promise<JSX.Element>')) {
    content = content.replace(/Promise<JSX\.Element>/g, 'Promise<React.JSX.Element>');
    changed = true;
    
    if (!content.includes('import React') && !content.includes('import * as React')) {
      if (content.includes('import ')) {
        content = content.replace(/import /, "import React from 'react';\nimport ");
      } else {
        content = "import React from 'react';\n" + content;
      }
    }
    console.log(`Fixed JSX namespace in ${filePath}`);
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
}

const mainDir = path.join(__dirname, '../src/app/(main)');
const files = findPageFiles(mainDir);
files.forEach(processFile);
