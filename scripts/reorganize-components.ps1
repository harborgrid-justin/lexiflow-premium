# Enterprise Component Reorganization Script
# This script reorganizes components following enterprise architecture patterns

$ErrorActionPreference = "Stop"
$componentsRoot = "C:\temp\lexiflow-premium\frontend\src\components"

Write-Host "=== LexiFlow Enterprise Component Reorganization ===" -ForegroundColor Cyan
Write-Host ""

# ============================================================================
# Phase 1: Move Atoms to ui/atoms/
# ============================================================================
Write-Host "[1/7] Reorganizing Atoms..." -ForegroundColor Yellow

$atoms = @(
    "Badge", "Box", "Button", "CentredLoader", "CopyButton", "Currency",
    "DateText", "EvidenceTypeIcon", "FileIcon", "HighlightedText",
    "IconButton", "Input", "LazyImage", "LoadingSpinner", "ProgressBar",
    "ProgressBarWithLabel", "ProgressIndicator", "SafeContent",
    "SectionHeader", "SectionTitle", "Stack", "StatusBadge", "StatusDot",
    "StatusIndicator", "Text", "TextArea", "TruncatedText", "UserAvatar"
)

foreach ($atom in $atoms) {
    $source = Join-Path $componentsRoot "atoms\$atom"
    $dest = Join-Path $componentsRoot "ui\atoms\$atom"
    
    if (Test-Path $source) {
        Write-Host "  Moving $atom..." -ForegroundColor Gray
        Move-Item -Path $source -Destination $dest -Force
    }
}

# Move atoms index.ts
if (Test-Path "$componentsRoot\atoms\index.ts") {
    Copy-Item "$componentsRoot\atoms\index.ts" "$componentsRoot\ui\atoms\index.ts" -Force
}

Write-Host "  ✓ Atoms reorganized" -ForegroundColor Green

# ============================================================================
# Phase 2: Move Molecules to ui/molecules/
# ============================================================================
Write-Host "[2/7] Reorganizing Molecules..." -ForegroundColor Yellow

$molecules = @(
    "Accordion", "ActionMenu", "ActionRow", "AdaptiveLoader",
    "AutocompleteSelect", "Breadcrumbs", "Card", "ChatBubble",
    "ConfirmDialog", "ContextMenu", "DataSourceSelector", "DescriptionList",
    "Drawer", "DynamicBreadcrumbs", "EmptyListState", "EmptyState",
    "ErrorState", "FileAttachment", "FileUploadZone", "InfoGrid",
    "LazyLoader", "LoadingState", "MetricCard", "Modal", "ModalFooter",
    "Pagination", "PeriodSelector", "RuleSelector", "SearchInput",
    "SearchInputBar", "SmartTextArea", "Stats", "Stepper", "Tabs",
    "TabStrip", "TabsV2", "TagInput", "TagList", "TimelineItem", "UserSelect"
)

foreach ($molecule in $molecules) {
    $source = Join-Path $componentsRoot "molecules\$molecule"
    $dest = Join-Path $componentsRoot "ui\molecules\$molecule"
    
    if (Test-Path $source) {
        Write-Host "  Moving $molecule..." -ForegroundColor Gray
        Move-Item -Path $source -Destination $dest -Force
    }
}

# Move molecules index.ts
if (Test-Path "$componentsRoot\molecules\index.ts") {
    Copy-Item "$componentsRoot\molecules\index.ts" "$componentsRoot\ui\molecules\index.ts" -Force
}

Write-Host "  ✓ Molecules reorganized" -ForegroundColor Green

# ============================================================================
# Phase 3: Move Layouts to ui/layouts/
# ============================================================================
Write-Host "[3/7] Reorganizing Layouts..." -ForegroundColor Yellow

$layouts = @(
    "AppContentRenderer", "AppShell", "AppShellLayout", "AsyncBoundary",
    "CenteredLayout", "GridLayout", "LayoutComposer", "ManagerLayout",
    "PageContainer", "PageContainerLayout", "PerformanceMonitor",
    "SplitViewLayout", "StackLayout", "StickyHeaderLayout", "TabbedPageLayout",
    "ThreeColumnLayout", "TwoColumnLayout", "withErrorBoundary"
)

foreach ($layout in $layouts) {
    $source = Join-Path $componentsRoot "layouts\$layout"
    $dest = Join-Path $componentsRoot "ui\layouts\$layout"
    
    if (Test-Path $source) {
        Write-Host "  Moving $layout..." -ForegroundColor Gray
        Move-Item -Path $source -Destination $dest -Force
    }
}

# Move layouts index.ts
if (Test-Path "$componentsRoot\layouts\index.ts") {
    Copy-Item "$componentsRoot\layouts\index.ts" "$componentsRoot\ui\layouts\index.ts" -Force
}

Write-Host "  ✓ Layouts reorganized" -ForegroundColor Green

# ============================================================================
# Phase 4: Move Domain Organisms to features/
# ============================================================================
Write-Host "[4/7] Reorganizing Domain-Specific Organisms..." -ForegroundColor Yellow

# Cases domain
$casesOrganisms = @("DocketSkeleton", "Kanban", "RiskMeter", "TaskCreationModal", "TimeEntryModal")
foreach ($comp in $casesOrganisms) {
    $source = Join-Path $componentsRoot "organisms\cases\$comp"
    $dest = Join-Path $componentsRoot "features\cases\components\$comp"
    
    if (Test-Path $source) {
        Write-Host "  Moving cases/$comp..." -ForegroundColor Gray
        if (-not (Test-Path (Join-Path $componentsRoot "features\cases\components"))) {
            New-Item -ItemType Directory -Path (Join-Path $componentsRoot "features\cases\components") -Force | Out-Null
        }
        Move-Item -Path $source -Destination $dest -Force
    }
}

# Discovery domain
$discoveryOrganisms = @("DiffViewer", "EditorToolbar", "ExportMenu", "PDFViewer", "SignaturePad")
foreach ($comp in $discoveryOrganisms) {
    $source = Join-Path $componentsRoot "organisms\discovery\$comp"
    $dest = Join-Path $componentsRoot "features\discovery\components\$comp"
    
    if (Test-Path $source) {
        Write-Host "  Moving discovery/$comp..." -ForegroundColor Gray
        if (-not (Test-Path (Join-Path $componentsRoot "features\discovery\components"))) {
            New-Item -ItemType Directory -Path (Join-Path $componentsRoot "features\discovery\components") -Force | Out-Null
        }
        Move-Item -Path $source -Destination $dest -Force
    }
}

# Other organism domains
$organismDomains = @("admin", "billing", "calendar", "collaboration", "core", "navigation", "search")
foreach ($domain in $organismDomains) {
    $source = Join-Path $componentsRoot "organisms\$domain"
    $dest = Join-Path $componentsRoot "features\$domain\components"
    
    if (Test-Path $source) {
        Write-Host "  Moving $domain organisms..." -ForegroundColor Gray
        if (-not (Test-Path (Split-Path $dest))) {
            New-Item -ItemType Directory -Path (Split-Path $dest) -Force | Out-Null
        }
        Move-Item -Path $source -Destination $dest -Force
    }
}

Write-Host "  ✓ Domain organisms reorganized" -ForegroundColor Green

# ============================================================================
# Phase 5: Move Pages to features/[domain]/pages/
# ============================================================================
Write-Host "[5/7] Reorganizing Pages..." -ForegroundColor Yellow

$pageDomains = @("cases", "collaboration", "dashboard", "documents", "knowledge", "litigation", "operations", "user")
foreach ($domain in $pageDomains) {
    $source = Join-Path $componentsRoot "pages\$domain"
    $dest = Join-Path $componentsRoot "features\$domain\pages"
    
    if (Test-Path $source) {
        Write-Host "  Moving $domain pages..." -ForegroundColor Gray
        if (-not (Test-Path (Split-Path $dest))) {
            New-Item -ItemType Directory -Path (Split-Path $dest) -Force | Out-Null
        }
        Move-Item -Path $source -Destination $dest -Force
    }
}

Write-Host "  ✓ Pages reorganized" -ForegroundColor Green

# ============================================================================
# Phase 6: Move Shared Organisms to shared/
# ============================================================================
Write-Host "[6/7] Reorganizing Shared Components..." -ForegroundColor Yellow

# Move navigation-related organisms to shared/navigation
$source = Join-Path $componentsRoot "organisms\navigation"
if (Test-Path $source) {
    Move-Item -Path $source -Destination (Join-Path $componentsRoot "shared\navigation\components") -Force
}

# Move search to shared
$source = Join-Path $componentsRoot "organisms\search"
if (Test-Path $source) {
    if (-not (Test-Path (Join-Path $componentsRoot "shared\search"))) {
        New-Item -ItemType Directory -Path (Join-Path $componentsRoot "shared\search") -Force | Out-Null
    }
    Move-Item -Path $source -Destination (Join-Path $componentsRoot "shared\search\components") -Force
}

Write-Host "  ✓ Shared components reorganized" -ForegroundColor Green

# ============================================================================
# Phase 7: Handle Legacy and Stories
# ============================================================================
Write-Host "[7/7] Organizing Legacy and Stories..." -ForegroundColor Yellow

# Keep _legacy folder for now (will be removed after testing)
# Stories folder stays as-is for Storybook

Write-Host "  ✓ Legacy and stories organized" -ForegroundColor Green

# ============================================================================
# Summary
# ============================================================================
Write-Host ""
Write-Host "=== Reorganization Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "New Structure:" -ForegroundColor White
Write-Host "  • ui/atoms/         - UI primitives (${atoms.Count} components)" -ForegroundColor Gray
Write-Host "  • ui/molecules/     - Composed UI (${molecules.Count} components)" -ForegroundColor Gray
Write-Host "  • ui/layouts/       - Page layouts (${layouts.Count} components)" -ForegroundColor Gray
Write-Host "  • features/         - Domain features (10 domains)" -ForegroundColor Gray
Write-Host "  • shared/           - Cross-cutting concerns" -ForegroundColor Gray
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor White
Write-Host "  1. Create index.ts files for barrel exports" -ForegroundColor Gray
Write-Host "  2. Update import paths in codebase" -ForegroundColor Gray
Write-Host "  3. Update config/modules.tsx" -ForegroundColor Gray
Write-Host "  4. Run tests and fix any issues" -ForegroundColor Gray
Write-Host "  5. Remove old directories after verification" -ForegroundColor Gray
Write-Host ""
