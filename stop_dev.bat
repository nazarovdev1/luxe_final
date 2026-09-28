@echo off
title Luxe Dev Stopper
echo ===================================================
echo         Luxe serverlarini to'xtatish...
echo ===================================================
echo.
taskkill /F /IM node.exe /T 2>nul
echo.
echo Barcha Node.js / Vite / Server jarayonlari to'xtatildi!
timeout /t 2 >nul
exit
