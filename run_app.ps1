# ==============================================================================
# Ajna Application Launcher (Multimodal Human Evaluation Intelligence)
# ==============================================================================

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " [Ajna] Starting Multimodal Human Evaluation Intelligence " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

function Test-PortOpen([int]$port) {
    try {
        $client = New-Object System.Net.Sockets.TcpClient
        $iar = $client.BeginConnect("127.0.0.1", $port, $null, $null)
        $success = $iar.AsyncWaitHandle.WaitOne(800, $false)
        if ($success -and $client.Connected) {
            $client.EndConnect($iar)
            $client.Close()
            return $true
        }
        $client.Close()
        return $false
    } catch {
        return $false
    }
}

# 1. Check and start MongoDB service
Write-Host "[1/3] Checking MongoDB Service..." -ForegroundColor Yellow
$mongoService = Get-Service -Name "MongoDB" -ErrorAction SilentlyContinue
if ($mongoService) {
    if ($mongoService.Status -ne "Running") {
        Write-Host "Starting MongoDB Service..." -ForegroundColor Yellow
        Start-Service -Name "MongoDB"
    }
    Write-Host "MongoDB is ACTIVE on mongodb://localhost:27017" -ForegroundColor Green
} else {
    Write-Host "MongoDB service not registered as 'MongoDB', verifying mongod process..." -ForegroundColor Yellow
    $mongoProc = Get-Process mongod -ErrorAction SilentlyContinue
    if (-not $mongoProc) {
        Write-Host "Starting mongod process directly..." -ForegroundColor Yellow
        Start-Process "C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe" -ArgumentList "--dbpath C:\data\db" -WindowStyle Hidden
    }
}

# 2. Check or Start FastAPI Backend on port 8000
$backendJob = $null
if (Test-PortOpen 8000) {
    Write-Host "[2/3] FastAPI Backend is already RUNNING on http://localhost:8000" -ForegroundColor Green
} else {
    Write-Host "[2/3] Launching FastAPI AI & Fusion Backend on port 8000..." -ForegroundColor Yellow
    $backendJob = Start-Process -FilePath "C:\Program Files\PyManager\python.exe" `
        -ArgumentList "-m uvicorn eval_engine.main:app --app-dir `"$PSScriptRoot\backend\src`" --host 0.0.0.0 --port 8000" `
        -WorkingDirectory "$PSScriptRoot\backend\src" `
        -PassThru
    Write-Host "Backend process spawned with PID $($backendJob.Id)" -ForegroundColor Green
    Start-Sleep -Seconds 2
}

# 3. Check or Start Vite Dev Server on port 5173
$viteJob = $null
if (Test-PortOpen 5173) {
    Write-Host "[3/3] Vite UI is already ACTIVE on http://localhost:5173" -ForegroundColor Green
} else {
    Write-Host "[3/3] Starting Vite Dev Server..." -ForegroundColor Yellow
    $viteJob = Start-Process -FilePath "cmd.exe" `
        -ArgumentList "/c npm run dev" `
        -WorkingDirectory "$PSScriptRoot\frontend" `
        -WindowStyle Hidden `
        -PassThru

    Write-Host "Waiting for Vite to initialize on port 5173..." -ForegroundColor Yellow
    for ($i = 0; $i -lt 15; $i++) {
        if (Test-PortOpen 5173) {
            Write-Host "Vite dev server is READY on http://localhost:5173" -ForegroundColor Green
            break
        }
        Start-Sleep -Milliseconds 500
    }
}

# 4. Launch Native Electron Desktop Window
Write-Host "Opening Ajna Native Desktop Window..." -ForegroundColor Cyan
$electronExe = "$PSScriptRoot\frontend\node_modules\electron\dist\electron.exe"
$mainJs = "$PSScriptRoot\electron\main.js"

if (Test-Path $electronExe) {
    Start-Process -FilePath $electronExe -ArgumentList "`"$mainJs`""
} else {
    Start-Process -FilePath "cmd.exe" -ArgumentList "/c npx electron `"$mainJs`"" -WorkingDirectory "$PSScriptRoot\frontend"
}

# 5. Also open in Default Browser as instant companion
Start-Process "http://localhost:5173"

Write-Host "==========================================================" -ForegroundColor Green
Write-Host " [Ajna] Application launched successfully! " -ForegroundColor Green
Write-Host " Native Desktop App: Active " -ForegroundColor Green
Write-Host " Web Interface:     http://localhost:5173 " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Green
