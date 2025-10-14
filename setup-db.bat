@echo off
echo ========================================
echo Emergency SOS Database Setup
echo ========================================
echo.

echo Testing PostgreSQL connection...
node setup-database.js

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Database setup completed successfully!
    echo.
    echo 🚀 Next steps:
    echo    1. Run: npm run dev:alt
    echo    2. Open: http://localhost:3000
    echo    3. Login with demo credentials from DEMO_CREDENTIALS.md
    echo.
) else (
    echo.
    echo ❌ Database setup failed!
    echo.
    echo 💡 Troubleshooting:
    echo    - Check your internet connection
    echo    - Verify the database credentials in DEMO_CREDENTIALS.md
    echo    - Make sure Node.js and npm are installed
    echo.
)

pause
