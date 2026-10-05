@echo off
chcp 65001 > nul
echo ===================================================
echo 🏆 CompeteMate Ingestion Studio Web UI
echo ===================================================
echo Đang mở trình duyệt tại: http://127.0.0.1:8765 ...
start http://127.0.0.1:8765
python -m uvicorn pipeline.server:app --host 127.0.0.1 --port 8765
