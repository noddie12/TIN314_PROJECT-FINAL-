import re
import urllib.parse
from pathlib import Path
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter
import json
import csv

input_path = Path(r"C:\Users\hoang.bd2\Downloads\TAKENOTE CÁC CUỘC THI PROJECT TIN314 (1).xlsx")
output_dir = Path(r"d:\HA\data")
output_dir.mkdir(parents=True, exist_ok=True)

wb_in = openpyxl.load_workbook(input_path, data_only=False)
ws_in = wb_in['Tổng hợp ']

def clean_url(url_str):
    if not url_str:
        return ""
    u = str(url_str).strip()
    # Remove trailing newlines or spaces
    u = u.replace('\n', '').replace('\r', '').strip()
    # Clean fbclid if present
    if "fbclid=" in u:
        try:
            parsed = urllib.parse.urlparse(u)
            qs = urllib.parse.parse_qs(parsed.query)
            qs.pop('fbclid', None)
            new_query = urllib.parse.urlencode(qs, doseq=True)
            u = urllib.parse.urlunparse((parsed.scheme, parsed.netloc, parsed.path, parsed.params, new_query, parsed.fragment))
            if u.endswith('?'):
                u = u[:-1]
        except Exception:
            pass
    return u

def detect_platform(url_str):
    u = url_str.lower()
    if "facebook.com" in u or "fb.com" in u:
        return "Facebook Fanpage"
    elif "framer.website" in u:
        return "Framer Site"
    elif any(k in u for k in ["edu.vn", ".com", ".org", ".net", ".vn", ".io", ".co"]):
        return "Website Chính Thức"
    return "Khác"

items = []
for r in range(2, ws_in.max_row + 1):
    name = ws_in.cell(row=r, column=1).value
    category = ws_in.cell(row=r, column=2).value
    link_cell = ws_in.cell(row=r, column=13)
    raw_link = link_cell.value or ""
    if link_cell.hyperlink and link_cell.hyperlink.target:
        raw_link = link_cell.hyperlink.target

    name_str = str(name).strip() if name else ""
    cat_str = str(category).strip() if category else ""
    clean_link = clean_url(raw_link)

    if name_str or clean_link:
        items.append({
            "stt": len(items) + 1,
            "name": name_str,
            "category": cat_str,
            "url": clean_link,
            "platform": detect_platform(clean_link)
        })

print(f"Tổng số cuộc thi trích xuất: {len(items)}")

# 1. Tạo file Excel đơn giản, định dạng đẹp: danh_sach_cuoc_thi_kem_link.xlsx
wb_out = openpyxl.Workbook()
ws_out = wb_out.active
ws_out.title = "Danh sách cuộc thi & Link"

# Headers
headers = ["STT", "Tên cuộc thi", "Lĩnh vực", "Nền tảng", "Link nguồn chính thức"]
ws_out.append(headers)

# Styling
header_fill = PatternFill(start_color="1E293B", end_color="1E293B", fill_type="solid")
header_font = Font(name="Segoe UI", size=11, bold=True, color="FFFFFF")
regular_font = Font(name="Segoe UI", size=10)
bold_font = Font(name="Segoe UI", size=10, bold=True)
link_font = Font(name="Segoe UI", size=10, color="2563EB", underline="single")
thin_border = Border(
    left=Side(style='thin', color='E2E8F0'),
    right=Side(style='thin', color='E2E8F0'),
    top=Side(style='thin', color='E2E8F0'),
    bottom=Side(style='thin', color='E2E8F0')
)
stripe_fill = PatternFill(start_color="F8FAFC", end_color="F8FAFC", fill_type="solid")

for col_num, h in enumerate(headers, 1):
    cell = ws_out.cell(row=1, column=col_num)
    cell.fill = header_fill
    cell.font = header_font
    cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)

ws_out.row_dimensions[1].height = 28

for idx, item in enumerate(items, start=2):
    r_stt = ws_out.cell(row=idx, column=1, value=item["stt"])
    r_name = ws_out.cell(row=idx, column=2, value=item["name"])
    r_cat = ws_out.cell(row=idx, column=3, value=item["category"])
    r_plat = ws_out.cell(row=idx, column=4, value=item["platform"])
    r_link = ws_out.cell(row=idx, column=5, value=item["url"])

    r_stt.alignment = Alignment(horizontal="center", vertical="center")
    r_name.alignment = Alignment(horizontal="left", vertical="center")
    r_cat.alignment = Alignment(horizontal="center", vertical="center")
    r_plat.alignment = Alignment(horizontal="center", vertical="center")
    r_link.alignment = Alignment(horizontal="left", vertical="center")

    r_stt.font = regular_font
    r_name.font = bold_font
    r_cat.font = regular_font
    r_plat.font = regular_font

    if item["url"]:
        r_link.font = link_font
        r_link.hyperlink = item["url"]
    else:
        r_link.font = regular_font

    for c in range(1, 6):
        cell = ws_out.cell(row=idx, column=c)
        cell.border = thin_border
        if idx % 2 == 1:
            cell.fill = stripe_fill

    ws_out.row_dimensions[idx].height = 22

# Auto column widths
col_widths = {1: 8, 2: 45, 3: 25, 4: 20, 5: 65}
for col_idx, width in col_widths.items():
    ws_out.column_dimensions[get_column_letter(col_idx)].width = width

excel_out_path = output_dir / "danh_sach_cuoc_thi_kem_link.xlsx"
wb_out.save(excel_out_path)
print(f"-> Đã xuất Excel: {excel_out_path}")

# 2. Tạo file JSON: data/competitions_links.json
json_out_path = output_dir / "competitions_links.json"
with open(json_out_path, "w", encoding="utf-8") as f:
    json.dump(items, f, ensure_ascii=False, indent=2)
print(f"-> Đã xuất JSON: {json_out_path}")

# 3. Tạo file CSV: data/competitions_links.csv
csv_out_path = output_dir / "competitions_links.csv"
with open(csv_out_path, "w", encoding="utf-8-sig", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=["stt", "name", "category", "platform", "url"])
    writer.writeheader()
    writer.writerows(items)
print(f"-> Đã xuất CSV: {csv_out_path}")

# 4. Sao chép và cập nhật trực tiếp vào file TAKENOTE chính của dự án để Web UI & Pipeline dùng được ngay
root_excel = Path(r"d:\HA\TAKENOTE CÁC CUỘC THI PROJECT TIN314.xlsx")
import shutil
backup_path = Path(r"d:\HA\TAKENOTE_ORIGINAL_BACKUP.xlsx")
if not backup_path.exists():
    shutil.copy2(root_excel, backup_path)
    print(f"-> Đã backup file gốc sang: {backup_path}")

shutil.copy2(input_path, root_excel)
print(f"-> Đã cập nhật file Excel dự án chính: {root_excel}")
