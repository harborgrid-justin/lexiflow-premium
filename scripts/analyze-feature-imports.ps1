# Find Cross-Feature Import Violations
# This script identifies features importing directly from other features

Write-Host "🔍 Analyzing cross-feature imports..." -ForegroundColor Cyan
Write-Host ""

$featuresPath = "C:\temp\lexiflow-premium\frontend\src\features"
$violations = @()

# Feature domains to check
$domains = @(
    "cases",
    "litigation", 
    "knowledge",
    "operations",
    "admin",
    "dashboard",
    "profile",
    "visual",
    "drafting",
    "document-assembly"
)

# Scan each feature
foreach ($domain in $domains) {
    $domainPath = Join-Path $featuresPath $domain
    
    if (Test-Path $domainPath) {
        # Find all TypeScript files
        $files = Get-ChildItem -Path $domainPath -Recurse -Include "*.tsx","*.ts" | Where-Object { $_.Name -notmatch "\.test\." }
        
        foreach ($file in $files) {
            $content = Get-Content $file.FullName -Raw
            
            # Check for imports from other features
            foreach ($otherDomain in $domains) {
                if ($otherDomain -ne $domain) {
                    # Pattern: from '@features/otherdomain' or from '@/features/otherdomain' or internal paths
                    # But exclude shared imports
                    if ($content -match "from\s+['\`"]@/?features/$otherDomain/[^']*['\`"]" -and 
                        $content -notmatch "from\s+['\`"]@/?features/shared") {
                        
                        $matchLine = ($content -split "`n" | Select-String "from\s+['\`"]@/?features/$otherDomain" | Select-Object -First 1)
                        
                        # Only flag if importing internal paths (has / after domain name)
                        if ($matchLine -match "from\s+['\`"]@/?features/$otherDomain/") {
                            $violations += [PSCustomObject]@{
                                File = $file.FullName.Replace($featuresPath + "\", "")
                                Domain = $domain
                                ImportsFrom = $otherDomain
                                Line = $matchLine.LineNumber
                            }
                        }
                    }
                }
            }
        }
    }
}

# Display results
if ($violations.Count -eq 0) {
    Write-Host "✅ No cross-feature import violations found!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Found $($violations.Count) cross-feature import violations:" -ForegroundColor Yellow
    Write-Host ""
    
    # Group by importing domain
    $violations | Group-Object Domain | ForEach-Object {
        Write-Host "📁 $($_.Name) feature:" -ForegroundColor Magenta
        $_.Group | ForEach-Object {
            Write-Host "   → imports from $($_.ImportsFrom) in: $($_.File)" -ForegroundColor Yellow
        }
        Write-Host ""
    }
    
    # Summary
    Write-Host "📊 Summary by target feature:" -ForegroundColor Cyan
    $violations | Group-Object ImportsFrom | Sort-Object Count -Descending | ForEach-Object {
        Write-Host "   $($_.Name): $($_.Count) imports" -ForegroundColor White
    }
    
    Write-Host ""
    Write-Host "💡 To fix: Move common code to /features/shared or use feature public APIs" -ForegroundColor Blue
}

Write-Host ""
Write-Host "✅ Analysis complete!" -ForegroundColor Green
