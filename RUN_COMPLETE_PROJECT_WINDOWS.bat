@echo off
setlocal
cd /d "%~dp0"
echo Starting Piazza API and MongoDB with Docker Compose...
docker compose up --build -d
if errorlevel 1 (
  echo.
  echo Docker could not start the project. Make sure Docker Desktop is open.
  pause
  exit /b 1
)
echo.
echo Piazza is starting at http://localhost:3000/health
echo To run tests, open a VS Code terminal and enter: npm install
echo Then enter: npm run test:coursework
start "" http://localhost:3000/health
pause
