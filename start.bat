@echo off
echo ========================================
echo Clarity Coach - LOCAL DEVELOPMENT
echo ========================================
echo.

echo [1/3] Starting React Frontend (Vite Dev) on port 5173...
start "Clarity Coach - Frontend" cmd /k "cd frontend && npm run dev"

timeout /t 2 /nobreak >nul

echo [2/3] Starting Python Backend on port 8000...
start "Clarity Coach - Python" cmd /k "cd backend-python && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

timeout /t 2 /nobreak >nul

echo [3/3] Starting Node.js Backend on port 3000...
start "Clarity Coach - Node.js" cmd /k "cd backend-node && node server.js"

echo.
echo ========================================
echo All systems running!
echo ========================================
echo.
echo Frontend: http://localhost:5173  ^<-- OPEN THIS
echo Python API: http://localhost:8000/docs
echo Node.js: http://localhost:3000/health
echo.
echo Press any key to exit...
pause >nul
