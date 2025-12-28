# Generate Index Files for All Directories
# Automatically creates index.ts barrel exports for components and features

param(
    [switch]$DryRun = $false
)

Write-Host "🔧 Generating index.ts files for all directories..." -ForegroundColor Cyan
Write-Host ""

$paths = @(
    "C:\temp\lexiflow-premium\frontend\src\components",
    "C:\temp\lexiflow-premium\frontend\src\features"
)

$totalCreated = 0
$totalSkipped = 0

foreach ($basePath in $paths) {
    $pathName = Split-Path $basePath -Leaf
    Write-Host "📁 Processing /$pathName..." -ForegroundColor Yellow
    
    # Find all directories with TypeScript files but no index.ts
    $directories = Get-ChildItem -Path $basePath -Recurse -Directory | Where-Object {
        $dir = $_
        $tsFiles = $dir.GetFiles("*.tsx") + $dir.GetFiles("*.ts") | Where-Object { $_.Name -ne "index.ts" }
        $hasFiles = $tsFiles.Count -gt 0
        $hasIndex = Test-Path (Join-Path $dir.FullName "index.ts")
        $hasFiles -and -not $hasIndex
    }
    
    foreach ($dir in $directories) {
        $relativePath = $dir.FullName.Replace($basePath + "\", "").Replace("\", "/")
        
        # Get all TypeScript files (excluding index.ts and test files)
        $files = Get-ChildItem -Path $dir.FullName -File | Where-Object {
            ($_.Extension -eq ".tsx" -or $_.Extension -eq ".ts") -and
            $_.Name -ne "index.ts" -and
            $_.Name -notmatch "\.test\." -and
            $_.Name -notmatch "\.spec\." -and
            $_.Name -notmatch "\.stories\."
        }
        
        if ($files.Count -eq 0) {
            continue
        }
        
        # Determine if this is a types/constants/utils folder
        $folderName = Split-Path $dir.FullName -Leaf
        $isUtilFolder = $folderName -match "^(types|utils|constants|hooks|services)$"
        
        # Build export statements
        $exports = @()
        $header = "/**`n * $(Split-Path $dir.FullName -Leaf)`n"
        
        # Add description based on folder type
        if ($folderName -eq "components") {
            $header += " * Component exports`n"
        } elseif ($folderName -eq "hooks") {
            $header += " * Custom hooks`n"
        } elseif ($folderName -eq "services") {
            $header += " * Services`n"
        } elseif ($folderName -eq "types") {
            $header += " * Type definitions`n"
        } elseif ($folderName -eq "utils") {
            $header += " * Utility functions`n"
        } elseif ($folderName -eq "constants") {
            $header += " * Constants`n"
        } else {
            $header += " * Module exports`n"
        }
        
        $header += " */"
        
        foreach ($file in $files) {
            $fileName = $file.BaseName
            
            # For types/utils/constants, use export * pattern
            if ($isUtilFolder) {
                $exports += "export * from './$fileName';"
            } else {
                # For components, use named exports
                $content = Get-Content $file.FullName -Raw
                
                # Check if it has a default export
                $hasDefaultExport = $content -match "export\s+default"
                
                # Check for named exports
                $hasNamedExports = $content -match "export\s+(const|function|class|interface|type|enum)\s+\w+"
                
                if ($hasDefaultExport) {
                    $exports += "export { default as $fileName } from './$fileName';"
                } elseif ($hasNamedExports) {
                    $exports += "export * from './$fileName';"
                } else {
                    # Assume component name matches file name
                    $exports += "export { $fileName } from './$fileName';"
                }
            }
        }
        
        if ($exports.Count -eq 0) {
            $totalSkipped++
            continue
        }
        
        # Generate index.ts content
        $indexContent = $header + "`n`n" + ($exports -join "`n") + "`n"
        
        $indexPath = Join-Path $dir.FullName "index.ts"
        
        if ($DryRun) {
            Write-Host "   [DRY RUN] Would create: $relativePath/index.ts" -ForegroundColor Gray
        } else {
            Set-Content -Path $indexPath -Value $indexContent -Encoding UTF8
            Write-Host "   ✅ Created: $relativePath/index.ts ($($exports.Count) exports)" -ForegroundColor Green
            $totalCreated++
        }
    }
}

Write-Host ""
if ($DryRun) {
    Write-Host "🔍 Dry run complete. Would create $totalCreated index.ts files." -ForegroundColor Cyan
} else {
    Write-Host "✅ Complete! Created $totalCreated index.ts files." -ForegroundColor Green
}

if ($totalSkipped -gt 0) {
    Write-Host "⏭️  Skipped $totalSkipped directories (no exportable files)" -ForegroundColor Yellow
}
