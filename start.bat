@echo off
echo ========================================
echo Starting Clarity Coach Platform
echo ========================================
echo.

echo [1/2] Starting Python Backend (Video Analysis) on port 8000...
start "Clarity Coach - Python Backend" cmd /k "cd backend-python && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

timeout /t 3 /nobreak >nul

echo [2/2] Starting Node.js Backend (Audio Analysis) on port 3000...
start "Clarity Coach - Node.js Backend" cmd /k "cd backend-node && node server.js"

echo.
echo ========================================
echo Both backends are starting...
echo ========================================
echo.
echo Python Backend: http://localhost:8000
echo Node.js Backend: http://localhost:3000
echo.
echo Open your browser to: http://localhost:8000
echo.
echo Press any key to exit this window...
echo (The backends will continue running in separate windows)
pause >nul
