# Chemins et helpers partagés pour le déploiement Diet Tracker

$Script:Root = 'C:\apps\dietTracker'
$Script:Deploy = Join-Path $Root 'deploy'
$Script:CaddyDir = 'C:\caddy'
$Script:Caddyfile = 'C:\caddy\Caddyfile'

function Resolve-CaddyExe {
    foreach ($candidate in @(
        'C:\caddy\caddy_windows_amd64.exe',
        'C:\caddy\caddy.exe',
        'C:\caddy\caddy_windows_amd64\caddy.exe'
    )) {
        if (Test-Path $candidate) { return (Resolve-Path $candidate).Path }
    }

    throw 'Caddy introuvable. Attendu : C:\caddy\caddy_windows_amd64.exe'
}

function Resolve-Caddyfile {
    if (Test-Path $Script:Caddyfile) { return $Script:Caddyfile }
    return Join-Path $Script:Deploy 'Caddyfile'
}

function Get-CaddyProcess {
    return Get-Process -ErrorAction SilentlyContinue |
        Where-Object { $_.Name -match '^caddy' }
}

function Ensure-Caddyfile {
    $deployCaddyfile = Join-Path $Script:Deploy 'Caddyfile'
    if (-not (Test-Path $Script:Caddyfile)) {
        Copy-Item $deployCaddyfile $Script:Caddyfile
        Write-Host "Caddyfile copié vers $Script:Caddyfile"
        return
    }

    $content = Get-Content $Script:Caddyfile -Raw
    if ($content -notmatch ':8080') {
        Write-Host 'Le Caddyfile existant ne contient pas le bloc :8080.' -ForegroundColor Yellow
        Write-Host "Ajoutez le contenu de $deployCaddyfile puis relancez start.cmd"
    }
}
