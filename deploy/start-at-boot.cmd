@echo off
REM Lanceur fiable pour le Planificateur de taches Windows
REM Toujours utiliser CE fichier dans la tache planifiee, pas start.ps1 directement.

set "LOGDIR=C:\apps\dietTracker\deploy\logs"
set "LOG=%LOGDIR%\boot.log"

if not exist "%LOGDIR%" mkdir "%LOGDIR%"

echo %date% %time% === Demarrage Diet Tracker ===>> "%LOG%"
echo %date% %time% Compte: %USERDOMAIN%\%USERNAME%>> "%LOG%"

REM Attendre que Windows, le reseau et Tailscale soient prets
echo %date% %time% Attente 45 secondes...>> "%LOG%"
timeout /t 45 /nobreak >nul

echo %date% %time% Execution start.ps1...>> "%LOG%"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "C:\apps\dietTracker\deploy\start.ps1" >> "%LOG%" 2>&1
set ERR=%ERRORLEVEL%

echo %date% %time% === Termine (code %ERR%) ===>> "%LOG%"
exit /b 0
