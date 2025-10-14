@echo off
echo Testing PostgreSQL Database Connection...
echo.

cd backend
node -e "
const { Pool } = require('pg');
const DATABASE_URL = 'postgresql://postgres:wTXRhREDHbxiaMRzsgdAoQVuSjYTTCSf@shinkansen.proxy.rlwy.net:55982/railway';
const pool = new Pool({ connectionString: DATABASE_URL });

pool.query('SELECT NOW() as current_time')
  .then(result => {
    console.log('✅ Database connection successful!');
    console.log('Current time:', result.rows[0].current_time);
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  });
"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Database connection test completed successfully!
) else (
    echo.
    echo ❌ Database connection test failed!
    echo Make sure you have Node.js and the pg package installed.
)

pause
