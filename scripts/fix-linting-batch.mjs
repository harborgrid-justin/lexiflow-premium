#!/usr/bin/env node
/**
 * Batch fix all linting errors
 * Run with: node scripts/fix-linting-batch.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// All the file-specific fixes mapped to their issues
const fileFixes = {
  'frontend/src/routes/_shared/types.ts': [
    { from: /, ReactNode/, to: '' },
    { from: /import \{ ReactNode \} from 'react';\n/, to: '' },
  ],
  'frontend/src/routes/admin/audit.tsx': [
    { from: /export function loader\(\s*\{\s*\}\s*:\s*LoaderFunctionArgs\)/g, to: 'export function loader(_args: LoaderFunctionArgs)' },
    { from: /const filter =/g, to: 'const _filter =' },
    { from: /const searchParams =/g, to: 'const _searchParams =' },
    { from: /const setSearchParams =/g, to: 'const _setSearchParams =' },
  ],
  'frontend/src/routes/admin/backup.tsx': [
    { from: /export function loader\(\s*\{\s*\}\s*:\s*LoaderFunctionArgs\)/g, to: 'export function loader(_args: LoaderFunctionArgs)' },
    { from: /const scheduleId =/g, to: 'const _scheduleId =' },
    { from: /const formId =/g, to: 'const _formId =' },
  ],
  'frontend/src/routes/admin/integrations.tsx': [
    { from: /export function loader\(\s*\{\s*\}\s*:\s*LoaderFunctionArgs\)/g, to: 'export function loader(_args: LoaderFunctionArgs)' },
    { from: /const formId =/g, to: 'const _formId =' },
  ],
  'frontend/src/routes/admin/settings.tsx': [
    { from: /export function loader\(\s*\{\s*\}\s*:\s*LoaderFunctionArgs\)/g, to: 'export function loader(_args: LoaderFunctionArgs)' },
  ],
  'frontend/src/routes/audit/index.tsx': [
    { from: /import \{ Link, /g, to: 'import { ' },
    { from: /, Filter,/g, to: ',' },
    { from: /, FileText/g, to: '' },
  ],
  'frontend/src/routes/auth/login-enhanced.tsx': [
    { from: /const mfaRequired =/g, to: 'const _mfaRequired =' },
  ],
  'frontend/src/routes/billing/expenses.tsx': [
    { from: /const error =/g, to: 'const _error =' },
  ],
  'frontend/src/routes/billing/invoices.$id.tsx': [
    { from: /const error =/g, to: 'const _error =' },
  ],
  'frontend/src/routes/billing/invoices.tsx': [
    { from: /const error =/g, to: 'const _error =' },
  ],
  'frontend/src/routes/billing/rates.tsx': [
    { from: /const rateTables =/g, to: 'const _rateTables =' },
  ],
  'frontend/src/routes/billing/time.tsx': [
    { from: /const error =/g, to: 'const _error =' },
  ],
  'frontend/src/routes/billing/trust.tsx': [
    { from: /const error =/g, to: 'const _error =' },
    { from: /const accounts =/g, to: 'const _accounts =' },
    { from: /, filters\)/g, to: ')' },
  ],
  'frontend/src/routes/calendar/index.tsx': [
    { from: /\(data: DashboardData\)/g, to: '(_data: DashboardData)' },
  ],
  'frontend/src/routes/cases/case-detail.tsx': [
    { from: /import \{ Link, /g, to: 'import { ' },
    { from: /, RouteLoading,/g, to: ',' },
    { from: /, throwNotFound/g, to: '' },
    { from: /const error =/g, to: 'const _error =' },
  ],
  'frontend/src/routes/cases/create.tsx': [
    { from: /\(loaderData: LoaderData\)/g, to: '(_loaderData: LoaderData)' },
  ],
  'frontend/src/routes/cases/documents.tsx': [
    { from: /import \{ Suspense, /g, to: 'import { ' },
    { from: /, Link/g, to: '' },
  ],
  'frontend/src/routes/crm/index.tsx': [
    { from: /const clients =/g, to: 'const _clients =' },
  ],
  'frontend/src/routes/dashboard.tsx': [
    { from: /export function loader\(\s*\{\s*\}\s*:\s*LoaderFunctionArgs\)/g, to: 'export function loader(_args: LoaderFunctionArgs)' },
  ],
  'frontend/src/routes/discovery/index.tsx': [
    { from: /import \{ Link, /g, to: 'import { ' },
  ],
  'frontend/src/routes/documents/index.tsx': [
    { from: /const totalCount =/g, to: 'const _totalCount =' },
  ],
  'frontend/src/routes/drafting/index.tsx': [
    { from: /export function loader\(\s*\{\s*\}\s*:\s*LoaderFunctionArgs\)/g, to: 'export function loader(_args: LoaderFunctionArgs)' },
  ],
  'frontend/src/routes/home.tsx': [
    { from: /const \{ metrics, recentCases, upcomingTasks \} =/g, to: 'const { metrics: _metrics, recentCases: _recentCases, upcomingTasks: _upcomingTasks } =' },
  ],
  'frontend/src/routes/layout.tsx': [
    { from: /export function loader\(\s*\{\s*\}\s*:\s*LoaderFunctionArgs\)/g, to: 'export function loader(_args: LoaderFunctionArgs)' },
  ],
  'frontend/src/routes/litigation/builder.tsx': [
    { from: /interface Milestone/g, to: 'interface _Milestone' },
    { from: /interface RiskFactor/g, to: 'interface _RiskFactor' },
    { from: /const \{ caseId \} =/g, to: 'const { caseId: _caseId } =' },
  ],
  'frontend/src/routes/workflows/detail.tsx': [
    { from: /import \{ useLoaderData, /g, to: 'import { ' },
    { from: /, Link,/g, to: ',' },
    { from: /import \{ RouteErrorBoundary, NotFoundError \} from '@\/components\/shared\/routing';\n/g, to: '' },
  ],
  'frontend/src/routes/workflows/index.tsx': [
    { from: /import \{ createFileRoute, useLoaderData \} from '@tanstack\/react-router';\n/g, to: "import { createFileRoute } from '@tanstack/react-router';\n" },
    { from: /import \{ RouteErrorBoundary \} from '@\/components\/shared\/routing';\n/g, to: '' },
  ],
  'frontend/src/routes/workflows/instance.$instanceId.tsx': [
    { from: /import \{ useLoaderData, /g, to: 'import { ' },
    { from: /import \{ RouteErrorBoundary, NotFoundError \} from '@\/components\/shared\/routing';\n/g, to: '' },
  ],
  'frontend/src/services/infrastructure/apiClient.ts': [
    { from: /const error =/g, to: 'const _error =' },
  ],
  'frontend/src/services/infrastructure/apiClientEnhanced.ts': [
    { from: /ApiError,/g, to: '' },
    { from: /ValidationError,/g, to: '' },
  ],
  'frontend/src/services/features/research/geminiService.ts': [
    { from: /\} catch \(e\) \{/g, to: '} catch (_e) {' },
  ],
  'frontend/src/types/type-mappings.ts': [
    { from: /const matterType =/g, to: 'const _matterType =' },
  ],
  'frontend/src/utils/billing-features.ts': [
    { from: /function canDeleteEntry\(entry: TimeEntry, reason: string\)/g, to: 'function canDeleteEntry(entry: TimeEntry, _reason: string)' },
  ],
  'frontend/src/utils/route-guards.ts': [
    { from: /async function requireAuth\(context: { request: Request }\)/g, to: 'async function requireAuth(context: { request: _request }): Promise<unknown>' },
  ],
};

function applyFixes(filePath, fixes) {
  const fullPath = path.join(rootDir, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`  ⚠️  File not found: ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  let changed = false;

  for (const fix of fixes) {
    const before = content;
    content = content.replace(fix.from, fix.to);
    if (content !== before) {
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`  ✓ Fixed: ${filePath}`);
    return true;
  }

  return false;
}

console.log('🔧 Starting batch linting fixes...\n');

let fixedCount = 0;

// Apply file-specific fixes
for (const [file, fixes] of Object.entries(fileFixes)) {
  if (applyFixes(file, fixes)) {
    fixedCount++;
  }
}

console.log(`\n✅ Fixed ${fixedCount} files`);
console.log('\n📝 Remaining issues require manual review:');
console.log('  - no-case-declarations: Add braces {} around case blocks');
console.log('  - no-constant-condition: Review while/if conditions');
console.log('  - no-constant-binary-expression: More complex expressions');
console.log('  - no-explicit-any: Context-specific type annotations');
console.log('\nRun: cd frontend && npm run lint to check remaining issues');