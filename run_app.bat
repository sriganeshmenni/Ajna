@echo off
title Ajna Desktop Launcher
color 0B

echo ==========================================================
echo  [Ajna] Starting Multimodal Human Evaluation Intelligence
echo ==========================================================

:: 1. Verify MongoDB
echo [1/3] Checking MongoDB...
sc query MongoDB | find "RUNNING" >nul
if %errorlevel% neq 0 (
    echo Starting MongoDB service...
    net start MongoDB
) else (
    echo MongoDB service is RUNNING.
)

:: 2. Launch FastAPI backend if not already on 8000
netstat -ano | findstr :8000 | findstr LISTENING >nul
if %errorlevel% neq 0 (
    echo [2/3] Starting FastAPI Backend on port 8000...
    set PYTHONPATH=%~dp0backend\src
    start "MHEI FastAPI Backend" /min "C:\Program Files\PyManager\python.exe" -m uvicorn eval_engine.main:app --app-dir "%~dp0backend\src" --host 0.0.0.0 --port 8000
    timeout /t 2 /nobreak >nul
) else (
    echo [2/3] FastAPI Backend is already RUNNING on port 8000.
)

:: 3. Launch Vite Dev Server if not on 5173
netstat -ano | findstr :5173 | findstr LISTENING >nul
if %errorlevel% neq 0 (
    echo [3/3] Starting Vite Dev Server...
    cd /d "%~dp0frontend"
    start "MHEI Vite Dev" /min cmd /c npm run dev
    timeout /t 3 /nobreak >nul
) else (
    echo [3/3] Vite UI is already RUNNING on port 5173.
)

:: 4. Launch Electron Native Desktop Window
echo Opening Ajna Native Desktop Window...
cd /d "%~dp0frontend"
start "" "%~dp0frontend\node_modules\electron\dist\electron.exe" "%~dp0electron\main.js"

:: 5. Open browser companion
start http://localhost:5173

echo ==========================================================
echo  [Ajna] Launched successfully!
echo  Desktop App: Active
echo  Web UI:      http://localhost:5173
echo ==========================================================
pause
