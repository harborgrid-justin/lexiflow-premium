# Production Memory-Optimized Startup Script
# LexiFlow Premium - Backend Service (Windows PowerShell)
# 
# Usage: .\start-production-memory-optimized.ps1 [-Environment <env>]
# Environment: production | staging | development (default: production)

param(
    [string]$Environment = "production"
)

$ErrorActionPreference = "Stop"

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  LexiFlow Backend - Memory-Optimized Startup" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Environment: $Environment" -ForegroundColor Yellow
Write-Host ""

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir

# Load environment variables
$envFile = Join-Path $ProjectRoot ".env.$Environment"
if (Test-Path $envFile) {
    Write-Host "Loading environment from .env.$Environment" -ForegroundColor Green
    Get-Content $envFile | ForEach-Object {
        if ($_ -match "^([^#][^=]+)=(.*)$") {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($name, $value, "Process")
        }
    }
} elseif (Test-Path (Join-Path $ProjectRoot ".env")) {
    Write-Host "Loading environment from .env" -ForegroundColor Green
    Get-Content (Join-Path $ProjectRoot ".env") | ForEach-Object {
        if ($_ -match "^([^#][^=]+)=(.*)$") {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($name, $value, "Process")
        }
    }
} else {
    Write-Warning "No .env file found"
}

# Memory optimization flags
$nodeOptions = @(
    "--max-old-space-size=4096",
    "--max-semi-space-size=64",
    "--optimize-for-size",
    "--gc-interval=100",
    "--expose-gc"
) -join " "

$env:NODE_OPTIONS = $nodeOptions

# Thread pool optimization
if (-not $env:UV_THREADPOOL_SIZE) {
    $env:UV_THREADPOOL_SIZE = "8"
}

# Logging
if (-not $env:LOG_LEVEL) {
    $env:LOG_LEVEL = "info"
}
if (-not $env:LOG_FORMAT) {
    $env:LOG_FORMAT = "json"
}

Write-Host "Node Options: $env:NODE_OPTIONS" -ForegroundColor Cyan
Write-Host "UV Thread Pool Size: $env:UV_THREADPOOL_SIZE" -ForegroundColor Cyan
Write-Host ""

# Check if node_modules exists
if (-not (Test-Path (Join-Path $ProjectRoot "node_modules"))) {
    Write-Host "ERROR: node_modules not found. Run 'npm install' first." -ForegroundColor Red
    exit 1
}

# Check if dist exists
if (-not (Test-Path (Join-Path $ProjectRoot "dist"))) {
    Write-Host "Building application..." -ForegroundColor Yellow
    Set-Location $ProjectRoot
    npm run build
}

# Database migrations (production only)
if ($Environment -eq "production") {
    Write-Host "Running database migrations..." -ForegroundColor Yellow
    Set-Location $ProjectRoot
    npm run migration:run
}

# Start the application
Write-Host ""
Write-Host "Starting application with memory optimizations..." -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

Set-Location $ProjectRoot

if ($Environment -eq "production") {
    # Production mode - use compiled JS
    node dist/main.js
} else {
    # Development/Staging - use nest start with optimizations
    npm run start:dev
}
