# Arrête Diet Tracker (API + Caddy sur le port 8080)
$ErrorActionPreference = 'SilentlyContinue'

function Stop-ProcessOnPort([int]$Port) {
    Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue |
        ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
}

Write-Host 'Arrêt API (port 3000)...'
Stop-ProcessOnPort 3000

Write-Host 'Arrêt Caddy Diet Tracker (port 8080)...'
Stop-ProcessOnPort 8080

Write-Host 'Terminé.'
