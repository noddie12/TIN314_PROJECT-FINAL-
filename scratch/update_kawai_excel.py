import openpyxl
import sys
import json
from pathlib import Path

sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, r"d:\HA")

from pipeline.excel_sync import ExcelSyncManager
from pipeline.models import CompetitionDNA

excel_path = Path(r"d:\HA\TAKENOTE CÁC CUỘC THI PROJECT TIN314.xlsx")

with open(r"d:\HA\data\competitions.json", "r", encoding="utf-8") as f:
    comps = json.load(f)

kawai_data = next((c for c in comps if "kawai" in (c.get("name") or "").lower()), None)
if not kawai_data:
    print("Kawai not found!")
    sys.exit(1)

dna = CompetitionDNA(**kawai_data)

custom_data = {
    "Tên cuộc thi": {
        "value": "Khởi nghiệp cùng Kawai 2026",
        "source_date": "08/07/2026",
        "source_url": "https://kbs.tec-ftu.com/",
        "source_quote": "CHÍNH THỨC MỞ ĐƠN ĐĂNG KÝ ĐÊM CHUNG KẾT CUỘC THI KHỞI NGHIỆP CÙNG KAWAI 2026"
    },
    "Lĩnh vực": {
        "value": "Khởi nghiệp / Đổi mới sáng tạo",
        "source_date": "08/07/2026",
        "source_url": "https://kbs.tec-ftu.com/",
        "source_quote": "Cuộc thi ý tưởng khởi nghiệp sáng tạo dành cho startup Việt Nam"
    },
    "Đơn vị tổ chức": {
        "value": "CLB Nhà Doanh nghiệp Tương lai (TEC) - Trường Đại học Ngoại thương",
        "source_date": "08/07/2026",
        "source_url": "https://kbs.tec-ftu.com/",
        "source_quote": "Do CLB Nhà Doanh nghiệp Tương lai (TEC FTU) trực thuộc Trường Đại học Ngoại thương tổ chức"
    },
    "Mô tả ngắn gọn": {
        "value": 'Cuộc thi ý tưởng khởi nghiệp sáng tạo dành cho startup Việt Nam 18–25 tuổi trên toàn thế giới, do CLB Nhà Doanh nghiệp Tương lai (TEC FTU) tổ chức. Mùa thi thứ 21 với đêm chung kết chủ đề "Tinh Quang" – nơi top 5 đội xuất sắc nhất pitching trước ban giám khảo, quỹ đầu tư và doanh nghiệp.',
        "source_date": "08/07/2026",
        "source_url": "https://kbs.tec-ftu.com/",
        "source_quote": 'Mùa thi thứ 21 với đêm chung kết chủ đề "Tinh Quang" – nơi top 5 đội xuất sắc nhất pitching trước ban giám khảo, quỹ đầu tư và doanh nghiệp.'
    },
    "Đối tượng tham gia": {
        "value": "Startup Việt Nam trong độ tuổi 18–25 trên toàn thế giới",
        "source_date": "08/07/2026",
        "source_url": "https://kbs.tec-ftu.com/",
        "source_quote": "Dành cho các bạn trẻ và nhóm khởi nghiệp Việt Nam trong độ tuổi 18-25"
    },
    "Hình thức tham gia": {
        "value": "Thi theo đội; nộp ý tưởng khởi nghiệp, trải qua các vòng thử thách thực chiến và pitching trực tiếp tại đêm chung kết",
        "source_date": "08/07/2026",
        "source_url": "https://kbs.tec-ftu.com/",
        "source_quote": "Thi theo đội nhóm, trải qua các vòng thử thách thực chiến và pitching trực tiếp"
    },
    "Cơ cấu vòng thi": {
        "value": "Vòng 1; Vòng 2; Vòng 3 (Tinh Quang – Đêm Chung kết): Top 5 đội xuất sắc pitching trước Ban giám khảo",
        "source_date": "08/07/2026",
        "source_url": "https://kbs.tec-ftu.com/",
        "source_quote": "Vòng 3 (Tinh Quang – Đêm Chung kết): Top 5 đội xuất sắc nhất pitching trực tiếp trước Hội đồng Ban giám khảo"
    },
    "Cơ cấu giải thưởng": {
        "value": "Chưa công bố chi tiết; ngôi vị Quán quân mùa thi thứ 21 được trao tại Đêm Chung kết",
        "source_date": "08/07/2026",
        "source_url": "https://kbs.tec-ftu.com/",
        "source_quote": "Ngôi vị Quán quân danh giá mùa thứ 21 cùng các giải thưởng tiền mặt và cơ hội gọi vốn đầu tư"
    },
    "Các mốc thời gian": {
        "value": "Đêm Chung kết: 08/07/2026 tại Cung Văn hóa Lao động Hữu nghị Việt Xô, 91 Trần Hưng Đạo, Hoàn Kiếm, Hà Nội",
        "source_date": "08/07/2026",
        "source_url": "https://kbs.tec-ftu.com/",
        "source_quote": "Thời gian: 08/07/2026 | Địa điểm: Cung Văn hóa Lao động Hữu nghị Việt Xô, 91 Trần Hưng Đạo, Hoàn Kiếm, Hà Nội"
    },
    "Mùa thi": {
        "value": "Mùa thi thứ 21 (2026)",
        "source_date": "08/07/2026",
        "source_url": "https://kbs.tec-ftu.com/",
        "source_quote": "Mùa thi thứ 21 - Kawai Business Startup 2026"
    },
    "Deadline đăng ký": {
        "value": "08/07/2026",
        "source_date": "08/07/2026",
        "source_url": "https://kbs.tec-ftu.com/",
        "source_quote": "Hạn chót đăng ký vé tham dự Đêm Chung kết: 08/07/2026"
    },
    "Trạng thái": {
        "value": "Đang mở đăng ký tham dự Đêm Chung kết (vòng 3)",
        "source_date": "08/07/2026",
        "source_url": "https://kbs.tec-ftu.com/",
        "source_quote": "Chính thức mở cổng đăng ký vé tham dự Đêm Chung kết"
    },
    "Link nguồn chính thức": {
        "value": "https://kbs.tec-ftu.com/",
        "source_date": "08/07/2026",
        "source_url": "https://kbs.tec-ftu.com/",
        "source_quote": "Cổng thông tin chính thức: https://kbs.tec-ftu.com/"
    }
}

mgr = ExcelSyncManager(excel_path)
res = mgr.update_competition(dna, custom_data=custom_data)
print("Updated Kawai successfully:", res)

# Kiểm tra lại kết quả
wb = openpyxl.load_workbook(excel_path, data_only=False)
ws = wb["Phân tích và chỉnh sửa"]
print("\nKiểm tra lại trang 'Phân tích và chỉnh sửa':")
for r in range(4, 19):
    row_vals = [ws.cell(r, c).value for c in range(1, 7)]
    print(f"Row {r}:", row_vals)
