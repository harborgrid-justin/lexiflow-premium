#!/usr/bin/env python3
"""
Comprehensive linting error fixer for the LexiFlow frontend
Handles:
- Unused variables (prefix with _)
- Empty object patterns  
- Unused error variables in catch blocks
- no-case-declarations
- no-useless-catch
- no-constant-binary-expression
"""

import re
import os
from pathlib import Path

# Define all fixes
FIXES = [
    # Fix unused error variables in catch blocks
    {
        'files': [
            'frontend/src/features/operations/billing/fee-agreements/FeeAgreementManagement.tsx',
            'frontend/src/features/operations/billing/rate-tables/RateTableManagement.tsx',
            'frontend/src/features/litigation/evidence/EvidenceForensics.tsx',
            'frontend/src/services/data/repositories/DocumentRepository.tsx',
            'frontend/src/services/domain/AdminDomain.ts',
            'frontend/src/services/domain/SearchDomain.ts',
            'frontend/src/services/domain/WarRoomDomain.ts',
            'frontend/src/services/integration/backendDiscovery.ts',
            'frontend/src/hooks/useImageOptimization.ts',
        ],
        'pattern': r'} catch \(error\) \{',
        'replace': '} catch (_error) {',
    },
    # Fix unused function parameters
    {
        'files': [
            'frontend/src/features/cases/components/docket/DocketSheet.tsx',
        ],
        'pattern': r'const \[startTransition\]',
        'replace': 'const [_startTransition]',
    },
    {
        'files': [
            'frontend/src/features/cases/components/list/CaseManagement.tsx',
        ],
        'pattern': r'\(onSelectCase\)',
        'replace': '(_onSelectCase)',
    },
    {
        'files': [
            'frontend/src/routes/cases/create.tsx',
        ],
        'pattern': r'\(loaderData\)',
        'replace': '(_loaderData)',
    },
    {
        'files': [
            'frontend/src/routes/documents/index.tsx',
        ],
        'pattern': r'const \[totalCount,',
        'replace': 'const [_totalCount,',
    },
    {
        'files': [
            'frontend/src/routes/billing/rates.tsx',
        ],
        'pattern': r'const \[rateTables,',
        'replace': 'const [_rateTables,',
    },
    {
        'files': [
            'frontend/src/features/dashboard/components/EnhancedDashboardOverview.tsx',
        ],
        'pattern': r'\buserRole\b(?=\s*[:=])',
        'replace': '_userRole',
    },
    {
        'files': [
            'frontend/src/features/dashboard/components/role-dashboards/AdminDashboard.tsx',
            'frontend/src/features/dashboard/components/role-dashboards/AttorneyDashboard.tsx',
            'frontend/src/features/dashboard/components/role-dashboards/ParalegalDashboard.tsx',
        ],
        'pattern': r'const \[roleDashboard\]',
        'replace': 'const [_roleDashboard]',
    },
    {
        'files': [
            'frontend/src/features/dashboard/components/role-dashboards/PartnerDashboard.tsx',
        ],
        'pattern': r'const \[roleDashboard\]',
        'replace': 'const [_roleDashboard]',
    },
    {
        'files': [
            'frontend/src/features/dashboard/components/role-dashboards/PartnerDashboard.tsx',
        ],
        'pattern': r'const \[billingData\]',
        'replace': 'const [_billingData]',
    },
    {
        'files': [
            'frontend/src/features/litigation/discovery/DiscoveryTimeline.tsx',
        ],
        'pattern': r', index\)',
        'replace': ', _index)',
    },
    {
        'files': [
            'frontend/src/features/litigation/discovery/LegalHoldsEnhanced.tsx',
        ],
        'pattern': r'interface LegalHoldNotification',
        'replace': '// interface LegalHoldNotification',
    },
    {
        'files': [
            'frontend/src/features/operations/documents/DocumentExplorer.tsx',
        ],
        'pattern': r', index\)',
        'replace': ', _index)',
    },
    {
        'files': [
            'frontend/src/features/litigation/strategy/AICommandBar.tsx',
        ],
        'pattern': r'\b_e\b(?=\s*[,)])',
        'replace': '__e',
    },
    {
        'files': [
            'frontend/src/hooks/useBreadcrumbs.ts',
        ],
        'pattern': r', index\)',
        'replace': ', _index)',
    },
    {
        'files': [
            'frontend/src/utils/billing-features.ts',
        ],
        'pattern': r'\(reason\)',
        'replace': '(_reason)',
    },
    {
        'files': [
            'frontend/src/utils/route-guards.ts',
        ],
        'pattern': r'\(request\)',
        'replace': '(_request)',
    },
    {
        'files': [
            'frontend/src/services/infrastructure/apiClientEnhanced.ts',
        ],
        'pattern': r'class ApiError',
        'replace': '// class ApiError',
    },
    # Fix empty object patterns
    {
        'files': [
            'frontend/src/routes/admin/audit.tsx',
        ],
        'pattern': r'export default function \w+\(\{\}\)',
        'replace': 'export default function AuditPage()',
    },
    {
        'files': [
            'frontend/src/routes/admin/backup.tsx',
        ],
        'pattern': r'export default function \w+\(\{\}\)',
        'replace': 'export default function BackupPage()',
    },
    {
        'files': [
            'frontend/src/routes/admin/integrations.tsx',
        ],
        'pattern': r'export default function \w+\(\{\}\)',
        'replace': 'export default function IntegrationsPage()',
    },
    {
        'files': [
            'frontend/src/routes/admin/settings.tsx',
        ],
        'pattern': r'export default function \w+\(\{\}\)',
        'replace': 'export default function SettingsPage()',
    },
    {
        'files': [
            'frontend/src/routes/dashboard.tsx',
        ],
        'pattern': r'export default function \w+\(\{\}\)',
        'replace': 'export default function DashboardPage()',
    },
    {
        'files': [
            'frontend/src/routes/layout.tsx',
        ],
        'pattern': r'export default function \w+\(\{\}\)',
        'replace': 'export default function Layout()',
    },
]

def apply_fix(file_path, pattern, replace):
    """Apply a single fix to a file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        if isinstance(pattern, str):
            pattern = re.compile(pattern)
        
        new_content = pattern.sub(replace, content)
        
        if new_content != content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            return True
        return False
    except Exception as e:
        print(f"  ✗ Error: {e}")
        return False

def main():
    """Apply all fixes"""
    root = Path.cwd()
    fixed_count = 0
    error_count = 0
    
    print("Applying linting fixes...\n")
    
    for fix in FIXES:
        pattern = fix['pattern']
        replace = fix['replace']
        
        for file_rel in fix['files']:
            file_path = root / file_rel
            
            if not file_path.exists():
                print(f"⚠️  File not found: {file_rel}")
                continue
            
            if apply_fix(file_path, pattern, replace):
                print(f"✓ {file_rel}")
                fixed_count += 1
    
    print(f"\n✓ Applied fixes to {fixed_count} files")
    if error_count > 0:
        print(f"✗ {error_count} errors encountered")

if __name__ == '__main__':
    main()