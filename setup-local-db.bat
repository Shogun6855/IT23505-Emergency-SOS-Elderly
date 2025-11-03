@echo off
echo ========================================
echo Emergency SOS - Local Database Setup
echo ========================================
echo.

echo This script will help you set up a local PostgreSQL database.
echo.
echo Prerequisites:
echo   1. PostgreSQL must be installed
echo   2. PostgreSQL service must be running
echo   3. Default database 'postgres' must exist
echo.

pause

echo.
echo Creating local database 'emergency_sos'...
echo.

REM Check if PostgreSQL is installed
where psql >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: PostgreSQL (psql) not found in PATH
    echo Please install PostgreSQL and add it to your PATH
    pause
    exit /b 1
)

echo Creating database...
set PGPASSWORD=1234
psql -U postgres -c "CREATE DATABASE emergency_sos;" 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Database created successfully!
) else (
    echo Database might already exist or there was an error.
    echo Continuing anyway...
)

echo.
echo Running database schema...
psql -U postgres -d emergency_sos -f backend\database\complete_schema.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo Database setup completed successfully!
    echo ========================================
    echo.
    echo Database connection string:
    echo postgresql://postgres:1234@localhost:5432/emergency_sos
    echo.
    echo You can now:
    echo   1. Set LOCAL_DB_URL environment variable OR
    echo   2. The app will use this default connection
    echo.
) else (
    echo.
    echo ERROR: Failed to run database schema
    echo Please check your PostgreSQL installation and try again
    echo.
)

pause

