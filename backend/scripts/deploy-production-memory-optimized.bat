@echo off
REM LexiFlow Backend - Production Memory-Optimized Deployment Script (Windows)
REM This script automates the complete production deployment with memory optimizations

setlocal enabledelayedexpansion

REM Configuration
set ENVIRONMENT=%1
if "%ENVIRONMENT%"=="" set ENVIRONMENT=production

set SCRIPT_DIR=%~dp0
set PROJECT_ROOT=%SCRIPT_DIR%..
set LOG_FILE=%PROJECT_ROOT%\deployment-%DATE:~-4,4%%DATE:~-10,2%%DATE:~-7,2%-%TIME:~0,2%%TIME:~3,2%%TIME:~6,2%.log
set LOG_FILE=%LOG_FILE: =0%

REM Colors (using color codes)
set RED=[91m
set GREEN=[92m
set YELLOW=[93m
set BLUE=[94m
set NC=[0m

REM Logging function
call :log "================================================"
call :log "  LexiFlow Backend - Production Deployment"
call :log "  Memory-Optimized Enterprise Setup"
call :log "================================================"
call :log ""

REM Pre-deployment checks
call :log "Running pre-deployment checks..."

REM Check Node.js version
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
set NODE_VERSION=%NODE_VERSION:v=%
call :log "Node.js version: %NODE_VERSION%"

REM Check npm version
for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
call :log "NPM version: %NPM_VERSION%"

REM Check if .env file exists
if not exist "%PROJECT_ROOT%\.env.%ENVIRONMENT%" (
    if not exist "%PROJECT_ROOT%\.env" (
        call :warning "No environment file found. Creating from template..."
        if exist "%PROJECT_ROOT%\.env.production.template" (
            copy "%PROJECT_ROOT%\.env.production.template" "%PROJECT_ROOT%\.env.%ENVIRONMENT%" >nul
            call :warning "Please edit %PROJECT_ROOT%\.env.%ENVIRONMENT% with your production values"
            exit /b 1
        ) else (
            call :error "No .env template found"
            exit /b 1
        )
    )
)

REM Load environment variables
if exist "%PROJECT_ROOT%\.env.%ENVIRONMENT%" (
    call :log "Loading environment from .env.%ENVIRONMENT%"
    for /f "tokens=*" %%i in (%PROJECT_ROOT%\.env.%ENVIRONMENT%) do (
        if not "%%i"=="" if not "%%i:~0,1%"=="#" set %%i
    )
) else if exist "%PROJECT_ROOT%\.env" (
    call :log "Loading environment from .env"
    for /f "tokens=*" %%i in (%PROJECT_ROOT%\.env) do (
        if not "%%i"=="" if not "%%i:~0,1%"=="#" set %%i
    )
)

REM Set production memory defaults if not set
if "%NODE_ENV%"=="" set NODE_ENV=production
if "%NODE_OPTIONS%"=="" set NODE_OPTIONS=--max-old-space-size=2048 --max-semi-space-size=16 --expose-gc --optimize-for-size --gc-interval=100
if "%UV_THREADPOOL_SIZE%"=="" set UV_THREADPOOL_SIZE=8
if "%MEMORY_MONITORING_ENABLED%"=="" set MEMORY_MONITORING_ENABLED=true

call :log "Memory configuration:"
call :log "  NODE_OPTIONS: %NODE_OPTIONS%"
call :log "  UV_THREADPOOL_SIZE: %UV_THREADPOOL_SIZE%"
call :log "  MEMORY_MONITORING_ENABLED: %MEMORY_MONITORING_ENABLED%"

REM Install dependencies
call :log "Installing dependencies..."
call npm ci --production=false >> "%LOG_FILE%" 2>&1
if errorlevel 1 (
    call :error "Failed to install dependencies"
    exit /b 1
)
call :success "Dependencies installed"

REM Run security audit
call :log "Running security audit..."
call npm audit --audit-level=moderate >> "%LOG_FILE%" 2>&1
if errorlevel 1 (
    call :warning "Security vulnerabilities found - review audit output"
) else (
    call :success "Security audit passed"
)

REM Type checking
call :log "Running type checking..."
call npm run typecheck >> "%LOG_FILE%" 2>&1
if errorlevel 1 (
    call :error "Type checking failed"
    exit /b 1
)
call :success "Type checking passed"

REM Linting
call :log "Running linting..."
call npm run lint:check >> "%LOG_FILE%" 2>&1
if errorlevel 1 (
    call :error "Linting failed"
    exit /b 1
)
call :success "Linting passed"

REM Build application
call :log "Building application..."
set NODE_OPTIONS=--max-old-space-size=8192
call npm run build >> "%LOG_FILE%" 2>&1
if errorlevel 1 (
    call :error "Build failed"
    exit /b 1
)
call :success "Build completed"

REM Run tests (optional for production)
if "%SKIP_TESTS%"=="true" (
    call :log "Skipping tests..."
) else (
    call :log "Running tests..."
    call npm run test:unit >> "%LOG_FILE%" 2>&1
    if errorlevel 1 (
        call :error "Unit tests failed"
        exit /b 1
    )
    call :success "Unit tests passed"
)

REM Database setup
call :log "Checking database connection..."
call npm run db:test >> "%LOG_FILE%" 2>&1
if errorlevel 1 (
    call :error "Database connection failed"
    exit /b 1
)
call :success "Database connection OK"

REM Run migrations
call :log "Running database migrations..."
call npm run migration:run >> "%LOG_FILE%" 2>&1
if errorlevel 1 (
    call :error "Database migrations failed"
    exit /b 1
)
call :success "Database migrations completed"

REM Seed data (if needed)
if "%SEED_DATA%"=="true" (
    call :log "Seeding database..."
    call npm run seed >> "%LOG_FILE%" 2>&1
    if errorlevel 1 (
        call :warning "Database seeding failed - continuing..."
    ) else (
        call :success "Database seeded"
    )
)

REM Deployment complete
call :log ""
call :log "================================================"
call :success "LexiFlow Backend deployment completed successfully!"
call :log ""
call :log "Next steps:"
call :log "1. Review configuration in .env.%ENVIRONMENT%"
call :log "2. Start service: npm run start:prod:memory"
call :log "3. Monitor health: curl http://localhost:5000/api/health"
call :log "4. Check logs in %LOG_FILE%"
call :log ""
call :log "Memory optimizations active:"
call :log "• V8 Heap: 2GB limit with optimized GC"
call :log "• Real-time monitoring: Enabled"
call :log "• Stream processing: 10MB+ files"
call :log "• LRU caching: All services optimized"
call :log "================================================"

REM Save deployment info
echo Deployment completed at: %DATE% %TIME% > "%PROJECT_ROOT%\.deployment-info"
echo Environment: %ENVIRONMENT% >> "%PROJECT_ROOT%\.deployment-info"
echo Node.js version: %NODE_VERSION% >> "%PROJECT_ROOT%\.deployment-info"
echo Memory optimizations: Enabled >> "%PROJECT_ROOT%\.deployment-info"
echo Log file: %LOG_FILE% >> "%PROJECT_ROOT%\.deployment-info"

call :log "Deployment information saved to .deployment-info"
goto :eof

:log
echo [%DATE% %TIME%] %~1 >> "%LOG_FILE%"
echo [%DATE% %TIME%] %~1
goto :eof

:success
echo [92m✓[0m %~1 >> "%LOG_FILE%"
echo [92m✓[0m %~1
goto :eof

:error
echo [91m✗[0m %~1 >> "%LOG_FILE%"
echo [91m✗[0m %~1
goto :eof

:warning
echo [93m⚠[0m %~1 >> "%LOG_FILE%"
echo [93m⚠[0m %~1
goto :eof