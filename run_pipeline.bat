@echo off
chcp 65001 > nul
echo ===================================================
echo 🏆 CompeteMate Automated Data Pipeline
echo ===================================================
if "%1"=="" (
    echo Cách dùng:
    echo   run_pipeline.bat --url https://www.facebook.com/yec.calliope
    echo   run_pipeline.bat --url calliope
    echo   run_pipeline.bat --url kawai
    echo   run_pipeline.bat --url ban_linh_marketer
    echo   run_pipeline.bat --list-competitions
    echo.
    python -X utf8 pipeline\run_pipeline.py --help
) else (
    python -X utf8 pipeline\run_pipeline.py %*
)
