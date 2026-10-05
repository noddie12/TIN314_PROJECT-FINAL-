import json
import time
import re
from datetime import datetime, timedelta
from pathlib import Path
from typing import List, Dict, Any, Optional
import requests

from pipeline.config import APIFY_TOKEN, RAW_POSTS_DIR
from pipeline.models import RawPost

class ApifyFacebookScraper:
    def __init__(self, token: Optional[str] = None):
        self.token = token or APIFY_TOKEN
        if not self.token:
            raise ValueError("APIFY_TOKEN chưa được cấu hình. Vui lòng kiểm tra file .env.")
        self.base_url = "https://api.apify.com/v2"
        self.actor_id = "apify~facebook-posts-scraper"
        self.headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }

    def _get_page_slug(self, url: str) -> str:
        clean = url.rstrip("/").split("/")[-1].split("?")[0]
        return re.sub(r'[^a-zA-Z0-9_\-]', '_', clean)

    @staticmethod
    def _parse_iso_time(time_str: str) -> Optional[datetime]:
        if not time_str:
            return None
        try:
            cleaned = time_str.replace("Z", "+00:00")
            dt = datetime.fromisoformat(cleaned)
            if dt.tzinfo is not None:
                dt = dt.astimezone().replace(tzinfo=None)
            return dt
        except Exception:
            return None

    @staticmethod
    def _parse_duration_to_days(duration_str: str) -> int:
        if not duration_str:
            return 365
        s = duration_str.strip().lower()
        match = re.search(r'(\d+)\s*(year|yr|nam|năm|month|thang|tháng|day|ngay|ngày|week|tuan|tuần)?', s)
        if match:
            num = int(match.group(1))
            unit = (match.group(2) or "").lower()
            if any(u in unit for u in ("year", "yr", "nam", "năm")):
                return num * 365
            elif any(u in unit for u in ("month", "thang", "tháng")):
                return num * 30
            elif any(u in unit for u in ("week", "tuan", "tuần")):
                return num * 7
            elif any(u in unit for u in ("day", "ngay", "ngày")):
                return num
            else:
                return num * 30
        return 365

    def filter_posts_by_earliest(
        self,
        posts: List[Dict[str, Any]],
        duration_str: Optional[str] = "1 year"
    ) -> List[Dict[str, Any]]:
        """
        Lọc các bài đăng trong khoảng 'X' tháng kể từ mốc thời gian của bài đăng sớm nhất (cũ nhất) tìm thấy.
        Mặc định: 1 năm (365 ngày).
        """
        if not posts or not duration_str or duration_str.lower() == "all":
            return posts

        post_times = []
        for p in posts:
            dt = self._parse_iso_time(p.get("time"))
            if dt:
                post_times.append(dt)

        if not post_times:
            return posts

        earliest_time = min(post_times)
        days = self._parse_duration_to_days(duration_str)
        cutoff_end = earliest_time + timedelta(days=days)

        print(f"⏱️ [Filter] Bài đăng sớm nhất tìm thấy: {earliest_time.strftime('%Y-%m-%d %H:%M')}")
        print(f"⏱️ [Filter] Lấy trong {days} ngày ({duration_str}) -> Đến mốc: {cutoff_end.strftime('%Y-%m-%d %H:%M')}")

        filtered = []
        for p in posts:
            dt = self._parse_iso_time(p.get("time"))
            if dt is None or (earliest_time <= dt <= cutoff_end):
                filtered.append(p)

        print(f"📊 [Filter] Giữ lại {len(filtered)}/{len(posts)} bài đăng trong khoảng thời gian này.")
        return filtered

    def scrape_posts(
        self,
        fanpage_url: str,
        time_mode: str = "relative",
        newer_than: Optional[str] = "1 year",
        older_than: Optional[str] = None,
        results_limit: int = 100,
        save_cache: bool = True
    ) -> List[Dict[str, Any]]:
        """
        Cào các bài đăng từ Fanpage Facebook theo khoảng thời gian tương đối hoặc từ ngày A đến ngày B.
        - time_mode == "relative": Lấy các bài đăng trong khoảng X tháng kể từ bài đăng sớm nhất.
        - time_mode == "range": Lấy từ ngày A (newer_than) đến ngày B (older_than).
        """
        # Làm sạch URL Facebook: Loại bỏ các query parameter như ?locale=vi_VN, ?mibextid=...
        clean_url = fanpage_url.split("?")[0].rstrip("/")
        page_slug = self._get_page_slug(clean_url)

        print(f"[Apify] Bắt đầu cào Fanpage: {clean_url} (URL gốc: {fanpage_url})")
        if time_mode == "range" and older_than:
            print(f"   - Khoảng thời gian: Từ {newer_than} đến {older_than}")
        else:
            print(f"   - Thời gian: Trong vòng {newer_than} kể từ bài đăng sớm nhất (Mặc định 1 năm)")

        payload = {
            "startUrls": [{"url": clean_url}],
            "resultsLimit": results_limit
        }
        if time_mode == "range":
            if newer_than:
                payload["onlyPostsNewerThan"] = newer_than
            if older_than:
                payload["onlyPostsOlderThan"] = older_than

        # 1. Khởi chạy Actor
        run_endpoint = f"{self.base_url}/acts/{self.actor_id}/runs"
        resp = requests.post(run_endpoint, headers=self.headers, json=payload, verify=False, timeout=90)
        
        if resp.status_code not in (200, 201):
            raise RuntimeError(f"Không thể khởi chạy Apify Actor: {resp.status_code} - {resp.text}")

        run_data = resp.json().get("data", {})
        run_id = run_data.get("id")
        dataset_id = run_data.get("defaultDatasetId")
        print(f"   - Run ID: {run_id}")
        print(f"   - Dataset ID: {dataset_id}")
        print("⏳ Đang đợi Apify cào dữ liệu Facebook (thường mất 1 - 3 phút)...")

        # 2. Polling kiểm tra trạng thái có cơ chế chống đứt gãy mạng (Retry on Timeout)
        status_url = f"{self.base_url}/actor-runs/{run_id}"
        start_time = time.time()
        timeout_seconds = 420  # 7 phút tối đa
        consecutive_network_errors = 0

        while time.time() - start_time < timeout_seconds:
            try:
                poll_resp = requests.get(status_url, headers=self.headers, verify=False, timeout=60)
                consecutive_network_errors = 0  # reset lỗi khi kết nối thành công
                if poll_resp.status_code == 200:
                    poll_data = poll_resp.json().get("data", {})
                    status = poll_data.get("status")
                    if status == "SUCCEEDED":
                        print("✅ [Apify] Cào dữ liệu thành công!")
                        break
                    elif status in ("FAILED", "ABORTED", "TIMED-OUT"):
                        raise RuntimeError(f"Apify run kết thúc với trạng thái: {status}")
                    else:
                        print(f"   ... Đang xử lý (Trạng thái: {status})...")
            except (requests.exceptions.Timeout, requests.exceptions.RequestException) as net_err:
                consecutive_network_errors += 1
                print(f"⚠️ [Apify Network] Mạng chập chờn khi polling ({net_err.__class__.__name__}). Đang tự động thử lại ({consecutive_network_errors}/6)...")
                if consecutive_network_errors >= 6:
                    raise RuntimeError(f"Mất kết nối mạng liên tục với Apify sau {consecutive_network_errors} lần thử: {net_err}")
                time.sleep(5)
                continue
            time.sleep(10)
        else:
            raise TimeoutError("Quá thời gian chờ cào dữ liệu từ Apify.")

        # 3. Lấy dữ liệu từ Dataset với cơ chế Retry tải dữ liệu (tối đa 3 lần, timeout 120s)
        dataset_url = f"{self.base_url}/datasets/{dataset_id}/items?clean=true&format=json"
        raw_items = None
        for dl_attempt in range(1, 4):
            try:
                data_resp = requests.get(dataset_url, headers=self.headers, verify=False, timeout=120)
                if data_resp.status_code == 200:
                    raw_items = data_resp.json()
                    break
                else:
                    print(f"⚠️ [Apify Dataset] Tải dataset lần {dl_attempt} thất bại ({data_resp.status_code}), đang thử lại...")
                    time.sleep(3)
            except Exception as dl_err:
                print(f"⚠️ [Apify Dataset] Lỗi tải dataset lần {dl_attempt} ({dl_err}), đang thử lại sau 3s...")
                time.sleep(3)

        if raw_items is None:
            raise RuntimeError(f"Không thể tải dữ liệu từ dataset {dataset_id} sau 3 lần thử.")

        print(f"📦 [Apify] Đã thu thập được {len(raw_items)} bài đăng từ Facebook.")

        # 4. Chuẩn hóa format bài đăng cơ bản
        posts = []
        error_reasons = []
        for item in raw_items:
            # Thu thập nếu Apify trả về thông báo lỗi
            if item.get("error") or item.get("errorDescription"):
                err_code = str(item.get("error", ""))
                err_desc = str(item.get("errorDescription", ""))
                error_reasons.append(f"{err_code}: {err_desc}")
                print(f"⚠️ [Apify] Bỏ qua item lỗi từ Apify: {err_code} - {err_desc}")
                continue

            text = item.get("text") or item.get("postText") or item.get("message") or ""
            post_url = item.get("url") or item.get("postUrl") or item.get("facebookUrl") or ""
            time_str = item.get("time") or item.get("timestamp") or item.get("date") or ""
            likes = item.get("likes") or item.get("likesCount") or 0
            comments = item.get("comments") or item.get("commentsCount") or 0
            shares = item.get("shares") or item.get("sharesCount") or 0
            
            # Lấy link hình ảnh đính kèm nếu có
            media = []
            if "media" in item and isinstance(item["media"], list):
                for m in item["media"]:
                    if isinstance(m, dict) and "thumbnail" in m:
                        media.append(m["thumbnail"])
                    elif isinstance(m, str):
                        media.append(m)

            if not text.strip() and not media:
                continue

            posts.append({
                "url": post_url,
                "text": text,
                "time": time_str,
                "likes": likes,
                "commentsCount": comments,
                "sharesCount": shares,
                "media": media
            })

        if not posts and error_reasons:
            joined_err = " | ".join(error_reasons)
            if "not_available" in joined_err or "only shared it with a small group" in joined_err:
                raise RuntimeError("Facebook chặn khách vãng lai đối với Fanpage này (Bắt buộc phải đăng nhập Facebook mới xem được, hoặc Page giới hạn độ tuổi/vùng). Bot cào không có cookie đăng nhập nên không thể xem.")
            elif "Empty or private data" in joined_err:
                raise RuntimeError("Facebook hạn chế hiển thị công khai Fanpage này (Tường rào đăng nhập Facebook).")
            else:
                raise RuntimeError(f"Lỗi từ Facebook/Apify: {joined_err}")

        # 5. Lọc bài viết theo mốc thời gian của bài đăng sớm nhất nếu ở chế độ relative
        if time_mode == "relative":
            posts = self.filter_posts_by_earliest(posts, duration_str=newer_than)

        # 6. Lưu cache thô chỉ khi có bài viết thực sự
        if save_cache and posts:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            cache_file = RAW_POSTS_DIR / f"{page_slug}_{timestamp}.json"
            with open(cache_file, "w", encoding="utf-8") as f:
                json.dump(posts, f, ensure_ascii=False, indent=2)
            print(f"💾 Đã lưu dữ liệu thô tại: {cache_file}")

        return posts

    def load_cached_posts(self, file_path: str) -> List[Dict[str, Any]]:
        """Đọc lại dữ liệu bài viết thô từ file JSON đã cào trước đó."""
        path = Path(file_path)
        if not path.exists():
            raise FileNotFoundError(f"Không tìm thấy file: {file_path}")
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
