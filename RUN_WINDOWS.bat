@echo off
cd /d %~dp0
if not exist .env (
  copy .env.example .env >nul
  echo Created .env. Edit MONGODB_URI and JWT_SECRET, then run this file again.
  pause
  exit /b 1
)
if not exist node_modules (
  echo Installing packages...
  call npm install
  if errorlevel 1 pause & exit /b 1
)
echo Starting Piazza API...
call npm start
pause
