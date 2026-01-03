#!/usr/bin/env node
/**
 * Script to fix remaining ESLint errors
 */

import fs from 'fs';
import path from 'path';

const frontendDir = '/workspaces/lexiflow-premium/frontend';

// Map of files and their specific fixes
const specificFixes = {
  'src/features/admin/ThemeSettingsPage.tsx': (content) => {
    // Fix unused handleSectionChange
    content = content.replace(/const handleSectionChange = \([^)]*\) => \{[^}]*\};/s, '');
    // Fix unused index parameter in map
    content = content.replace(/\.map\(\(([^,]+), index\) =>/g, '.map(($1, _index) =>');
    return content;
  },
  
  'src/features/cases/components/detail/collaboration/CorrespondenceDetail.tsx': (content) => {
    // Fix unused 'e' variable
    content = content.replace(/} catch \(e\) \{/g, '} catch {');
    return content;
  },
  
  'src/features/cases/components/list/CaseDetail.tsx': (content) => {
    // Remove unused Loader2 import
    content = content.replace(/,\s*Loader2/g, '');
    content = content.replace(/Loader2,\s*/g, '');
    return content;
  },
  
  'src/features/cases/components/list/CaseManagement.tsx': (content) => {
    // Fix unused onSelectCase parameter
    content = content.replace(/\(onSelectCase\) =>/g, '(_onSelectCase) =>');
    return content;
  },
  
  'src/features/cases/components/detail/CasePlanning.tsx': (content) => {
    // Remove unused ScheduleTimeline import
    content = content.replace(/,\s*ScheduleTimeline/g, '');
    content = content.replace(/ScheduleTimeline,\s*/g, '');
    return content;
  },
  
  'src/features/docket/DocketSheet.tsx': (content) => {
    // Remove unused startTransition and deferredSearchTerm
    content = content.replace(/const \[startTransition\][^;]*;/g, '');
    content = content.replace(/const deferredSearchTerm[^;]*;/g, '');
    return content;
  },
  
  'src/features/dashboard/components/EnhancedDashboardOverview.tsx': (content) => {
    // Remove unused imports
    content = content.replace(/,\s*LineChart/g, '');
    content = content.replace(/LineChart,\s*/g, '');
    content = content.replace(/,\s*Line\s*,/g, ',');
    content = content.replace(/Line,\s*/g, '');
    // Fix unused variables
    content = content.replace(/const \{ userRole \}/g, 'const { userRole: _userRole }');
    content = content.replace(/const \[dateRange, setDateRange\]/g, 'const [dateRange]');
    return content;
  },
  
  'src/features/dashboard/components/role-dashboards/AdminDashboard.tsx': (content) => {
    content = content.replace(/const roleDashboard =/g, 'const _roleDashboard =');
    return content;
  },
  
  'src/features/dashboard/components/role-dashboards/AttorneyDashboard.tsx': (content) => {
    content = content.replace(/const roleDashboard =/g, 'const _roleDashboard =');
    return content;
  },
  
  'src/features/dashboard/components/role-dashboards/ParalegalDashboard.tsx': (content) => {
    content = content.replace(/const roleDashboard =/g, 'const _roleDashboard =');
    return content;
  },
  
  'src/features/dashboard/components/role-dashboards/PartnerDashboard.tsx': (content) => {
    content = content.replace(/const roleDashboard =/g, 'const _roleDashboard =');
    content = content.replace(/const billingData =/g, 'const _billingData =');
    return content;
  },
  
  'src/features/litigation/discovery/DiscoveryTimeline.tsx': (content) => {
    content = content.replace(/\.map\(\([^,]+, index\) => \{/g, '.map(($1, _index) => {');
    return content;
  },
  
  'src/features/litigation/discovery/LegalHoldsEnhanced.tsx': (content) => {
    // Remove unused type
    content = content.replace(/type LegalHoldNotification[^;]*;/g, '');
    // Fix unused parameter
    content = content.replace(/\(holdId\) => \{/g, '(_holdId) => {');
    return content;
  },
  
  'src/features/litigation/discovery/PrivilegeLogEnhanced.tsx': (content) => {
    // Remove unused Filter import
    content = content.replace(/,\s*Filter/g, '');
    content = content.replace(/Filter,\s*/g, '');
    return content;
  },
  
  'src/features/litigation/discovery/ProductionWizard.tsx': (content) => {
    // Remove unused type
    content = content.replace(/type ProductionSet[^;]*;/g, '');
    return content;
  },
  
  'src/features/litigation/strategy/AICommandBar.tsx': (content) => {
    content = content.replace(/\(e\) => \{[\s\n]*\/\/ Handle command/g, '() => {\n        // Handle command');
    return content;
  },
  
  'src/features/litigation/war-room/AdvisoryBoard.tsx': (content) => {
    content = content.replace(/const handleRoleFilterChange =/g, 'const _handleRoleFilterChange =');
    content = content.replace(/const handleSpecialtyFilterChange =/g, 'const _handleSpecialtyFilterChange =');
    content = content.replace(/const handleStatusFilterChange =/g, 'const _handleStatusFilterChange =');
    return content;
  },
  
  'src/features/operations/documents/DocumentExplorer.tsx': (content) => {
    content = content.replace(/const deferredSearchTerm =/g, 'const _deferredSearchTerm =');
    content = content.replace(/\.map\(\([^,]+, index\) =>/g, '.map(($1, _index) =>');
    return content;
  },
  
  'src/features/operations/documents/pdf/FormsSigningView.tsx': (content) => {
    content = content.replace(/const \[, startTransition\]/g, 'const [startTransition]');
    content = content.replace(/const \[startTransition\]/g, 'const [_startTransition]');
    return content;
  },
  
  'src/hooks/useBreadcrumbs.ts': (content) => {
    content = content.replace(/\.map\(\([^,]+, index\) =>/g, '.map(($1, _index) =>');
    return content;
  },
  
  'src/hooks/useDocumentDragDrop.ts': (content) => {
    content = content.replace(/} catch \(_error\) \{/g, '} catch {');
    return content;
  },
  
  'src/hooks/useAppContext.ts': (content) => {
    content = content.replace(/const \[isAuthenticated, setIsAuthenticated\]/g, 'const [isAuthenticated]');
    return content;
  },
  
  'src/routes/admin/audit.tsx': (content) => {
    content = content.replace(/export default function AuditPage\(\{\}\)/g, 'export default function AuditPage()');
    return content;
  },
  
  'src/routes/admin/backup.tsx': (content) => {
    content = content.replace(/export default function BackupPage\(\{\}\)/g, 'export default function BackupPage()');
    return content;
  },
  
  'src/routes/admin/integrations.tsx': (content) => {
    content = content.replace(/export default function IntegrationsPage\(\{\}\)/g, 'export default function IntegrationsPage()');
    return content;
  },
  
  'src/routes/admin/settings.tsx': (content) => {
    content = content.replace(/export default function SettingsPage\(\{\}\)/g, 'export default function SettingsPage()');
    return content;
  },
  
  'src/routes/calendar/index.tsx': (content) => {
    content = content.replace(/export async function loader\(\{ data \}\)/g, 'export async function loader({ data: _data })');
    return content;
  },
  
  'src/routes/dashboard.tsx': (content) => {
    content = content.replace(/export default function Dashboard\(\{\}\)/g, 'export default function Dashboard()');
    return content;
  },
  
  'src/routes/layout.tsx': (content) => {
    content = content.replace(/export default function RootLayout\(\{\}\)/g, 'export default function RootLayout()');
    return content;
  },
  
  'src/routes/crm/index.tsx': (content) => {
    content = content.replace(/const clients =/g, 'const _clients =');
    return content;
  },
  
  'src/types/type-mappings.ts': (content) => {
    content = content.replace(/const matterType =/g, 'const _matterType =');
    return content;
  },
  
  'src/utils/billing-features.ts': (content) => {
    content = content.replace(/\(reason\)/g, '(_reason)');
    return content;
  },
  
  'src/features/litigation/discovery/DiscoveryPlatform.tsx': (content) => {
    // Remove unused component definitions
    content = content.replace(/const PrivilegeLog = \(\) => \{[^}]*\};/gs, '');
    content = content.replace(/const LegalHolds = \(\) => \{[^}]*\};/gs, '');
    content = content.replace(/const DiscoveryProduction = \(\) => \{[^}]*\};/gs, '');
    content = content.replace(/const DiscoveryESI = \(\) => \{[^}]*\};/gs, '');
    return content;
  }
};

function applyFix(filePath) {
  const fullPath = path.join(frontendDir, filePath);
  
  if (!fs.existsSync(fullPath)) {
    return;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  const fixFn = specificFixes[filePath];
  
  if (fixFn) {
    const newContent = fixFn(content);
    if (newContent !== content) {
      fs.writeFileSync(fullPath, newContent, 'utf8');
      console.log(`✓ Fixed ${filePath}`);
    }
  }
}

console.log('Fixing remaining errors...\n');
Object.keys(specificFixes).forEach(applyFix);
console.log('\nDone!');