"""
Tương thích ngược: File này chuyển hướng trực tiếp sang test_ai.py
để kiểm thử Multi-Model AI Engine mới thay thế Google Gemini API cũ.
"""
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from pipeline.test_ai import main

if __name__ == "__main__":
    print("ℹ️ Google Gemini API đã được thay thế bằng Multi-Model AI Engine.")
    print("   Chuyển tiếp kiểm thử sang pipeline/test_ai.py...\n")
    success = main()
    sys.exit(0 if success else 1)
