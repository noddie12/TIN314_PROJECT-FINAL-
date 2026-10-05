import os
import ssl
import sys
from pathlib import Path
import urllib3
from dotenv import load_dotenv

# Đảm bảo stdout/stderr luôn dùng UTF-8 trên Windows
if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Disable urllib3 insecure warnings for corporate proxy inspection
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Apply global SSL Patch for Windows Corporate Proxy (SECLEVEL=1 & Windows Root CAs)
_orig_create_default_context = ssl.create_default_context

def _patched_create_default_context(purpose=ssl.Purpose.SERVER_AUTH, **kwargs):
    ctx = _orig_create_default_context(purpose=purpose, **kwargs)
    try:
        ctx.set_ciphers('DEFAULT@SECLEVEL=1')
    except Exception:
        pass
    try:
        ctx.load_default_certs(purpose)
    except Exception:
        pass
    return ctx

ssl.create_default_context = _patched_create_default_context

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent
ENV_PATH = BASE_DIR / ".env"
load_dotenv(dotenv_path=ENV_PATH)

DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)

RAW_POSTS_DIR = DATA_DIR / "raw_posts"
RAW_POSTS_DIR.mkdir(parents=True, exist_ok=True)

EXCEL_FILE = BASE_DIR / "TAKENOTE CÁC CUỘC THI PROJECT TIN314.xlsx"
COMPETITIONS_JSON = DATA_DIR / "competitions.json"
COMPETITIONS_DB = DATA_DIR / "competitions.db"

# API Credentials (Apify Facebook Scraper)
APIFY_TOKEN = os.getenv("APIFY_TOKEN", "")
APIFY_USER_ID = os.getenv("APIFY_USER_ID", "")

# Multi-Model AI Engine Credentials
AI_BASE_URL = os.getenv("AI_BASE_URL", "https://rv6jzum.abc-tunnel.us/v1").rstrip("/")
AI_API_KEY = os.getenv("AI_API_KEY", "")
AI_MODEL = os.getenv("AI_MODEL", "kc/kilo-auto/free")

# Danh sách model dự phòng (fallback) đa dạng từ nhiều nhà cung cấp độc lập
DEFAULT_FALLBACK_MODELS = [
    # 1. Nguồn Kilo AI / Novita (Tải cao, ổn định, không giới hạn neuron ngày)
    "kc/kilo-auto/free",
    "kc/openrouter/free",
    "kc/nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
    "kc/cohere/north-mini-code:free",
    # 2. Nguồn Tối ưu Tự động Miễn phí
    "kilo",
    "free",
    # 3. Router tổng hợp toàn diện
    "All",
    # 4. OpenRouter Free Tier
    "openrouter/openrouter/free",
    "openrouter/poolside/laguna-xs.2:free",
    # 5. Cloudflare Workers AI (Dự phòng khi còn hạn ngạch neurons)
    "cf/@cf/meta/llama-3.3-70b-instruct-fp8-fast",
    "cf/@cf/qwen/qwen2.5-coder-32b-instruct",
    "cf/@cf/deepseek-ai/deepseek-r1-distill-qwen-32b",
    # 6. Kiro AI Engine (Dự phòng cho chu kỳ tháng kế tiếp)
    "kr/auto",
    "kr/claude-sonnet-4.5-thinking"
]

# Tương thích ngược (backward compatibility) cho các mã nguồn cũ
GEMINI_API_KEY = AI_API_KEY
GEMINI_MODEL = AI_MODEL

# Known Fanpage Directory Mapping
KNOWN_FANPAGES = {
    "calliope": {
        "name": "Cuộc thi Hùng biện Kinh tế CALLIOPE",
        "url": "https://www.facebook.com/yec.calliope",
        "category": "Debate & Economics",
        "organizer": "CLB Kinh tế Trẻ (YEC) - Học viện Tài chính"
    },
    "kawai": {
        "name": "Khởi nghiệp cùng Kawai",
        "url": "https://www.facebook.com/khoinghiepcungkawai",
        "category": "Startup",
        "organizer": "CLB Nhà Doanh nghiệp Tương lai (TEC) - ĐH Ngoại Thương"
    },
    "ban_linh_marketer": {
        "name": "Bản Lĩnh Marketer",
        "url": "https://www.facebook.com/BanLinhMarketer",
        "category": "Marketing",
        "organizer": "CLB Marketing MAC - ĐH Ngoại Thương"
    },
    "i_invest": {
        "name": "I-INVEST!",
        "url": "https://www.facebook.com/IINVEST.NFC",
        "category": "Finance",
        "organizer": "CLB Chứng khoán Trẻ (SIC) - ĐH Ngoại Thương"
    },
    "cmo_think_and_action": {
        "name": "CMO Think & Action",
        "url": "https://www.facebook.com/cmo.thinkandaction",
        "category": "Marketing",
        "organizer": "Margroup - ĐH Kinh tế TP.HCM (UEH)"
    },
    "hsbc_business_case": {
        "name": "HSBC Business Case Challenge",
        "url": "https://www.facebook.com/hsbccasecompetition",
        "category": "Business Case",
        "organizer": "HSBC & FTU"
    },
    "ung_vien_tai_nang": {
        "name": "Ứng viên tài năng",
        "url": "https://www.facebook.com/ungvientainang",
        "category": "MT & Management Trainee",
        "organizer": "CLB Nguồn nhân lực HRC - ĐH Ngoại Thương"
    }
}
