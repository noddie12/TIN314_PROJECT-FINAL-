import argparse
import sys
from pathlib import Path
from typing import Optional

# Thêm thư mục gốc vào sys.path để import dễ dàng
BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from pipeline.config import KNOWN_FANPAGES, EXCEL_FILE, RAW_POSTS_DIR
from pipeline.scraper_apify import ApifyFacebookScraper
from pipeline.scraper_web import GenericWebScraper
from pipeline.ai_extractor import AICompetitionExtractor, GeminiCompetitionExtractor
from pipeline.excel_sync import ExcelSyncManager
from pipeline.db_syncer import DatabaseSyncer

def main():
    try:
        sys.stdout.reconfigure(encoding='utf-8', line_buffering=True)
    except Exception:
        pass
    parser = argparse.ArgumentParser(
        description="CompeteMate Automated Data Pipeline: Cào Fanpage Facebook / Website -> Trích xuất AI -> Chuẩn hoá dữ liệu"
    )
    parser.add_argument(
        "--url", "-u",
        type=str,
        help="URL của Fanpage Facebook hoặc Website cuộc thi (hoặc tên viết tắt như: calliope, kawai, ban_linh_marketer, i_invest, hsbc_business_case)"
    )
    parser.add_argument(
        "--limit", "-l",
        type=int,
        default=35,
        help="Số lượng bài đăng tối đa cần cào (mặc định: 35)"
    )
    parser.add_argument(
        "--newer-than", "-t",
        type=str,
        default="1 year",
        help="Khoảng thời gian kể từ bài đăng sớm nhất (ví dụ: '1 year', '6 months', mặc định: '1 year')"
    )
    parser.add_argument(
        "--raw-file", "-r",
        type=str,
        help="Đường dẫn file JSON bài đăng thô đã cào trước đó (bỏ qua bước cào Apify)"
    )
    parser.add_argument(
        "--list-competitions",
        action="store_true",
        help="Liệt kê danh sách các cuộc thi có trong file Excel TAKENOTE"
    )
    parser.add_argument(
        "--no-excel",
        action="store_true",
        help="Không cập nhật vào file Excel"
    )
    parser.add_argument(
        "--no-db",
        action="store_true",
        help="Không lưu vào cơ sở dữ liệu JSON/SQLite"
    )

    args = parser.parse_args()

    # Chức năng liệt kê cuộc thi trong Excel
    if args.list_competitions:
        excel_mgr = ExcelSyncManager()
        comps = excel_mgr.get_competitions_from_sheet()
        print(f"\n📋 Danh sách {len(comps)} cuộc thi trong file Excel ({EXCEL_FILE.name}):")
        print("-" * 75)
        print(f"{'Hàng':<6} | {'Tên cuộc thi':<45} | {'Trạng thái dữ liệu'}")
        print("-" * 75)
        for c in comps:
            status = "🟢 Đã có dữ liệu" if c['has_data'] else "⚪ Chưa có dữ liệu"
            print(f"#{c['row']:<5} | {c['name'][:43]:<45} | {status}")
        return

    # Xác định URL
    target_url = None
    known_info = {}

    if args.url:
        key = args.url.lower().strip()
        if key in KNOWN_FANPAGES:
            known_info = KNOWN_FANPAGES[key]
            target_url = known_info["url"]
            print(f"📌 Nhận diện cuộc thi: {known_info['name']} -> {target_url}")
        else:
            target_url = args.url
    elif not args.raw_file:
        print("⚠️ Vui lòng cung cấp URL qua tham số --url (ví dụ: --url https://www.facebook.com/yec.calliope hoặc --url https://kbs.tec-ftu.com/) hoặc --raw-file")
        print("💡 Hoặc dùng tên viết tắt: calliope, kawai, ban_linh_marketer, i_invest, hsbc_business_case")
        return

    print("\n" + "=" * 65)
    print("🏆 COMPETEMATE AUTOMATED DATA INGESTION PIPELINE")
    print("=" * 65)

    # BƯỚC 1: Thu thập bài đăng (Scraping hoặc Load Cache)
    posts = []

    if args.raw_file:
        print(f"\n📂 [BƯỚC 1] Đọc bài đăng thô từ file: {args.raw_file}")
        scraper = ApifyFacebookScraper()
        posts = scraper.load_cached_posts(args.raw_file)
    else:
        is_fb = GenericWebScraper.is_facebook_url(target_url)
        if not is_fb:
            print(f"\n🌐 [BƯỚC 1] Cào dữ liệu từ Website / Landing Page: {target_url}")
            web_scraper = GenericWebScraper()
            posts = web_scraper.scrape_url(target_url, save_cache=True)
            print(f"✅ Đã trích xuất thành công nội dung website ({len(posts[0].get('text', ''))} ký tự)!")
        else:
            print(f"\n📱 [BƯỚC 1] Cào bài đăng từ Facebook qua Apify Cloud Scraper...")
            scraper = ApifyFacebookScraper()
            posts = scraper.scrape_posts(
                fanpage_url=target_url,
                time_mode="relative",
                results_limit=args.limit,
                newer_than=args.newer_than
            )

    if not posts:
        print("❌ Không tìm thấy bài đăng nào phù hợp trong khoảng thời gian đã chọn!")
        return

    print(f"📊 Đã sẵn sàng {len(posts)} bài đăng cho quá trình phân tích AI.")

    # BƯỚC 2: Trích xuất & Chuẩn hóa bằng Multi-Model AI Engine
    print(f"\n🤖 [BƯỚC 2] Sử dụng Multi-Model AI Engine để phân tích và chuẩn hoá...")
    extractor = AICompetitionExtractor()
    dna = extractor.extract_competition_dna(
        posts=posts,
        fallback_name=known_info.get("name"),
        fallback_organizer=known_info.get("organizer"),
        fallback_url=target_url
    )

    # Hiển thị tóm tắt kết quả trích xuất
    print("\n" + "-" * 50)
    print("✨ KẾT QUẢ TRÍCH XUẤT COMPETITION DNA:")
    print("-" * 50)
    print(f"📌 Tên cuộc thi      : {dna.name}")
    print(f"🎖️ Mùa thi / Chủ đề  : {dna.season}")
    print(f"🏛️ Đơn vị tổ chức    : {dna.organizer}")
    print(f"🏷️ Lĩnh vực          : {dna.category}")
    print(f"⏰ Hạn nộp đơn       : {dna.deadline}")
    print(f"👥 Quy mô đội        : {dna.team_size.type} ({dna.team_size.min} - {dna.team_size.max} người)")
    print(f"📍 Hình thức thi     : {dna.format}")
    print(f"🏆 Giải thưởng lớn   : {dna.grand_prize}")
    print(f"🔗 Link đăng ký      : {dna.registration_link}")
    print(f"🎯 Kỹ năng cần thiết : {', '.join([s.name for s in dna.required_skills])}")
    print(f"🚩 Số mốc thời gian  : {len(dna.milestones)} mốc")
    if dna.milestones:
        for m in dna.milestones:
            print(f"   • Vòng {m.stage} - {m.name}: {m.date}")
    print(f"💡 Playbook Thử thách: {dna.playbook_insights.challenging_part[:80]}...")
    print(f"💡 Lời khuyên chuẩn bị: {dna.playbook_insights.prep_advice[:80]}...")
    print("-" * 50)

    # BƯỚC 3: Đồng bộ vào file Excel TAKENOTE CÁC CUỘC THI PROJECT TIN314.xlsx
    if not args.no_excel:
        print(f"\n📊 [BƯỚC 3] Đồng bộ vào bảng tính Excel: {EXCEL_FILE.name}")
        excel_mgr = ExcelSyncManager()
        excel_mgr.update_competition(dna)

    # BƯỚC 4: Lưu vào cơ sở dữ liệu Website (JSON & SQLite)
    if not args.no_db:
        print(f"\n💾 [BƯỚC 4] Lưu vào cơ sở dữ liệu website (JSON & SQLite)...")
        db_syncer = DatabaseSyncer()
        db_syncer.sync_competition(dna)

    print("\n" + "=" * 65)
    print("🎉 QUY TRÌNH TỰ ĐỘNG HÓA HOÀN TẤT THÀNH CÔNG!")
    print(f"1. Dữ liệu thô lưu tại   : data/raw_posts/")
    print(f"2. File Excel dự án TIN314: {EXCEL_FILE}")
    print(f"3. Dữ liệu chuẩn cho web : data/competitions.json & data/competitions.db")
    print("=" * 65)

if __name__ == "__main__":
    main()
