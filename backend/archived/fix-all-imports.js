// Comprehensive fix for ALL ApiResponse import issues
const fs = require('fs');
const path = require('path');

function getAllControllers(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      getAllControllers(filePath, fileList);
    } else if (file.endsWith('.controller.ts')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

const srcDir = path.join(__dirname, '..', 'src');
const controllers = getAllControllers(srcDir);

let fixed = 0;
let skipped = 0;

controllers.forEach(filePath => {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Check if file uses @ApiResponse decorator
  if (!content.includes('@ApiResponse')) {
    skipped++;
    return;
  }
  
  // Check if ApiResponse is already imported
  const hasApiResponseImport = /ApiResponse[,\s}]/.test(content);
  const hasSwaggerImport = content.includes("from '@nestjs/swagger'");
  
  if (hasApiResponseImport) {
    skipped++;
    return; // Already correct
  }
  
  if (!hasSwaggerImport) {
    console.error(`ERROR: ${filePath} - Uses @ApiResponse but has no swagger import`);
    return;
  }
  
  // Find and fix the swagger import line
  const updated = content.replace(
    /(import\s+{[^}]+)(}\s+from\s+['"]@nestjs\/swagger['"];?)/,
    (match, p1, p2) => {
      // Check if already has ApiResponse (safety check)
      if (p1.includes('ApiResponse')) {
        return match;
      }
      // Add ApiResponse before the closing brace
      return `${p1}, ApiResponse${p2}`;
    }
  );
  
  if (updated === content) {
    console.error(`FAILED: ${filePath} - Could not update import`);
    return;
  }
  
  fs.writeFileSync(filePath, updated, 'utf8');
  fixed++;
  console.log(`✓ Fixed: ${path.relative(srcDir, filePath)}`);
});

console.log(`\n✓ Fixed: ${fixed} files`);
console.log(`- Skipped: ${skipped} files (already correct or no @ApiResponse usage)`);
