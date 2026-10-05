import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter
import json
import re
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, r"d:\HA")

from pipeline.excel_sync import REVIEW_SHEET_NAME

excel_file = Path(r"d:\HA\TAKENOTE CÁC CUỘC THI PROJECT TIN314.xlsx")
wb = openpyxl.load_workbook(excel_file, data_only=False)

with open(r"d:\HA\data\competitions.json", "r", encoding="utf-8") as f:
    comps = json.load(f)

ws_main = None
for s in wb.sheetnames:
    if "tổng hợp" in s.lower():
        ws_main = wb[s]
        break

ws_rev = wb[REVIEW_SHEET_NAME]

# 1. Update column widths
ws_rev.column_dimensions['A'].width = 26
ws_rev.column_dimensions['B'].width = 50
ws_rev.column_dimensions['C'].width = 65
ws_rev.column_dimensions['D'].width = 35
ws_rev.column_dimensions['E'].width = 18
ws_rev.column_dimensions['F'].width = 24

# Typography & Palette
font_main_title = Font(name="Segoe UI", size=12, bold=True, color="1E293B")
font_subtitle = Font(name="Segoe UI", size=9.5, italic=True, color="64748B")
font_section_header = Font(name="Segoe UI", size=11, bold=True, color="1E3A8A")
font_th = Font(name="Segoe UI", size=10, bold=True, color="334155")
font_col_name = Font(name="Segoe UI", size=10, bold=True, color="1E293B")
font_val = Font(name="Segoe UI", size=10, color="0F172A")
font_proof = Font(name="Segoe UI", size=9.5, color="334155")
font_link = Font(name="Segoe UI", size=9.5, color="2563EB", underline="single")
font_muted = Font(name="Segoe UI", size=9.5, color="94A3B8")
font_ref = Font(name="Segoe UI", size=9, italic=True, color="64748B")

fill_section_header = PatternFill(start_color="EEF2FF", end_color="EEF2FF", fill_type="solid")
fill_th = PatternFill(start_color="F8FAFC", end_color="F8FAFC", fill_type="solid")
fill_input_box = PatternFill(start_color="FFFFFF", end_color="FFFFFF", fill_type="solid")
fill_proof_box = PatternFill(start_color="F8FAFC", end_color="F8FAFC", fill_type="solid")

thin_border_side = Side(border_style="thin", color="CBD5E1")
box_border = Border(top=thin_border_side, bottom=thin_border_side, left=thin_border_side, right=thin_border_side)

# Read headers of ws_main
main_headers = {}
for c in range(1, ws_main.max_column + 1):
    v = ws_main.cell(1, c).value
    if v:
        main_headers[str(v).strip().lower()] = (c, str(v).strip())

def norm_name(s):
    return "".join(c.lower() for c in str(s or "") if c.isalnum())

# Find all section starts
sections = []
for r in range(3, ws_rev.max_row + 1):
    c1 = ws_rev.cell(r, 1).value
    if c1 and ("CUỘC THI:" in str(c1)):
        sections.append(r)

print(f"Found {len(sections)} sections in '{REVIEW_SHEET_NAME}'")

# Tra cứu target_row chính xác
def find_exact_row(comp_name_clean):
    c_norm = norm_name(comp_name_clean)
    mapping = {
        "kawai": 2,
        "khởinghiệptrẻ": 4,
        "rnd": 9,
        "startuprunway": 10,
        "rakhơi": 11,
        "startupprogram": 12,
        "vietfuture": 33,
        "esg": 34,
        "huit": 35,
        "180degrees": 35,
        "hànhtrìnhkinhdoanh": 37,
        "tsinghua": 42,
        "beyondborders": 42,
        "undergraduatecase": 43,
        "raceoffinance": 55,
        "thebanker": 66,
        "theauditrace": 66,
        "hrsandbox": 75,
        "react": 104,
        "agritech": 105,
        "cbs": 106,
        "ecompete": 107,
        "duhọcset": 108
    }
    for kw, r in mapping.items():
        if kw in c_norm:
            return r
    return None

for i, sec_r in enumerate(sections):
    next_sec_r = sections[i + 1] if i + 1 < len(sections) else ws_rev.max_row + 2
    banner_val = str(ws_rev.cell(sec_r, 1).value or "")
    
    comp_match = re.search(r"CUỘC THI:\s*(.*?)\s*\[", banner_val)
    comp_name_clean = comp_match.group(1).strip() if comp_match else banner_val
    c_norm = norm_name(comp_name_clean)
    
    comp_json = next((c for c in comps if norm_name(c.get("name", "")) in c_norm or c_norm in norm_name(c.get("name", ""))), None)
    
    exact_row = find_exact_row(comp_name_clean)
    if exact_row:
        target_row = exact_row
    else:
        row_match = re.search(r"hàng #([0-9]+)", banner_val)
        target_row = int(row_match.group(1)) if row_match else 2

    # Update banner
    for col_idx in range(1, 7):
        b_cell = ws_rev.cell(sec_r, col_idx)
        b_cell.fill = fill_section_header
        b_cell.border = Border(top=thin_border_side, bottom=thin_border_side)
    ws_rev.cell(sec_r, 1).value = f"🏆 CUỘC THI: {comp_name_clean.upper()}  [Liên kết tự động hàng #{target_row} ở trang '{ws_main.title}']"
    ws_rev.cell(sec_r, 1).font = font_section_header
    ws_rev.cell(sec_r, 1).alignment = Alignment(vertical="center", horizontal="left", indent=1)
    ws_rev.row_dimensions[sec_r].height = 26

    # Update Table Header
    th_r = sec_r + 1
    headers_title = [
        ("Tên Cột Trong Excel", 1),
        ("Giá Trị Sẽ Ghi Vào File", 2),
        ("Nội dung từ web", 3),
        ("Link bài viết", 4),
        ("Ngày đăng bài (nếu có)", 5),
        ("Vị trí liên kết trang Tổng hợp", 6)
    ]
    for htext, cidx in headers_title:
        cell = ws_rev.cell(th_r, cidx)
        cell.value = htext
        cell.font = font_th
        cell.fill = fill_th
        cell.border = box_border
        align_h = "center" if cidx in (5, 6) else "left"
        cell.alignment = Alignment(vertical="center", horizontal=align_h, indent=0 if align_h == "center" else 1)
    ws_rev.row_dimensions[th_r].height = 28

    comp_url = ""
    comp_date = ""
    if comp_json:
        comp_url = str(comp_json.get("source_url") or comp_json.get("registration_link") or "").strip()
        comp_date = str(comp_json.get("deadline") or "").strip()
        if comp_date.startswith("202"):
            parts = comp_date.split("-")
            if len(parts) == 3:
                comp_date = f"{parts[2]}/{parts[1]}/{parts[0]}"

    for r in range(th_r + 1, next_sec_r):
        col_name = ws_rev.cell(r, 1).value
        if not col_name or "CUỘC THI:" in str(col_name):
            continue
        clean_name = str(col_name).strip()
        val_str = str(ws_rev.cell(r, 2).value or "").strip()
        if val_str == "None":
            val_str = ""

        old_c3 = str(ws_rev.cell(r, 3).value or "").strip()
        if old_c3 and old_c3 != "(Không có trích dẫn cụ thể)" and old_c3 != "None":
            s_quote = old_c3
        else:
            s_quote = val_str

        s_url = comp_url
        if not s_url and val_str.startswith("http"):
            s_url = val_str
        
        s_date = comp_date if comp_date else ""

        # Col A (1)
        c_a = ws_rev.cell(r, 1)
        c_a.value = clean_name
        c_a.font = font_col_name
        c_a.border = box_border
        c_a.alignment = Alignment(vertical="center", horizontal="left", indent=1)

        # Col B (2)
        c_b = ws_rev.cell(r, 2)
        c_b.value = val_str if val_str else None
        c_b.font = font_val
        c_b.fill = fill_input_box
        c_b.border = box_border
        c_b.alignment = Alignment(vertical="center", horizontal="left", wrap_text=True, indent=1)

        # Col C (3) - Nội dung từ web
        c_c = ws_rev.cell(r, 3)
        c_c.value = s_quote if s_quote else "(Chưa có trích dẫn từ web)"
        c_c.font = font_proof if s_quote else font_muted
        c_c.fill = fill_proof_box
        c_c.border = box_border
        c_c.alignment = Alignment(vertical="center", horizontal="left", wrap_text=True, indent=1)

        # Col D (4) - Link bài viết
        c_d = ws_rev.cell(r, 4)
        if s_url and s_url.startswith("http"):
            c_d.value = s_url
            c_d.hyperlink = s_url
            c_d.font = font_link
        else:
            c_d.value = "—"
            c_d.font = font_muted
        c_d.border = box_border
        c_d.alignment = Alignment(vertical="center", horizontal="left", indent=1)

        # Col E (5) - Ngày đăng bài
        c_e = ws_rev.cell(r, 5)
        c_e.value = s_date if s_date else "—"
        c_e.font = font_proof if s_date else font_muted
        c_e.border = box_border
        c_e.alignment = Alignment(vertical="center", horizontal="center")

        # Col F (6) - Vị trí liên kết trang Tổng hợp
        matched_info = main_headers.get(clean_name.lower())
        if not matched_info:
            for h_lower, (h_cidx, h_orig) in main_headers.items():
                if clean_name.lower() in h_lower or h_lower in clean_name.lower():
                    matched_info = (h_cidx, h_orig)
                    break

        if matched_info:
            target_col_idx, target_col_orig = matched_info
            col_letter = get_column_letter(target_col_idx)
            
            formula_str = f"='{REVIEW_SHEET_NAME}'!B{r}"
            ws_main.cell(target_row, target_col_idx).value = formula_str
            ws_main.cell(target_row, target_col_idx).alignment = Alignment(vertical="center", wrap_text=True)

            c_f = ws_rev.cell(r, 6)
            c_f.value = f"='{ws_main.title}'!{col_letter}{target_row}"
            c_f.font = font_ref
            c_f.border = box_border
            c_f.alignment = Alignment(vertical="center", horizontal="center")
        else:
            c_f = ws_rev.cell(r, 6)
            c_f.value = "Chưa có cột tương ứng"
            c_f.font = font_ref
            c_f.border = box_border
            c_f.alignment = Alignment(vertical="center", horizontal="center")

        content_len = max(len(val_str), len(s_quote))
        if content_len > 120:
            ws_rev.row_dimensions[r].height = 55
        elif content_len > 60:
            ws_rev.row_dimensions[r].height = 42
        else:
            ws_rev.row_dimensions[r].height = 32

wb.save(excel_file)
print(f"🎉 Hoàn tất cập nhật 23 cuộc thi với 5 cột chuẩn và liên kết đúng hàng!")
