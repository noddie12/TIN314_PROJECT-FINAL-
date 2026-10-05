import os
import sys
from pathlib import Path

# Add project root to sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from pipeline.config import AI_BASE_URL, AI_API_KEY, AI_MODEL
from pipeline.ai_extractor import AICompetitionExtractor

def main():
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

    print("=" * 60)
    print("🤖 KIỂM TRA MULTI-MODEL AI ENGINE")
    print("=" * 60)
    print(f"Endpoint: {AI_BASE_URL}")
    print(f"API Key : {AI_API_KEY[:8]}... (độ dài: {len(AI_API_KEY)})")
    print(f"Model   : {AI_MODEL}")

    extractor = AICompetitionExtractor()

    # Test trích xuất mẫu một bài đăng
    sample_posts = [
        {
            "time": "2026-03-01",
            "url": "https://www.facebook.com/BanLinhMarketer/posts/123456",
            "likes": 520,
            "commentsCount": 85,
            "text": """
            [CHÍNH THỨC PHÁT ĐỘNG BẢN LĨNH MARKETER 2026 - THE REDEFINITION]
            Cuộc thi Marketing uy tín nhất toàn quốc dành cho sinh viên chính thức trở lại!
            - Đơn vị tổ chức: CLB Marketing MAC - Trường Đại học Ngoại Thương
            - Đối tượng: Toàn bộ sinh viên trên toàn quốc, theo đội từ 3 - 4 thành viên.
            - Hạn nộp đơn đăng ký Vòng 1: 25/03/2026.
            - Tổng giá trị giải thưởng: 300.000.000 VNĐ, Quán quân nhận 100.000.000 VNĐ tiền mặt và học bổng.
            - Link đăng ký: https://banlinhmarketer.vn/register
            - Các vòng thi: Vòng 1: Đề tài sơ loại (25/03); Vòng 2: Business Case & Hackathon (15/04); Vòng Chung kết: Pitching tại Hà Nội (05/05/2026).
            - Kỹ năng cần có: Phân tích thị trường (Market Research), Sáng tạo chiến dịch (Brand Strategy), Thuyết trình (Pitching).
            """
        }
    ]

    print("\n⏳ Đang gửi yêu cầu phân tích dữ liệu bài viết...")
    try:
        dna = extractor.extract_competition_dna(
            posts=sample_posts,
            fallback_name="Bản Lĩnh Marketer",
            fallback_organizer="CLB MAC - ĐH Ngoại Thương",
            fallback_url="https://www.facebook.com/BanLinhMarketer"
        )
        print("\n✅ TRÍCH XUẤT THÀNH CÔNG!")
        print(f"📌 Tên cuộc thi : {dna.name}")
        print(f"🎖️ Mùa thi     : {dna.season}")
        print(f"🏛️ Tổ chức     : {dna.organizer}")
        print(f"🏷️ Lĩnh vực     : {dna.category}")
        print(f"⏰ Hạn chót     : {dna.deadline}")
        print(f"👥 Đội thi      : {dna.team_size.type} ({dna.team_size.min}-{dna.team_size.max} người)")
        print(f"🏆 Giải thưởng  : {dna.grand_prize}")
        print(f"🔗 Link đăng ký : {dna.registration_link}")
        print(f"🎯 Kỹ năng      : {', '.join([s.name for s in dna.required_skills])}")
        print(f"🚩 Mốc thời gian: {len(dna.milestones)} mốc")
        for m in dna.milestones:
            print(f"   • {m.name}: {m.date}")
        print(f"💡 Thử thách    : {dna.playbook_insights.challenging_part}")
        print("=" * 60)
        return True
    except Exception as e:
        print(f"\n❌ LỖI TRÍCH XUẤT: {e}")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
