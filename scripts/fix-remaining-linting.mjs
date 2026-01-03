#!/usr/bin/env node
/**
 * Fix remaining linting errors - Round 2
 * Focuses on patterns missed in first pass
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

const fileFixes = {
  // Routes that still have issues
  'frontend/src/routes/_shared/types.ts': [
    { from: /import \{ ReactNode \} from ['"]react['"];\n?/g, to: '' },
    { from: /ReactNode,?\s*/g, to: '' },
  ],
  'frontend/src/routes/admin/audit.tsx': [
    { from: /loader\(\s*\{\s*\}\s*:/g, to: 'loader(_args:' },
    { from: /const \[searchParams, setSearchParams\] =/g, to: 'const [_searchParams, _setSearchParams] =' },
  ],
  'frontend/src/routes/admin/backup.tsx': [
    { from: /loader\(\s*\{\s*\}\s*:/g, to: 'loader(_args:' },
  ],
  'frontend/src/routes/admin/integrations.tsx': [
    { from: /loader\(\s*\{\s*\}\s*:/g, to: 'loader(_args:' },
  ],
  'frontend/src/routes/admin/settings.tsx': [
    { from: /loader\(\s*\{\s*\}\s*:/g, to: 'loader(_args:' },
  ],
  'frontend/src/routes/audit/index.tsx': [
    { from: /import \{ Link,/g, to: 'import {' },
  ],
  'frontend/src/routes/auth/login-enhanced.tsx': [
    { from: /const \{ mfaRequired \} =/g, to: 'const { mfaRequired: _mfaRequired } =' },
  ],
  'frontend/src/routes/billing/expenses.tsx': [
    { from: /} catch \(error\) {/g, to: '} catch (_error) {' },
  ],
  'frontend/src/routes/billing/invoices.$id.tsx': [
    { from: /} catch \(error\) {/g, to: '} catch (_error) {' },
  ],
  'frontend/src/routes/billing/invoices.tsx': [
    { from: /} catch \(error\) {/g, to: '} catch (_error) {' },
  ],
  'frontend/src/routes/billing/rates.tsx': [
    { from: /const rateTables =/g, to: 'const _rateTables =' },
  ],
  'frontend/src/routes/billing/time.tsx': [
    { from: /} catch \(error\) {/g, to: '} catch (_error) {' },
  ],
  'frontend/src/routes/billing/trust.tsx': [
    { from: /} catch \(error\) {/g, to: '} catch (_error) {' },
    { from: /const \{ accounts, filters \} =/g, to: 'const { accounts: _accounts, filters: _filters } =' },
  ],
  'frontend/src/routes/calendar/index.tsx': [
    { from: /loader: \(data:/g, to: 'loader: (_data:' },
  ],
  'frontend/src/routes/cases/case-detail.tsx': [
    { from: /import \{ Link,/g, to: 'import {' },
    { from: /, RouteLoading,/g, to: ',' },
    { from: /, throwNotFound/g, to: '' },
    { from: /} catch \(error\) {/g, to: '} catch (_error) {' },
  ],
  'frontend/src/routes/cases/create.tsx': [
    { from: /\(loaderData:/g, to: '(_loaderData:' },
  ],
  'frontend/src/routes/cases/documents.tsx': [
    { from: /import \{ Suspense,/g, to: 'import {' },
    { from: /, Link/g, to: '' },
  ],
  'frontend/src/routes/crm/index.tsx': [
    { from: /const clients =/g, to: 'const _clients =' },
  ],
  'frontend/src/routes/dashboard.tsx': [
    { from: /loader\(\s*\{\s*\}\s*:/g, to: 'loader(_args:' },
  ],
  'frontend/src/routes/documents/index.tsx': [
    { from: /const totalCount =/g, to: 'const _totalCount =' },
  ],
  'frontend/src/routes/drafting/index.tsx': [
    { from: /loader\(\s*\{\s*\}\s*:/g, to: 'loader(_args:' },
  ],
  'frontend/src/routes/layout.tsx': [
    { from: /loader\(\s*\{\s*\}\s*:/g, to: 'loader(_args:' },
  ],
  'frontend/src/routes/litigation/builder.tsx': [
    { from: /const \{ caseId \} =/g, to: 'const { caseId: _caseId } =' },
  ],
  'frontend/src/routes/workflows/detail.tsx': [
    { from: /import \{ useLoaderData,/g, to: 'import {' },
    { from: /, Link,/g, to: ',' },
    { from: /import \{ RouteErrorBoundary, NotFoundError \}[^;]+;\n?/g, to: '' },
  ],
  'frontend/src/routes/workflows/index.tsx': [
    { from: /, useLoaderData/g, to: '' },
    { from: /import \{ RouteErrorBoundary \}[^;]+;\n?/g, to: '' },
  ],
  'frontend/src/routes/workflows/instance.$instanceId.tsx': [
    { from: /import \{ useLoaderData,/g, to: 'import {' },
    { from: /import \{ RouteErrorBoundary, NotFoundError \}[^;]+;\n?/g, to: '' },
  ],
  
  // Hooks
  'frontend/src/hooks/useApiMutation.ts': [
    { from: /try \{\s*return await mutationFn\([^)]+\);\s*\} catch \(error\) \{\s*throw error;\s*\}/g, to: 'return await mutationFn(variables);' },
  ],
  'frontend/src/hooks/useAppContext.ts': [
    { from: /const \[, setIsAuthenticated\] =/g, to: 'const [, _setIsAuthenticated] =' },
  ],
  'frontend/src/hooks/useBreadcrumbs.ts': [
    { from: /\.map\(\([^,]+, index\) =>/g, to: '.map((item, _index) =>' },
  ],
  'frontend/src/hooks/useDocumentDragDrop.ts': [
    { from: /} catch \(error\) \{/g, to: '} catch (_error) {' },
  ],
  'frontend/src/hooks/useWorkerSearch.ts': [
    { from: /useMemo\(\(\) => items, \[itemsKey, items\]\)/g, to: 'useMemo(() => items, [items])' },
  ],
  
  // Services
  'frontend/src/services/infrastructure/apiClient.ts': [
    { from: /} catch \(error\) \{/g, to: '} catch (_error) {' },
  ],
  'frontend/src/services/infrastructure/apiClientEnhanced.ts': [
    { from: /import \{ ApiError,/g, to: 'import {' },
  ],
  'frontend/src/services/features/research/geminiService.ts': [
    { from: /catch \(_e\) \{/g, to: 'catch {' },
  ],
  
  // Utils
  'frontend/src/types/type-mappings.ts': [
    { from: /const matterType =/g, to: 'const _matterType =' },
  ],
  'frontend/src/utils/billing-features.ts': [
    { from: /canDeleteEntry\([^,]+, reason:/g, to: 'canDeleteEntry(entry, _reason:' },
  ],
  'frontend/src/utils/route-guards.ts': [
    { from: /requireAuth\(\{ request \}:/g, to: 'requireAuth({ request: _request }:' },
  ],
};

function applyFixes(filePath, fixes) {
  const fullPath = path.join(rootDir, filePath);
  
  if (!fs.existsSync(fullPath)) {
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

console.log('🔧 Fixing remaining linting errors (Round 2)...\n');

let fixedCount = 0;

for (const [file, fixes] of Object.entries(fileFixes)) {
  if (applyFixes(file, fixes)) {
    fixedCount++;
  }
}

console.log(`\n✅ Fixed ${fixedCount} additional files`);
console.log('\nRemaining issues still require manual intervention.');