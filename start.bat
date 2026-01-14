@echo off
title EARIST Health Access Hub - Startup
color 0A

echo.
echo ============================================================
echo   EARIST HEALTH ACCESS HUB - STARTING SERVERS
echo ============================================================
echo.

echo [1/2] Starting Backend Server...
start "Backend Server" cmd /k "cd /d %~dp0backend && npm start"

echo [INFO] Waiting for backend to initialize...
timeout /t 5 /nobreak > nul

echo.
echo [2/2] Starting Frontend Server...
start "Frontend Server" cmd /k "cd /d %~dp0frontend && npm start"

echo.
echo ============================================================
echo   SERVERS ARE STARTING...
echo ============================================================
echo.
echo   Backend:  http://localhost:5000
echo   Frontend: http://localhost:3000
echo.
echo   For mobile access, check the Network IP displayed
echo   in the Backend Server window.
echo.
echo   Mobile Access: http://YOUR_IP:3000
echo ============================================================
echo.
echo Press any key to exit this window...
pause > nul
