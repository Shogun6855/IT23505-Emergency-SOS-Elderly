Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Emergency SOS Database Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "🔄 Testing PostgreSQL connection..." -ForegroundColor Yellow
node setup-database.js

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Database setup completed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🚀 Next steps:" -ForegroundColor Cyan
    Write-Host "   1. Run: npm run dev:alt" -ForegroundColor White
    Write-Host "   2. Open: http://localhost:3000" -ForegroundColor White
    Write-Host "   3. Login with demo credentials from DEMO_CREDENTIALS.md" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Database setup failed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Troubleshooting:" -ForegroundColor Yellow
    Write-Host "   - Check your internet connection" -ForegroundColor White
    Write-Host "   - Verify the database credentials in DEMO_CREDENTIALS.md" -ForegroundColor White
    Write-Host "   - Make sure Node.js and npm are installed" -ForegroundColor White
    Write-Host ""
}

Read-Host "Press Enter to continue"
