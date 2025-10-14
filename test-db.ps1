Write-Host "🔄 Testing PostgreSQL Database Connection..." -ForegroundColor Yellow

# Test database connection using Node.js
node test-db-connection.js

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Database connection test completed!" -ForegroundColor Green
} else {
    Write-Host "❌ Database connection test failed!" -ForegroundColor Red
    Write-Host "💡 Make sure you have Node.js and the pg package installed." -ForegroundColor Cyan
}
