Write-Host "Starting Emergency SOS Development Servers..." -ForegroundColor Green

Write-Host "Starting Backend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev"

Write-Host "Starting Frontend Server..." -ForegroundColor Yellow  
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm start"

Write-Host "Both servers are starting in separate windows..." -ForegroundColor Green
Read-Host "Press Enter to continue"
