<#
run-website.ps1
PowerShell helper to install dependencies (if missing) and launch backend + frontend
Usage: Right-click -> Run with PowerShell or from an elevated PowerShell:
  .\run-website.ps1
#>
Set-StrictMode -Version Latest

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Push-Location $root

Write-Host "Checking Node.js availability..." -ForegroundColor Cyan
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Error "Node.js not found in PATH. Install Node.js and re-run this script."; exit 1
}

function Ensure-Install([string]$path) {
    if (-not (Test-Path "$path\node_modules")) {
        Write-Host "Installing dependencies in $path..." -ForegroundColor Yellow
        Push-Location $path
        npm install
        Pop-Location
    } else {
        Write-Host "Dependencies already installed in $path" -ForegroundColor Green
    }
}

Ensure-Install "$root\server"
Ensure-Install "$root"

Write-Host "Launching backend and frontend in separate windows..." -ForegroundColor Cyan

Start-Process powershell -ArgumentList "-NoExit -Command \"cd '$root\server'; npm start\""
Start-Process powershell -ArgumentList "-NoExit -Command \"cd '$root'; npm run dev\""

Write-Host "Started. Backend should be at http://localhost:5000 and frontend at http://localhost:5173" -ForegroundColor Green
Write-Host "Use Ctrl+C in each window to stop servers." -ForegroundColor Gray

Pop-Location
