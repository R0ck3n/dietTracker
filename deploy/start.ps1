# Démarre Diet Tracker (API Node + Caddy)
$ErrorActionPreference = 'Stop'
. "$PSScriptRoot\config.ps1"
$LogDir = Join-Path $Deploy 'logs'

New-Item -ItemType Directory -Force -Path $LogDir | Out-Null

function Resolve-NodeExe {
    $node = Get-Command node -ErrorAction SilentlyContinue
    if ($node) { return $node.Source }

    foreach ($candidate in @(
        'C:\Program Files\nodejs\node.exe',
        "$env:ProgramFiles\nodejs\node.exe",
        "$env:LOCALAPPDATA\Programs\node\node.exe"
    )) {
        if (Test-Path $candidate) { return $candidate }
    }

    throw 'Node.js introuvable. Vérifiez l installation ou le PATH.'
}

function Test-PortListening([int]$Port) {
    return [bool](Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue)
}

function Get-TailscaleIPv4 {
    if (-not (Get-Command tailscale -ErrorAction SilentlyContinue)) { return $null }
    $ip = tailscale ip -4 2>$null
    if (-not $ip) { return $null }
    return ($ip | Select-Object -First 1).ToString().Trim()
}

Ensure-Caddyfile

$nodeExe = Resolve-NodeExe
$caddyExe = Resolve-CaddyExe
$caddyfile = Resolve-Caddyfile

# --- Backend API (port 3000, localhost uniquement) ---
if (-not (Test-Path (Join-Path $Root 'backend\dist\server.js'))) {
    throw 'Backend non compilé. Lancez deploy\install.ps1 d abord.'
}

if (-not (Test-PortListening 3000)) {
    Write-Host 'Démarrage API Diet Tracker...'
    $backendLog = Join-Path $LogDir 'backend.log'
    $backendErr = Join-Path $LogDir 'backend-error.log'
    Start-Process -FilePath $nodeExe `
        -ArgumentList 'dist/server.js' `
        -WorkingDirectory (Join-Path $Root 'backend') `
        -WindowStyle Hidden `
        -RedirectStandardOutput $backendLog `
        -RedirectStandardError $backendErr | Out-Null
    Start-Sleep -Seconds 2
} else {
    Write-Host 'API déjà active sur le port 3000.'
}

# --- Caddy (port 8080) ---
$caddyRunning = Get-CaddyProcess

if ($caddyRunning) {
    Write-Host 'Caddy déjà actif — rechargement de la configuration...'
    & $caddyExe reload --config $caddyfile 2>&1 | Out-Null
} elseif (-not (Test-PortListening 8080)) {
    Write-Host "Démarrage Caddy ($caddyfile)..."
    $caddyLog = Join-Path $LogDir 'caddy.log'
    $caddyErr = Join-Path $LogDir 'caddy-error.log'
    Start-Process -FilePath $caddyExe `
        -ArgumentList "run --config `"$caddyfile`"" `
        -WorkingDirectory $CaddyDir `
        -WindowStyle Hidden `
        -RedirectStandardOutput $caddyLog `
        -RedirectStandardError $caddyErr | Out-Null
    Start-Sleep -Seconds 2
} else {
    Write-Host 'Port 8080 déjà utilisé par un autre service.'
}

Write-Host ''
Write-Host 'Diet Tracker est prêt.' -ForegroundColor Green
$tsIp = Get-TailscaleIPv4
if ($tsIp) {
    Write-Host "Accès Tailscale : http://${tsIp}:8080"
} else {
    Write-Host 'Accès : http://<ip-tailscale-du-mini-pc>:8080'
    Write-Host 'IP Tailscale : tailscale ip -4'
}
