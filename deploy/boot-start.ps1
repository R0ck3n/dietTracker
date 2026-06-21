# Wrapper de démarrage au boot — journalise tout dans deploy\logs\boot.log
$ErrorActionPreference = 'Continue'
$LogDir = 'C:\apps\dietTracker\deploy\logs'
$LogFile = Join-Path $LogDir 'boot.log'
$StartScript = Join-Path $PSScriptRoot 'start.ps1'

New-Item -ItemType Directory -Force -Path $LogDir | Out-Null

function Write-BootLog([string]$Message) {
    $line = "{0} {1}" -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'), $Message
    Add-Content -Path $LogFile -Value $line -Encoding UTF8
}

Write-BootLog '=== Demarrage Diet Tracker (boot) ==='
Write-BootLog "Compte Windows : $env:USERDOMAIN\$env:USERNAME"

# Laisser le réseau / Tailscale s initialiser
Write-BootLog 'Attente 60 secondes (reseau)...'
Start-Sleep -Seconds 60

try {
    Write-BootLog "Execution de $StartScript"
    $output = & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $StartScript 2>&1
    foreach ($line in $output) {
        Write-BootLog "  $line"
    }
    Write-BootLog '=== Demarrage termine avec succes ==='
} catch {
    Write-BootLog "ERREUR : $($_.Exception.Message)"
    Write-BootLog '=== Demarrage en echec ==='
    exit 1
}
