/**
 * Utility script to add missing @ApiResponse decorators to all controllers
 * Adds common error responses: 400, 401, 403, 404, 409, 500
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { readdirSync, statSync } from 'fs';

// Recursively find all controller files
function findControllerFiles(dir: string): string[] {
  let results: string[] = [];
  const list = readdirSync(dir);
  
  list.forEach(file => {
    const filePath = join(dir, file);
    const stat = statSync(filePath);
    
    if (stat && stat.isDirectory()) {
      results = results.concat(findControllerFiles(filePath));
    } else if (file.endsWith('.controller.ts')) {
      results.push(filePath);
    }
  });
  
  return results;
}

// Check if endpoint already has specific error response
function hasErrorResponse(decoratorBlock: string, statusCode: number): boolean {
  const regex = new RegExp(`@ApiResponse\\s*\\(\\s*{[^}]*status:\\s*${statusCode}`, 'g');
  return regex.test(decoratorBlock);
}

// Add missing error responses to controller methods
function addMissingApiResponses(content: string): string {
  // Split content into lines for processing
  const lines = content.split('\n');
  const result: string[] = [];
  let i = 0;
  
  // Check if file already imports ApiResponse
  const hasApiResponseImport = content.includes('@nestjs/swagger');
  
  while (i < lines.length) {
    const line = lines[i];
    
    // Check if this is an endpoint decorator
    const isHttpMethod = /^\s*@(Get|Post|Put|Patch|Delete)\(/.test(line);
    
    if (isHttpMethod) {
      // Collect all decorators until we hit the method definition
      const decoratorBlock: string[] = [line];
      let j = i + 1;
      
      while (j < lines.length && !/^\s*async /.test(lines[j]) && !/^\s*\w+\s*\(/.test(lines[j])) {
        decoratorBlock.push(lines[j]);
        j++;
      }
      
      const blockText = decoratorBlock.join('\n');
      const httpMethod = line.match(/@(Get|Post|Put|Patch|Delete)/)?.[1];
      const hasIdParam = blockText.includes(':id');
      const indent = line.match(/^\s*/)?.[0] || '  ';
      
      // Determine which error responses should be added
      const responses: Array<{ status: number; description: string }> = [];
      
      // 400 Bad Request - for POST/PUT/PATCH with body validation
      if (['Post', 'Put', 'Patch'].includes(httpMethod!) && !hasErrorResponse(blockText, 400)) {
        responses.push({ status: 400, description: 'Invalid request data' });
      }
      
      // 401 Unauthorized - for all protected endpoints (skip if @Public)
      if (!blockText.includes('@Public') && !hasErrorResponse(blockText, 401)) {
        responses.push({ status: 401, description: 'Unauthorized' });
      }
      
      // 403 Forbidden - for endpoints that might have permission checks
      if (!blockText.includes('@Public') && !hasErrorResponse(blockText, 403)) {
        responses.push({ status: 403, description: 'Forbidden' });
      }
      
      // 404 Not Found - for endpoints with :id parameter
      if (hasIdParam && !hasErrorResponse(blockText, 404)) {
        responses.push({ status: 404, description: 'Resource not found' });
      }
      
      // 409 Conflict - for POST endpoints that might create duplicates
      if (httpMethod === 'Post' && !hasErrorResponse(blockText, 409)) {
        responses.push({ status: 409, description: 'Resource already exists' });
      }
      
      // Add original decorators
      result.push(...decoratorBlock);
      
      // Add new @ApiResponse decorators before the method
      responses.forEach(({ status, description }) => {
        result.push(`${indent}@ApiResponse({ status: ${status}, description: '${description}' })`);
      });
      
      // Skip to method definition
      i = j;
      continue;
    }
    
    result.push(line);
    i++;
  }
  
  return result.join('\n');
}

// Process all controllers
const srcDir = join(__dirname, '..', 'src');
const controllers = findControllerFiles(srcDir);

console.log(`Found ${controllers.length} controller files`);

let processedCount = 0;
let errorCount = 0;

controllers.forEach(filePath => {
  try {
    const originalContent = readFileSync(filePath, 'utf8');
    const updatedContent = addMissingApiResponses(originalContent);
    
    // Only write if content changed
    if (originalContent !== updatedContent) {
      writeFileSync(filePath, updatedContent, 'utf8');
      processedCount++;
      console.log(`✓ Updated: ${filePath.replace(srcDir, '')}`);
    }
  } catch (error) {
    errorCount++;
    console.error(`✗ Error processing ${filePath}:`, error.message);
  }
});

console.log(`\nProcessed: ${processedCount} files`);
console.log(`Errors: ${errorCount} files`);
console.log('Done!');
