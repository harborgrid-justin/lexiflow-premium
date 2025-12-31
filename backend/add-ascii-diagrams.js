#!/usr/bin/env node

/**
 * Script to add ASCII diagrams to all service files in the backend
 * This will add contextual flow diagrams showing data in/out for each service
 */

const fs = require('fs');
const path = require('path');

// Service configurations - maps service patterns to diagram templates
const serviceConfigs = {
  // Common services
  'file-storage.service.ts': {
    title: 'FILE STORAGE SERVICE - FILE UPLOAD & STORAGE MANAGEMENT',
    inputs: ['File buffer/stream, metadata, filePath'],
    outputs: ['Stored file path, file metadata, file URL'],
    features: ['Local filesystem storage', 'Cloud storage (S3-compatible)', 'File validation', 'Metadata extraction']
  },
  'docket.service.ts': {
    title: 'DOCKET SERVICE - COURT DOCKET ENTRY MANAGEMENT',
    inputs: ['DocketEntryDto { caseId, entryNumber, description, filingDate, document }'],
    outputs: ['DocketEntry { id, entryNumber, description, documents[], parties[] }'],
    features: ['PACER integration', 'Docket parsing', 'Entry tracking', 'Document linking']
  },
  'compliance.service.ts': {
    title: 'COMPLIANCE SERVICE - REGULATORY COMPLIANCE & AUDIT',
    inputs: ['ComplianceCheckDto, PolicyRuleDto, AuditRequestDto'],
    outputs: ['ComplianceReport, Violations[], RemediationSteps[]'],
    features: ['Conflict checks', 'Ethical walls', 'Data retention', 'GDPR compliance']
  },
  'workflow.service.ts': {
    title: 'WORKFLOW SERVICE - AUTOMATED WORKFLOW & TASK MANAGEMENT',
    inputs: ['WorkflowDefinitionDto, ExecuteWorkflowDto, TaskDto'],
    outputs: ['WorkflowExecution, TaskList, CompletionStatus'],
    features: ['Workflow templates', 'Task automation', 'Conditional logic', 'Notifications']
  },
  'search.service.ts': {
    title: 'SEARCH SERVICE - FULL-TEXT SEARCH & INDEXING',
    inputs: ['SearchQueryDto { query, filters, pagination, facets }'],
    outputs: ['SearchResults { hits[], total, facets{}, aggregations{} }'],
    features: ['Full-text search', 'Faceted search', 'Fuzzy matching', 'Ranking']
  },
  'analytics.service.ts': {
    title: 'ANALYTICS SERVICE - BUSINESS INTELLIGENCE & METRICS',
    inputs: ['MetricsQuery { dateRange, dimensions[], metrics[] }'],
    outputs: ['AnalyticsData { series[], aggregations{}, trends[] }'],
    features: ['KPI dashboards', 'Trend analysis', 'Predictive analytics', 'Data visualization']
  },
  'communications.service.ts': {
    title: 'COMMUNICATIONS SERVICE - MESSAGING & NOTIFICATIONS',
    inputs: ['MessageDto, NotificationDto, EmailDto, SMSDto'],
    outputs: ['DeliveryStatus, MessageHistory, Recipients[]'],
    features: ['Email delivery', 'SMS notifications', 'In-app messaging', 'Template rendering']
  },
  'backup.service.ts': {
    title: 'BACKUP SERVICE - DATA BACKUP & RESTORE',
    inputs: ['BackupRequestDto, RestoreRequestDto, ScheduleDto'],
    outputs: ['BackupRecord, RestoreResult, BackupStatus'],
    features: ['Automated backups', 'Point-in-time recovery', 'Incremental backups', 'Cloud storage']
  }
};

function generateASCIIDiagram(serviceName, config) {
  const title = config?.title || serviceName.toUpperCase().replace(/-/g, ' ');
  const inputs = config?.inputs || ['Data input'];
  const outputs = config?.outputs || ['Data output'];
  const features = config?.features || [];

  return `/**
 * \u2554${'='.repeat(113)}\u2557
 * \u2551${title.padEnd(113)}\u2551
 * \u2560${'='.repeat(113)}\u2563
 * \u2551${' '.repeat(113)}\u2551
 * \u2551  External Request                   Controller                            Service${' '.repeat(32)}\u2551
 * \u2551       \u2502                                   \u2502                                     \u2502${' '.repeat(32)}\u2551
 * \u2551       \u2502  HTTP Endpoints                  \u2502                                     \u2502${' '.repeat(32)}\u2551
 * \u2551       \u2514${'─'.repeat(35)}\u25ba${' '.repeat(37)}\u2502${' '.repeat(32)}\u2551
 * \u2551${' '.repeat(113)}\u2551
 * \u2551                                                                 \u250c${'─'.repeat(15)}\u2534${'─'.repeat(15)}\u2510${' '.repeat(16)}\u2551
 * \u2551                                                                 \u2502${' '.repeat(31)}\u2502${' '.repeat(16)}\u2551
 * \u2551                                                                 \u25bc${' '.repeat(31)}\u25bc${' '.repeat(16)}\u2551
 * \u2551                                                          Repository${' '.repeat(20)}Database${' '.repeat(16)}\u2551
 * \u2551                                                                 \u2502${' '.repeat(31)}\u2502${' '.repeat(16)}\u2551
 * \u2551                                                                 \u25bc${' '.repeat(31)}\u25bc${' '.repeat(16)}\u2551
 * \u2551                                                          PostgreSQL${' '.repeat(42)}\u2551
 * \u2551${' '.repeat(113)}\u2551
 * \u2551  DATA IN:  ${inputs[0] ? inputs[0].padEnd(99) : ' '.padEnd(99)}\u2551
${inputs.slice(1).map(i => ` * \u2551            ${i.padEnd(99)}\u2551`).join('\n')}
 * \u2551${' '.repeat(113)}\u2551
 * \u2551  DATA OUT: ${outputs[0] ? outputs[0].padEnd(99) : ' '.padEnd(99)}\u2551
${outputs.slice(1).map(o => ` * \u2551            ${o.padEnd(99)}\u2551`).join('\n')}
 * \u2551${' '.repeat(113)}\u2551
${features.length > 0 ? ` * \u2551  FEATURES: ${features.map((f, i) => i === 0 ? `\u2022 ${f}` : `            \u2022 ${f}`).join(' '.repeat(99 - features[0].length - 12) + '\u2551\n * \u2551')}\u2551\n` : ''}
 * \u255a${'='.repeat(113)}\u255d
 */

`;
}

function addDiagramToFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath);

    // Skip if diagram already exists
    if (content.includes('\u2554═══') || content.includes('ASCII') || content.includes('\u2560═══')) {
      console.log(`  ✓ ${fileName} - already has diagram`);
      return { skipped: true };
    }

    // Find the @Injectable decorator
    const injectableRegex = /@Injectable\(\)\s*export\s+class\s+(\w+)/;
    const match = content.match(injectableRegex);

    if (!match) {
      console.log(`  ⚠ ${fileName} - no @Injectable found`);
      return { skipped: true };
    }

    const className = match[1];
    const serviceName = className.replace('Service', '');

    // Get config or use default
    const config = serviceConfigs[fileName];
    const diagram = generateASCIIDiagram(serviceName, config);

    // Insert diagram before @Injectable
    const newContent = content.replace(injectableRegex, `${diagram}$&`);

    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`  ✓ ${fileName} - diagram added`);
    return { added: true };

  } catch (error) {
    console.error(`  ✗ ${path.basename(filePath)} - error:`, error.message);
    return { error: true };
  }
}

function findServiceFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      findServiceFiles(filePath, fileList);
    } else if (file.endsWith('.service.ts') && !file.includes('.spec.')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

async function main() {
  const srcDir = path.join(__dirname, 'src');
  console.log('Finding service files...\n');

  const serviceFiles = findServiceFiles(srcDir);
  console.log(`Found ${serviceFiles.length} service files\n`);

  const stats = { added: 0, skipped: 0, errors: 0 };

  for (const filePath of serviceFiles) {
    const result = addDiagramToFile(filePath);
    if (result.added) stats.added++;
    if (result.skipped) stats.skipped++;
    if (result.error) stats.errors++;
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log(`Summary:`);
  console.log(`  Diagrams added: ${stats.added}`);
  console.log(`  Skipped (already has diagram): ${stats.skipped}`);
  console.log(`  Errors: ${stats.errors}`);
  console.log(`${'='.repeat(50)}\n`);
}

main().catch(console.error);
