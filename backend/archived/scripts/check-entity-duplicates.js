/**
 * COMPREHENSIVE ENTITY DUPLICATION AND ISSUES CHECKER
 * Finds all duplicate entities, missing decorators, and schema conflicts
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// ANSI color codes
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const GREEN = '\x1b[32m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';

console.log(`${BLUE}==================================================${RESET}`);
console.log(`${BLUE}   COMPREHENSIVE ENTITY VALIDATION CHECK${RESET}`);
console.log(`${BLUE}==================================================${RESET}\n`);

// Find all entity files
const entityFiles = glob.sync('src/**/*.entity.ts', { cwd: __dirname + '/..' });

console.log(`Found ${entityFiles.length} entity files\n`);

// Store results
const entities = new Map(); // tableName -> [filePaths]
const issues = [];
const warnings = [];

// Parse each entity file
entityFiles.forEach(filePath => {
  const fullPath = path.join(__dirname, '..', filePath);
  const content = fs.readFileSync(fullPath, 'utf8');
  
  // Extract @Entity decorator with table name
  const entityMatch = content.match(/@Entity\(['"`]([^'"`]+)['"`]\)/);
  
  if (entityMatch) {
    const tableName = entityMatch[1];
    
    // Store entity mapping
    if (!entities.has(tableName)) {
      entities.set(tableName, []);
    }
    entities.get(tableName).push(filePath);
    
    // Check for class definition
    const classMatch = content.match(/export\s+class\s+(\w+)/);
    const className = classMatch ? classMatch[1] : 'UNKNOWN';
    
    // Check if extends BaseEntity or other base class
    const extendsBase = content.includes('extends BaseEntity') || 
                        content.includes('extends TimestampedEntity') ||
                        content.includes('extends AuditableEntity');
    
    // Check for missing @PrimaryGeneratedColumn (skip if extends base class)
    if (!extendsBase && !content.includes('@PrimaryGeneratedColumn') && !content.includes('@PrimaryColumn')) {
      warnings.push({
        type: 'NO_PRIMARY_KEY',
        file: filePath,
        table: tableName,
        class: className,
        message: 'No @PrimaryGeneratedColumn or @PrimaryColumn found (and does not extend base class)'
      });
    }
    
    // Check for missing timestamps (skip if extends base class)
    if (!extendsBase && !content.includes('@CreateDateColumn') && !content.includes('createdAt')) {
      warnings.push({
        type: 'NO_CREATED_AT',
        file: filePath,
        table: tableName,
        class: className,
        message: 'No @CreateDateColumn or createdAt field found (and does not extend base class)'
      });
    }
    
    // Check for camelCase column names (should use snake_case with SnakeNamingStrategy)
    const columnMatches = content.matchAll(/@Column\(\{[^}]*name:\s*['"`]([^'"`]+)['"`]/g);
    for (const match of columnMatches) {
      const columnName = match[1];
      if (columnName.includes('_') === false && columnName.toLowerCase() !== columnName) {
        // Has uppercase but no underscores - might be camelCase
        warnings.push({
          type: 'POSSIBLE_CAMELCASE',
          file: filePath,
          table: tableName,
          class: className,
          column: columnName,
          message: `Column '${columnName}' might be camelCase (should be snake_case with SnakeNamingStrategy)`
        });
      }
    }
  } else {
    // File named *.entity.ts but no @Entity decorator
    // Skip base classes and shared types
    const isBaseClass = filePath.includes('/base/') || 
                        filePath.includes('\\base\\') ||
                        filePath.includes('/shared-types/') ||
                        filePath.includes('\\shared-types\\') ||
                        content.includes('export abstract class');
    
    if (!isBaseClass) {
      warnings.push({
        type: 'NO_ENTITY_DECORATOR',
        file: filePath,
        message: 'File named *.entity.ts but no @Entity decorator found'
      });
    }
  }
});

// Find duplicates
console.log(`${BLUE}CHECKING FOR DUPLICATE ENTITIES...${RESET}\n`);

let duplicatesFound = false;
entities.forEach((files, tableName) => {
  if (files.length > 1) {
    duplicatesFound = true;
    issues.push({
      type: 'DUPLICATE_ENTITY',
      table: tableName,
      files: files,
      count: files.length
    });
    
    console.log(`${RED}❌ DUPLICATE ENTITY FOR TABLE: '${tableName}'${RESET}`);
    console.log(`${RED}   Found ${files.length} entity definitions:${RESET}`);
    files.forEach((file, index) => {
      console.log(`${RED}   ${index + 1}. ${file}${RESET}`);
    });
    console.log('');
  }
});

if (!duplicatesFound) {
  console.log(`${GREEN}✅ No duplicate entities found${RESET}\n`);
}

// Report warnings
if (warnings.length > 0) {
  console.log(`${YELLOW}⚠️  FOUND ${warnings.length} WARNINGS:${RESET}\n`);
  
  // Group by type
  const byType = {};
  warnings.forEach(w => {
    if (!byType[w.type]) byType[w.type] = [];
    byType[w.type].push(w);
  });
  
  Object.keys(byType).forEach(type => {
    const items = byType[type];
    console.log(`${YELLOW}${type} (${items.length} occurrences):${RESET}`);
    items.slice(0, 5).forEach(item => {
      console.log(`  - ${item.file}`);
      if (item.message) console.log(`    ${item.message}`);
      if (item.column) console.log(`    Column: ${item.column}`);
    });
    if (items.length > 5) {
      console.log(`  ... and ${items.length - 5} more`);
    }
    console.log('');
  });
} else {
  console.log(`${GREEN}✅ No warnings found${RESET}\n`);
}

// Summary
console.log(`${BLUE}==================================================${RESET}`);
console.log(`${BLUE}   SUMMARY${RESET}`);
console.log(`${BLUE}==================================================${RESET}`);
console.log(`Total entity files scanned: ${entityFiles.length}`);
console.log(`Unique tables found: ${entities.size}`);
console.log(`${RED}Critical issues (duplicates): ${issues.length}${RESET}`);
console.log(`${YELLOW}Warnings: ${warnings.length}${RESET}`);
console.log(`${BLUE}==================================================${RESET}\n`);

// Exit with error if duplicates found
if (issues.length > 0) {
  console.log(`${RED}❌ CRITICAL: Found ${issues.length} duplicate entity definition(s)${RESET}`);
  console.log(`${RED}   This will cause TypeORM synchronization to fail!${RESET}`);
  console.log(`${RED}   Delete or rename the duplicate entity files above.${RESET}\n`);
  process.exit(1);
}

console.log(`${GREEN}✅ Entity validation check passed!${RESET}\n`);
process.exit(0);
