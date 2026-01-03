#!/usr/bin/env node
/**
 * Script to automatically fix common linting issues
 * Run with: npx tsx scripts/fix-linting-issues.ts
 */

import * as fs from 'fs';
import * as path from 'path';

interface Fix {
  file: string;
  fixes: Array<{
    search: string | RegExp;
    replace: string;
    description: string;
  }>;
}

const fixes: Fix[] = [
  // Fix unused variables by prefixing with _
  {
    file: 'frontend/src/features/admin/components/users/UserManagement.tsx',
    fixes: [
      {
        search: /const \[startTransition\]/g,
        replace: 'const [_startTransition]',
        description: 'Prefix unused startTransition with _'
      },
      {
        search: /} catch \(error\) \{[\s\S]*?console\.error/g,
        replace: '} catch (_error) {\n      console.error',
        description: 'Prefix unused error variables with _'
      }
    ]
  },
  {
    file: 'frontend/src/features/admin/components/webhooks/WebhookManagement.tsx',
    fixes: [
      {
        search: /} catch \(error\) \{[\s\S]*?console\.error/g,
        replace: '} catch (_error) {\n      console.error',
        description: 'Prefix unused error with _'
      }
    ]
  },
  {
    file: 'frontend/src/features/cases/components/docket/DocketSheet.tsx',
    fixes: [
      {
        search: /const \[startTransition\]/g,
        replace: 'const [_startTransition]',
        description: 'Prefix unused startTransition with _'
      }
    ]
  },
  {
    file: 'frontend/src/features/cases/components/list/CaseManagement.tsx',
    fixes: [
      {
        search: /\(onSelectCase\):/g,
        replace: '(_onSelectCase):',
        description: 'Prefix unused onSelectCase with _'
      }
    ]
  },
  {
    file: 'frontend/src/routes/cases/create.tsx',
    fixes: [
      {
        search: /\(loaderData\):/g,
        replace: '(_loaderData):',
        description: 'Prefix unused loaderData with _'
      }
    ]
  },
  {
    file: 'frontend/src/routes/documents/index.tsx',
    fixes: [
      {
        search: /const \[totalCount,/g,
        replace: 'const [_totalCount,',
        description: 'Prefix unused totalCount with _'
      }
    ]
  },
  {
    file: 'frontend/src/routes/workflows/detail.tsx',
    fixes: [
      {
        search: /import \{ Link \}/g,
        replace: '// import { Link }',
        description: 'Comment out unused Link import'
      }
    ]
  },
  {
    file: 'frontend/src/routes/workflows/instance.$instanceId.tsx',
    fixes: [
      {
        search: /} catch \(error\) \{[\s\S]*?console\.error/g,
        replace: '} catch (_error) {\n      console.error',
        description: 'Prefix unused error with _'
      }
    ]
  },
  {
    file: 'frontend/src/routes/billing/rates.tsx',
    fixes: [
      {
        search: /const \[rateTables,/g,
        replace: 'const [_rateTables,',
        description: 'Prefix unused rateTables with _'
      }
    ]
  },
  // Fix empty object patterns
  {
    file: 'frontend/src/routes/admin/audit.tsx',
    fixes: [
      {
        search: /export default function \w+\(\{\}\)/g,
        replace: 'export default function AuditPage()',
        description: 'Remove empty object pattern'
      }
    ]
  },
  {
    file: 'frontend/src/routes/admin/backup.tsx',
    fixes: [
      {
        search: /export default function \w+\(\{\}\)/g,
        replace: 'export default function BackupPage()',
        description: 'Remove empty object pattern'
      }
    ]
  },
  {
    file: 'frontend/src/routes/admin/integrations.tsx',
    fixes: [
      {
        search: /export default function \w+\(\{\}\)/g,
        replace: 'export default function IntegrationsPage()',
        description: 'Remove empty object pattern'
      }
    ]
  },
  {
    file: 'frontend/src/routes/admin/settings.tsx',
    fixes: [
      {
        search: /export default function \w+\(\{\}\)/g,
        replace: 'export default function SettingsPage()',
        description: 'Remove empty object pattern'
      }
    ]
  },
  {
    file: 'frontend/src/routes/dashboard.tsx',
    fixes: [
      {
        search: /export default function \w+\(\{\}\)/g,
        replace: 'export default function DashboardPage()',
        description: 'Remove empty object pattern'
      }
    ]
  },
  {
    file: 'frontend/src/routes/layout.tsx',
    fixes: [
      {
        search: /export default function \w+\(\{\}\)/g,
        replace: 'export default function Layout()',
        description: 'Remove empty object pattern'
      }
    ]
  }
];

function applyFixes() {
  let fixedCount = 0;
  let errorCount = 0;

  for (const { file, fixes: fileFixes } of fixes) {
    const filePath = path.join(process.cwd(), file);
    
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️  File not found: ${file}`);
      continue;
    }

    try {
      let content = fs.readFileSync(filePath, 'utf-8');
      let modified = false;

      for (const fix of fileFixes) {
        const beforeLength = content.length;
        content = content.replace(fix.search, fix.replace);
        
        if (content.length !== beforeLength) {
          console.log(`✓ ${file}: ${fix.description}`);
          modified = true;
          fixedCount++;
        }
      }

      if (modified) {
        fs.writeFileSync(filePath, content, 'utf-8');
      }
    } catch (error) {
      console.error(`✗ Error fixing ${file}:`, error);
      errorCount++;
    }
  }

  console.log(`\n✓ Applied ${fixedCount} fixes`);
  if (errorCount > 0) {
    console.log(`✗ ${errorCount} errors encountered`);
  }
}

applyFixes();