# 🏆 CompeteMate Data Pipeline: Facebook Scraping & AI Structuring

Hệ thống tự động hoá thu thập dữ liệu cuộc thi từ Facebook Fanpage (1 năm gần nhất), xử lý và tổng hợp ngữ cảnh bằng AI (Gemini Flash), xuất ra cấu trúc dữ liệu chuẩn hóa phục vụ website **CompeteMate** và đồng bộ trực tiếp vào file Excel quản lý cuộc thi.

---

## 🚀 Tính năng Nổi bật

1. **Thu thập dữ liệu Facebook tự động qua Cloud (Apify):**
   - Vượt qua các lớp chặn bot, login modal và checkpoint của Facebook.
   - Lọc bài đăng chính xác trong 1 năm gần nhất (`onlyPostsNewerThan: 1 year`).
   - Tự động lưu cache thô dạng JSON tại `data/raw_posts/` để tái sử dụng mà không tốn credit cào lại.

2. **Xử lý đa bài viết bằng Multi-Model AI Engine (102 Models, OpenAI-Compatible):**
   - Đọc và phân tích hàng chục bài viết trong suốt mùa thi (mở đề, thể lệ booklet, gia hạn deadline, workshop, vinh danh chung kết).
   - Tự động đối chiếu và giải quyết mâu thuẫn (luôn ưu tiên deadline mới nhất sau khi gia hạn).
   - Trích xuất toàn diện 13 trường dữ liệu chuẩn **Competition DNA**, **Milestone Timeline** và **Winner's Playbook** theo đặc tả [idea.md](file:///d:/HA/docs/notes/idea.md).
   - Cơ chế tự động xoay vòng Failover & Auto-routing qua 102 mô hình (Claude Sonnet/Haiku, Meta LLaMA 3.3 70B Fast, DeepSeek R1/V3, Qwen 2.5/3, GPT-5.5) tránh hoàn toàn hiện tượng nghẽn quota hoặc quá tải (HTTP 503/429).

3. **Đồng bộ đa đích (Multi-destination Sync):**
   - **File Excel dự án:** Cập nhật thông minh vào đúng hàng cuộc thi hoặc đúng nhóm danh mục trong [TAKENOTE CÁC CUỘC THI PROJECT TIN314.xlsx](file:///d:/HA/TAKENOTE%20C%C3%81C%20CU%E1%BB%98C%20THI%20PROJECT%20TIN314.xlsx).
   - **File JSON cho Web:** Lưu vào [data/competitions.json](file:///d:/HA/data/competitions.json) và [data/competitions.js](file:///d:/HA/data/competitions.js).
   - **Cơ sở dữ liệu SQLite:** Lưu và lập chỉ mục tại `data/competitions.db`.

---

## 🛠️ Hướng dẫn Sử dụng (CLI)

### 1. Xem danh sách cuộc thi trong file Excel
```bash
python -X utf8 pipeline/run_pipeline.py --list-competitions
```
*Hoặc:*
```bash
run_pipeline.bat --list-competitions
```

### 2. Cào và chuẩn hoá một Fanpage bất kỳ
```bash
python -X utf8 pipeline/run_pipeline.py --url https://www.facebook.com/yec.calliope
```
*Hoặc dùng phím tắt có sẵn:*
```bash
run_pipeline.bat --url calliope
run_pipeline.bat --url kawai
run_pipeline.bat --url ban_linh_marketer
run_pipeline.bat --url i_invest
run_pipeline.bat --url hsbc_business_case
```

### 3. Tái phân tích từ file bài đăng đã cào (Không tốn lượt cào Apify)
```bash
python -X utf8 pipeline/run_pipeline.py --raw-file data/raw_posts/yec_calliope_20260922_102732.json
```

### 4. Tùy chỉnh tham số nâng cao
- `--limit 50`: Cào tối đa 50 bài đăng.
- `--newer-than "6 months"` hoặc `"2025-01-01"`: Thay đổi khoảng thời gian cào.
- `--no-excel`: Chỉ lưu vào CSDL/JSON web, không ghi đè vào Excel.
- `--no-db`: Chỉ cập nhật Excel, không ghi vào database.

---

## 📁 Cấu trúc Thư mục

```text
d:/HA/
├── pipeline/
│   ├── config.py           # Cấu hình API keys, SSL patch, danh bạ fanpage
│   ├── models.py           # Pydantic schema cho Competition DNA & ánh xạ Excel
│   ├── scraper_apify.py    # Module cào Facebook qua Apify API
│   ├── ai_extractor.py     # Module AI Gemini trích xuất & tổng hợp thông minh
│   ├── excel_sync.py       # Module đọc & ghi file Excel TAKENOTE
│   ├── db_syncer.py        # Module xuất JSON & SQLite
│   └── run_pipeline.py     # CLI runner chính
├── data/
│   ├── raw_posts/          # Cache bài viết thô thu thập từ Facebook
│   ├── competitions.json   # CSDL JSON chuẩn hóa
│   ├── competitions.js     # Bundle JS nạp trực tiếp cho HTML tĩnh (vượt lỗi CORS)
│   └── competitions.db     # CSDL SQLite cục bộ
├── TAKENOTE CÁC CUỘC THI PROJECT TIN314.xlsx  # Bảng tính Excel quản lý cuộc thi
├── competehub.html         # Giao diện khám phá cuộc thi (tự nạp dữ liệu cào)
├── competition_dna.html    # Giao diện chi tiết Competition DNA
├── run_pipeline.bat        # Phím tắt thực thi 1 chạm trên Windows
└── .env                    # Lưu trữ bảo mật API Token
```
