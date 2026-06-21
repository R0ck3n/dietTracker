# Enregistre Diet Tracker au demarrage — methode fiable
# Executer en PowerShell administrateur :
#   C:\apps\dietTracker\deploy\register-startup.cmd

$ErrorActionPreference = 'Stop'
$TaskName = 'DietTracker'
$BootCmd = 'C:\apps\dietTracker\deploy\start-at-boot.cmd'
$CurrentUser = "$env:USERDOMAIN\$env:USERNAME"

if (-not (Test-Path $BootCmd)) {
    throw "Fichier introuvable : $BootCmd"
}

Write-Host '=== Enregistrement demarrage automatique ===' -ForegroundColor Cyan
Write-Host "Compte : $CurrentUser"
Write-Host ''

# Supprimer l ancienne tache si elle existe
$existing = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
if ($existing) {
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
    Write-Host "Ancienne tache supprimee."
}

$action = New-ScheduledTaskAction `
    -Execute $BootCmd `
    -WorkingDirectory 'C:\apps\dietTracker\deploy'

# DECLENCHEUR RECOMMANDE : a l ouverture de session (pas au demarrage du PC)
# C est la raison pour laquelle "Executer" manuellement marche mais pas au boot :
# au demarrage = pas de session utilisateur, PATH vide, reseau pas pret
$trigger = New-ScheduledTaskTrigger -AtLogOn -User $CurrentUser
$trigger.Delay = 'PT30S'

$settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -RestartCount 3 `
    -RestartInterval (New-TimeSpan -Minutes 2) `
    -ExecutionTimeLimit (New-TimeSpan -Hours 1)

$principal = New-ScheduledTaskPrincipal `
    -UserId $CurrentUser `
    -LogonType InteractiveToken `
    -RunLevel Highest

Register-ScheduledTask `
    -TaskName $TaskName `
    -Action $action `
    -Trigger $trigger `
    -Settings $settings `
    -Principal $principal `
    -Description 'Demarre Diet Tracker a la connexion Windows' | Out-Null

Write-Host ''
Write-Host "Tache '$TaskName' creee avec succes." -ForegroundColor Green
Write-Host ''
Write-Host 'Configuration :'
Write-Host "  Declencheur : A l ouverture de session ($CurrentUser)"
Write-Host '  Delai       : 30 secondes apres connexion'
Write-Host "  Action      : $BootCmd"
Write-Host '  Journal     : C:\apps\dietTracker\deploy\logs\boot.log'
Write-Host ''
Write-Host 'Test : redemarrez le PC, connectez-vous, attendez 1 minute.'
Write-Host 'Puis : C:\apps\dietTracker\deploy\check-startup.cmd'
