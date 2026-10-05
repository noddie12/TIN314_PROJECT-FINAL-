import json
import time
import re
from typing import List, Dict, Any, Optional
import requests
import urllib3

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

from pipeline.config import AI_BASE_URL, AI_API_KEY, AI_MODEL, DEFAULT_FALLBACK_MODELS
from pipeline.models import CompetitionDNA

# ==============================================================================
# CIRCUIT BREAKER: Quản lý trạng thái cách ly các model bị lỗi/hết quota/quá tải
# ==============================================================================
_MODEL_CIRCUIT_BREAKER: Dict[str, Dict[str, Any]] = {}

def is_model_quarantined(model: str) -> tuple[bool, str]:
    """Kiểm tra xem model có đang bị khóa cách ly hay không."""
    info = _MODEL_CIRCUIT_BREAKER.get(model)
    if not info:
        return False, ""
    now = time.time()
    if now < info["expiry"]:
        remaining = int(info["expiry"] - now)
        return True, f"{info['reason']} (còn {remaining}s)"
    # Hết hạn cách ly -> mở khóa tự động
    del _MODEL_CIRCUIT_BREAKER[model]
    return False, ""

def quarantine_model(model: str, error_message: str):
    """
    Đưa model vào danh sách đen/cách ly tạm thời để không gọi lại nó nữa trong suốt chu trình xử lý.
    """
    now = time.time()
    err_str = str(error_message).lower()
    
    if "402" in err_str or "monthly" in err_str or "you have reached the limit" in err_str:
        duration = 7200  # 2 giờ cho lỗi hết quota tháng
        reason = "Hết hạn mức tháng (Quota 402/Monthly Limit)"
    elif "neuron" in err_str or "daily free allocation" in err_str:
        duration = 3600  # 1 giờ cho lỗi hết hạn ngạch neurons ngày của Cloudflare
        reason = "Hết hạn ngạch miễn phí 10,000 neurons/ngày của Cloudflare"
    elif "401" in err_str or "404" in err_str or "410" in err_str or "not support" in err_str:
        duration = 86400  # 24 giờ cho model không hỗ trợ/không tồn tại
        reason = "Model không tồn tại hoặc endpoint bị hủy (4xx)"
    elif "413" in err_str or "context window" in err_str:
        duration = 1800  # 30 phút
        reason = "Vượt giới hạn context window của model (413)"
    elif "429" in err_str or "rate limit" in err_str:
        duration = 600   # 10 phút cho lỗi rate limit
        reason = "Chạm giới hạn tốc độ gọi (Rate limit 429)"
    elif "503" in err_str or "overload" in err_str:
        duration = 600   # 10 phút cho máy chủ quá tải
        reason = "Máy chủ nhà cung cấp bị quá tải (503 Overloaded)"
    elif "timeout" in err_str or "timed out" in err_str:
        duration = 300   # 5 phút cho lỗi timeout
        reason = "Phản hồi quá thời gian cho phép (Timeout)"
    else:
        duration = 600
        reason = error_message[:80]

    _MODEL_CIRCUIT_BREAKER[model] = {
        "expiry": now + duration,
        "reason": reason,
        "raw_error": error_message[:150]
    }
    print(f"🚫 [Circuit Breaker] ĐÃ KHÓA model '{model}' ({reason}). Sẽ tự động bỏ qua model này!")

def filter_active_models(models_list: List[str]) -> List[str]:
    """Lọc danh sách model, loại bỏ hoàn toàn các model đang bị khóa."""
    active = []
    quarantined = []
    for m in models_list:
        is_q, r = is_model_quarantined(m)
        if is_q:
            quarantined.append((m, r))
        else:
            active.append(m)
    
    # Nếu TẤT CẢ model đều bị khóa (tình huống khẩn cấp), mở khóa toàn bộ để thử lại
    if not active and quarantined:
        print("⚠️ [Circuit Breaker] Tất cả model dự phòng đều bị khóa! Tự động reset circuit breaker...")
        _MODEL_CIRCUIT_BREAKER.clear()
        return list(models_list)
        
    return active

def reset_model_quarantine(model: Optional[str] = None):
    """Xóa khóa cách ly cho một model hoặc toàn bộ."""
    global _MODEL_CIRCUIT_BREAKER
    if model:
        _MODEL_CIRCUIT_BREAKER.pop(model, None)
    else:
        _MODEL_CIRCUIT_BREAKER.clear()

def get_quarantined_models_summary() -> Dict[str, Any]:
    """Báo cáo các model đang bị khóa."""
    now = time.time()
    res = {}
    for m, info in list(_MODEL_CIRCUIT_BREAKER.items()):
        if now < info["expiry"]:
            res[m] = {
                "remaining_seconds": int(info["expiry"] - now),
                "reason": info["reason"]
            }
        else:
            del _MODEL_CIRCUIT_BREAKER[m]
    return res

class AICompetitionExtractor:
    """
    Bộ trích xuất và chuẩn hóa thông tin cuộc thi sử dụng Multi-Model AI Engine
    với Circuit Breaker tự động khóa model lỗi và xoay vòng fallback qua nhiều nguồn.
    """
    def __init__(
        self,
        base_url: Optional[str] = None,
        api_key: Optional[str] = None,
        model_name: Optional[str] = None,
        fallback_models: Optional[List[str]] = None
    ):
        self.base_url = (base_url or AI_BASE_URL).rstrip("/")
        self.api_key = api_key or AI_API_KEY
        self.preferred_model = model_name or AI_MODEL or "kr/auto"
        self.fallback_models = fallback_models or DEFAULT_FALLBACK_MODELS
        
        if not self.api_key:
            raise ValueError("AI_API_KEY chưa được cấu hình. Vui lòng kiểm tra file .env.")

    @staticmethod
    def _parse_json_robust(raw_text: str) -> Dict[str, Any]:
        """
        Bóc tách JSON an toàn ngay cả khi mô hình trả về:
        - Thẻ suy nghĩ <thinking>...</thinking> (Claude Sonnet / DeepSeek thinking)
        - Markdown blocks ```json ... ```
        - Đoạn hội thoại kèm JSON
        """
        # 1. Loại bỏ các khối thẻ suy nghĩ
        clean = re.sub(r'<thinking>[\s\S]*?</thinking>', '', raw_text, flags=re.IGNORECASE).strip()
        
        # 2. Loại bỏ khối markdown codeblocks ```json ... ```
        if "```" in clean:
            # Tìm khối ```json ... ``` hoặc ``` ... ```
            codeblock_match = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', clean)
            if codeblock_match:
                clean = codeblock_match.group(1).strip()
            else:
                clean = re.sub(r'^```[a-zA-Z]*\n', '', clean)
                clean = re.sub(r'\n```$', '', clean).strip()

        # 3. Thử parse trực tiếp
        try:
            return json.loads(clean)
        except Exception:
            pass

        # 4. Fallback: Dùng regex tìm khối JSON object ngoài cùng {...}
        obj_match = re.search(r'(\{[\s\S]*\})', clean)
        if obj_match:
            try:
                return json.loads(obj_match.group(1))
            except Exception:
                pass

        # 5. Fallback 2: Thử tìm khối JSON array [...] nếu cần
        arr_match = re.search(r'(\[[\s\S]*\])', clean)
        if arr_match:
            try:
                return json.loads(arr_match.group(1))
            except Exception:
                pass

        raise ValueError(f"Không thể phân tích phản hồi thành JSON hợp lệ. Nội dung nhận được:\n{raw_text[:300]}...")

    def _prepare_posts_text(self, posts: List[Dict[str, Any]], max_chars: int = 22000) -> str:
        """Ghép các bài đăng thành chuỗi văn bản mạch lạc cho AI đọc, tối ưu dưới context window 32k."""
        formatted_posts = []
        total_len = 0
        
        for idx, post in enumerate(posts, 1):
            text = (post.get("text") or "").strip()
            if len(text) < 25 and not post.get("url"):
                continue  # Bỏ qua bài đăng quá ngắn không có thông tin
                
            post_block = (
                f"--- [BÀI ĐĂNG #{idx}] ---\n"
                f"Thời gian: {post.get('time', 'N/A')}\n"
                f"Link: {post.get('url', 'N/A')}\n"
                f"Tương tác: {post.get('likes', 0)} likes, {post.get('commentsCount', 0)} comments\n"
                f"Nội dung:\n{text}\n"
            )
            
            if total_len + len(post_block) > max_chars:
                print(f"⚠️ Dữ liệu bài đăng đạt ngưỡng an toàn context window ({total_len} ký tự, {idx-1} bài).")
                break
                
            formatted_posts.append(post_block)
            total_len += len(post_block)

        return "\n".join(formatted_posts)

    def _send_chat_request(self, model: str, system_prompt: str, user_prompt: str, temperature: float = 0.1) -> str:
        """Gửi request chat completions đến OpenAI-compatible proxy với verify=False và tự động xử lý lỗi 413, 429."""
        endpoint = f"{self.base_url}/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "User-Agent": "CompeteMate-Pipeline/2.0"
        }
        payload = {
            "model": model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "temperature": temperature,
            "stream": False
        }

        resp = requests.post(
            endpoint,
            json=payload,
            headers=headers,
            verify=False,
            timeout=90
        )

        # 1. Tự động khắc phục khi dính lỗi HTTP 413 Payload Too Large (vượt context window 32k)
        if resp.status_code == 413 or "413" in resp.text or "context window limit" in resp.text:
            print(f"⚠️ [Payload 413] Prompt quá dài đối với {model}. Tự động rút gọn 40% văn bản để vừa context window 32k...")
            trimmed_user_prompt = user_prompt[:int(len(user_prompt) * 0.6)] + "\n\n[...Đã lược bớt nội dung để vừa context window...]"
            payload["messages"] = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": trimmed_user_prompt}
            ]
            time.sleep(1)
            resp = requests.post(endpoint, json=payload, headers=headers, verify=False, timeout=90)

            if resp.status_code == 413 or "413" in resp.text or "context window limit" in resp.text:
                print(f"⚠️ [Payload 413] Tiếp tục rút gọn còn 35%...")
                trimmed_user_prompt = user_prompt[:int(len(user_prompt) * 0.35)] + "\n\n[...Đã lược bớt nội dung để vừa context window...]"
                payload["messages"] = [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": trimmed_user_prompt}
                ]
                time.sleep(1)
                resp = requests.post(endpoint, json=payload, headers=headers, verify=False, timeout=90)

        # 2. Tự động khắc phục khi dính lỗi 429 (Rate Limit tạm thời)
        if resp.status_code == 429 or "429" in resp.text or "Rate limit" in resp.text:
            print(f"⏳ [{model}] Dính rate limit (429). Tự động chờ 4 giây rồi thử lại...")
            time.sleep(4)
            resp = requests.post(endpoint, json=payload, headers=headers, verify=False, timeout=90)

        if resp.status_code == 200:
            try:
                res_json = resp.json()
            except Exception:
                clean_text = resp.text.strip()
                if "data: [DONE]" in clean_text:
                    clean_text = clean_text.replace("data: [DONE]", "").strip()
                try:
                    res_json = json.loads(clean_text)
                except Exception:
                    dec = json.JSONDecoder()
                    res_json, _ = dec.raw_decode(clean_text)

            choices = res_json.get("choices", [])
            if not choices:
                raise RuntimeError(f"API trả về rỗng choices: {res_json}")
            msg = choices[0].get("message", {})
            content = msg.get("content") or msg.get("reasoning_content") or msg.get("reasoning") or ""
            return content
        else:
            raise RuntimeError(f"HTTP {resp.status_code}: {resp.text}")

    def extract_competition_dna(
        self,
        posts: List[Dict[str, Any]],
        fallback_name: Optional[str] = None,
        fallback_organizer: Optional[str] = None,
        fallback_url: Optional[str] = None
    ) -> CompetitionDNA:
        """
        Dùng Multi-Model AI để phân tích chuỗi bài đăng trong 1 năm và trích xuất thành CompetitionDNA hoàn chỉnh.
        Có cơ chế tự động xoay vòng model dự phòng (fallback) nếu gặp lỗi 429 (quota), 503 (quá tải) hoặc lỗi mạng.
        """
        corpus = self._prepare_posts_text(posts)
        
        system_instruction = """
Bạn là Chuyên gia Cấp cao về Phân tích Dữ liệu Cuộc thi Học thuật và Đổi mới Sáng tạo dành cho Sinh viên thuộc nền tảng CompeteMate (đặc tả trong idea.md).

Bối cảnh: Các cuộc thi học thuật sinh viên (Business Case, Marketing, Hùng biện, Tài chính, Khởi nghiệp,...) thường đăng thông tin phân tán qua hàng chục bài viết trên Facebook trong suốt mùa thi (bài mở đề, bài thể lệ booklet, bài mở đơn đăng ký, gia hạn deadline, thông báo vòng thi, workshops, và bài vinh danh quán quân).

Nhiệm vụ của bạn:
1. Đọc toàn bộ các bài đăng được cung cấp từ Fanpage trong 1 năm qua.
2. TỔNG HỢP và ĐỐI CHIẾU thông tin giữa các bài đăng để tạo ra MỘT HỒ SƠ CHUẨN HOÁ DUY NHẤT (Competition Profile) cho MÙA THI MỚI NHẤT (hoặc mùa thi nổi bật nhất năm).
3. Xử lý logic thông minh:
   - Nếu có bài gia hạn deadline (Extending deadline), BẮT BUỘC lấy deadline mới nhất.
   - Trích xuất link đăng ký thực tế (Google Forms, Bitly, Landing Page) từ nội dung bài viết.
   - Trích xuất các mốc thời gian (Milestones) của từng vòng (Vòng 1, Vòng 2, Chung kết...).
   - Đánh giá bộ kỹ năng cần thiết (Required Skills) dựa trên bản chất cuộc thi (phân loại must_have vs nice_to_have).
   - Trích xuất hoặc tổng hợp kinh nghiệm thi đấu (Playbook Insights: thử thách, sai lầm cần tránh, yếu tố then chốt, lời khuyên ôn tập).

BẮT BUỘC TRẢ VỀ ĐỊNH DẠNG JSON HỢP LỆ THEO ĐÚNG SCHEMA SAU ĐÂY:
{
  "id": "slug-dinh-danh-khong-dau-va-nam-vi-du-calliope-2026-trendx",
  "name": "Tên chính thức đầy đủ của cuộc thi",
  "season": "Tên mùa thi hoặc chủ đề (ví dụ: TrendX 2026)",
  "organizer": "Tên đơn vị / trường / CLB tổ chức",
  "category": "Lĩnh vực (Business Case / Marketing / Startup / Finance / Research / Debate / Innovation / MT&Young Talent / Logistics / Data)",
  "short_description": "Mô tả ngắn gọn 2-3 câu về mục tiêu, quy mô và điểm đặc biệt của cuộc thi",
  "eligibility": "Đối tượng tham gia chi tiết (sinh viên năm mấy, trường nào, phạm vi địa lý...)",
  "deadline": "Hạn cuối đăng ký (định dạng YYYY-MM-DD hoặc thời gian cụ thể)",
  "duration": "Khoảng thời gian diễn ra cuộc thi (ví dụ: Tháng 02/2026 - Tháng 04/2026)",
  "rounds_count": 3,
  "rounds_description": "Tóm tắt cơ cấu các vòng thi",
  "format": "Online / Offline / Hybrid",
  "team_size": {
    "min": 1,
    "max": 4,
    "type": "Team hoặc Individual hoặc Individual or Team"
  },
  "experience_level": "Beginner / Intermediate / Advanced / Beginner to Intermediate",
  "grand_prize": "Giải thưởng quán quân (tiền mặt + hiện vật + cơ hội)",
  "prizes_detail": "Tổng giá trị và cơ cấu giải thưởng các vòng",
  "registration_link": "URL đăng ký chính thức",
  "source_url": "URL fanpage hoặc link bài viết gốc",
  "required_skills": [
    {
      "name": "Tên kỹ năng (ví dụ: Problem Solving, Hùng biện, Slide Design...)",
      "priority": "must_have",
      "category": "Analytical hoặc Soft Skills hoặc Domain Knowledge hoặc Presentation"
    }
  ],
  "milestones": [
    {
      "stage": 1,
      "name": "Tên vòng (ví dụ: Vòng 1: Mở đơn & Nộp bài luận)",
      "date": "Thời gian (YYYY-MM-DD hoặc khoảng ngày)",
      "description": "Yêu cầu bài thi của vòng này",
      "status": "active"
    }
  ],
  "playbook_insights": {
    "challenging_part": "Thử thách lớn nhất thí sinh phải đối mặt",
    "common_mistakes": "Sai lầm phổ biến mà các đội mới tham gia thường mắc phải",
    "key_success_factors": "Kỹ năng hoặc yếu tố tạo nên chiến thắng",
    "prep_advice": "Chiến lược ôn luyện và phân bổ thời gian hiệu quả"
  },
  "status": "open hoặc closing_soon hoặc closed"
}
"""

        user_prompt = f"""
Dưới đây là chuỗi bài viết thu thập từ Fanpage:
Thông tin bổ sung (nếu có):
- Tên gợi ý: {fallback_name or 'N/A'}
- Đơn vị tổ chức gợi ý: {fallback_organizer or 'N/A'}
- Link gốc: {fallback_url or 'N/A'}

NỘI DUNG CÁC BÀI ĐĂNG TRONG 1 NĂM QUA:
{corpus}

Hãy phân tích và trả về DUY NHẤT một chuỗi JSON thuần túy (không kèm markdown ngoài JSON).
"""

        # Danh sách models cần thử theo thứ tự ưu tiên
        raw_candidates = [self.preferred_model] + [m for m in self.fallback_models if m != self.preferred_model]
        
        is_pref_q, pref_reason = is_model_quarantined(self.preferred_model)
        if is_pref_q:
            print(f"⏩ Model chính '{self.preferred_model}' đang bị cách ly ({pref_reason}). Tự động nhảy sang model dự phòng tiếp theo...")

        models_to_try = filter_active_models(raw_candidates)
        if not models_to_try:
            models_to_try = raw_candidates
        last_error = None

        for model in models_to_try:
            print(f"[AI Engine] Đang gọi model: {model}...")
            for attempt in range(1, 3):
                try:
                    raw_text = self._send_chat_request(model, system_instruction, user_prompt, temperature=0.15)
                    parsed = self._parse_json_robust(raw_text)

                    # Bổ sung fallback nếu AI bỏ sót
                    if not parsed.get("source_url") and fallback_url:
                        parsed["source_url"] = fallback_url
                    if not parsed.get("organizer") and fallback_organizer:
                        parsed["organizer"] = fallback_organizer

                    # Chuẩn hóa an toàn các trường cấu trúc
                    if isinstance(parsed.get("team_size"), dict):
                        ts = parsed["team_size"]
                        if ts.get("min") is None: ts["min"] = 1
                        if ts.get("max") is None: ts["max"] = 4
                        if not ts.get("type"): ts["type"] = "Team"
                    elif not parsed.get("team_size"):
                        parsed["team_size"] = {"min": 1, "max": 4, "type": "Team"}

                    if isinstance(parsed.get("milestones"), list):
                        for idx_m, m in enumerate(parsed["milestones"], 1):
                            if isinstance(m, dict) and m.get("stage") is None:
                                m["stage"] = idx_m

                    competition_dna = CompetitionDNA.model_validate(parsed)
                    print(f"✅ [AI Engine] Trích xuất thành công: {competition_dna.name} bằng model '{model}'!")
                    return competition_dna

                except Exception as ex:
                    last_error = str(ex)
                    print(f"⚠️ [{model}] Lần thử {attempt}/2 không thành công: {last_error[:120]}")
                    
                    is_fatal = any(err_key in last_error.lower() for err_key in [
                        "402", "monthly", "neuron", "daily free allocation", 
                        "401", "404", "410", "not support", "429", "503", "overload", "timeout", "timed out"
                    ])
                    if is_fatal:
                        quarantine_model(model, last_error)
                        print(f"🔄 Đã khóa cách ly model '{model}'. Tự động chuyển model kế tiếp...")
                        break
                        
                    if attempt == 2:
                        quarantine_model(model, last_error)
                        break
                    time.sleep(1)

        raise RuntimeError(f"Tất cả các model AI đều không phản hồi thành công. Lỗi cuối: {last_error}")

    def extract_custom_mapping(
        self,
        posts: List[Dict[str, Any]],
        target_columns: List[str],
        fallback_name: Optional[str] = None,
        fallback_organizer: Optional[str] = None,
        fallback_url: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Dùng Multi-Model AI để phân tích chuỗi bài đăng và ánh xạ giá trị vào danh sách cột trong file Excel,
        đồng thời trích xuất ngày đăng, link bài viết chi tiết trên Facebook và đoạn trích dẫn đối chiếu.
        """
        corpus = self._prepare_posts_text(posts)
        cols_formatted = "\n".join([f"- \"{c}\"" for c in target_columns])

        system_instruction = f"""
Bạn là Chuyên gia Xử lý Dữ liệu Cuộc thi Học thuật và Sinh viên.
Người dùng có các cột sau trong file Excel:
{cols_formatted}

Nhiệm vụ của bạn:
1. Đọc toàn bộ các bài viết từ Fanpage Facebook (mỗi bài viết đều có mốc Thời gian, Link bài viết gốc và Nội dung).
2. Trích xuất thông tin mùa thi mới nhất.
3. Với MỖI CỘT trong danh sách trên, bạn hãy đối chiếu với bài đăng gốc và trả về một object JSON:
   - "value": Giá trị chuẩn hóa, súc tích để điền vào ô Excel.
   - "source_date": Ngày đăng của bài viết cung cấp thông tin này (chuyển đổi từ trường Thời gian sang định dạng DD/MM/YYYY, ví dụ: 21/09/2026). Nếu không rõ, để rỗng "".
   - "source_url": Link chi tiết tới bài viết Facebook gốc cung cấp thông tin này (lấy chính xác từ dòng 'Link:' của bài đăng tương ứng).
   - "source_quote": Trích dẫn 1 câu ngắn nguyên văn từ nội dung bài đăng chứng minh cho thông tin đó.

BẮT BUỘC TRẢ VỀ JSON theo cấu trúc (các key phải khớp 100% với tên các cột trên):
{{
  "Tên cột": {{
    "value": "...",
    "source_date": "DD/MM/YYYY",
    "source_url": "https://www.facebook.com/...",
    "source_quote": "..."
  }}
}}
"""
        user_prompt = f"""
Dưới đây là chuỗi bài viết thu thập từ Fanpage:
Tên gợi ý: {fallback_name or 'N/A'}
Đơn vị gợi ý: {fallback_organizer or 'N/A'}
URL: {fallback_url or 'N/A'}

NỘI DUNG CÁC BÀI ĐĂNG:
{corpus}

Trả về DUY NHẤT một chuỗi JSON thuần túy (không kèm markdown ngoài JSON) có các key là tên các cột trong file Excel của người dùng.
"""

        raw_candidates = [self.preferred_model] + [m for m in self.fallback_models if m != self.preferred_model]
        
        is_pref_q, pref_reason = is_model_quarantined(self.preferred_model)
        if is_pref_q:
            print(f"⏩ Model chính '{self.preferred_model}' đang bị cách ly ({pref_reason}). Tự động nhảy sang model dự phòng tiếp theo...")

        models_to_try = filter_active_models(raw_candidates)
        if not models_to_try:
            models_to_try = raw_candidates
        last_error = None

        for model in models_to_try:
            print(f"[AI Mapping] Đang ánh xạ bằng model: {model}...")
            for attempt in range(1, 3):
                try:
                    raw_text = self._send_chat_request(model, system_instruction, user_prompt, temperature=0.1)
                    parsed = self._parse_json_robust(raw_text)

                    # Chuẩn hóa đầu ra đảm bảo mọi cột đều có đủ 4 trường
                    normalized = {}
                    for col in target_columns:
                        item = parsed.get(col)
                        if isinstance(item, dict):
                            val = str(item.get("value", "") or "").strip()
                            s_url = str(item.get("source_url", "") or "").strip() or (fallback_url or "")
                            s_quote = str(item.get("source_quote", "") or "").strip()
                            s_date = str(item.get("source_date", "") or "").strip()
                            if not s_quote and val:
                                s_quote = val
                            normalized[col] = {
                                "value": val,
                                "source_date": s_date,
                                "source_url": s_url,
                                "source_quote": s_quote
                            }
                        elif item is not None:
                            val = str(item).strip()
                            normalized[col] = {
                                "value": val,
                                "source_date": "",
                                "source_url": fallback_url or "",
                                "source_quote": val
                            }
                        else:
                            normalized[col] = {
                                "value": "",
                                "source_date": "",
                                "source_url": fallback_url or "",
                                "source_quote": ""
                            }
                    print(f"✅ [AI Mapping] Ánh xạ thành công {len(normalized)} cột bằng model '{model}'!")
                    return normalized

                except Exception as ex:
                    last_error = str(ex)
                    print(f"⚠️ [{model}] Lỗi ánh xạ: {last_error[:120]}")
                    
                    is_fatal = any(err_key in last_error.lower() for err_key in [
                        "402", "monthly", "neuron", "daily free allocation", 
                        "401", "404", "410", "not support", "429", "503", "overload", "timeout", "timed out"
                    ])
                    if is_fatal:
                        quarantine_model(model, last_error)
                        print(f"🔄 Đã khóa cách ly model '{model}'. Tự động chuyển model fallback kế tiếp...")
                        break
                        
                    if attempt == 2:
                        quarantine_model(model, last_error)
                        break
                    time.sleep(1)

        raise RuntimeError(f"Không thể ánh xạ cột qua AI Engine ({last_error}). Vui lòng kiểm tra lại kết nối hoặc chọn model khác.")

# Backward compatibility: Giữ alias cũ để các file khác không bị lỗi import
GeminiCompetitionExtractor = AICompetitionExtractor
