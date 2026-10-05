@echo off
chcp 65001 > nul
title CompeteMate - Phan Tich Du Lieu Cao & Ghi Excel
echo ======================================================================
echo   COMPETEMATE: PHAN TICH DU LIEU CAO BANG AI VA GHI EXCEL TU DONG
echo ======================================================================
python "%~dp0scripts\process_scraped_data.py"
pause
