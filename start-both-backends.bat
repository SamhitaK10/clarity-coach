@echo off
REM Clarity Coach - Start Both Backends (Windows)

echo ========================================
echo Starting Clarity Coach - Dual Backend
echo ========================================
echo.

REM Set paths
set PYTHON_BACKEND_DIR=C:\Users\samhi\Downloads\clarity-coach-cv\clarity-coach-cv\backend-python
set NODE_BACKEND_DIR=C:\Users\samhi\Downloads\clarity-coach-frontend\clarity-coach-frontend

REM Check if Python backend exists
if not exist "%PYTHON_BACKEND_DIR%" (
    echo [ERROR] Python backend not found at: %PYTHON_BACKEND_DIR%
    pause
    exit /b 1
)

REM Start Python backend in new window
echo [1/2] Starting Python MediaPipe Backend ^(Port 8000^)...
start "Python Backend - Port 8000" cmd /k "cd /d %PYTHON_BACKEND_DIR% && python run_server.py"
timeout /t 3 /nobreak >nul

REM Start Node.js backend in new window
echo [2/2] Starting Node.js Backend ^(Port 3000^)...
start "Node.js Backend - Port 3000" cmd /k "cd /d %NODE_BACKEND_DIR% && node server.js"
timeout /t 2 /nobreak >nul

echo.
echo ========================================
echo Both backends are starting!
echo ========================================
echo.
echo URLs:
echo   Frontend:        http://localhost:3000
echo   Python Backend:  http://localhost:8000
echo   Python API Docs: http://localhost:8000/docs
echo.
echo Architecture:
echo   Frontend -^> Python ^(video analysis^) -^> Node.js ^(audio transcription^)
echo.
echo Two terminal windows opened:
echo   1. Python Backend ^(Port 8000^)
echo   2. Node.js Backend ^(Port 3000^)
echo.
echo To stop: Close both terminal windows or press Ctrl+C in each
echo ========================================
echo.
pause
