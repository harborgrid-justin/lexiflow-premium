/**
 * Service Layer Batch Refactoring Script
 * Automatically applies architectural fixes to all service files
 * 
 * Run with: ts-node scripts/refactor-services.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

// Domain error mappings
const ERROR_MAPPINGS: Record<string, { errorClass: string; context?: string }> = {
  'not found': { errorClass: 'EntityNotFoundError' },
  'Case not found': { errorClass: 'CaseNotFoundError' },
  'User not found': { errorClass: 'UserNotFoundError' },
  'Document not found': { errorClass: 'DocumentNotFoundError' },
  'Client not found': { errorClass: 'ClientNotFoundError' },
  'Invoice not found': { errorClass: 'InvoiceNotFoundError' },
  'Clause not found': { errorClass: 'EntityNotFoundError' },
  'Invalid': { errorClass: 'ValidationError' },
  'must be': { errorClass: 'ValidationError' },
  'required': { errorClass: 'MissingRequiredFieldError' },
  'Failed to': { errorClass: 'OperationError' },
  'timeout': { errorClass: 'ApiTimeoutError' },
  'API key not configured': { errorClass: 'MissingConfigurationError' },
  'No response text': { errorClass: 'ExternalServiceError' },
  'XML parsing error': { errorClass: 'FileProcessingError' },
  'Worker': { errorClass: 'WorkerPoolInitializationError' },
  'Workflow': { errorClass: 'WorkflowExecutionError' },
};

// Browser API replacements
const BROWSER_API_FIXES = [
  {
    pattern: /localStorage\.getItem\((.*?)\)/g,
    replacement: 'defaultStorage.getItem($1)',
    import: "import { defaultStorage } from '@/services';"
  },
  {
    pattern: /localStorage\.setItem\((.*?),\s*(.*?)\)/g,
    replacement: 'defaultStorage.setItem($1, $2)',
    import: "import { defaultStorage } from '@/services';"
  },
  {
    pattern: /localStorage\.removeItem\((.*?)\)/g,
    replacement: 'defaultStorage.removeItem($1)',
    import: "import { defaultStorage } from '@/services';"
  },
  {
    pattern: /window\.setInterval\((.*?),\s*(.*?)\)/g,
    replacement: 'defaultWindowAdapter.setInterval($1, $2)',
    import: "import { defaultWindowAdapter } from '@/services';"
  },
  {
    pattern: /window\.setTimeout\((.*?),\s*(.*?)\)/g,
    replacement: 'defaultWindowAdapter.setTimeout($1, $2)',
    import: "import { defaultWindowAdapter } from '@/services';"
  },
  {
    pattern: /window\.addEventListener\((.*?),\s*(.*?)\)/g,
    replacement: 'defaultWindowAdapter.addEventListener($1, $2 as EventListener)',
    import: "import { defaultWindowAdapter } from '@/services';"
  }
];

async function processFile(filePath: string): Promise<{ file: string; changes: number }> {
  let content = fs.readFileSync(filePath, 'utf-8');
  let changes = 0;
  
  // Add imports if needed
  const needsErrorImport = content.includes('throw new Error');
  const needsStorageImport = /localStorage\./g.test(content);
  const needsWindowImport = /window\.(setInterval|setTimeout|addEventListener)/g.test(content);
  
  if (needsErrorImport || needsStorageImport || needsWindowImport) {
    const imports = [];
    
    if (needsErrorImport) {
      imports.push(
        "import { ValidationError, OperationError, EntityNotFoundError, MissingConfigurationError, FileProcessingError, WorkflowExecutionError, WorkerPoolInitializationError, ExternalServiceError, ApiTimeoutError } from '@/services/core/errors';"
      );
    }
    
    if (needsStorageImport) {
      imports.push("import { defaultStorage } from '@/services';");
    }
    
    if (needsWindowImport) {
      imports.push("import { defaultWindowAdapter } from '@/services';");
    }
    
    // Insert after last import
    const lastImportIndex = content.lastIndexOf('import ');
    if (lastImportIndex !== -1) {
      const endOfLine = content.indexOf('\n', lastImportIndex);
      content = content.slice(0, endOfLine + 1) + imports.join('\n') + '\n' + content.slice(endOfLine + 1);
      changes++;
    }
  }
  
  // Replace throw new Error with domain errors
  const errorMatches = content.matchAll(/throw new Error\((.*?)\);/gs);
  for (const match of errorMatches) {
    const errorMessage = match[1];
    let replacement = match[0];
    
    // Find best matching error class
    for (const [keyword, { errorClass }] of Object.entries(ERROR_MAPPINGS)) {
      if (errorMessage.toLowerCase().includes(keyword.toLowerCase())) {
        // Extract ID or context if present
        const idMatch = errorMessage.match(/[`'"](.*?)[`'"]/);
        if (idMatch && errorClass.includes('NotFoundError')) {
          replacement = `throw new ${errorClass}(${idMatch[1]});`;
        } else {
          replacement = `throw new ${errorClass}(${errorMessage});`;
        }
        break;
      }
    }
    
    content = content.replace(match[0], replacement);
    changes++;
  }
  
  // Replace browser APIs
  for (const { pattern, replacement } of BROWSER_API_FIXES) {
    const matches = content.match(pattern);
    if (matches) {
      content = content.replace(pattern, replacement);
      changes += matches.length;
    }
  }
  
  if (changes > 0) {
    fs.writeFileSync(filePath, content, 'utf-8');
  }
  
  return { file: path.relative(process.cwd(), filePath), changes };
}

async function main() {
  console.log('🔧 Starting service layer batch refactoring...\n');
  
  const serviceFiles = await glob('frontend/src/services/**/*.ts', {
    ignore: [
      '**/node_modules/**',
      '**/*.spec.ts',
      '**/*.test.ts',
      '**/adapters/**', // Already refactored
      '**/core/errors.ts' // Already refactored
    ]
  });
  
  console.log(`📁 Found ${serviceFiles.length} service files to process\n`);
  
  const results = await Promise.all(serviceFiles.map(processFile));
  
  const totalChanges = results.reduce((sum, r) => sum + r.changes, 0);
  const filesChanged = results.filter(r => r.changes > 0).length;
  
  console.log('\n✅ Refactoring complete!\n');
  console.log(`📊 Summary:`);
  console.log(`   Files processed: ${serviceFiles.length}`);
  console.log(`   Files changed: ${filesChanged}`);
  console.log(`   Total changes: ${totalChanges}`);
  
  console.log('\n📋 Files with changes:');
  results
    .filter(r => r.changes > 0)
    .forEach(r => console.log(`   ${r.file}: ${r.changes} changes`));
}

main().catch(console.error);
