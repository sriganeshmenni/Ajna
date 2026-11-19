# PowerShell script to run the Multimodal Eval Engine Frontend
$ErrorActionPreference = "Stop"
Write-Host ">>> Starting Multimodal Eval Engine Frontend on http://localhost:5173..." -ForegroundColor Cyan

Set-Location -Path "$PSScriptRoot/frontend"
npm run dev
