@echo off
REM LexiFlow Backend Production Deploy (Windows)
REM Memory-Optimized Configuration

echo ========================================
echo   LexiFlow Backend Production Deploy
echo   Memory-Optimized Configuration
echo ========================================
echo.

if exist .env (
    echo Loading environment variables from .env
    for /f "usebackq tokens=*" %%i in (".env") do set %%i
) else (
    echo Warning: No .env file found. Using defaults.
)

if not defined NODE_ENV set NODE_ENV=production
if not defined PORT set PORT=5000
if not defined NODE_MAX_OLD_SPACE_SIZE set NODE_MAX_OLD_SPACE_SIZE=2048
if not defined NODE_MAX_SEMI_SPACE_SIZE set NODE_MAX_SEMI_SPACE_SIZE=16

echo Configuration:
echo   Environment: %NODE_ENV%
echo   Port: %PORT%
echo   Max Heap Size: %NODE_MAX_OLD_SPACE_SIZE%MB
echo   Max Semi Space: %NODE_MAX_SEMI_SPACE_SIZE%MB
echo.

echo Building application...
call npm run build

if errorlevel 1 (
    echo Build failed!
    exit /b 1
)

echo Build successful
echo.

echo Running database migrations...
call npm run migration:run

echo.
echo Starting production server with memory optimization...
echo.

node ^
    --max-old-space-size=%NODE_MAX_OLD_SPACE_SIZE% ^
    --max-semi-space-size=%NODE_MAX_SEMI_SPACE_SIZE% ^
    --expose-gc ^
    --optimize-for-size ^
    --max-old-generation-size-mb=1536 ^
    dist/src/main.js
