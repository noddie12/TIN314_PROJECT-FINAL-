import re
import json
import time
import urllib.parse
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Any, Optional

import requests
import urllib3
from bs4 import BeautifulSoup

from pipeline.config import RAW_POSTS_DIR

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

class GenericWebScraper:
    """
    Bộ thu thập dữ liệu thông minh từ Website, Landing Page, Framer, hoặc Cổng thông tin cuộc thi
    (không thuộc nền tảng Facebook).
    Tự động trích xuất cấu trúc văn bản, tiêu đề, thể lệ, bảng biểu, mốc thời gian
    và định dạng chuẩn tương thích 100% với GeminiCompetitionExtractor.
    """

    HEADERS = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/128.0.0.0 Safari/537.36"
        ),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "vi,en-US;q=0.9,en;q=0.8",
        "Cache-Control": "no-cache",
    }

    @staticmethod
    def is_facebook_url(url: str) -> bool:
        """Kiểm tra URL có phải là Facebook Fanpage / Post hay không."""
        if not url:
            return False
        u = url.lower()
        return "facebook.com" in u or "fb.com" in u or "fb.me" in u or "fb.watch" in u

    @staticmethod
    def get_domain_slug(url: str) -> str:
        """Tạo slug an toàn từ URL phục vụ đặt tên file cache."""
        try:
            parsed = urllib.parse.urlparse(url)
            netloc = parsed.netloc.replace("www.", "")
            path_part = parsed.path.strip("/").replace("/", "_")
            raw_slug = f"{netloc}_{path_part}" if path_part else netloc
            clean = re.sub(r'[^a-zA-Z0-9_\-]', '_', raw_slug)
            return clean[:50].strip('_')
        except Exception:
            return "web_page"

    def scrape_url(
        self,
        url: str,
        timeout: int = 15,
        save_cache: bool = True
    ) -> List[Dict[str, Any]]:
        """
        Tải và bóc tách nội dung HTML của website.
        Trả về danh sách structured posts tương thích với bộ phân tích AI của CompeteMate.
        """
        clean_url = url.strip()
        print(f"🌐 [Web Scraper] Đang kết nối tới: {clean_url}")

        session = requests.Session()
        session.headers.update(self.HEADERS)

        resp = session.get(clean_url, timeout=timeout, verify=False, allow_redirects=True)
        if resp.status_code != 200:
            raise RuntimeError(f"Không thể tải trang web ({resp.status_code}): {clean_url}")

        # Tự động nhận diện bảng mã (hỗ trợ UTF-8 tiếng Việt hoàn hảo)
        resp.encoding = resp.apparent_encoding or "utf-8"
        html_content = resp.text

        soup = BeautifulSoup(html_content, "html.parser")

        # 1. Trích xuất tiêu đề chính
        title = ""
        if soup.title and soup.title.string:
            title = soup.title.string.strip()
        
        # OpenGraph meta tags
        og_title = ""
        og_desc = ""
        og_image = ""
        for meta in soup.find_all("meta"):
            prop = meta.get("property", "").lower()
            name = meta.get("name", "").lower()
            content = meta.get("content", "").strip()
            if prop == "og:title" or name == "twitter:title":
                og_title = og_title or content
            elif prop == "og:description" or name == "description" or name == "twitter:description":
                og_desc = og_desc or content
            elif prop == "og:image" or name == "twitter:image":
                og_image = og_image or content

        display_title = title or og_title or clean_url

        # 2. Dọn dẹp các thẻ rác không mang thông tin thể lệ
        for tag in soup(["script", "style", "noscript", "svg", "iframe", "nav", "footer"]):
            tag.decompose()

        # 3. Trích xuất các section / khối nội dung có cấu trúc
        structured_sections = []

        # Header metadata block
        meta_lines = []
        if display_title:
            meta_lines.append(f"# {display_title}")
        if og_desc:
            meta_lines.append(f"> **Mô tả / Giới thiệu:** {og_desc}")
        if meta_lines:
            structured_sections.append("\n".join(meta_lines))

        # Tìm các khối tiêu đề và đoạn văn bản tương ứng
        content_root = soup.find("main") or soup.find("article") or soup.find("body") or soup

        current_heading = "Thông tin chung"
        current_paras = []

        # Bóc tách tuần tự các phần tử chứa văn bản
        for elem in content_root.find_all(["h1", "h2", "h3", "h4", "p", "ul", "ol", "table", "blockquote", "div"]):
            tag_name = elem.name.lower()

            if tag_name in ("h1", "h2", "h3", "h4"):
                h_text = elem.get_text(separator=" ", strip=True)
                if h_text and len(h_text) > 3:
                    if current_paras:
                        structured_sections.append(f"### {current_heading}\n" + "\n".join(current_paras))
                        current_paras = []
                    current_heading = h_text
            elif tag_name in ("p", "blockquote"):
                p_text = elem.get_text(separator=" ", strip=True)
                if p_text and len(p_text) > 10:
                    current_paras.append(p_text)
            elif tag_name in ("ul", "ol"):
                items = [li.get_text(separator=" ", strip=True) for li in elem.find_all("li", recursive=False)]
                items = [f"- {it}" for it in items if it]
                if items:
                    current_paras.append("\n".join(items))
            elif tag_name == "table":
                rows = []
                for tr in elem.find_all("tr"):
                    cols = [td.get_text(separator=" ", strip=True) for td in tr.find_all(["td", "th"])]
                    if any(cols):
                        rows.append(" | ".join(cols))
                if rows:
                    current_paras.append("\n[BẢNG THỂ LỆ / LỊCH TRÌNH]\n" + "\n".join(rows))
            elif tag_name == "div":
                # Đối với thẻ div: chỉ lấy nếu div có text trực tiếp hoặc là leaf container (không chứa các thẻ block con)
                if not elem.find(["p", "div", "h1", "h2", "h3", "h4", "table", "ul", "ol"]):
                    d_text = elem.get_text(separator=" ", strip=True)
                    if d_text and len(d_text) > 20 and d_text not in current_paras:
                        current_paras.append(d_text)

        if current_paras:
            structured_sections.append(f"### {current_heading}\n" + "\n".join(current_paras))

        # Ghép toàn bộ nội dung đã làm sạch
        full_text = "\n\n".join(structured_sections).strip()

        # So sánh với raw text để đảm bảo không bỏ sót thông tin
        all_stripped = " ".join(content_root.stripped_strings)
        if len(full_text) < len(all_stripped) * 0.4:
            # Nếu trích xuất section bị sót quá nhiều văn bản, bổ sung phần văn bản tổng quan
            full_text = (full_text + "\n\n### TỔNG QUAN NỘI DUNG CHI TIẾT TRANG WEB:\n" + all_stripped).strip()

        # Lấy danh sách ảnh đại diện
        media_list = []
        if og_image:
            media_list.append(og_image)
        for img in content_root.find_all("img"):
            src = img.get("src", "").strip()
            if src and (src.startswith("http://") or src.startswith("https://")):
                if src not in media_list:
                    media_list.append(src)
            if len(media_list) >= 5:
                break

        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        # Định dạng chuẩn Post Item để đưa vào Gemini AI
        post_item = {
            "url": clean_url,
            "title": display_title,
            "text": full_text,
            "time": now_str,
            "likes": 0,
            "commentsCount": 0,
            "sharesCount": 0,
            "media": media_list,
            "source_type": "website"
        }

        posts = [post_item]

        # 4. Lưu Cache JSON cục bộ để kiểm tra & tái sử dụng
        if save_cache:
            RAW_POSTS_DIR.mkdir(parents=True, exist_ok=True)
            slug = self.get_domain_slug(clean_url)
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            cache_file = RAW_POSTS_DIR / f"web_{slug}_{timestamp}.json"
            try:
                with open(cache_file, "w", encoding="utf-8") as f:
                    json.dump(posts, f, ensure_ascii=False, indent=2)
                print(f"📁 [Web Scraper] Đã lưu cache trang web: {cache_file.name} ({len(full_text)} ký tự)")
            except Exception as e:
                print(f"⚠️ [Web Scraper] Không thể lưu cache file: {e}")

        return posts
