@echo off
setlocal enabledelayedexpansion

:: Gehe ins Projekt-Root (Ordner, wo die .bat liegt)
cd /d "%~dp0"

echo 🚀 Starte Backend im Docker...
docker compose up -d backend

echo ⏳ Warte 3 Sekunden auf Flask...
timeout /t 3 >nul

echo 🖥️ Wechsle ins Frontend...
cd frontend


echo ▶️ Starte Electron...
npm run electron

pause
