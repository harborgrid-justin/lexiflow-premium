
import re
import glob
import os

# Mappings for base classes
REPLACEMENTS = {
    # Text
    r'\btext-gray-900\b': 'text-[var(--color-text)]',
    r'\btext-gray-800\b': 'text-[var(--color-text)]',
    r'\btext-gray-700\b': 'text-[var(--color-text)]',
    r'\btext-gray-600\b': 'text-[var(--color-textMuted)]',
    r'\btext-gray-500\b': 'text-[var(--color-textMuted)]',
    r'\btext-gray-400\b': 'text-[var(--color-textMuted)]',
    r'\btext-slate-900\b': 'text-[var(--color-text)]',
    r'\btext-slate-800\b': 'text-[var(--color-text)]',
    r'\btext-slate-700\b': 'text-[var(--color-text)]',
    r'\btext-slate-600\b': 'text-[var(--color-textMuted)]',
    r'\btext-slate-500\b': 'text-[var(--color-textMuted)]',

    # Backgrounds
    r'\bbg-white\b': 'bg-[var(--color-surface)]',
    r'\bbg-gray-50\b': 'bg-[var(--color-surfaceRaised)]',
    r'\bbg-gray-100\b': 'bg-[var(--color-surfaceRaised)]', # Mapping both to raised generally works
    r'\bbg-gray-200\b': 'bg-[var(--color-backgroundTertiary)]',
    r'\bbg-slate-50\b': 'bg-[var(--color-surfaceRaised)]',

    # Borders
    r'\bborder-gray-200\b': 'border-[var(--color-borderLight)]',
    r'\bborder-gray-300\b': 'border-[var(--color-border)]',
    r'\bborder-slate-200\b': 'border-[var(--color-borderLight)]',
    r'\bborder-slate-300\b': 'border-[var(--color-border)]',

    # Primary Buttons
    r'\bbg-blue-600\b': 'bg-[var(--color-primary)]',
    r'\bhover:bg-blue-700\b': 'hover:bg-[var(--color-primaryDark)]',
    r'\btext-blue-600\b': 'text-[var(--color-primary)]',
}

# Regex to remove dark mode overrides which are now redundant
DARK_MODE_REMOVALS = [
    r'\bdark:text-gray-\d+\b',
    r'\bdark:text-slate-\d+\b',
    r'\bdark:bg-gray-\d+\b',
    r'\bdark:bg-slate-\d+\b',
    r'\bdark:border-gray-\d+\b',
    r'\bdark:border-slate-\d+\b',
    r'\bdark:text-blue-\d+\b', # Primary usually handles dark mode contrast itself in tokens
]

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    original_content = content

    # 1. Apply replacements
    for pattern, replacement in REPLACEMENTS.items():
        content = re.sub(pattern, replacement, content)

    # 2. Remove dark mode overrides
    # careful not to leave double spaces
    for pattern in DARK_MODE_REMOVALS:
        content = re.sub(pattern, '', content)

    # 3. Cleanup spaces
    content = re.sub(r'\s{2,}', ' ', content) # cleanup extra spaces in class names
    content = re.sub(r'className=" ', 'className="', content)
    content = re.sub(r' "', '"', content)

    if content != original_content:
        # Check if we broke anything (basic check)
        # e.g. check if we have unclosed braces or something?
        # For now, just save
        with open(filepath, 'w') as f:
            f.write(content)
        return True
    return False

def main():
    # Use the list I generated earlier
    targets = [
'routes/billing/components/enterprise/FinancialReports.tsx',
'routes/billing/components/enterprise/InvoiceBuilder.tsx',
'routes/billing/components/enterprise/EnterpriseBilling.tsx',
'routes/research/components/enterprise/ResearchMemo.tsx',
'routes/billing/components/enterprise/LEDESBilling.tsx',
'routes/cases/components/docket/DocketDetail.tsx',
'routes/cases/components/list/CaseDetail.tsx',
'routes/cases/components/enterprise/CaseBudget.tsx',
'routes/cases/components/list/FederalLitigationCaseForm.tsx',
'routes/litigation/components/builder/StrategyBuilder.tsx',
'routes/admin/components/BackupManager.tsx',
'routes/research/components/enterprise/CitationManager.tsx',
'routes/cases/components/enterprise/CaseTeam.tsx',
'routes/real-estate/components/relocation/RelocationList.tsx',
'routes/real-estate/components/cost-share/CostShareList.tsx',
'routes/real-estate/components/outgrants/OutgrantsList.tsx',
'routes/real-estate/components/inventory/InventoryList.tsx',
'routes/pleadings/components/builder/PleadingBuilder.tsx',
'routes/documents/components/enterprise/DocumentViewer.tsx',
'routes/real-estate/components/acquisition/AcquisitionManager.tsx',
'routes/cases/components/enterprise/EnterpriseCaseList.tsx',
'routes/real-estate/disposal.tsx',
'routes/cases/components/enterprise/CaseTemplates.tsx',
'routes/audit/index.tsx',
'routes/real-estate/audit-readiness.tsx',
'routes/cases/billing.tsx',
'routes/cases/components/list/QuickAddPartyModal.tsx',
'routes/real-estate/encroachment.tsx',
'routes/cases/components/list/case-form-old/FormSections.tsx',
'routes/documents/components/enterprise/DocumentWorkflow.tsx',
'routes/real-estate/solicitations.tsx',
'routes/documents/components/enterprise/DocumentManagementSystem.tsx',
'routes/cases/components/calendar/CaseCalendar.tsx',
'routes/cases/components/list/CaseListView.tsx',
'routes/real-estate/user-management.tsx',
'routes/admin/integrations/IntegrationsManager.tsx',
'routes/cases/components/intake/NewCaseIntakeForm.tsx',
'routes/cases/components/financials/CaseFinancialsCenter.tsx',
'routes/cases/ui/components/DocketSkeleton/DocketSkeleton.tsx',
'routes/cases/ui/components/CaseFilters/CaseFilters.tsx',
'routes/cases/components/insights/CaseInsightsDashboard.tsx',
'routes/admin/index.tsx',
'routes/documents/components/enterprise/AuditTrail.tsx',
'routes/workflows/index.tsx',
'theme/components/AdvancedThemeCustomizer.tsx',
'routes/real-estate/utilization.tsx',
'routes/workflows/WorkflowsView.tsx',
'routes/cases/components/overview/CaseOverviewDashboard.tsx',
'routes/cases/ui/components/FilingsTable/FilingsTable.tsx',
'routes/cases/components/enterprise/EnhancedCaseTimeline.tsx',
'routes/real-estate/portfolio-summary.tsx',
'routes/workflows/instance.$instanceId.tsx',
'routes/cases/components/operations/CaseOperationsCenter.tsx',
'routes/docket/components/DocketList.tsx',
'routes/admin/audit.tsx'
    ]

    base_dir = '/workspaces/lexiflow-premium/frontend/src'

    count = 0
    for rel_path in targets:
        filepath = os.path.join(base_dir, rel_path)
        if os.path.exists(filepath):
            if process_file(filepath):
                count += 1
                print(f"Updated {rel_path}")
            else:
                print(f"Skipped {rel_path} (no changes needed)")
        else:
             print(f"File not found: {filepath}")

    print(f"Total files updated: {count}")

if __name__ == '__main__':
    main()
