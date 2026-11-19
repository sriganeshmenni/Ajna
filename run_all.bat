@echo off
echo ========================================================
echo  Starting Multimodal Evaluation Engine (Full Stack)
echo ========================================================

start "Backend [Port 8000]" powershell -NoExit -ExecutionPolicy Bypass -File "%~dp0run_backend.ps1"
timeout /t 3 /nobreak >nul
start "Frontend [Port 5173]" powershell -NoExit -ExecutionPolicy Bypass -File "%~dp0run_frontend.ps1"

echo.
echo Both servers have been launched in separate windows!
echo - Backend:  http://localhost:8000/docs
echo - Frontend: http://localhost:5173
echo.
pause
