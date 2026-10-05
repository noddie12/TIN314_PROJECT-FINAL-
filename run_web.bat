@echo off
chcp 65001 > nul
title CompeteMate Web - Port 3333
echo ===================================================
echo 🏆 CompeteMate Web Portal (Cổng 3333)
echo ===================================================
echo Đang mở trình duyệt tại: http://localhost:3333 ...
start http://localhost:3333
python -m http.server 3333 --directory "%~dp0."
pause
