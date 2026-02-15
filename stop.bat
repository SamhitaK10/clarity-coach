@echo off
echo ========================================
echo Stopping Clarity Coach Platform
echo ========================================
echo.

echo Killing Python backend processes...
taskkill /FI "WINDOWTITLE eq Clarity Coach - Python Backend*" /T /F >nul 2>&1

echo Killing Node.js backend processes...
taskkill /FI "WINDOWTITLE eq Clarity Coach - Node.js Backend*" /T /F >nul 2>&1

echo.
echo ✅ All backends stopped!
echo.
pause
