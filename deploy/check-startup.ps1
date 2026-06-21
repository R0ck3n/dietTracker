# Diagnostic du demarrage automatique Diet Tracker
$TaskName = 'DietTracker'
$LogDir = 'C:\apps\dietTracker\deploy\logs'

Write-Host '=== Diagnostic Diet Tracker ===' -ForegroundColor Cyan
Write-Host ''

# Tache planifiee
$task = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
if ($task) {
    Write-Host "Tache planifiee : OK ($TaskName)" -ForegroundColor Green
    Write-Host "  Etat    : $($task.State)"
    Write-Host "  Compte  : $($task.Principal.UserId)"
    $info = Get-ScheduledTaskInfo -TaskName $TaskName -ErrorAction SilentlyContinue
    if ($info) {
        Write-Host "  Derniere execution : $($info.LastRunTime)"
        Write-Host "  Resultat           : $($info.LastTaskResult)"
        Write-Host "  Prochaine          : $($info.NextRunTime)"
    }
} else {
    Write-Host "Tache planifiee : ABSENTE" -ForegroundColor Red
    Write-Host '  Lancez : C:\apps\dietTracker\deploy\register-startup.cmd'
}

Write-Host ''

# Registre Run
$run = Get-ItemProperty -Path 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Run' -Name 'DietTracker' -ErrorAction SilentlyContinue
if ($run) {
    Write-Host 'Registre Run (connexion) : OK' -ForegroundColor Green
} else {
    Write-Host 'Registre Run (connexion) : ABSENT' -ForegroundColor Yellow
}

Write-Host ''

# Ports
function Test-Port([int]$Port) {
    $conn = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
    return [bool]$conn
}

$api = Test-Port 3000
$caddy = Test-Port 8080
Write-Host "API (port 3000)   : $(if ($api) { 'ACTIVE' } else { 'ARRETEE' })"
Write-Host "Caddy (port 8080) : $(if ($caddy) { 'ACTIF' } else { 'ARRETE' })"

Write-Host ''

# --- Dernieres lignes boot.log ---
$bootLog = Join-Path $LogDir 'boot.log'
if (Test-Path $bootLog) {
    Write-Host '--- Dernieres lignes boot.log ---' -ForegroundColor Cyan
    Get-Content $bootLog -Tail 20
} else {
    Write-Host 'Aucun boot.log — utilisez start-at-boot.cmd dans la tache planifiee.'
}

Write-Host ''
if (-not $api -or -not $caddy) {
    Write-Host 'Demarrage manuel : C:\apps\dietTracker\deploy\start.cmd' -ForegroundColor Yellow
}
