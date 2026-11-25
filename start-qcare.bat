@echo off
start "npm run dev" powershell -NoExit -Command "cd 'C:\Users\nguye\OneDrive\Q care\backend'; npm run dev"
timeout /t 3 /nobreak >nul
start "ngrok" powershell -NoExit -Command "ngrok http 5000"