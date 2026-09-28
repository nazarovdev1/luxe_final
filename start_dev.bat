@echo off
title Luxe Dev Starter
echo ===================================================
echo           Starting Luxe Fullstack Dev Server
echo ===================================================
echo.
echo [1/2] Backend ishga tushirilmoqda (Nodemon)...
start "Luxe Backend" cmd /k "cd /d c:\luxe\server && npm run dev"

echo [2/2] Frontend ishga tushirilmoqda (Vite React)...
start "Luxe Frontend" cmd /k "cd /d c:\luxe\client && npm start"

echo.
echo ===================================================
echo  Backend va Frontend muvaffaqiyatli ishga tushdi!
echo  Backend:  c:\luxe\server (nodemon)
echo  Frontend: c:\luxe\client (vite)
echo ===================================================
timeout /t 3 >nul
exit
