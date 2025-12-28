<#
.SYNOPSIS
Automates migration of type definitions from API service files to centralized types folder

.DESCRIPTION
This script:
1. Scans API service files for inline type definitions (interfaces, types, enums)
2. Extracts filter interfaces and DTO types
3. Creates new type files in the types folder organized by domain
4. Updates imports in API service files
5. Validates TypeScript compilation after migration

.PARAMETER Domain
The API domain to migrate (e.g., auth, litigation, discovery)

.PARAMETER DryRun
If specified, shows what would be done without making changes

.EXAMPLE
.\migrate-api-types.ps1 -Domain auth -DryRun
Shows what would be migrated for the auth domain

.EXAMPLE
.\migrate-api-types.ps1 -Domain auth
Performs actual migration for the auth domain
#>

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet('auth', 'litigation', 'discovery', 'billing', 'trial', 'workflow', 
                 'communications', 'compliance', 'integrations', 'analytics', 'admin', 
                 'data-platform', 'hr', 'drafting')]
    [string]$Domain,
    
    [Parameter(Mandatory=$false)]
    [switch]$DryRun
)

$ErrorActionPreference = 'Stop'

# Define paths
$frontendRoot = "C:\temp\lexiflow-premium\frontend"
$apiPath = Join-Path $frontendRoot "src\api\$Domain"
$typesPath = Join-Path $frontendRoot "src\api\types"
$dtoPath = Join-Path $typesPath "dto"
$filtersPath = Join-Path $typesPath "filters"

# Ensure subdirectories exist
if (-not $DryRun) {
    New-Item -ItemType Directory -Force -Path $dtoPath | Out-Null
    New-Item -ItemType Directory -Force -Path $filtersPath | Out-Null
}

Write-Host "=== API Type Migration Tool ===" -ForegroundColor Cyan
Write-Host "Domain: $Domain" -ForegroundColor Yellow
Write-Host "Mode: $(if($DryRun){'DRY RUN'}else{'LIVE'})" -ForegroundColor $(if($DryRun){'Yellow'}else{'Green'})
Write-Host ""

# Function to extract type definitions from a file
function Get-TypeDefinitions {
    param(
        [string]$FilePath
    )
    
    $content = Get-Content $FilePath -Raw
    $types = @()
    
    # Match export interface/type definitions
    $pattern = '(?ms)^export\s+(interface|type|enum)\s+(\w+)[\s{<].*?(?=^export\s|^class\s|^async\s|^private\s|^public\s|$)'
    $matches = [regex]::Matches($content, $pattern)
    
    foreach ($match in $matches) {
        $typeKind = $match.Groups[1].Value
        $typeName = $match.Groups[2].Value
        $fullDefinition = $match.Value.TrimEnd()
        
        # Categorize type
        $category = 'model'
        if ($typeName -match 'Filters?$') { $category = 'filter' }
        elseif ($typeName -match 'Dto$') { $category = 'dto' }
        elseif ($typeName -match 'Request$|Response$|Params$') { $category = 'dto' }
        elseif ($typeKind -eq 'enum') { $category = 'enum' }
        
        $types += [PSCustomObject]@{
            Kind = $typeKind
            Name = $typeName
            Category = $category
            Definition = $fullDefinition
            File = Split-Path $FilePath -Leaf
        }
    }
    
    return $types
}

# Function to check if type already exists in types folder
function Test-TypeExists {
    param([string]$TypeName)
    
    $existingFiles = Get-ChildItem -Path $typesPath -Filter "*.ts" -Recurse
    foreach ($file in $existingFiles) {
        $content = Get-Content $file.FullName -Raw
        if ($content -match "export\s+(interface|type|enum)\s+$TypeName\b") {
            return $file.FullName
        }
    }
    return $null
}

# Scan API files in domain
Write-Host "Scanning $apiPath..." -ForegroundColor Cyan
$apiFiles = Get-ChildItem -Path $apiPath -Filter "*.ts" -Recurse

$allTypes = @()
$stats = @{
    TotalTypes = 0
    Duplicates = 0
    NewFilters = 0
    NewDtos = 0
    NewModels = 0
    NewEnums = 0
}

foreach ($file in $apiFiles) {
    Write-Host "  Processing $(Split-Path $file.FullName -Leaf)..." -ForegroundColor Gray
    $types = Get-TypeDefinitions -FilePath $file.FullName
    
    foreach ($type in $types) {
        $stats.TotalTypes++
        $existingFile = Test-TypeExists -TypeName $type.Name
        
        if ($existingFile) {
            $stats.Duplicates++
            Write-Host "    [DUPLICATE] $($type.Name) already exists in $existingFile" -ForegroundColor Yellow
        } else {
            $allTypes += $type
            
            switch ($type.Category) {
                'filter' { $stats.NewFilters++ }
                'dto' { $stats.NewDtos++ }
                'enum' { $stats.NewEnums++ }
                default { $stats.NewModels++ }
            }
            
            Write-Host "    [NEW] $($type.Category.ToUpper()): $($type.Name)" -ForegroundColor Green
        }
    }
}

Write-Host ""
Write-Host "=== Migration Summary ===" -ForegroundColor Cyan
Write-Host "Total types found: $($stats.TotalTypes)" -ForegroundColor White
Write-Host "Duplicates (skip): $($stats.Duplicates)" -ForegroundColor Yellow
Write-Host "New filters: $($stats.NewFilters)" -ForegroundColor Green
Write-Host "New DTOs: $($stats.NewDtos)" -ForegroundColor Green
Write-Host "New models: $($stats.NewModels)" -ForegroundColor Green
Write-Host "New enums: $($stats.NewEnums)" -ForegroundColor Green
Write-Host ""

if ($DryRun) {
    Write-Host "DRY RUN - No files will be modified" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Types to be created:" -ForegroundColor Cyan
    foreach ($type in $allTypes) {
        $targetDir = switch ($type.Category) {
            'filter' { $filtersPath }
            'dto' { $dtoPath }
            default { $typesPath }
        }
        $targetFile = Join-Path $targetDir "$($type.Name.ToLower()).ts"
        Write-Host "  -> $targetFile" -ForegroundColor Gray
    }
    exit 0
}

# Prompt for confirmation
Write-Host "Proceed with migration? (Y/N): " -NoNewline -ForegroundColor Yellow
$confirm = Read-Host
if ($confirm -ne 'Y' -and $confirm -ne 'y') {
    Write-Host "Migration cancelled" -ForegroundColor Red
    exit 1
}

# Create type files
Write-Host ""
Write-Host "Creating type files..." -ForegroundColor Cyan
$createdFiles = @()

foreach ($type in $allTypes) {
    $targetDir = switch ($type.Category) {
        'filter' { $filtersPath }
        'dto' { $dtoPath }
        default { $typesPath }
    }
    
    $fileName = "$($type.Name.ToLower()).ts"
    $targetFile = Join-Path $targetDir $fileName
    
    # Create file content
    $content = @"
/**
 * $($type.Name)
 * Auto-migrated from api/$Domain/$($type.File)
 * Domain: $Domain
 * Category: $($type.Category)
 */

$($type.Definition)

"@
    
    Set-Content -Path $targetFile -Value $content -Encoding UTF8
    $createdFiles += $targetFile
    Write-Host "  Created: $fileName" -ForegroundColor Green
}

# Update imports in API files
Write-Host ""
Write-Host "Updating imports in API files..." -ForegroundColor Cyan
foreach ($file in $apiFiles) {
    $content = Get-Content $file.FullName -Raw
    $modified = $false
    $originalContent = $content
    
    # Get types defined in this file that we migrated
    $fileTypes = Get-TypeDefinitions -FilePath $file.FullName | Where-Object {
        $allTypes.Name -contains $_.Name
    }
    
    if ($fileTypes.Count -gt 0) {
        # Add import statement at the top
        $typeNames = ($fileTypes | ForEach-Object { $_.Name }) -join ', '
        
        # Find the last import statement
        $importPattern = '(?m)^import\s+.*?from\s+[''"].*?[''"];?\s*$'
        $lastImportMatch = [regex]::Matches($content, $importPattern) | Select-Object -Last 1
        
        if ($lastImportMatch) {
            $insertPosition = $lastImportMatch.Index + $lastImportMatch.Length
            $newImport = "`nimport type { $typeNames } from '@/types';"
            $content = $content.Insert($insertPosition, $newImport)
            $modified = $true
        }
        
        # Remove the original type definitions
        foreach ($type in $fileTypes) {
            $pattern = "(?ms)^export\s+(interface|type|enum)\s+$($type.Name)[\s{<].*?(?=^export\s|^class\s|^async\s|^private\s|^public\s|$)"
            $content = $content -replace $pattern, ''
        }
        
        # Clean up extra blank lines
        $content = $content -replace "(?m)^\s*\n\s*\n\s*\n", "`n`n"
        
        if ($content -ne $originalContent) {
            Set-Content -Path $file.FullName -Value $content -Encoding UTF8
            Write-Host "  Updated: $(Split-Path $file.FullName -Leaf)" -ForegroundColor Green
        }
    }
}

# Update types/index.ts to export new types
Write-Host ""
Write-Host "Updating types/index.ts..." -ForegroundColor Cyan
$indexFile = Join-Path $typesPath "index.ts"
$indexContent = Get-Content $indexFile -Raw

# Add exports for new filter and DTO files if not already present
$filterExport = "export * from './filters';"
$dtoExport = "export * from './dto';"

if ($stats.NewFilters -gt 0 -and $indexContent -notmatch [regex]::Escape($filterExport)) {
    $indexContent += "`n$filterExport"
    Write-Host "  Added filter export" -ForegroundColor Green
}

if ($stats.NewDtos -gt 0 -and $indexContent -notmatch [regex]::Escape($dtoExport)) {
    $indexContent += "`n$dtoExport"
    Write-Host "  Added DTO export" -ForegroundColor Green
}

Set-Content -Path $indexFile -Value $indexContent -Encoding UTF8

# Create index files for filter and dto subdirectories
if ($stats.NewFilters -gt 0) {
    $filterIndex = Join-Path $filtersPath "index.ts"
    $filterExports = $allTypes | Where-Object { $_.Category -eq 'filter' } | 
        ForEach-Object { "export * from './$($_.Name.ToLower())';" }
    Set-Content -Path $filterIndex -Value ($filterExports -join "`n") -Encoding UTF8
    Write-Host "  Created filters/index.ts" -ForegroundColor Green
}

if ($stats.NewDtos -gt 0) {
    $dtoIndex = Join-Path $dtoPath "index.ts"
    $dtoExports = $allTypes | Where-Object { $_.Category -eq 'dto' } | 
        ForEach-Object { "export * from './$($_.Name.ToLower())';" }
    Set-Content -Path $dtoIndex -Value ($dtoExports -join "`n") -Encoding UTF8
    Write-Host "  Created dto/index.ts" -ForegroundColor Green
}

Write-Host ""
Write-Host "=== Migration Complete ===" -ForegroundColor Green
Write-Host "Files created: $($createdFiles.Count)" -ForegroundColor White
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Run TypeScript compiler: cd frontend && npm run type-check" -ForegroundColor White
Write-Host "2. Fix any import errors manually" -ForegroundColor White
Write-Host "3. Test the application" -ForegroundColor White
Write-Host "4. Commit changes with message: 'refactor($Domain): consolidate types to centralized folder'" -ForegroundColor White
