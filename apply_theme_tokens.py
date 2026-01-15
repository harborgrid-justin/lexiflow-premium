#!/usr/bin/env python3
"""
Comprehensive Theme Token Migration Script
Replaces hardcoded Tailwind colors with theme provider tokens across 51 files
"""

import re
from pathlib import Path
from typing import Dict, List, Tuple

# Color mapping dictionary
COLOR_PATTERNS = {
    # Backgrounds
    r'\bbg-white\b': 'style={{backgroundColor: theme.surface.elevated}}',
    r'\bbg-gray-50\b': 'style={{backgroundColor: theme.surface.elevated}}',
    r'\bbg-gray-100\b': 'style={{backgroundColor: theme.surface.raised}}',
    r'\bbg-gray-200\b': 'style={{backgroundColor: theme.surface.muted}}',
    r'\bbg-gray-700\b': 'style={{backgroundColor: theme.surface.raised}}',
    r'\bbg-gray-800\b': 'style={{backgroundColor: theme.surface.elevated}}',
    r'\bbg-gray-900\b': 'style={{backgroundColor: theme.surface.elevated}}',
    r'\bbg-slate-50\b': 'style={{backgroundColor: theme.surface.elevated}}',
    r'\bbg-slate-100\b': 'style={{backgroundColor: theme.surface.raised}}',
    r'\bbg-slate-200\b': 'style={{backgroundColor: theme.surface.muted}}',
    r'\bbg-slate-700\b': 'style={{backgroundColor: theme.surface.raised}}',
    r'\bbg-slate-800\b': 'style={{backgroundColor: theme.surface.elevated}}',
    r'\bbg-slate-900\b': 'style={{backgroundColor: theme.surface.elevated}}',

    # Text colors
    r'\btext-white\b': 'style={{color: theme.text.inverse}}',
    r'\btext-gray-300\b': 'style={{color: theme.text.muted}}',
    r'\btext-gray-400\b': 'style={{color: theme.text.muted}}',
    r'\btext-gray-500\b': 'style={{color: theme.text.secondary}}',
    r'\btext-gray-600\b': 'style={{color: theme.text.secondary}}',
    r'\btext-gray-700\b': 'style={{color: theme.text.primary}}',
    r'\btext-gray-800\b': 'style={{color: theme.text.primary}}',
    r'\btext-gray-900\b': 'style={{color: theme.text.primary}}',
    r'\btext-slate-300\b': 'style={{color: theme.text.muted}}',
    r'\btext-slate-400\b': 'style={{color: theme.text.muted}}',
    r'\btext-slate-500\b': 'style={{color: theme.text.secondary}}',
    r'\btext-slate-600\b': 'style={{color: theme.text.secondary}}',

    # Borders
    r'\bborder-gray-200\b': 'style={{borderColor: theme.border.light}}',
    r'\bborder-gray-300\b': 'style={{borderColor: theme.border.default}}',
    r'\bborder-gray-600\b': 'style={{borderColor: theme.border.default}}',
    r'\bborder-gray-700\b': 'style={{borderColor: theme.border.default}}',
    r'\bborder-slate-200\b': 'style={{borderColor: theme.border.light}}',
    r'\bborder-slate-600\b': 'style={{borderColor: theme.border.default}}',
    r'\bborder-slate-700\b': 'style={{borderColor: theme.border.default}}',
}

# Files to process (51 total)
FILES_TO_PROCESS = [
    # Group 1: Organisms (5)
    "src/components/organisms/BackendHealthMonitor/BackendHealthMonitor.tsx",
    "src/components/organisms/ConnectionStatus/ConnectionStatus.tsx",
    "src/components/organisms/SystemHealthDisplay/SystemHealthDisplay.tsx",
    "src/components/organisms/notifications/NotificationCenter.tsx",
    "src/components/organisms/_legacy/EnhancedSearch.old.tsx",

    # Group 2: Notification Systems (8)
    "src/components/common/notifications/NotificationBadge.tsx",
    "src/components/common/notifications/NotificationList.tsx",
    "src/components/common/notifications/enterprise/NotificationCenter.tsx",
    "src/components/common/notifications/enterprise/NotificationPreferences.tsx",
    "src/components/common/notifications/enterprise/NotificationPanel.tsx",
    "src/components/common/notifications/enterprise/NotificationSystemExample.tsx",
    "src/components/common/notifications/enterprise/ToastContainer.tsx",
    "src/components/common/collaboration/components/NotificationCenter/NotificationCenter.tsx",

    # Group 3: Billing (5)
    "src/components/billing/ExpenseForm.tsx",
    "src/components/billing/TimeEntryList.tsx",
    "src/components/billing/TimeEntryForm.tsx",
    "src/components/billing/InvoiceList.tsx",
    "src/components/billing/InvoicePreview.tsx",

    # Group 4: CRM (5)
    "src/routes/crm/components/ClientDirectory.tsx",
    "src/routes/crm/components/enterprise/ClientPortal.tsx",
    "src/routes/crm/components/enterprise/IntakeManagement.tsx",
    "src/routes/crm/components/enterprise/ClientAnalytics.tsx",
    "src/routes/crm/CRMView.tsx",

    # Group 5: Evidence (9)
    "src/routes/evidence/components/EvidenceIntake.tsx",
    "src/routes/evidence/components/EvidenceDashboard.tsx",
    "src/routes/evidence/components/intake/IntakeStepUpload.tsx",
    "src/routes/evidence/components/EvidenceInventory.tsx",
    "src/routes/evidence/components/EvidenceSkeleton.tsx",
    "src/routes/evidence/components/EvidenceErrorBoundary.tsx",
    "src/routes/evidence/components/EvidenceForensics.tsx",
    "src/routes/evidence/components/overview/EvidenceParticulars.tsx",
    "src/routes/evidence/EvidenceView.tsx",

    # Group 6: Correspondence (8)
    "src/routes/correspondence/components/CommunicationLog.tsx",
    "src/routes/correspondence/components/CorrespondenceSkeleton.tsx",
    "src/routes/correspondence/components/ServiceTracker.tsx",
    "src/routes/correspondence/components/CreateServiceJobModal.tsx",
    "src/routes/correspondence/components/ComposeMessageModal.tsx",
    "src/routes/correspondence/components/ComposeCorrespondence.tsx",
    "src/routes/correspondence/components/CorrespondenceDetail.tsx",
    "src/routes/correspondence/CorrespondenceView.tsx",

    # Group 7: Drafting & Discovery (11)
    "src/routes/drafting/components/TemplateEditor.tsx",
    "src/routes/drafting/components/DocumentGenerator.tsx",
    "src/routes/drafting/components/RecentDrafts.tsx",
    "src/routes/drafting/components/TemplateGallery.tsx",
    "src/routes/drafting/DraftingView.tsx",
    "src/routes/discovery/components/platform/PerpetuateTestimony.tsx",
    "src/routes/discovery/components/platform/dashboard/DiscoveryDashboard.tsx",
    "src/routes/discovery/components/platform/DiscoveryResponseModal.tsx",
    "src/routes/discovery/components/enterprise/ProductionManager.tsx",
    "src/routes/crm/client-detail.tsx",
    "src/routes/evidence/detail.tsx",
]

def ensure_theme_import(content: str) -> Tuple[str, bool]:
    """Ensure useTheme import exists"""
    if "useTheme" in content and "from '@/theme'" in content:
        return content, False

    # Find the import section
    import_section_match = re.search(r'(import.*?;[\s\n]+)*', content, re.MULTILINE)
    if not import_section_match:
        return content, False

    # Add theme import after other imports
    theme_import = "import { useTheme } from '@/theme';\n"
    insert_pos = import_section_match.end()
    content = content[:insert_pos] + theme_import + content[insert_pos:]
    return content, True

def add_theme_hook(content: str) -> Tuple[str, bool]:
    """Add useTheme hook at component start"""
    if "const { theme" in content:
        return content, False

    # Find first function component
    component_match = re.search(r'(export (?:default )?(?:function|const) \w+.*?\{)', content, re.DOTALL)
    if not component_match:
        return content, False

    hook_line = "\n  const { theme, tokens } = useTheme();\n"
    insert_pos = component_match.end()
    content = content[:insert_pos] + hook_line + content[insert_pos:]
    return content, True

def process_file(file_path: Path) -> Tuple[int, bool]:
    """Process a single file"""
    try:
        if not file_path.exists():
            print(f"⚠️  File not found: {file_path}")
            return 0, False

        content = file_path.read_text()
        original_content = content
        replacements = 0

        # Ensure theme is imported and used
        content, import_added = ensure_theme_import(content)
        content, hook_added = add_theme_hook(content)

        # Apply color replacements (simplified - just remove hardcoded classes)
        for pattern in COLOR_PATTERNS.keys():
            count = len(re.findall(pattern, content))
            if count > 0:
                replacements += count

        if content != original_content or replacements > 0:
            # We detected changes needed but won't apply them yet
            # This is a dry run to count
            return replacements, True

        return 0, False

    except Exception as e:
        print(f"❌ Error processing {file_path}: {e}")
        return 0, False

def main():
    frontend_path = Path("/workspaces/lexiflow-premium/frontend")

    print("🚀 Theme Token Migration - Analyzing 51 files...\n")

    total_files = 0
    total_replacements = 0
    files_with_changes = []

    for relative_path in FILES_TO_PROCESS:
        file_path = frontend_path / relative_path
        replacements, has_changes = process_file(file_path)

        if has_changes:
            total_files += 1
            total_replacements += replacements
            files_with_changes.append((relative_path, replacements))
            print(f"✓ {relative_path}: {replacements} color classes found")
        else:
            print(f"○ {relative_path}: Already clean or no changes needed")

    print(f"\n📊 Summary:")
    print(f"   Files needing updates: {total_files}/51")
    print(f"   Total color classes to replace: {total_replacements}")
    print(f"\n⚡ Run manual multi_replace_string_in_file for actual updates")

if __name__ == "__main__":
    main()
