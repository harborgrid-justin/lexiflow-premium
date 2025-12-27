# LexiFlow Backend - Production Memory-Optimized Deployment Script (PowerShell)
# This script automates the complete production deployment with memory optimizations

param(
    [string]$Environment = "production",
    [switch]$SkipTests,
    [switch]$SeedData
)

# Configuration
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir
$Timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$LogFile = Join-Path $ProjectRoot "deployment-$Timestamp.log"

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Cyan"
$White = "White"

function Write-Log {
    param([string]$Message, [string]$Color = $White)
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $LogMessage = "[$Timestamp] $Message"
    Write-Host $LogMessage -ForegroundColor $Color
    Add-Content -Path $LogFile -Value $LogMessage
}

function Write-Success {
    param([string]$Message)
    Write-Log "✓ $Message" $Green
}

function Write-Error {
    param([string]$Message)
    Write-Log "✗ $Message" $Red
}

function Write-Warning {
    param([string]$Message)
    Write-Log "⚠ $Message" $Yellow
}

# Header
Write-Host "================================================" -ForegroundColor $Blue
Write-Host "  LexiFlow Backend - Production Deployment" -ForegroundColor $Blue
Write-Host "  Memory-Optimized Enterprise Setup" -ForegroundColor $Blue
Write-Host "================================================" -ForegroundColor $Blue
Write-Log ""

# Pre-deployment checks
Write-Log "Running pre-deployment checks..."

# Check Node.js version
try {
    $NodeVersion = & node --version 2>$null
    if ($LASTEXITCODE -ne 0) { throw "Node.js not found" }
    $NodeVersion = $NodeVersion -replace '^v', ''
    Write-Log "Node.js version: $NodeVersion"
} catch {
    Write-Error "Node.js not found or not working"
    exit 1
}

# Check npm version
try {
    $NpmVersion = & npm --version 2>$null
    if ($LASTEXITCODE -ne 0) { throw "npm not found" }
    Write-Log "NPM version: $NpmVersion"
} catch {
    Write-Error "npm not found or not working"
    exit 1
}

# Check if .env file exists
$EnvFile = Join-Path $ProjectRoot ".env.$Environment"
$DefaultEnvFile = Join-Path $ProjectRoot ".env"
$TemplateFile = Join-Path $ProjectRoot ".env.production.template"

if (-not (Test-Path $EnvFile) -and -not (Test-Path $DefaultEnvFile)) {
    Write-Warning "No environment file found. Creating from template..."
    if (Test-Path $TemplateFile) {
        Copy-Item $TemplateFile $EnvFile
        Write-Warning "Please edit $EnvFile with your production values"
        exit 1
    } else {
        Write-Error "No .env template found"
        exit 1
    }
}

# Load environment variables
$EnvFileToLoad = if (Test-Path $EnvFile) { $EnvFile } else { $DefaultEnvFile }
Write-Log "Loading environment from $(Split-Path $EnvFileToLoad -Leaf)"

if (Test-Path $EnvFileToLoad) {
    Get-Content $EnvFileToLoad | ForEach-Object {
        if ($_ -and -not $_.StartsWith("#")) {
            $key, $value = $_.Split("=", 2)
            if ($key -and $value) {
                [Environment]::SetEnvironmentVariable($key.Trim(), $value.Trim())
            }
        }
    }
}

# Set production memory defaults if not set
if (-not $env:NODE_ENV) { $env:NODE_ENV = "production" }
if (-not $env:NODE_OPTIONS) {
    $env:NODE_OPTIONS = "--max-old-space-size=2048 --max-semi-space-size=16 --expose-gc --optimize-for-size --gc-interval=100"
}
if (-not $env:UV_THREADPOOL_SIZE) { $env:UV_THREADPOOL_SIZE = "8" }
if (-not $env:MEMORY_MONITORING_ENABLED) { $env:MEMORY_MONITORING_ENABLED = "true" }

Write-Log "Memory configuration:"
Write-Log "  NODE_OPTIONS: $env:NODE_OPTIONS"
Write-Log "  UV_THREADPOOL_SIZE: $env:UV_THREADPOOL_SIZE"
Write-Log "  MEMORY_MONITORING_ENABLED: $env:MEMORY_MONITORING_ENABLED"

# Install dependencies
Write-Log "Installing dependencies..."
try {
    & npm ci --production=false >> $LogFile 2>&1
    if ($LASTEXITCODE -ne 0) { throw "npm ci failed" }
    Write-Success "Dependencies installed"
} catch {
    Write-Error "Failed to install dependencies"
    exit 1
}

# Run security audit
Write-Log "Running security audit..."
try {
    & npm audit --audit-level=moderate >> $LogFile 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Security audit passed"
    } else {
        Write-Warning "Security vulnerabilities found - review audit output"
    }
} catch {
    Write-Warning "Security audit failed - continuing..."
}

# Type checking
Write-Log "Running type checking..."
try {
    & npm run typecheck >> $LogFile 2>&1
    if ($LASTEXITCODE -ne 0) { throw "Type checking failed" }
    Write-Success "Type checking passed"
} catch {
    Write-Error "Type checking failed"
    exit 1
}

# Linting
Write-Log "Running linting..."
try {
    & npm run lint:check >> $LogFile 2>&1
    if ($LASTEXITCODE -ne 0) { throw "Linting failed" }
    Write-Success "Linting passed"
} catch {
    Write-Error "Linting failed"
    exit 1
}

# Build application
Write-Log "Building application..."
$OriginalNodeOptions = $env:NODE_OPTIONS
$env:NODE_OPTIONS = "--max-old-space-size=8192"
try {
    & npm run build >> $LogFile 2>&1
    if ($LASTEXITCODE -ne 0) { throw "Build failed" }
    Write-Success "Build completed"
} catch {
    Write-Error "Build failed"
    exit 1
}
$env:NODE_OPTIONS = $OriginalNodeOptions

# Run tests (optional for production)
if ($SkipTests) {
    Write-Log "Skipping tests..."
} else {
    Write-Log "Running tests..."
    try {
        & npm run test:unit >> $LogFile 2>&1
        if ($LASTEXITCODE -ne 0) { throw "Tests failed" }
        Write-Success "Unit tests passed"
    } catch {
        Write-Error "Unit tests failed"
        exit 1
    }
}

# Database setup
Write-Log "Checking database connection..."
try {
    & npm run db:test >> $LogFile 2>&1
    if ($LASTEXITCODE -ne 0) { throw "Database connection failed" }
    Write-Success "Database connection OK"
} catch {
    Write-Error "Database connection failed"
    exit 1
}

# Run migrations
Write-Log "Running database migrations..."
try {
    & npm run migration:run >> $LogFile 2>&1
    if ($LASTEXITCODE -ne 0) { throw "Migrations failed" }
    Write-Success "Database migrations completed"
} catch {
    Write-Error "Database migrations failed"
    exit 1
}

# Seed data (if requested)
if ($SeedData) {
    Write-Log "Seeding database..."
    try {
        & npm run seed >> $LogFile 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Database seeded"
        } else {
            Write-Warning "Database seeding failed - continuing..."
        }
    } catch {
        Write-Warning "Database seeding failed - continuing..."
    }
}

# Deployment complete
Write-Log ""
Write-Host "================================================" -ForegroundColor $Blue
Write-Success "LexiFlow Backend deployment completed successfully!"
Write-Log ""
Write-Log "Next steps:"
Write-Log "1. Review configuration in .env.$Environment"
Write-Log "2. Start service: npm run start:prod:memory"
Write-Log "3. Monitor health: curl http://localhost:5000/api/health"
Write-Log "4. Check logs in $LogFile"
Write-Log ""
Write-Log "Memory optimizations active:"
Write-Log "• V8 Heap: 2GB limit with optimized GC"
Write-Log "• Real-time monitoring: Enabled"
Write-Log "• Stream processing: 10MB+ files"
Write-Log "• LRU caching: All services optimized"
Write-Host "================================================" -ForegroundColor $Blue

# Save deployment info
$DeploymentInfo = @"
Deployment completed at: $(Get-Date)
Environment: $Environment
Node.js version: $NodeVersion
Memory optimizations: Enabled
Log file: $LogFile
"@

$DeploymentInfo | Out-File -FilePath (Join-Path $ProjectRoot ".deployment-info") -Encoding UTF8
Write-Log "Deployment information saved to .deployment-info"