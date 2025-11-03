@echo off
echo ========================================
echo Emergency SOS - Local Database Setup
echo ========================================
echo.

echo This will set up a local PostgreSQL database for the Emergency SOS system.
echo.
echo Prerequisites:
echo   - PostgreSQL must be installed and running
echo   - Default database 'postgres' must exist
echo   - Default user 'postgres' with password '1234' (or update setup-local-database.js)
echo.

pause

echo.
echo Starting database setup...
node setup-local-database.js

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo ✅ Setup completed successfully!
    echo ========================================
    echo.
    echo Next steps:
    echo   1. Start the backend: cd backend ^&^& npm run dev
    echo   2. Start the frontend: cd frontend ^&^& npm start
    echo   3. OR use: npm run dev:alt
    echo.
) else (
    echo.
    echo ========================================
    echo ❌ Setup failed!
    echo ========================================
    echo.
    echo Please check the error messages above.
    echo.
    echo Common issues:
    echo   - PostgreSQL not running
    echo   - Wrong username/password
    echo   - Port 5432 not available
    echo.
)

pause

