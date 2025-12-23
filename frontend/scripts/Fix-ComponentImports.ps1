# Fix-ComponentImports.ps1
# Updates relative imports in reorganized component directories

$ErrorActionPreference = "Stop"
$rootDir = "f:\temp\lexiflow-premium\frontend"

Write-Host "Fixing relative imports in reorganized components..." -ForegroundColor Cyan

# Define directory depth changes (how many levels deeper than before)
$depthChanges = @{
    "components\matters\list" = 1           # was components/case-list
    "components\matters\detail" = 1          # was components/case-detail
    "components\matters\create" = 1          # was components/case-management
    "components\matters\docket" = 1          # was components/docket
    "components\matters\entities" = 1        # was components/entities
    "components\matters\workflow" = 1        # was components/workflow
    "components\matters\calendar" = 1        # was components/calendar
    "components\litigation\strategy" = 1     # was components/litigation
    "components\litigation\discovery" = 1    # was components/discovery
    "components\litigation\evidence" = 1     # was components/evidence
    "components\litigation\exhibits" = 1     # was components/exhibits
    "components\litigation\pleadings" = 1    # was components/pleading
    "components\litigation\war-room" = 1     # was components/war-room
    "components\operations\documents" = 1    # was components/documents
    "components\operations\billing" = 1      # was components/billing
    "components\operations\compliance" = 1   # was components/compliance
    "components\operations\correspondence" = 1 # was components/correspondence
    "components\operations\messenger" = 1    # was components/messenger
    "components\operations\crm" = 1          # was components/crm
    "components\knowledge\base" = 1          # was components/knowledge
    "components\knowledge\research" = 1      # was components/research
    "components\knowledge\citation" = 1      # was components/citation
    "components\knowledge\clauses" = 1       # was components/clauses
    "components\knowledge\rules" = 1         # was components/rules
    "components\knowledge\jurisdiction" = 1  # was components/jurisdiction
    "components\knowledge\practice" = 1      # was components/practice
    "components\admin\analytics" = 1         # was components/analytics
}

$totalFixed = 0

foreach ($relPath in $depthChanges.Keys) {
    $extraDepth = $depthChanges[$relPath]
    $fullPath = Join-Path $rootDir $relPath
    
    if (-not (Test-Path $fullPath)) {
        Write-Host "  Skipping $relPath (not found)" -ForegroundColor Yellow
        continue
    }
    
    Write-Host "`nProcessing $relPath..." -ForegroundColor Cyan
    
    $tsxFiles = Get-ChildItem -Path $fullPath -Recurse -Filter "*.tsx" -File
    
    foreach ($file in $tsxFiles) {
        $content = Get-Content $file.FullName -Raw
        $originalContent = $content
        
        # Add extra ../ for each level of added depth
        # Pattern: from '../something' -> from '../../something'
        # Pattern: from '../../something' -> from '../../../something'
        
        for ($i = 0; $i -lt $extraDepth; $i++) {
            $content = $content -replace "from\s+(['`"])\.\./((?:\.\./)*)", "from `$1../../`$2"
            $content = $content -replace "import\s+(['`"])\.\./((?:\.\./)*)", "import `$1../../`$2"
        }
        
        if ($content -ne $originalContent) {
            Set-Content -Path $file.FullName -Value $content -NoNewline
            $totalFixed++
            $relativePath = $file.FullName.Replace("$rootDir\", "")
            Write-Host "  ✓ Fixed: $relativePath" -ForegroundColor Green
        }
    }
}

Write-Host "`n========================================" -ForegroundColor Magenta
Write-Host "✓ Fixed $totalFixed files" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Magenta
