# PowerShell script to run the Multimodal Eval Engine Backend
$ErrorActionPreference = "Stop"
Write-Host ">>> Starting Multimodal Eval Engine Backend on http://localhost:8000..." -ForegroundColor Cyan

$env:PYTHONPATH = "backend/src"

# Try PyManager Python first, then py launcher, then python
if (Test-Path "C:\Program Files\PyManager\python.exe") {
    & "C:\Program Files\PyManager\python.exe" -m uvicorn eval_engine.main:app --host 0.0.0.0 --port 8000 --reload
} elseif (Get-Command py -ErrorAction SilentlyContinue) {
    py -m uvicorn eval_engine.main:app --host 0.0.0.0 --port 8000 --reload
} else {
    python -m uvicorn eval_engine.main:app --host 0.0.0.0 --port 8000 --reload
}
