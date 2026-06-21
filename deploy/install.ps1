# Installation initiale de Diet Tracker sur le mini PC de production
# Exécuter en PowerShell administrateur :
#   Set-ExecutionPolicy -Scope Process Bypass
#   C:\apps\dietTracker\deploy\install.ps1

$ErrorActionPreference = 'Stop'
$Root = 'C:\apps\dietTracker'
$Deploy = Join-Path $Root 'deploy'
. "$Deploy\config.ps1"

Write-Host '=== Diet Tracker — installation ===' -ForegroundColor Cyan

foreach ($cmd in @('node', 'npm', 'git')) {
    if (-not (Get-Command $cmd -ErrorAction SilentlyContinue)) {
        throw "Commande introuvable : $cmd"
    }
}

Write-Host "Node $(node -v) / npm $(npm -v)"

New-Item -ItemType Directory -Force -Path (Join-Path $Root 'data') | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $Deploy 'logs') | Out-Null

# Backend
Write-Host 'Installation backend...'
Push-Location (Join-Path $Root 'backend')
npm ci
if (-not (Test-Path '.env')) {
    Copy-Item (Join-Path $Deploy 'backend.env.example') '.env'

    if (Get-Command tailscale -ErrorAction SilentlyContinue) {
        $tsIp = (tailscale ip -4 2>$null | Select-Object -First 1).ToString().Trim()
        if ($tsIp) {
            (Get-Content '.env') -replace 'http://VOTRE-IP-TAILSCALE:8080', "http://${tsIp}:8080" | Set-Content '.env'
            Write-Host "CORS_ORIGIN pré-rempli avec l IP Tailscale : $tsIp" -ForegroundColor Yellow
        }
    }

    $secret = [Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Maximum 256 }) -as [byte[]])
    (Get-Content '.env') -replace 'REMPLACEZ-PAR-UNE-LONGUE-CHAINE-ALEATOIRE', $secret | Set-Content '.env'
    Write-Host 'SESSION_SECRET généré automatiquement dans backend\.env' -ForegroundColor Yellow
}
npm run build
Pop-Location

# Frontend
Write-Host 'Build frontend...'
Push-Location (Join-Path $Root 'frontend')
npm ci
Copy-Item (Join-Path $Deploy 'frontend.env.production') '.env.production' -Force
npm run build
Pop-Location

# Base de données
$dbPath = Join-Path $Root 'data\diettracker.db'
if (-not (Test-Path $dbPath)) {
    Write-Host 'Initialisation de la base SQLite...'
    Push-Location (Join-Path $Root 'backend')
    npm run db:init
    Pop-Location
    Write-Host 'Créez votre utilisateur avec :' -ForegroundColor Yellow
    Write-Host '  cd C:\apps\dietTracker\backend' -ForegroundColor Yellow
    Write-Host '  npm run user:create VOTRE_IDENTIFIANT VOTRE_MOT_DE_PASSE' -ForegroundColor Yellow
}

# Caddy
try {
    $null = Resolve-CaddyExe
    Ensure-Caddyfile
} catch {
    Write-Warning $_.Exception.Message
}

Write-Host ''
Write-Host '=== Installation terminée ===' -ForegroundColor Green
Write-Host 'Étapes suivantes :'
Write-Host '  1. Éditez C:\apps\dietTracker\backend\.env (SESSION_SECRET, CORS_ORIGIN)'
Write-Host '  2. Créez l utilisateur si besoin (npm run user:create)'
Write-Host '  3. Lancez : C:\apps\dietTracker\deploy\register-startup.ps1'
Write-Host '  4. Testez : C:\apps\dietTracker\deploy\start.ps1'
Write-Host '  5. Accès Tailscale : http://<ip-tailscale>:8080'
