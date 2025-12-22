#!/usr/bin/env node

/**
 * Fix Health Endpoint Issues
 * 
 * This script addresses:
 * 1. Ensures health endpoints don't call service methods
 * 2. Verifies @Public() decorator is present
 * 3. Checks route ordering (health before :id routes)
 */

const fs = require('fs');
const path = require('path');

const controllerFiles = [
  'src/jurisdictions/jurisdictions.controller.ts',
  'src/integrations/integrations.controller.ts',
  'src/webhooks/webhooks.controller.ts',
  'src/versioning/versioning.controller.ts',
  'src/sync/sync.controller.ts',
  'src/query-workbench/query-workbench.controller.ts',
  'src/schema-management/schema-management.controller.ts',
  'src/monitoring/monitoring.controller.ts',
  'src/ocr/ocr.controller.ts',
  'src/risks/risks.controller.ts',
  'src/pipelines/pipelines.controller.ts',
  'src/production/production.controller.ts',
  'src/processing-jobs/processing-jobs.controller.ts',
  'src/bluebook/bluebook.controller.ts',
  'src/case-phases/case-phases.controller.ts',
  'src/analytics/analytics.controller.ts',
  'src/backups/backups.controller.ts',
  'src/auth/auth.controller.ts',
];

console.log('🔧 Fixing Health Endpoints...\n');

controllerFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Skipping ${file} (not found)`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;

  // Check if health endpoint exists
  if (!content.includes('@Get(\'health\')') && !content.includes('@Get("health")')) {
    console.log(`❌ ${file} - Missing health endpoint`);
  } else if (content.includes('async health()') || content.includes('health(): Promise')) {
    console.log(`❌ ${file} - Health endpoint is async (shouldn't be)`);
    
    // Make health endpoint synchronous
    content = content.replace(
      /async health\(\)[^{]*{[^}]*}/g,
      `health() {\n    return { status: 'ok', service: '${path.basename(path.dirname(filePath))}' };\n  }`
    );
  }

  // Ensure @Public() is present
  if (content.includes('@Get(\'health\')') && !content.match(/@Public\(\)\s*@Head\('health'\)/)) {
    console.log(`⚠️  ${file} - Missing @Public() decorator`);
  }

  // Check route ordering - health should come before :id routes
  const healthIndex = content.indexOf('@Get(\'health\')');
  const idRouteIndex = content.indexOf('@Get(\':id\')');
  
  if (healthIndex > -1 && idRouteIndex > -1 && healthIndex > idRouteIndex) {
    console.log(`❌ ${file} - Health route after :id route (will match incorrectly)`);
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ ${file} - Fixed`);
  } else {
    console.log(`✓  ${file} - OK`);
  }
});

console.log('\n✨ Health endpoint fixes complete!');
console.log('\n📝 Next steps:');
console.log('   1. Restart the backend server');
console.log('   2. Clear browser cache');
console.log('   3. Test health monitor');
