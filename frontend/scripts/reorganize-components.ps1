# Component Directory Reorganization Script
# This script reorganizes the frontend/components directory to align with navigation categories

param(
    [switch]$DryRun = $false,
    [switch]$Force = $false
)

$ErrorActionPreference = "Stop"
$componentsDir = "f:\temp\lexiflow-premium\frontend\components"
$backupDir = "f:\temp\lexiflow-premium\frontend\components.backup"

# Migration map: old path -> new path
$migrations = @{
    # Category 2: Matters (Case Work)
    "case-list" = "matters/list"
    "case-detail" = "matters/detail"
    "case-management" = "matters/create"
    "docket" = "matters/docket"
    "entities" = "matters/entities"
    "workflow" = "matters/workflow"
    "calendar" = "matters/calendar"
    
    # Category 3: Litigation Tools
    "litigation" = "litigation/strategy"
    "discovery" = "litigation/discovery"
    "evidence" = "litigation/evidence"
    "exhibits" = "litigation/exhibits"
    "pleading" = "litigation/pleadings"
    "war-room" = "litigation/war-room"
    
    # Category 4: Operations
    "documents" = "operations/documents"
    "billing" = "operations/billing"
    "compliance" = "operations/compliance"
    "correspondence" = "operations/correspondence"
    "messenger" = "operations/messenger"
    "crm" = "operations/crm"
    
    # Category 5: Knowledge
    "knowledge" = "knowledge/base"
    "research" = "knowledge/research"
    "citation" = "knowledge/citation"
    "clauses" = "knowledge/clauses"
    "rules" = "knowledge/rules"
    "jurisdiction" = "knowledge/jurisdiction"
    "practice" = "knowledge/practice"
    
    # Category 6: Admin (analytics moves under admin)
    "analytics" = "admin/analytics"
}

# Main execution
try {
    Write-Host "LexiFlow Component Reorganization Script" -ForegroundColor Magenta
    Write-Host "=========================================`n" -ForegroundColor Magenta
    
    if ($DryRun) {
        Write-Host "[DRY RUN MODE] No changes will be made`n" -ForegroundColor Yellow
    }
    
    # Step 1: Backup
    if (-not $DryRun) {
        if (Test-Path $backupDir) {
            if (-not $Force) {
                Write-Host "Backup directory exists: $backupDir" -ForegroundColor Yellow
                $confirm = Read-Host "Delete existing backup? (y/N)"
                if ($confirm -ne 'y') {
                    throw "Backup cancelled by user"
                }
            }
            Remove-Item $backupDir -Recurse -Force
        }
        
        Write-Host "Creating backup..." -ForegroundColor Cyan
        Copy-Item $componentsDir $backupDir -Recurse
        Write-Host "✓ Backup created at $backupDir" -ForegroundColor Green
    }
    
    # Step 2: Create new structure
    Write-Host "`nCreating new directory structure..." -ForegroundColor Cyan
    
    $newDirs = @(
        "matters/list", "matters/detail", "matters/create", "matters/docket", 
        "matters/entities", "matters/workflow", "matters/calendar",
        "litigation/strategy", "litigation/discovery", "litigation/evidence", 
        "litigation/exhibits", "litigation/pleadings", "litigation/war-room",
        "operations/documents", "operations/billing", "operations/compliance", 
        "operations/correspondence", "operations/messenger", "operations/crm",
        "knowledge/base", "knowledge/research", "knowledge/citation", 
        "knowledge/clauses", "knowledge/rules", "knowledge/jurisdiction", "knowledge/practice",
        "admin/analytics"
    )
    
    foreach ($dir in $newDirs) {
        $fullPath = Join-Path $componentsDir $dir
        if (-not (Test-Path $fullPath)) {
            if (-not $DryRun) {
                New-Item -ItemType Directory -Path $fullPath -Force | Out-Null
            }
            Write-Host "  Created: $dir" -ForegroundColor Green
        }
    }
    
    # Step 3: Move files
    Write-Host "`nMigrating component files..." -ForegroundColor Cyan
    
    foreach ($oldPath in $migrations.Keys) {
        $newPath = $migrations[$oldPath]
        $oldFullPath = Join-Path $componentsDir $oldPath
        $newFullPath = Join-Path $componentsDir $newPath
        
        if (-not (Test-Path $oldFullPath)) {
            Write-Host "  Source not found: $oldPath (skipping)" -ForegroundColor Yellow
            continue
        }
        
        Write-Host "  Moving $oldPath -> $newPath" -ForegroundColor Cyan
        
        if ($DryRun) {
            Write-Host "    [DRY RUN] Would move contents" -ForegroundColor Yellow
        } else {
            # Copy all contents
            Copy-Item -Path "$oldFullPath\*" -Destination $newFullPath -Recurse -Force
            
            # Remove old directory
            Remove-Item $oldFullPath -Recurse -Force
            Write-Host "    ✓ Moved" -ForegroundColor Green
        }
    }
    
    # Step 4: Update imports
    Write-Host "`nUpdating import statements..." -ForegroundColor Cyan
    
    $allTsxFiles = Get-ChildItem -Path $componentsDir -Recurse -Filter "*.tsx" -File
    $updateCount = 0
    
    foreach ($file in $allTsxFiles) {
        $content = Get-Content $file.FullName -Raw
        $originalContent = $content
        
        foreach ($oldPath in $migrations.Keys) {
            $newPath = $migrations[$oldPath]
            
            # Update relative imports
            $content = $content -replace "from\s+(['""])\.\./$oldPath/", "from `$1../$newPath/"
            $content = $content -replace "from\s+(['""])\.\./\.\./$oldPath/", "from `$1../../$newPath/"
            $content = $content -replace "from\s+(['""])\.\./(\.\./)+" + [regex]::Escape($oldPath) + "/", "from `$1../$newPath/"
        }
        
        if ($content -ne $originalContent) {
            $updateCount++
            if (-not $DryRun) {
                Set-Content -Path $file.FullName -Value $content -NoNewline
            }
        }
    }
    
    Write-Host "  ✓ Updated $updateCount files" -ForegroundColor Green
    
    # Step 5: Update modules.tsx
    Write-Host "`nUpdating config/modules.tsx..." -ForegroundColor Cyan
    
    $modulesPath = "f:\temp\lexiflow-premium\frontend\config\modules.tsx"
    $content = Get-Content $modulesPath -Raw
    $originalContent = $content
    
    foreach ($oldPath in $migrations.Keys) {
        $newPath = $migrations[$oldPath]
        $content = $content -replace "import\((['""])\.\.\/components\/$oldPath\/", "import(`$1../components/$newPath/"
    }
    
    if ($content -ne $originalContent) {
        Write-Host "  ✓ Updated modules.tsx" -ForegroundColor Green
        if (-not $DryRun) {
            Set-Content -Path $modulesPath -Value $content -NoNewline
        }
    } else {
        Write-Host "  No changes needed" -ForegroundColor Gray
    }
    
    # Summary
    Write-Host "`n========================================" -ForegroundColor Magenta
    Write-Host "REORGANIZATION SUMMARY" -ForegroundColor Magenta
    Write-Host "========================================" -ForegroundColor Magenta
    
    Write-Host "`nNew Structure:" -ForegroundColor Cyan
    Write-Host "  matters/      - Case management"
    Write-Host "  litigation/   - Litigation tools"
    Write-Host "  operations/   - Business operations"
    Write-Host "  knowledge/    - Knowledge management"
    Write-Host "  admin/        - Administration + analytics"
    
    if ($DryRun) {
        Write-Host "`n[DRY RUN MODE] No changes were made" -ForegroundColor Yellow
        Write-Host "Run without -DryRun to apply changes" -ForegroundColor Yellow
    } else {
        Write-Host "`n✓ Reorganization complete!" -ForegroundColor Green
        Write-Host "Backup location: $backupDir" -ForegroundColor Cyan
    }
    
} catch {
    Write-Host "✗ Reorganization failed: $_" -ForegroundColor Red
    Write-Host "Restore from backup if needed: $backupDir" -ForegroundColor Yellow
    exit 1
}

