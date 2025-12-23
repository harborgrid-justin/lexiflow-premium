#!/usr/bin/env ts-node

/**
 * Comprehensive API Alignment Fix Script
 * Systematically identifies all real mismatches and generates fix recommendations
 */

import * as fs from 'fs';
import * as path from 'path';

// Read the critical mismatches
const mismatches = JSON.parse(
  fs.readFileSync('/home/user/lexiflow-premium/CRITICAL_MISMATCHES_DETAILED.json', 'utf-8')
);

// Group by base path (controller)
const byController = new Map<string, any[]>();

for (const mismatch of mismatches) {
  const parts = mismatch.endpoint.split('/').filter((p: string) => p);
  const controller = parts[0] || 'root';
  
  if (!byController.has(controller)) {
    byController.set(controller, []);
  }
  byController.get(controller)!.push(mismatch);
}

console.log('=== API MISMATCHES BY CONTROLLER ===\n');

const summary: any[] = [];

for (const [controller, items] of Array.from(byController.entries()).sort()) {
  const uniqueEndpoints = new Set(items.map(i => `${i.method} ${i.endpoint}`));
  
  console.log(`\n${controller.toUpperCase()} (${uniqueEndpoints.size} unique endpoints)`);
  console.log('─'.repeat(60));
  
  const endpointList: string[] = [];
  for (const endpoint of Array.from(uniqueEndpoints).slice(0, 10)) {
    console.log(`  ${endpoint}`);
    endpointList.push(endpoint);
  }
  
  if (uniqueEndpoints.size > 10) {
    console.log(`  ... and ${uniqueEndpoints.size - 10} more`);
  }
  
  summary.push({
    controller,
    count: uniqueEndpoints.size,
    endpoints: Array.from(uniqueEndpoints),
    frontendFile: items[0].frontendFile
  });
}

// Save detailed summary
fs.writeFileSync(
  '/home/user/lexiflow-premium/API_MISMATCHES_BY_CONTROLLER.json',
  JSON.stringify(summary, null, 2)
);

console.log('\n\n=== SUMMARY ===');
console.log(`Total Controllers with Issues: ${byController.size}`);
console.log(`\nTop 10 Controllers by Mismatch Count:`);

summary
  .sort((a, b) => b.count - a.count)
  .slice(0, 10)
  .forEach((item, idx) => {
    console.log(`${idx + 1}. ${item.controller}: ${item.count} mismatches`);
  });

console.log('\n\nDetailed report saved to: API_MISMATCHES_BY_CONTROLLER.json');
