// Fix remaining import issues for all controllers
const fs = require('fs');
const path = require('path');

// Files that need ApiResponse added to import
const filesToFix = [
  'src/jurisdictions/jurisdictions.controller.ts',
  'src/ocr/ocr.controller.ts',
  'src/organizations/organizations.controller.ts',
  'src/pleadings/pleadings.controller.ts',
  'src/processing-jobs/processing-jobs.controller.ts',
  'src/risks/risks.controller.ts',
  'src/tasks/tasks.controller.ts',
  'src/webhooks/webhooks.controller.ts',
];

filesToFix.forEach(filePath => {
  const fullPath = path.join(__dirname, '..', filePath);
  
  try {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Check if file needs fixing (has @ApiResponse but not in import)
    if (content.includes('@ApiResponse') && !content.includes('ApiResponse') && content.includes("from '@nestjs/swagger'")) {
      // Find the swagger import line and add ApiResponse
      content = content.replace(
        /(import\s+{[^}]+)(}\s+from\s+['"]@nestjs\/swagger['"];)/,
        '$1, ApiResponse$2'
      );
      
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✓ Fixed: ${filePath}`);
    } else if (content.includes('@ApiResponse') && !content.includes("from '@nestjs/swagger'")) {
      console.log(`⚠ Needs manual fix: ${filePath} - missing swagger import entirely`);
    } else {
      console.log(`✓ Already correct: ${filePath}`);
    }
  } catch (error) {
    console.error(`✗ Error processing ${filePath}:`, error.message);
  }
});

console.log('\nDone!');
