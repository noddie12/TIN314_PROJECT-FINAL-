import os
import sys
import json
import time
import asyncio
import shutil
import re
import subprocess
from datetime import datetime
from pathlib import Path
from typing import Optional, Dict, Any, List
import requests

# Ensure project root is in sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from fastapi import FastAPI, Request, BackgroundTasks, Query, UploadFile, File
from fastapi.responses import HTMLResponse, JSONResponse, FileResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from pipeline.config import (
    APIFY_TOKEN, AI_BASE_URL, AI_API_KEY, AI_MODEL,
    GEMINI_API_KEY, GEMINI_MODEL,
    EXCEL_FILE, COMPETITIONS_JSON, RAW_POSTS_DIR, KNOWN_FANPAGES
)
from pipeline.scraper_apify import ApifyFacebookScraper
from pipeline.scraper_web import GenericWebScraper
from pipeline.ai_extractor import AICompetitionExtractor, GeminiCompetitionExtractor
from pipeline.excel_sync import ExcelSyncManager
from pipeline.db_syncer import DatabaseSyncer
from pipeline.models import CompetitionDNA

# Tự động nạp danh sách 102 cuộc thi & link để đối chiếu tên và danh mục thông minh
COMPETITION_URL_MAP: Dict[str, Dict[str, Any]] = {}
try:
    links_file = BASE_DIR / "data" / "competitions_links.json"
    if links_file.exists():
        with open(links_file, "r", encoding="utf-8") as f:
            for item in json.load(f):
                u = item.get("url", "").lower().strip()
                if u:
                    COMPETITION_URL_MAP[u] = item
                    COMPETITION_URL_MAP[u.rstrip("/")] = item
                    COMPETITION_URL_MAP[u.split("?")[0].rstrip("/")] = item
except Exception as e:
    print(f"Lỗi nạp competitions_links.json: {e}")

app = FastAPI(title="CompeteMate Ingestion Studio", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

WEB_UI_DIR = Path(__file__).resolve().parent / "web_ui"
WEB_UI_DIR.mkdir(parents=True, exist_ok=True)

UPLOADS_DIR = BASE_DIR / "data" / "uploads"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

# File Excel hiện tại đang được sử dụng (Mặc định là file TAKENOTE dự án)
CURRENT_EXCEL_FILE = EXCEL_FILE
CURRENT_APIFY_TOKEN = APIFY_TOKEN
CURRENT_AI_MODEL = AI_MODEL
CURRENT_GEMINI_MODEL = CURRENT_AI_MODEL

# Khóa luồng toàn cục để bảo vệ file Excel không bị xung đột khi ghi đồng thời
excel_lock = asyncio.Lock()

PRESET_APIFY_ACCOUNTS = [
     {
         "id": "acc_1",
         "name": "Tài khoản 1 (bdhzxc23)",
         "token": "",
         "masked_token": "",
         "user_hint": ""
     }
]

# Bộ nhớ đệm (In-memory Cache) và Session Pooling cho Apify API để chuyển đổi tức thì không có độ trễ
APIFY_ACCOUNTS_CACHE: Dict[str, Dict[str, Any]] = {}
APIFY_CACHE_TTL = 180.0  # Lưu cache trong 3 phút (180 giây)

apify_session = requests.Session()
apify_session.headers.update({"Content-Type": "application/json"})

def fetch_apify_account_info(token: str, force_refresh: bool = False) -> Dict[str, Any]:
    """Lấy thông tin tài khoản và hạn mức sử dụng (monthly usage) từ Apify API v2 với cơ chế Cache & Session Pooling."""
    if not token:
        return {
            "configured": False,
            "error": "Chưa có Apify API Token. Vui lòng nhập hoặc chọn token bên dưới để bắt đầu cào dữ liệu."
        }

    now = time.time()
    # Nếu không ép buộc làm mới và cache còn hiệu lực (< 3 phút), trả về ngay lập tức
    if not force_refresh and token in APIFY_ACCOUNTS_CACHE:
        cached = APIFY_ACCOUNTS_CACHE[token]
        if now - cached.get("timestamp", 0) < APIFY_CACHE_TTL:
            return cached["data"]

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    try:
        r_user = apify_session.get("https://api.apify.com/v2/users/me", headers=headers, verify=False, timeout=8)
        if r_user.status_code == 401:
            return {
                "configured": False,
                "error": "API Token không hợp lệ hoặc đã bị vô hiệu hóa trên Apify."
            }
        if r_user.status_code != 200:
            return {
                "configured": False,
                "error": f"Lỗi phản hồi từ Apify ({r_user.status_code}): {r_user.text[:150]}"
            }

        user_data = r_user.json().get("data", {})
        username = user_data.get("username", "")
        email = user_data.get("email", "")
        plan_info = user_data.get("plan", {})
        plan_tier = plan_info.get("tier") or plan_info.get("id") or "FREE"

        # Mức tín dụng tối đa cấu hình: 10.0$ USD
        target_max_credits = float(os.getenv("APIFY_CUSTOM_MAX_CREDITS", "10.0") or 10.0)
        monthly_credits = target_max_credits

        # Lấy thông tin hạn mức và sử dụng thực tế trong chu kỳ
        r_lim = apify_session.get("https://api.apify.com/v2/users/me/limits", headers=headers, verify=False, timeout=8)
        limits_data = {}
        if r_lim.status_code == 200:
            limits_data = r_lim.json().get("data", {})

        current_usage = limits_data.get("current", {})
        limits_info = limits_data.get("limits", {})
        usage_cycle = limits_data.get("monthlyUsageCycle", {})

        monthly_usage_usd = round(float(current_usage.get("monthlyUsageUsd", 0.0) or 0.0), 3)
        max_monthly_usd = float(limits_info.get("maxMonthlyUsageUsd", target_max_credits) or target_max_credits)
        max_concurrent = int(limits_info.get("maxConcurrentActorJobs", 5) or 5)
        active_jobs = int(current_usage.get("activeActorJobCount", 0) or 0)

        limit_target = target_max_credits
        usage_pct = min(round((monthly_usage_usd / limit_target) * 100, 1), 100.0) if limit_target > 0 else 0.0

        cycle_end = usage_cycle.get("endAt", "")
        formatted_cycle_end = ""
        if cycle_end:
            try:
                dt = datetime.fromisoformat(cycle_end.replace("Z", "+00:00"))
                formatted_cycle_end = dt.strftime("%d/%m/%Y")
            except Exception:
                formatted_cycle_end = cycle_end.split("T")[0]

        masked_token = (token[:10] + "..." + token[-4:]) if len(token) > 14 else "••••••••"

        remaining_usd = max(round(target_max_credits - monthly_usage_usd, 3), 0.0)

        result = {
            "configured": True,
            "masked_token": masked_token,
            "raw_token": token,
            "username": username,
            "email": email,
            "plan_tier": plan_tier,
            "monthly_usage_usd": monthly_usage_usd,
            "monthly_credits_usd": monthly_credits,
            "remaining_usd": remaining_usd,
            "max_monthly_usd": max_monthly_usd,
            "usage_percent": usage_pct,
            "max_concurrent_jobs": max_concurrent,
            "active_actor_jobs": active_jobs,
            "cycle_end": formatted_cycle_end
        }

        # Lưu vào cache
        APIFY_ACCOUNTS_CACHE[token] = {
            "data": result,
            "timestamp": now
        }
        return result
    except Exception as e:
        # Nếu có lỗi mạng tạm thời nhưng trong cache đã có, trả về dữ liệu cache cũ
        if token in APIFY_ACCOUNTS_CACHE:
            return APIFY_ACCOUNTS_CACHE[token]["data"]
        return {
            "configured": False,
            "error": f"Lỗi kết nối tới máy chủ Apify: {str(e)}"
        }

@app.get("/api/apify/accounts-overview")
async def get_apify_accounts_overview(force_refresh: bool = Query(False)):
    """Lấy thông tin và hạn mức chi tiết của TẤT CẢ các tài khoản Apify đồng thời (hỗ trợ Cache siêu tốc & force_refresh)."""
    global CURRENT_APIFY_TOKEN
    custom_max = float(os.getenv("APIFY_CUSTOM_MAX_CREDITS", "10.0") or 10.0)

    async def fetch_one(acc):
        info = await asyncio.to_thread(fetch_apify_account_info, acc["token"], force_refresh)
        return {
            "id": acc["id"],
            "name": acc["name"],
            "token": acc["token"],
            "masked_token": acc["masked_token"],
            "user_hint": acc.get("user_hint", ""),
            "is_active": (acc["token"] == CURRENT_APIFY_TOKEN),
            "info": info
        }

    tasks = [fetch_one(acc) for acc in PRESET_APIFY_ACCOUNTS]

    is_custom = not any(acc["token"] == CURRENT_APIFY_TOKEN for acc in PRESET_APIFY_ACCOUNTS)
    if is_custom and CURRENT_APIFY_TOKEN:
        async def fetch_custom():
            info = await asyncio.to_thread(fetch_apify_account_info, CURRENT_APIFY_TOKEN, force_refresh)
            return {
                "id": "acc_custom",
                "name": f"Tùy chỉnh: {info.get('username') or 'Custom'}",
                "token": CURRENT_APIFY_TOKEN,
                "masked_token": (CURRENT_APIFY_TOKEN[:10] + "..." + CURRENT_APIFY_TOKEN[-4:]) if len(CURRENT_APIFY_TOKEN) > 14 else "••••••••",
                "user_hint": info.get("username", "custom"),
                "is_active": True,
                "info": info
            }
        tasks.append(fetch_custom())

    accounts_data = await asyncio.gather(*tasks)

    return {
        "success": True,
        "current_token": CURRENT_APIFY_TOKEN,
        "max_credits_usd": custom_max,
        "accounts": accounts_data
    }

@app.get("/api/apify/accounts")
async def get_apify_accounts():
    """Lấy danh sách các tài khoản / API token Apify có sẵn và tài khoản đang kích hoạt."""
    global CURRENT_APIFY_TOKEN
    custom_max = float(os.getenv("APIFY_CUSTOM_MAX_CREDITS", "10.0") or 10.0)
    return {
        "current_token": CURRENT_APIFY_TOKEN,
        "accounts": PRESET_APIFY_ACCOUNTS,
        "max_credits_usd": custom_max
    }

@app.get("/api/apify/usage")
async def get_apify_usage(force_refresh: bool = Query(False)):
    """Lấy hạn mức và số dư Apify đang kích hoạt."""
    global CURRENT_APIFY_TOKEN
    info = await asyncio.to_thread(fetch_apify_account_info, CURRENT_APIFY_TOKEN, force_refresh)
    return info

class SetApifyTokenPayload(BaseModel):
    token: str

@app.post("/api/apify/set-token")
async def set_apify_token(payload: SetApifyTokenPayload):
    """Xác thực và lưu Apify API Token mới siêu tốc (tận dụng Cache tức thì)."""
    global CURRENT_APIFY_TOKEN
    clean_token = payload.token.strip()
    if not clean_token:
        return JSONResponse(status_code=400, content={"error": "Vui lòng nhập API Token."})

    # Kiểm tra nhanh từ cache hoặc kiểm tra preset
    cached = APIFY_ACCOUNTS_CACHE.get(clean_token)
    now = time.time()
    if cached and (now - cached.get("timestamp", 0) < APIFY_CACHE_TTL):
        info = cached["data"]
    elif any(acc["token"] == clean_token for acc in PRESET_APIFY_ACCOUNTS) and cached:
        info = cached["data"]
    else:
        # Chỉ fetch qua mạng nếu token mới chưa hề có trong cache
        info = await asyncio.to_thread(fetch_apify_account_info, clean_token, False)

    if not info.get("configured"):
        return JSONResponse(status_code=400, content={"error": info.get("error", "Token không hợp lệ.")})

    # Cập nhật trong runtime ngay tức thì (< 1ms)
    CURRENT_APIFY_TOKEN = clean_token
    os.environ["APIFY_TOKEN"] = clean_token
    import pipeline.config
    pipeline.config.APIFY_TOKEN = clean_token

    # Cập nhật vào file .env để lưu vĩnh viễn
    try:
        from pipeline.config import ENV_PATH
        if ENV_PATH.exists():
            env_content = ENV_PATH.read_text(encoding="utf-8")
            if "APIFY_TOKEN=" in env_content:
                env_content = re.sub(r'APIFY_TOKEN=.*', f'APIFY_TOKEN={clean_token}', env_content)
            else:
                env_content += f"\nAPIFY_TOKEN={clean_token}\n"
            ENV_PATH.write_text(env_content, encoding="utf-8")
        else:
            ENV_PATH.write_text(f"APIFY_TOKEN={clean_token}\n", encoding="utf-8")
    except Exception as e:
        print(f"Lỗi lưu file .env: {e}")

    return {
        "success": True,
        "message": f"Đã kết nối thành công tài khoản Apify '{info.get('username')}'!",
        "usage": info
    }

_CACHED_MODELS_LIST = None
_CACHED_MODELS_TIMESTAMP = 0

@app.get("/api/ai/models")
async def get_available_ai_models():
    """Liệt kê danh sách tất cả các mô hình AI khả dụng từ endpoint Multi-Model và nhóm theo phân khúc tối ưu."""
    global CURRENT_AI_MODEL, CURRENT_GEMINI_MODEL, _CACHED_MODELS_LIST, _CACHED_MODELS_TIMESTAMP
    api_key = AI_API_KEY
    base_url = AI_BASE_URL
    if not api_key:
        return {
            "current_model": CURRENT_AI_MODEL,
            "categories": [],
            "error": "Chưa cấu hình AI_API_KEY."
        }

    # Dùng cache nếu còn hiệu lực trong 10 phút (600 giây)
    now = time.time()
    if _CACHED_MODELS_LIST and (now - _CACHED_MODELS_TIMESTAMP < 600):
        models_list = _CACHED_MODELS_LIST
    else:
        def fetch_models():
            try:
                url = f"{base_url}/models"
                resp = requests.get(url, headers={"Authorization": f"Bearer {api_key}"}, verify=False, timeout=25)
                if resp.status_code == 200:
                    raw_data = resp.json().get("data", [])
                    result = []
                    for m in raw_data:
                        mid = m.get("id") if isinstance(m, dict) else str(m)
                        if mid:
                            result.append({"id": mid, "name": mid})
                    return result
            except Exception as e:
                print(f"Lỗi lấy danh sách models từ AI API: {e}")
            return []

        models_list = await asyncio.to_thread(fetch_models)
        if models_list:
            _CACHED_MODELS_LIST = models_list
            _CACHED_MODELS_TIMESTAMP = now

    # Nếu không gọi được API và chưa có cache, dùng danh sách dự phòng
    if not models_list:
        models_list = [
            {"id": "kr/auto", "name": "kr/auto (Auto Routing)"},
            {"id": "cf/@cf/meta/llama-3.3-70b-instruct-fp8-fast", "name": "LLaMA 3.3 70B Fast (Cloudflare)"},
            {"id": "kr/claude-sonnet-4.5-thinking", "name": "Claude Sonnet 4.5 Thinking"},
            {"id": "openrouter/openrouter/free", "name": "OpenRouter Free"},
            {"id": "cf/@cf/deepseek-ai/deepseek-r1-distill-qwen-32b", "name": "DeepSeek R1 Distill 32B"}
        ]

    # Phân nhóm 102 mô hình để người dùng dễ chọn theo mục đích
    rec_group = []       # Auto routing & Khuyên dùng
    claude_group = []    # Claude / DeepSeek / Reasoning
    cf_group = []        # Cloudflare Workers AI (Nhanh & Tải lớn)
    cx_group = []        # OpenAI & Codex / Grok / Khác

    from pipeline.ai_extractor import is_model_quarantined, get_quarantined_models_summary, reset_model_quarantine

    rec_ids = [
        "free", "kilo", "kc/kilo-auto/free", "kc/openrouter/free", "All",
        "kr/auto", "cf/@cf/meta/llama-3.3-70b-instruct-fp8-fast",
        "openrouter/openrouter/free"
    ]

    for m in models_list:
        mid = m["id"]
        is_q, q_r = is_model_quarantined(mid)
        m["is_quarantined"] = is_q
        m["quarantine_reason"] = q_r
        if mid in rec_ids:
            rec_group.append(m)
        elif mid.startswith("kr/") or mid.startswith("kimchi/"):
            claude_group.append(m)
        elif mid.startswith("cf/"):
            cf_group.append(m)
        else:
            cx_group.append(m)

    rec_group.sort(key=lambda x: rec_ids.index(x["id"]) if x["id"] in rec_ids else 99)

    categories = [
        {"name": "⭐ Khuyên Dùng & Miễn Phí (Đã xác minh / Ổn định cao)", "models": rec_group},
        {"name": "🧠 Claude & DeepSeek & Qwen (Suy luận & Logic thể lệ)", "models": claude_group},
        {"name": "⚡ Cloudflare AI (Đa luồng cực nhanh & Nhẹ tải)", "models": cf_group},
        {"name": "🌐 OpenAI / Codex / Grok & Mô hình khác", "models": cx_group},
    ]

    return {
        "current_model": CURRENT_AI_MODEL,
        "categories": categories,
        "total_count": len(models_list),
        "quarantined_summary": get_quarantined_models_summary()
    }

@app.get("/api/ai/circuit-breaker")
async def get_circuit_breaker_status():
    """Lấy danh sách các mô hình đang bị cách ly tạm thời bởi Circuit Breaker."""
    from pipeline.ai_extractor import get_quarantined_models_summary
    return {
        "quarantined_models": get_quarantined_models_summary()
    }

@app.post("/api/ai/circuit-breaker/reset")
async def reset_circuit_breaker():
    """Giải phóng toàn bộ danh sách mô hình bị cách ly."""
    from pipeline.ai_extractor import reset_model_quarantine
    reset_model_quarantine()
    return {"status": "success", "message": "Đã mở khóa toàn bộ mô hình trong Circuit Breaker."}

class SetAiModelPayload(BaseModel):
    model: str

@app.post("/api/ai/set-model")
async def set_ai_model(payload: SetAiModelPayload):
    """Cập nhật mô hình AI được kích hoạt."""
    global CURRENT_AI_MODEL, CURRENT_GEMINI_MODEL
    clean_model = payload.model.strip()
    if not clean_model:
        return JSONResponse(status_code=400, content={"error": "Vui lòng chỉ định tên mô hình."})

    CURRENT_AI_MODEL = clean_model
    CURRENT_GEMINI_MODEL = clean_model
    os.environ["AI_MODEL"] = clean_model
    os.environ["GEMINI_MODEL"] = clean_model
    import pipeline.config
    pipeline.config.AI_MODEL = clean_model
    pipeline.config.GEMINI_MODEL = clean_model

    # Lưu vào .env để ghi nhớ lâu dài
    try:
        from pipeline.config import ENV_PATH
        if ENV_PATH.exists():
            env_content = ENV_PATH.read_text(encoding="utf-8")
            if "AI_MODEL=" in env_content:
                env_content = re.sub(r'AI_MODEL=.*', f'AI_MODEL={clean_model}', env_content)
            else:
                env_content += f"\nAI_MODEL={clean_model}\n"
            ENV_PATH.write_text(env_content, encoding="utf-8")
        else:
            ENV_PATH.write_text(f"AI_MODEL={clean_model}\n", encoding="utf-8")
    except Exception as e:
        print(f"Lỗi lưu file .env: {e}")

    return {
        "success": True,
        "message": f"Đã chuyển sang mô hình AI: '{clean_model}'",
        "current_model": CURRENT_AI_MODEL
    }


@app.get("/", response_class=HTMLResponse)
@app.get("/studio", response_class=HTMLResponse)
async def serve_index():
    index_file = WEB_UI_DIR / "index.html"
    if index_file.exists():
        with open(index_file, "r", encoding="utf-8") as f:
            return f.read()
    return "<h1>CompeteMate Ingestion Studio UI đang tải...</h1>"

@app.get("/portal", response_class=HTMLResponse)
@app.get("/home", response_class=HTMLResponse)
@app.get("/index.html", response_class=HTMLResponse)
async def serve_portal():
    fpath = BASE_DIR / "index.html"
    if fpath.exists():
        return HTMLResponse(fpath.read_text(encoding="utf-8"))
    return HTMLResponse("<h1>Trang chủ CompeteMate không tìm thấy</h1>", status_code=404)

@app.get("/competehub.html", response_class=HTMLResponse)
async def serve_competehub():
    fpath = BASE_DIR / "competehub.html"
    if fpath.exists():
        return HTMLResponse(fpath.read_text(encoding="utf-8"))
    return HTMLResponse("<h1>CompeteHub không tìm thấy</h1>", status_code=404)

@app.get("/competition_dna.html", response_class=HTMLResponse)
async def serve_dna():
    fpath = BASE_DIR / "competition_dna.html"
    if fpath.exists():
        return HTMLResponse(fpath.read_text(encoding="utf-8"))
    return HTMLResponse("<h1>Competition DNA không tìm thấy</h1>", status_code=404)

@app.get("/my_journey.html", response_class=HTMLResponse)
async def serve_my_journey():
    fpath = BASE_DIR / "my_journey.html"
    if fpath.exists():
        return HTMLResponse(fpath.read_text(encoding="utf-8"))
    return HTMLResponse("<h1>My Journey không tìm thấy</h1>", status_code=404)

# Static file mounts
if (BASE_DIR / "data").exists():
    app.mount("/data", StaticFiles(directory=str(BASE_DIR / "data")), name="data")
if (BASE_DIR / "screenshots").exists():
    app.mount("/screenshots", StaticFiles(directory=str(BASE_DIR / "screenshots")), name="screenshots")

@app.get("/api/status")
async def get_system_status():
    """Kiểm tra trạng thái hệ thống, API keys và thông tin file Excel đang kích hoạt."""
    global CURRENT_EXCEL_FILE, CURRENT_APIFY_TOKEN, CURRENT_AI_MODEL, CURRENT_GEMINI_MODEL
    excel_exists = CURRENT_EXCEL_FILE.exists()
    schema_info = {}
    if excel_exists:
        try:
            excel_mgr = ExcelSyncManager(CURRENT_EXCEL_FILE)
            schema_info = excel_mgr.get_schema()
        except Exception:
            pass

    return {
        "status": "ready",
        "apify_ready": bool(CURRENT_APIFY_TOKEN),
        "ai_ready": bool(AI_API_KEY),
        "ai_model": CURRENT_AI_MODEL,
        "gemini_ready": bool(AI_API_KEY),
        "gemini_model": CURRENT_AI_MODEL,
        "active_excel_name": CURRENT_EXCEL_FILE.name,
        "is_custom_excel": CURRENT_EXCEL_FILE != EXCEL_FILE,
        "excel_schema": schema_info,
        "known_presets": KNOWN_FANPAGES
    }

@app.post("/api/upload-excel")
async def upload_custom_excel(file: UploadFile = File(...)):
    """Tiếp nhận file Excel người dùng tải lên, phân tích cấu trúc cột."""
    global CURRENT_EXCEL_FILE
    if not file.filename.endswith(('.xlsx', '.xls')):
        return JSONResponse(status_code=400, content={"error": "Vui lòng chọn định dạng file Excel (.xlsx hoặc .xls)"})

    # Lưu file vào thư mục data/uploads
    dest_path = UPLOADS_DIR / file.filename
    with open(dest_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    CURRENT_EXCEL_FILE = dest_path

    try:
        excel_mgr = ExcelSyncManager(CURRENT_EXCEL_FILE)
        schema = excel_mgr.get_schema()
        return {
            "success": True,
            "message": f"Đã nhận file '{file.filename}' thành công!",
            "schema": schema
        }
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": f"Lỗi đọc file Excel: {str(e)}"})

@app.post("/api/reset-excel")
async def reset_to_default_excel():
    """Khôi phục lại file Excel mặc định của dự án."""
    global CURRENT_EXCEL_FILE
    CURRENT_EXCEL_FILE = EXCEL_FILE
    excel_mgr = ExcelSyncManager(CURRENT_EXCEL_FILE)
    schema = excel_mgr.get_schema()
    return {
        "success": True,
        "message": f"Đã chuyển về file mặc định: {EXCEL_FILE.name}",
        "schema": schema
    }

@app.get("/api/excel-list")
async def get_excel_list():
    """Lấy danh sách các cuộc thi trong file Excel hiện tại."""
    global CURRENT_EXCEL_FILE
    if not CURRENT_EXCEL_FILE.exists():
        return JSONResponse(status_code=404, content={"error": "Không tìm thấy file Excel"})
    try:
        excel_mgr = ExcelSyncManager(CURRENT_EXCEL_FILE)
        comps = excel_mgr.get_competitions_from_sheet()
        return {"competitions": comps}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

def _get_safe_open_path(file_path: Path) -> Path:
    """
    Trên Windows, Microsoft Excel gặp lỗi không mở được file nếu đường dẫn chứa ký tự
    tiếng Việt có dấu ngoài bảng mã ANSI (như 'Ộ', 'Ứ', ...) do bị lỗi chuyển mã thành '?'.
    Hàm này tạo một NTFS hard link tên an toàn (cùng chia sẻ 100% dữ liệu gốc trên đĩa)
    để Excel mở được trực tiếp mà không tốn dung lượng hay làm sai lệch file.
    """
    s1 = u'ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚÝàáâãèéêìíòóôõùúýĂăĐđĨĩŨũƠơƯưẠạẢảẤấẦầẨẩẪẫẬậẮắẰằẲẳẴẵẶặẸẹẺẻẼẽẾếỀềỂểỄễỆệỈỉỊịỌọỎỏỐốỒồỔổỖỗỘộỚớỜờỞởỠỡỢợỤụỦủỨứỪừỬửỮữỰựỲỳỴỵỶỷỸỹ'
    s0 = u'AAAAEEEIIOOOOUUYaaaaeeeiioooouuyAaDdIiUuOoUuAaAaAaAaAaAaAaAaAaAaAaAaEeEeEeEeEeEeEeEeIiIiOoOoOoOoOoOoOoOoOoOoOoOoUuUuUuUuUuUuUuYyYyYyYy'
    
    filename = file_path.name
    try:
        filename.encode('ascii')
        return file_path  # Tên thuần ASCII, mở bình thường
    except UnicodeEncodeError:
        pass

    # Chuyển đổi tên sang không dấu an toàn
    clean_stem = ''
    for c in file_path.stem:
        clean_stem += s0[s1.index(c)] if c in s1 else c
    clean_stem = re.sub(r'[^a-zA-Z0-9_\-]+', '_', clean_stem).strip('_')
    safe_name = f"{clean_stem}{file_path.suffix}"
    safe_path = file_path.parent / safe_name

    # Tạo NTFS hardlink nếu chưa có
    if not safe_path.exists():
        try:
            os.link(str(file_path), str(safe_path))
        except Exception:
            try:
                shutil.copy2(str(file_path), str(safe_path))
            except Exception:
                return file_path

    return safe_path

@app.get("/api/open-excel")
async def open_excel_on_machine():
    """Mở trực tiếp file Excel hiện tại bằng ứng dụng mặc định trên Windows."""
    global CURRENT_EXCEL_FILE
    if not CURRENT_EXCEL_FILE.exists():
        return JSONResponse(status_code=404, content={"error": "File Excel không tồn tại"})
    
    try:
        # Sử dụng đường dẫn an toàn tương thích 100% với Microsoft Excel trên Windows
        target_path = _get_safe_open_path(CURRENT_EXCEL_FILE)
        os.startfile(str(target_path.resolve()))
        return {"success": True, "message": f"Đã mở file: {CURRENT_EXCEL_FILE.name}"}
    except Exception as e:
        # Fallback 1: Mở thư mục chứa file và bôi đen file trong Windows Explorer
        try:
            subprocess.Popen(["explorer.exe", f"/select,{str(CURRENT_EXCEL_FILE.resolve())}"])
            return {"success": True, "message": f"Đã mở thư mục chứa file: {CURRENT_EXCEL_FILE.name}"}
        except Exception:
            pass

        return JSONResponse(status_code=500, content={"error": f"Không thể mở file tự động: {str(e)}"})

@app.get("/api/download-excel")
async def download_excel():
    """Tải xuống file Excel hiện tại."""
    global CURRENT_EXCEL_FILE
    if not CURRENT_EXCEL_FILE.exists():
        return JSONResponse(status_code=404, content={"error": "File Excel không tồn tại"})
    return FileResponse(
        path=str(CURRENT_EXCEL_FILE),
        filename=CURRENT_EXCEL_FILE.name,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )

@app.get("/api/ingest-stream")
async def ingest_stream(
    url: Optional[str] = Query(None, description="Fanpage URL đơn"),
    urls: Optional[str] = Query(None, description="Danh sách URL (JSON array hoặc phân tách bằng dòng)"),
    concurrency: int = Query(3, ge=1, le=10, description="Số luồng xử lý song song cùng lúc (1-10)"),
    time_mode: str = Query("relative", description="Chế độ thời gian: relative hoặc range"),
    newer_than: Optional[str] = Query("1 year", description="Khoảng thời gian (X) hoặc Ngày bắt đầu A"),
    older_than: Optional[str] = Query(None, description="Ngày kết thúc B (cho chế độ range)"),
    limit: int = Query(100, description="Giới hạn an toàn số bài cào"),
    auto_save: bool = Query(True, description="Tự động ghi vào file Excel ngay sau khi phân tích"),
    raw_file: Optional[str] = Query(None, description="Đường dẫn file thô đã lưu (cho test)"),
    ai_model: Optional[str] = Query(None, description="Tên mô hình AI muốn sử dụng")
):
    """
    Luồng Server-Sent Events (SSE) hỗ trợ xử lý song song nhiều link Fanpage cùng lúc.
    """
    global CURRENT_EXCEL_FILE

    async def event_generator():
        raw_text = urls or url or ""
        if not raw_text.strip():
            yield f"data: {json.dumps({'step': 'error', 'message': 'Vui lòng cung cấp ít nhất một link Fanpage Facebook.'})}\n\n"
            return

        # Parse danh sách URL
        raw_text_clean = raw_text.strip()
        if raw_text_clean.startswith("["):
            try:
                raw_list = json.loads(raw_text_clean)
            except Exception:
                raw_list = [line.strip() for line in raw_text_clean.splitlines() if line.strip()]
        else:
            raw_list = [line.strip() for line in raw_text_clean.replace(",", "\n").splitlines() if line.strip()]

        unique_urls = []
        for u in raw_list:
            if u and u not in unique_urls:
                unique_urls.append(u)

        if not unique_urls:
            yield f"data: {json.dumps({'step': 'error', 'message': 'Không tìm thấy link hợp lệ nào.'})}\n\n"
            return

        total_items = len(unique_urls)
        effective_concurrency = min(concurrency, total_items)

        # Đọc schema file Excel
        excel_mgr = ExcelSyncManager(CURRENT_EXCEL_FILE)
        schema = excel_mgr.get_schema()
        columns = schema.get("columns", [])
        is_custom = (CURRENT_EXCEL_FILE != EXCEL_FILE)

        yield f"data: {json.dumps({'step': 'batch_init', 'total': total_items, 'concurrency': effective_concurrency, 'auto_save': auto_save, 'excel_file': CURRENT_EXCEL_FILE.name, 'urls': unique_urls, 'message': f'Khởi chạy xử lý {total_items} link cuộc thi (Chạy song song tối đa {effective_concurrency} luồng)...'})}\n\n"
        await asyncio.sleep(0.3)

        sem = asyncio.Semaphore(effective_concurrency)
        progress_queue = asyncio.Queue()

        async def worker(idx: int, target_raw_url: str):
            async with sem:
                target_url = target_raw_url
                known_info = {}
                key = target_raw_url.lower().strip()
                key_no_slash = key.rstrip("/")
                key_clean = key.split("?")[0].rstrip("/")

                if key in KNOWN_FANPAGES or key_no_slash in KNOWN_FANPAGES or key_clean in KNOWN_FANPAGES:
                    known_info = KNOWN_FANPAGES.get(key) or KNOWN_FANPAGES.get(key_no_slash) or KNOWN_FANPAGES.get(key_clean)
                    target_url = known_info["url"]
                    comp_display = known_info["name"]
                elif key in COMPETITION_URL_MAP or key_no_slash in COMPETITION_URL_MAP or key_clean in COMPETITION_URL_MAP:
                    mapped = COMPETITION_URL_MAP.get(key) or COMPETITION_URL_MAP.get(key_no_slash) or COMPETITION_URL_MAP.get(key_clean)
                    comp_display = mapped.get("name", target_raw_url)
                    known_info = {
                        "name": comp_display,
                        "category": mapped.get("category", "")
                    }
                else:
                    comp_display = target_url

                is_fb = GenericWebScraper.is_facebook_url(target_url)
                if is_fb:
                    target_url = target_url.split("?")[0].rstrip("/")

                await progress_queue.put({
                    "step": "item_start",
                    "index": idx,
                    "total": total_items,
                    "url": target_raw_url,
                    "name": comp_display,
                    "source_type": "facebook" if is_fb else "website",
                    "message": f"[{idx+1}/{total_items}] Bắt đầu: {comp_display} ({'📱 Facebook' if is_fb else '🌐 Website'})"
                })

                posts = []

                if not is_fb:
                    # Chế độ cào Website / Landing Page trực tiếp (Siêu tốc, Miễn phí)
                    await progress_queue.put({
                        "step": "item_scraping",
                        "index": idx,
                        "url": target_raw_url,
                        "source_type": "website",
                        "message": f"[{idx+1}/{total_items}] 🌐 Đang cào dữ liệu từ Website/Landing Page..."
                    })
                    try:
                        web_scraper = GenericWebScraper()
                        posts = await asyncio.to_thread(web_scraper.scrape_url, target_url, save_cache=True)
                        char_count = len(posts[0].get("text", "")) if posts else 0
                        await progress_queue.put({
                            "step": "item_scraped_ok",
                            "index": idx,
                            "url": target_raw_url,
                            "count": len(posts),
                            "source_type": "website",
                            "message": f"[{idx+1}/{total_items}] 🌐 Trích xuất website thành công ({char_count} ký tự)!"
                        })
                    except Exception as e:
                        await progress_queue.put({
                            "step": "item_error",
                            "index": idx,
                            "url": target_raw_url,
                            "message": f"[{idx+1}/{total_items}] ❌ Lỗi cào website: {str(e)}"
                        })
                        return {"index": idx, "url": target_raw_url, "status": "error", "error": str(e)}
                else:
                    # Chế độ cào Facebook Fanpage qua Apify Cloud
                    scraper = ApifyFacebookScraper(token=CURRENT_APIFY_TOKEN)
                    page_slug = scraper._get_page_slug(target_url)

                    if raw_file and total_items == 1:
                        try:
                            posts = scraper.load_cached_posts(raw_file)
                            await progress_queue.put({
                                "step": "item_scraped_ok",
                                "index": idx,
                                "url": target_raw_url,
                                "count": len(posts),
                                "source_type": "facebook",
                                "message": f"[{idx+1}/{total_items}] Nạp từ cache: {Path(raw_file).name} ({len(posts)} bài)"
                            })
                        except Exception as e:
                            await progress_queue.put({
                                "step": "item_error",
                                "index": idx,
                                "url": target_raw_url,
                                "message": f"[{idx+1}/{total_items}] Lỗi đọc cache: {str(e)}"
                            })
                            return {"index": idx, "url": target_raw_url, "status": "error", "error": str(e)}
                    else:
                        time_desc = f"từ ngày {newer_than} đến {older_than}" if (time_mode == "range" and older_than) else f"trong {newer_than} kể từ bài đăng sớm nhất"
                        await progress_queue.put({
                            "step": "item_scraping",
                            "index": idx,
                            "url": target_raw_url,
                            "source_type": "facebook",
                            "message": f"[{idx+1}/{total_items}] 📱 Đang cào dữ liệu Facebook ({time_desc})..."
                        })

                        try:
                            posts = await asyncio.to_thread(
                                scraper.scrape_posts,
                                fanpage_url=target_url,
                                time_mode=time_mode,
                                newer_than=newer_than,
                                older_than=older_than,
                                results_limit=limit,
                                save_cache=True
                            )
                        except Exception as e:
                            cached_files = sorted(RAW_POSTS_DIR.glob(f"*{page_slug}*.json"), key=lambda f: f.stat().st_mtime, reverse=True)
                            if not cached_files:
                                clean_kw = page_slug.replace("_", "").lower()
                                cached_files = [f for f in RAW_POSTS_DIR.glob("*.json") if clean_kw in f.name.lower()]

                            valid_cache = None
                            for cf in cached_files:
                                try:
                                    loaded = scraper.load_cached_posts(cf)
                                    if any((p.get("text") or "").strip() or len(p.get("media", [])) > 0 for p in loaded):
                                        valid_cache = (cf, loaded)
                                        break
                                except Exception:
                                    continue

                            if valid_cache:
                                cf_name, posts = valid_cache
                                await progress_queue.put({
                                    "step": "item_scraped_ok",
                                    "index": idx,
                                    "url": target_raw_url,
                                    "count": len(posts),
                                    "source_type": "facebook",
                                    "message": f"[{idx+1}/{total_items}] Cào trực tiếp gián đoạn. Tự động nạp cache gần nhất: {cf_name.name} ({len(posts)} bài)"
                                })
                            else:
                                await progress_queue.put({
                                    "step": "item_error",
                                    "index": idx,
                                    "url": target_raw_url,
                                    "message": f"[{idx+1}/{total_items}] Lỗi cào dữ liệu: {str(e)}"
                                })
                                return {"index": idx, "url": target_raw_url, "status": "error", "error": str(e)}

                valid_posts = [p for p in posts if (p.get("text") or "").strip() or len(p.get("media", [])) > 0]
                if not valid_posts and is_fb:
                    # Nếu bài viết trả về rỗng do khoảng thời gian quá hẹp, kiểm tra xem có cache cũ hợp lệ không
                    cached_files = sorted(RAW_POSTS_DIR.glob(f"*{page_slug}*.json"), key=lambda f: f.stat().st_mtime, reverse=True)
                    for cf in cached_files:
                        try:
                            loaded = scraper.load_cached_posts(cf)
                            loaded_valid = [p for p in loaded if (p.get("text") or "").strip() or len(p.get("media", [])) > 0]
                            if loaded_valid:
                                valid_posts = loaded_valid
                                posts = loaded_valid
                                await progress_queue.put({
                                    "step": "item_scraped_ok",
                                    "index": idx,
                                    "url": target_raw_url,
                                    "count": len(valid_posts),
                                    "source_type": "facebook",
                                    "message": f"[{idx+1}/{total_items}] Không có bài viết trong mốc thời gian chọn. Tự động nạp cache đã lưu: {cf.name} ({len(valid_posts)} bài)"
                                })
                                break
                        except Exception:
                            continue

                if not valid_posts:
                    hint = f"Fanpage không có bài viết nào trong khoảng {newer_than} kể từ bài đăng sớm nhất (Hãy thử chọn mốc thời gian rộng hơn, ví dụ: 'Toàn bộ thời gian' hoặc '2 năm')." if is_fb else "Không thể trích xuất nội dung văn bản từ trang web này."
                    await progress_queue.put({
                        "step": "item_error",
                        "index": idx,
                        "url": target_raw_url,
                        "message": f"[{idx+1}/{total_items}] Không có bài viết nào: {hint}"
                    })
                    return {"index": idx, "url": target_raw_url, "status": "error", "error": f"Không có bài viết. {hint}"}
                posts = valid_posts

                target_ai_model = (ai_model or "").strip() or CURRENT_AI_MODEL
                
                # Kiểm tra Circuit Breaker xem model có đang bị cách ly không
                from pipeline.ai_extractor import is_model_quarantined, filter_active_models
                from pipeline.config import DEFAULT_FALLBACK_MODELS
                is_q, q_reason = is_model_quarantined(target_ai_model)
                if is_q:
                    active_pool = filter_active_models(DEFAULT_FALLBACK_MODELS)
                    chosen_model = active_pool[0] if active_pool else target_ai_model
                    await progress_queue.put({
                        "step": "item_ai_switch_model",
                        "index": idx,
                        "url": target_raw_url,
                        "message": f"[{idx+1}/{total_items}] ⏩ Model '{target_ai_model}' đang bị khóa ({q_reason}). Tự động dùng '{chosen_model}'..."
                    })
                    target_ai_model = chosen_model

                await progress_queue.put({
                    "step": "item_ai_analyzing",
                    "index": idx,
                    "url": target_raw_url,
                    "count": len(posts),
                    "model": target_ai_model,
                    "message": f"[{idx+1}/{total_items}] AI ({target_ai_model}) đang đọc {len(posts)} bài & trích xuất dẫn chứng..."
                })

                extractor = AICompetitionExtractor(model_name=target_ai_model)
                target_cols = columns if columns else [
                    'Tên cuộc thi', 'Danh mục', 'Đơn vị tổ chức', 'Mô tả ngắn', 
                    'Đối tượng tham gia', 'Hình thức tham gia', 'Cơ cấu vòng thi', 
                    'Cơ cấu giải thưởng', 'Mùa thi', 'Deadline đăng ký', 'Link nguồn chính thức'
                ]

                try:
                    # Trích xuất DNA trước để lấy chính xác tên & đơn vị tổ chức
                    dna = await asyncio.to_thread(
                        extractor.extract_competition_dna,
                        posts=posts,
                        fallback_name=known_info.get("name"),
                        fallback_organizer=known_info.get("organizer"),
                        fallback_url=target_url
                    )
                    # Sau đó trích xuất cột Excel đối chiếu (tránh gọi đồng thời 2 request gây nghẽn rate-limit)
                    custom_mapped_row = await asyncio.to_thread(
                        extractor.extract_custom_mapping,
                        posts=posts,
                        target_columns=target_cols,
                        fallback_name=dna.name or known_info.get("name"),
                        fallback_organizer=dna.organizer or known_info.get("organizer"),
                        fallback_url=target_url
                    )
                except Exception as e:
                    await progress_queue.put({
                        "step": "item_error",
                        "index": idx,
                        "url": target_raw_url,
                        "message": f"[{idx+1}/{total_items}] Lỗi phân tích AI: {str(e)}"
                    })
                    return {"index": idx, "url": target_raw_url, "status": "error", "error": str(e)}

                row_idx = None
                if auto_save:
                    async with excel_lock:
                        target_hint_row = (known_info.get("stt") + 1) if known_info.get("stt") else None
                        try:
                            if is_custom and custom_mapped_row:
                                row_idx = await asyncio.to_thread(
                                    excel_mgr.update_with_custom_mapping,
                                    custom_data=custom_mapped_row,
                                    competition_name=dna.name,
                                    target_row=target_hint_row
                                )
                            else:
                                row_idx = await asyncio.to_thread(
                                    excel_mgr.update_competition,
                                    dna=dna,
                                    custom_data=custom_mapped_row,
                                    target_row=target_hint_row
                                )
                        except Exception as e:
                            row_idx = None
                            await progress_queue.put({
                                "step": "item_warning",
                                "index": idx,
                                "url": target_raw_url,
                                "message": f"[{idx+1}/{total_items}] ⚠️ Lỗi ghi Excel: {str(e)}"
                            })

                        try:
                            db_syncer = DatabaseSyncer()
                            await asyncio.to_thread(db_syncer.sync_competition, dna)
                        except Exception:
                            pass

                item_res = {
                    "index": idx,
                    "url": target_raw_url,
                    "status": "success",
                    "name": dna.name,
                    "season": dna.season,
                    "dna": dna.model_dump(),
                    "custom_mapping": custom_mapped_row,
                    "excel_row": row_idx
                }

                await progress_queue.put({
                    "step": "item_completed",
                    "index": idx,
                    "url": target_raw_url,
                    "name": dna.name,
                    "season": dna.season,
                    "item": item_res,
                    "message": f"[{idx+1}/{total_items}] Hoàn tất: {dna.name} ({dna.season})"
                })
                return item_res

        # Khởi chạy các worker
        worker_tasks = [asyncio.create_task(worker(i, u)) for i, u in enumerate(unique_urls)]
        all_task = asyncio.gather(*worker_tasks)

        # Phát sự kiện SSE thời gian thực từ queue
        while not all_task.done() or not progress_queue.empty():
            try:
                event_data = await asyncio.wait_for(progress_queue.get(), timeout=3.0)
                yield f"data: {json.dumps(event_data)}\n\n"
            except asyncio.TimeoutError:
                yield f": keep-alive\n\n"

        results = await all_task
        succeeded = [r for r in results if r and r.get("status") == "success"]
        failed = [r for r in results if not r or r.get("status") == "error"]

        batch_res = {
            "step": "completed" if total_items == 1 else "batch_completed",
            "total": total_items,
            "succeeded": len(succeeded),
            "failed": len(failed),
            "auto_saved": auto_save,
            "results": results,
            "excel_file": CURRENT_EXCEL_FILE.name,
            # Tương thích ngược cho trường hợp 1 link
            "dna": succeeded[0]["dna"] if succeeded else {},
            "custom_mapping": succeeded[0]["custom_mapping"] if succeeded else None,
            "excel_row": succeeded[0].get("excel_row") if succeeded else None,
            "message": f"Đã xử lý xong {len(succeeded)}/{total_items} cuộc thi." + (" (Đã lưu Excel)" if auto_save else " (Đang chờ duyệt)")
        }
        yield f"data: {json.dumps(batch_res)}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")

class BatchItemSavePayload(BaseModel):
    dna: Dict[str, Any]
    custom_mapping: Optional[Dict[str, Any]] = None
    competition_name: Optional[str] = None

class ConfirmSaveBatchPayload(BaseModel):
    items: List[BatchItemSavePayload]

@app.post("/api/confirm-save-batch")
async def confirm_save_batch_to_excel(req: ConfirmSaveBatchPayload):
    """
    Ghi hàng loạt cuộc thi (đã được người dùng kiểm tra hoặc chỉnh sửa) vào file Excel và CSDL.
    """
    global CURRENT_EXCEL_FILE
    excel_mgr = ExcelSyncManager(CURRENT_EXCEL_FILE)
    is_custom = (CURRENT_EXCEL_FILE != EXCEL_FILE)

    saved_items = []
    errors = []

    for item in req.items:
        comp_name = item.competition_name or item.dna.get("name", "Cuộc thi")
        try:
            dna_data = dict(item.dna)
            dna_data.setdefault("organizer", "Chưa rõ")
            dna_data.setdefault("category", "General")
            dna_data.setdefault("short_description", "")
            dna_data.setdefault("eligibility", "")
            dna_data.setdefault("deadline", "")
            dna_data.setdefault("id", "comp-" + str(int(asyncio.get_event_loop().time())))

            async with excel_lock:
                if is_custom and item.custom_mapping:
                    row_idx = await asyncio.to_thread(
                        excel_mgr.update_with_custom_mapping,
                        custom_data=item.custom_mapping,
                        competition_name=comp_name
                    )
                else:
                    field_map = {
                        "Tên cuộc thi": "name",
                        "Deadline đăng ký": "deadline",
                        "Đơn vị tổ chức": "organizer",
                        "Danh mục": "category",
                        "Lĩnh vực": "category",
                        "Mô tả ngắn": "short_description",
                        "Đối tượng tham gia": "eligibility",
                        "Mùa thi": "season",
                        "Cơ cấu giải thưởng": "grand_prize"
                    }
                    if item.custom_mapping:
                        for label, attr in field_map.items():
                            if label in item.custom_mapping and item.custom_mapping[label]:
                                val = item.custom_mapping[label]
                                if isinstance(val, dict):
                                    val = val.get("value", "")
                                dna_data[attr] = val

                    dna_obj = CompetitionDNA(**dna_data)
                    row_idx = await asyncio.to_thread(
                        excel_mgr.update_competition,
                        dna=dna_obj,
                        custom_data=item.custom_mapping
                    )

                try:
                    dna_obj = CompetitionDNA(**dna_data)
                    db_syncer = DatabaseSyncer()
                    await asyncio.to_thread(db_syncer.sync_competition, dna_obj)
                except Exception:
                    pass

            saved_items.append({"name": comp_name, "row": row_idx})
        except Exception as e:
            errors.append({"name": comp_name, "error": str(e)})

    if not saved_items and errors:
        return JSONResponse(status_code=500, content={"error": f"Lỗi lưu: {errors[0]['error']}"})

    return {
        "success": True,
        "message": f"Đã ghi thành công {len(saved_items)}/{len(req.items)} cuộc thi vào file Excel: {CURRENT_EXCEL_FILE.name}",
        "saved_count": len(saved_items),
        "total_count": len(req.items),
        "excel_file": CURRENT_EXCEL_FILE.name,
        "errors": errors
    }

class ConfirmSavePayload(BaseModel):
    dna: Dict[str, Any]
    custom_mapping: Optional[Dict[str, Any]] = None
    competition_name: Optional[str] = None

@app.post("/api/confirm-save")
async def confirm_save_to_excel(req: ConfirmSavePayload):
    """
    Ghi dữ liệu (đã được người dùng kiểm tra hoặc chỉnh sửa trên giao diện) vào file Excel và CSDL.
    """
    global CURRENT_EXCEL_FILE
    excel_mgr = ExcelSyncManager(CURRENT_EXCEL_FILE)
    is_custom = (CURRENT_EXCEL_FILE != EXCEL_FILE)

    row_idx = 0
    comp_name = req.competition_name or req.dna.get("name", "Cuộc thi")

    try:
        from pipeline.models import CompetitionDNA
        dna_data = dict(req.dna)
        dna_data.setdefault("organizer", "Chưa rõ")
        dna_data.setdefault("category", "General")
        dna_data.setdefault("short_description", "")
        dna_data.setdefault("eligibility", "")
        dna_data.setdefault("deadline", "")
        dna_data.setdefault("id", "comp-" + str(int(asyncio.get_event_loop().time())))

        async with excel_lock:
            if is_custom and req.custom_mapping:
                row_idx = await asyncio.to_thread(
                    excel_mgr.update_with_custom_mapping,
                    custom_data=req.custom_mapping,
                    competition_name=comp_name
                )
            else:
                # Cập nhật các trường chỉnh sửa từ custom_mapping nếu có
                if req.custom_mapping:
                    field_map = {
                        "Tên cuộc thi": "name",
                        "Deadline đăng ký": "deadline",
                        "Đơn vị tổ chức": "organizer",
                        "Danh mục": "category",
                        "Lĩnh vực": "category",
                        "Mô tả ngắn": "short_description",
                        "Mô tả ngắn gọn": "short_description",
                        "Đối tượng tham gia": "eligibility",
                        "Mùa thi": "season",
                        "Cơ cấu giải thưởng": "grand_prize"
                    }
                    for label, attr in field_map.items():
                        if label in req.custom_mapping and req.custom_mapping[label]:
                            val = req.custom_mapping[label]
                            if isinstance(val, dict):
                                val = val.get("value", "")
                            dna_data[attr] = str(val or "")

                dna_obj = CompetitionDNA(**dna_data)
                row_idx = await asyncio.to_thread(
                    excel_mgr.update_competition,
                    dna=dna_obj,
                    custom_data=req.custom_mapping
                )

            # Đồng bộ CSDL website
            try:
                dna_obj = CompetitionDNA(**dna_data)
                db_syncer = DatabaseSyncer()
                await asyncio.to_thread(db_syncer.sync_competition, dna_obj)
            except Exception as e:
                print(f"Lỗi sync DB: {e}")

        return {
            "success": True,
            "message": f"Đã ghi thành công vào file Excel: {CURRENT_EXCEL_FILE.name} (Hàng #{row_idx})",
            "excel_file": CURRENT_EXCEL_FILE.name,
            "excel_row": row_idx
        }
    except PermissionError as pe:
        return JSONResponse(status_code=409, content={"error": str(pe)})
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": f"Lỗi lưu file: {str(e)}"})

# ==============================================================================
# API BATCH XỬ LÝ DỮ LIỆU ĐÃ CÀO SẴN BẰNG AI & GHI EXCEL
# ==============================================================================
@app.get("/api/scraped/status")
async def get_scraped_status():
    """Lấy danh sách các cuộc thi đã cào dữ liệu và trạng thái trong Excel."""
    from process_scraped_data import ScrapedCompetitionManager
    manager = ScrapedCompetitionManager(CURRENT_EXCEL_FILE)
    items = await asyncio.to_thread(manager.scan_all)
    scraped = [it for it in items if it["has_scraped_file"]]
    pending = [it for it in scraped if not it["has_excel_data"]]
    return {
        "total_scraped": len(scraped),
        "total_excel_filled": len(scraped) - len(pending),
        "total_pending": len(pending),
        "items": [
            {
                "row": it["target_row"],
                "name": it["name"],
                "category": it["category"],
                "url": it["url"],
                "has_scraped_file": it["has_scraped_file"],
                "scraped_file": it["scraped_file"].name if it["scraped_file"] else None,
                "post_count": it["post_count"],
                "file_size_kb": it["file_size_kb"],
                "has_excel_data": it["has_excel_data"],
                "is_formula_linked": it["is_formula_linked"]
            }
            for it in items if it["has_scraped_file"] or it["has_excel_data"]
        ]
    }

@app.post("/api/scraped/process")
async def process_scraped_endpoint(request: Request, background_tasks: BackgroundTasks):
    """
    Kích hoạt phân tích dữ liệu cào bằng AI và ghi vào Excel.
    Payload: {"row": 62} hoặc {"url": "..."} hoặc {"all_pending": true}
    """
    body = await request.json()
    from process_scraped_data import ScrapedCompetitionManager
    manager = ScrapedCompetitionManager(CURRENT_EXCEL_FILE)
    
    if body.get("all_pending"):
        background_tasks.add_task(manager.process_all_pending, force=body.get("force", False))
        return {"success": True, "message": "Đang chạy phân tích toàn bộ cuộc thi đang chờ trong background!"}
    elif body.get("row"):
        r_num = int(body["row"])
        background_tasks.add_task(manager.process_by_row, [r_num], force=body.get("force", True))
        return {"success": True, "message": f"Đang chạy phân tích cuộc thi tại hàng #{r_num} trong background!"}
    elif body.get("url"):
        url_q = str(body["url"])
        background_tasks.add_task(manager.process_by_url_or_slug, url_q, force=body.get("force", True))
        return {"success": True, "message": f"Đang chạy phân tích cuộc thi '{url_q}' trong background!"}
    else:
        return JSONResponse(status_code=400, content={"error": "Vui lòng truyền 'row', 'url' hoặc 'all_pending': true"})

def start_server(host="127.0.0.1", port=8765):
    import uvicorn
    print(f"🚀 CompeteMate Studio Web UI đang khởi chạy tại: http://{host}:{port}")
    uvicorn.run("pipeline.server:app", host=host, port=port, reload=False)

if __name__ == "__main__":
    start_server()
