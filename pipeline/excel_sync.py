import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter
from pathlib import Path
from typing import Optional, Dict, Any, List, Union
import re

from pipeline.config import EXCEL_FILE
from pipeline.models import CompetitionDNA

REVIEW_SHEET_NAME = "Phân tích và chỉnh sửa"

class ExcelSyncManager:
    def __init__(self, file_path: Optional[Union[Path, str]] = None):
        self.file_path = Path(file_path) if file_path else EXCEL_FILE
        if not self.file_path.exists():
            raise FileNotFoundError(f"Không tìm thấy file Excel: {self.file_path}")

    def _normalize_name(self, text: str) -> str:
        if not text:
            return ""
        # Bỏ dấu cách thừa, chuyển về chữ thường, bỏ ký tự đặc biệt
        cleaned = re.sub(r'[^a-zA-Z0-9\u00C0-\u1EF9]', '', str(text).lower())
        return cleaned

    def _get_target_sheet(self, wb: openpyxl.Workbook, sheet_name: Optional[str] = None):
        """Xác định trang tính chính ('Tổng hợp') cần cập nhật."""
        if sheet_name and sheet_name in wb.sheetnames:
            return wb[sheet_name]
        # Ưu tiên trang có tên chứa 'tổng hợp'
        for name in wb.sheetnames:
            if "tổng hợp" in name.lower():
                return wb[name]
        # Nếu không có, lấy trang đầu tiên không phải là trang review
        for name in wb.sheetnames:
            if name != REVIEW_SHEET_NAME:
                return wb[name]
        return wb.sheetnames[0]

    def _resolve_cell_value(self, cell, wb: openpyxl.Workbook) -> Any:
        """Giải quyết giá trị thực sự nếu ô chứa công thức liên kết giữa các sheet."""
        val = cell.value
        if isinstance(val, str) and val.startswith("="):
            # Tìm dạng ='Sheet'!B6
            match = re.search(r"'(?:[^']+)'!([A-Z]+[0-9]+)", val)
            if match:
                ref = match.group(1)
                try:
                    if REVIEW_SHEET_NAME in wb.sheetnames:
                        return wb[REVIEW_SHEET_NAME][ref].value
                except Exception:
                    pass
            # Tìm dạng =B6 (cùng sheet)
            match_simple = re.search(r"=([A-Z]+[0-9]+)", val)
            if match_simple:
                ref = match_simple.group(1)
                try:
                    return cell.parent[ref].value
                except Exception:
                    pass
        return val

    def get_competitions_from_sheet(self, sheet_name: Optional[str] = None) -> List[Dict[str, Any]]:
        """Lấy danh sách các cuộc thi đã liệt kê trong file Excel."""
        wb = openpyxl.load_workbook(self.file_path, data_only=False)
        ws = self._get_target_sheet(wb, sheet_name)

        competitions = []
        for r in range(2, ws.max_row + 1):
            name_cell = ws.cell(r, 1)
            name = self._resolve_cell_value(name_cell, wb)
            cat_cell = ws.cell(r, 2)
            category = self._resolve_cell_value(cat_cell, wb)
            org_cell = ws.cell(r, 3)
            org_val = self._resolve_cell_value(org_cell, wb)
            if name:
                competitions.append({
                    "row": r,
                    "name": str(name).strip(),
                    "category": str(category).strip() if category else "",
                    "has_data": org_val is not None
                })

        return competitions

    def get_schema(self, sheet_name: Optional[str] = None) -> Dict[str, Any]:
        """Phân tích các cột và cấu trúc của file Excel."""
        wb = openpyxl.load_workbook(self.file_path, data_only=False)
        ws = self._get_target_sheet(wb, sheet_name)

        columns = []
        for c in range(1, ws.max_column + 1):
            val = ws.cell(1, c).value
            if val is not None and str(val).strip():
                columns.append(str(val).strip())

        real_rows = 0
        for r in range(2, ws.max_row + 1):
            if any(ws.cell(r, c).value is not None for c in range(1, len(columns) + 1)):
                real_rows += 1

        return {
            "file_name": self.file_path.name,
            "sheet_name": ws.title,
            "sheets": wb.sheetnames,
            "columns": columns,
            "total_rows": real_rows
        }

    def sync_review_sheet(
        self,
        wb: openpyxl.Workbook,
        ws_main: openpyxl.worksheet.worksheet.Worksheet,
        target_row: int,
        comp_name: str,
        data_mapping: Dict[str, Any]
    ) -> int:
        """
        Tạo hoặc cập nhật trang 'Phân tích và chỉnh sửa' với giao diện trực quan
        giống hệt thiết kế trong ảnh, và liên kết công thức tự động sang hàng target_row của trang Tổng hợp.
        """
        if REVIEW_SHEET_NAME in wb.sheetnames:
            ws_rev = wb[REVIEW_SHEET_NAME]
        else:
            # Chèn vào vị trí thứ 2 (ngay sau trang Tổng hợp)
            main_idx = wb.sheetnames.index(ws_main.title) if ws_main.title in wb.sheetnames else 0
            ws_rev = wb.create_sheet(title=REVIEW_SHEET_NAME, index=main_idx + 1)
            
            # Thiết lập độ rộng cột rộng rãi, dễ đọc
            ws_rev.column_dimensions['A'].width = 26
            ws_rev.column_dimensions['B'].width = 50
            ws_rev.column_dimensions['C'].width = 65
            ws_rev.column_dimensions['D'].width = 35
            ws_rev.column_dimensions['E'].width = 18
            ws_rev.column_dimensions['F'].width = 24

        # Typography & Palette chuẩn UI
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
        bottom_border = Border(bottom=thin_border_side)

        # 1. Header chính ở đầu sheet (Row 1-2)
        if ws_rev.cell(1, 1).value != "DỮ LIỆU PHÂN TÍCH (CÓ THỂ CHỈNH SỬA TRỰC TIẾP VÀO TỪNG Ô):":
            ws_rev.cell(1, 1).value = "DỮ LIỆU PHÂN TÍCH (CÓ THỂ CHỈNH SỬA TRỰC TIẾP VÀO TỪNG Ô):"
            ws_rev.cell(1, 1).font = font_main_title
            ws_rev.cell(1, 1).alignment = Alignment(vertical="center", horizontal="left")
            ws_rev.row_dimensions[1].height = 25

            ws_rev.cell(2, 1).value = "Chỉnh sửa sẽ tự động lưu khi chuyển tab | Giá trị ở cột 'Giá Trị Sẽ Ghi Vào File' sẽ TỰ ĐỘNG CẬP NHẬT sang trang 'Tổng hợp'"
            ws_rev.cell(2, 1).font = font_subtitle
            ws_rev.cell(2, 1).alignment = Alignment(vertical="center", horizontal="left")
            ws_rev.row_dimensions[2].height = 18

        # 2. Tìm xem cuộc thi này đã có section trong sheet review chưa
        comp_norm = self._normalize_name(comp_name)
        section_start_r = None

        for r in range(3, ws_rev.max_row + 1):
            c1_val = ws_rev.cell(r, 1).value
            if c1_val and "CUỘC THI:" in str(c1_val):
                c1_str = str(c1_val).lower()
                if f"hàng #{target_row}" in c1_str or f"hàng {target_row}" in c1_str or (comp_norm and comp_norm in self._normalize_name(str(c1_val))):
                    section_start_r = r
                    break

        # Nếu chưa có, append ở cuối
        if section_start_r is None:
            last_r = 2
            for r in range(3, ws_rev.max_row + 1):
                if any(ws_rev.cell(r, c).value for c in range(1, 7)):
                    last_r = r
            section_start_r = last_r + 2 if last_r > 2 else 4

        # 3. Ghi Banner cuộc thi trải dài các cột
        for col_idx in range(1, 7):
            b_cell = ws_rev.cell(section_start_r, col_idx)
            b_cell.fill = fill_section_header
            b_cell.border = Border(top=thin_border_side, bottom=thin_border_side)
        ws_rev.cell(section_start_r, 1).value = f"🏆 CUỘC THI: {comp_name.upper()}  [Liên kết tự động hàng #{target_row} ở trang '{ws_main.title}']"
        ws_rev.cell(section_start_r, 1).font = font_section_header
        ws_rev.cell(section_start_r, 1).alignment = Alignment(vertical="center", horizontal="left", indent=1)
        ws_rev.row_dimensions[section_start_r].height = 26

        # 4. Header bảng gồm 5 cột chính theo yêu cầu + 1 cột vị trí liên kết
        th_row = section_start_r + 1
        headers_title = [
            ("Tên Cột Trong Excel", 1),
            ("Giá Trị Sẽ Ghi Vào File", 2),
            ("Nội dung từ web", 3),
            ("Link bài viết", 4),
            ("Ngày đăng bài (nếu có)", 5),
            ("Vị trí liên kết trang Tổng hợp", 6)
        ]
        for htext, cidx in headers_title:
            cell = ws_rev.cell(th_row, cidx)
            cell.value = htext
            cell.font = font_th
            cell.fill = fill_th
            cell.border = box_border
            align_h = "center" if cidx in (5, 6) else "left"
            cell.alignment = Alignment(vertical="center", horizontal=align_h, indent=0 if align_h == "center" else 1)
        ws_rev.row_dimensions[th_row].height = 28

        # 5. Đọc headers của trang Tổng hợp để ánh xạ cột
        main_headers = {}
        for c in range(1, ws_main.max_column + 1):
            v = ws_main.cell(1, c).value
            if v:
                main_headers[str(v).strip().lower()] = (c, str(v).strip())

        curr_r = th_row + 1
        for col_name, item_data in data_mapping.items():
            clean_name = str(col_name).strip()
            
            # Bóc tách giá trị và chứng cứ đối chiếu
            if isinstance(item_data, dict):
                val_str = str(item_data.get("value", "") or "").strip()
                s_date = str(item_data.get("source_date", "") or "").strip()
                s_url = str(item_data.get("source_url", "") or "").strip()
                s_quote = str(item_data.get("source_quote", "") or "").strip()
            else:
                val_str = str(item_data or "").strip()
                s_date = ""
                s_url = ""
                s_quote = val_str

            # Col A (1): Tên Cột Trong Excel
            c_a = ws_rev.cell(curr_r, 1)
            c_a.value = clean_name
            c_a.font = font_col_name
            c_a.border = box_border
            c_a.alignment = Alignment(vertical="center", horizontal="left", indent=1)

            # Col B (2): Giá Trị Sẽ Ghi Vào File (Người dùng có thể sửa đổi ô này trực tiếp trong Excel)
            c_b = ws_rev.cell(curr_r, 2)
            c_b.value = val_str
            c_b.font = font_val
            c_b.fill = fill_input_box
            c_b.border = box_border
            c_b.alignment = Alignment(vertical="center", horizontal="left", wrap_text=True, indent=1)

            # Col C (3): Nội dung từ web (thay thế cột 'Nội Dung Lấy Từ Bài Đăng Trên Fanpage Ngày')
            c_c = ws_rev.cell(curr_r, 3)
            c_c.value = s_quote if s_quote else "(Chưa có trích dẫn từ web)"
            c_c.font = font_proof if s_quote else font_muted
            c_c.fill = fill_proof_box
            c_c.border = box_border
            c_c.alignment = Alignment(vertical="center", horizontal="left", wrap_text=True, indent=1)

            # Col D (4): Link bài viết
            c_d = ws_rev.cell(curr_r, 4)
            if s_url and s_url.startswith("http"):
                c_d.value = s_url
                c_d.hyperlink = s_url
                c_d.font = font_link
            else:
                c_d.value = "—"
                c_d.font = font_muted
            c_d.border = box_border
            c_d.alignment = Alignment(vertical="center", horizontal="left", indent=1)

            # Col E (5): Ngày đăng bài (nếu có)
            c_e = ws_rev.cell(curr_r, 5)
            c_e.value = s_date if s_date else "—"
            c_e.font = font_proof if s_date else font_muted
            c_e.border = box_border
            c_e.alignment = Alignment(vertical="center", horizontal="center")

            # Col F (6): Vị trí liên kết trang Tổng hợp
            matched_info = main_headers.get(clean_name.lower())
            if not matched_info:
                for h_lower, (h_cidx, h_orig) in main_headers.items():
                    if clean_name.lower() in h_lower or h_lower in clean_name.lower():
                        matched_info = (h_cidx, h_orig)
                        break

            if matched_info:
                target_col_idx, target_col_orig = matched_info
                col_letter = get_column_letter(target_col_idx)
                
                is_category_col = (target_col_idx == 2 or clean_name.lower() in ("lĩnh vực", "danh mục"))
                if is_category_col:
                    # LĨNH VỰC ĐÃ ĐƯỢC XÁC ĐỊNH TRƯỚC THEO FILE MẪU: KHÔNG GHI ĐÈ BẰNG CÔNG THỨC
                    # Giữ nguyên giá trị tĩnh ở trang Tổng hợp, và hiển thị giá trị này ở cột B của trang Phân tích
                    predefined_cat = ws_main.cell(target_row, 2).value
                    if not predefined_cat or str(predefined_cat).startswith("="):
                        try:
                            import json
                            cfg_p = Path(__file__).resolve().parent.parent / "data" / "predefined_categories.json"
                            if cfg_p.exists():
                                with open(cfg_p, "r", encoding="utf-8") as f_cfg:
                                    cat_data = json.load(f_cfg)
                                    predefined_cat = cat_data.get("by_row", {}).get(str(target_row)) or cat_data.get("by_row", {}).get(target_row)
                        except Exception:
                            pass
                    if predefined_cat:
                        val_str = str(predefined_cat).strip()
                        ws_main.cell(target_row, 2).value = val_str
                        c_b.value = val_str
                else:
                    # LIÊN KẾT CÔNG THỨC: Khi người dùng sửa ô B ở trang này, ô trên trang Tổng hợp tự nhảy theo!
                    formula_str = f"='{REVIEW_SHEET_NAME}'!B{curr_r}"
                    ws_main.cell(target_row, target_col_idx).value = formula_str
                    ws_main.cell(target_row, target_col_idx).alignment = Alignment(vertical="center", wrap_text=True)

                c_f = ws_rev.cell(curr_r, 6)
                c_f.value = f"='{ws_main.title}'!{col_letter}{target_row}"
                c_f.font = font_ref
                c_f.border = box_border
                c_f.alignment = Alignment(vertical="center", horizontal="center")
            else:
                c_f = ws_rev.cell(curr_r, 6)
                c_f.value = "Chưa có cột tương ứng"
                c_f.font = font_ref
                c_f.border = box_border
                c_f.alignment = Alignment(vertical="center", horizontal="center")

            # Chiều cao dòng
            content_len = max(len(val_str), len(s_quote))
            if content_len > 120:
                ws_rev.row_dimensions[curr_r].height = 55
            elif content_len > 60:
                ws_rev.row_dimensions[curr_r].height = 42
            else:
                ws_rev.row_dimensions[curr_r].height = 32

            curr_r += 1

        return curr_r

    def update_competition(
        self,
        dna: CompetitionDNA,
        sheet_name: Optional[str] = None,
        custom_data: Optional[Dict[str, Any]] = None,
        target_row: Optional[int] = None
    ) -> int:
        """
        Cập nhật dữ liệu từ CompetitionDNA vào đúng hàng của cuộc thi trong Excel,
        đồng thời đồng bộ sang trang 'Phân tích và chỉnh sửa' với liên kết công thức.
        """
        wb = openpyxl.load_workbook(self.file_path, data_only=False)
        ws = self._get_target_sheet(wb, sheet_name)

        # Đọc headers để ánh xạ cột chính xác
        headers = {}
        for c in range(1, ws.max_column + 1):
            val = ws.cell(1, c).value
            if val:
                headers[str(val).strip()] = c

        excel_data = dna.to_excel_dict()
        norm_dna_name = self._normalize_name(dna.name)

        # 0. Nếu target_row đã được truyền trực tiếp từ bên ngoài
        if target_row is not None and isinstance(target_row, int) and target_row >= 2:
            print(f"🎯 Sử dụng target_row được chỉ định trực tiếp: #{target_row}")
        else:
            target_row = None

        # 0.1 Thử tra cứu qua URL trong competitions_links.json nếu có
        if target_row is None and dna.source_url:
            try:
                import json
                links_path = Path(__file__).resolve().parent.parent / "data" / "competitions_links.json"
                if links_path.exists():
                    clean_u = re.sub(r'\?.*$', '', dna.source_url.strip().lower()).rstrip('/')
                    with open(links_path, "r", encoding="utf-8") as lf:
                        all_links = json.load(lf)
                        for litem in all_links:
                            cand_u = re.sub(r'\?.*$', '', (litem.get("url") or "").strip().lower()).rstrip('/')
                            if cand_u and (cand_u == clean_u or clean_u.startswith(cand_u) or cand_u.startswith(clean_u)):
                                if litem.get("stt"):
                                    target_row = int(litem["stt"]) + 1
                                    print(f"🎯 Khớp URL trong competitions_links.json -> Hàng #{target_row} ({litem.get('name')})")
                                    break
            except Exception as ex:
                print(f"Lưu ý: Không thể tra cứu competitions_links.json: {ex}")

        # 1. Tìm dòng đã có tên cuộc thi khớp trên sheet chính
        if target_row is None:
            best_match_r = None
            best_score = 0.0

            for r in range(2, ws.max_row + 1):
                cell_val = self._resolve_cell_value(ws.cell(r, 1), wb)
                if not cell_val:
                    continue
                cell_str = str(cell_val).strip()
                norm_cell = self._normalize_name(cell_str)
                if not norm_cell:
                    continue

                # So khớp chính xác hoặc chuỗi con (tối thiểu 4 ký tự để tránh nhầm)
                if norm_cell == norm_dna_name:
                    best_match_r = r
                    best_score = 2.0
                    break
                elif len(norm_cell) >= 4 and (norm_cell in norm_dna_name or norm_dna_name in norm_cell):
                    score = 1.0 + (len(norm_cell) / max(len(norm_dna_name), 1))
                    if score > best_score:
                        best_score = score
                        best_match_r = r
                else:
                    # Token matching cho các từ viết tắt như KMAC, VSIC, Startup BA, I-Startup
                    tokens_cell = set(re.findall(r'[a-zA-Z0-9\u00C0-\u1EF9]+', cell_str.lower()))
                    tokens_dna = set(re.findall(r'[a-zA-Z0-9\u00C0-\u1EF9]+', dna.name.lower()))
                    overlap = tokens_cell & tokens_dna
                    stopwords = {"cuoc", "thi", "nam", "lan", "thu", "mua", "giai", "toan", "quoc", "sinh", "vien", "hoc", "sinh", "2024", "2025", "2026", "2027"}
                    overlap_sig = {w for w in overlap if w not in stopwords and len(w) > 1}
                    if overlap_sig:
                        score = len(overlap_sig) / min(max(len(tokens_cell - stopwords), 1), max(len(tokens_dna - stopwords), 1))
                        if score > best_score and score >= 0.5:
                            best_score = score
                            best_match_r = r

            if best_match_r is not None:
                target_row = best_match_r

        # 2. Nếu chưa có tên, kiểm tra xem có dòng trống nào có Danh mục (Cột 2) tương ứng chưa
        if target_row is None:
            cat_keywords = {
                "debate": ["hùng biện", "tranh biện", "diễn thuyết"],
                "startup": ["khởi nghiệp"],
                "business case": ["business case", "kinh doanh"],
                "marketing": ["marketing"],
                "finance": ["tài chính", "chứng khoán", "ngân hàng"],
                "logistics": ["logistics"],
                "data": ["data"],
                "mt": ["mt", "young talent", "lãnh đạo"]
            }
            dna_cat_lower = (dna.category or "").lower()
            matching_kw = []
            for key, kw_list in cat_keywords.items():
                if key in dna_cat_lower or any(kw in dna_cat_lower for kw in kw_list):
                    matching_kw.extend(kw_list)

            if matching_kw:
                for r in range(2, 200):
                    c1_val = self._resolve_cell_value(ws.cell(r, 1), wb)
                    c2_val = self._resolve_cell_value(ws.cell(r, 2), wb)
                    if not c1_val and c2_val:
                        c2_lower = str(c2_val).lower()
                        if any(kw in c2_lower for kw in matching_kw):
                            target_row = r
                            print(f"🎯 Điền vào hàng danh mục có sẵn: #{target_row} ({str(c2_val).strip()})")
                            break

        # 3. Nếu vẫn không có, tìm dòng cuối cùng có dữ liệu thực sự
        if target_row is None:
            last_real_row = 1
            for r in range(2, ws.max_row + 1):
                if ws.cell(r, 1).value or ws.cell(r, 2).value:
                    last_real_row = r
            target_row = last_real_row + 1
            print(f"📝 Cuộc thi '{dna.name}' chưa có trong Excel, thêm dòng mới tại hàng #{target_row}.")
        else:
            print(f"📝 Đã tìm thấy vị trí cập nhật tại hàng #{target_row}...")

        # 4. Chuẩn bị dữ liệu ánh xạ cho trang Review với bảo toàn và bổ sung dẫn chứng
        # Luôn đảm bảo Lĩnh vực lấy theo danh mục xác định trước từ file mẫu
        predefined_cat = ws.cell(target_row, 2).value if target_row else None
        if not predefined_cat or str(predefined_cat).startswith("="):
            try:
                import json
                cfg_p = Path(__file__).resolve().parent.parent / "data" / "predefined_categories.json"
                if cfg_p.exists():
                    with open(cfg_p, "r", encoding="utf-8") as f_cfg:
                        cat_data = json.load(f_cfg)
                        predefined_cat = cat_data.get("by_row", {}).get(str(target_row)) or cat_data.get("by_row", {}).get(target_row)
            except Exception:
                pass
        if predefined_cat:
            excel_data["Lĩnh vực"] = str(predefined_cat).strip()
            dna.category = str(predefined_cat).strip()

        data_to_sync = {}
        # Dựng dữ liệu cơ bản từ CompetitionDNA
        for col_name, value in excel_data.items():
            clean_k = str(col_name).strip()
            proof_quote = ""
            if clean_k == "Tên cuộc thi":
                proof_quote = dna.name
            elif clean_k == "Mô tả ngắn gọn":
                proof_quote = dna.short_description
            elif clean_k in ("Cơ cấu giải thưởng", "Giải thưởng"):
                proof_quote = dna.grand_prize
            elif clean_k == "Deadline đăng ký":
                proof_quote = f"Hạn chót: {dna.deadline}"
            elif clean_k == "Đơn vị tổ chức":
                proof_quote = dna.organizer
            elif clean_k in ("Lĩnh vực", "Danh mục"):
                proof_quote = dna.category

            data_to_sync[clean_k] = {
                "value": value,
                "source_date": "",
                "source_url": dna.source_url or dna.registration_link or "",
                "source_quote": proof_quote or value
            }

        # Nếu có custom_data (từ AI trích xuất hoặc Web UI), ghi đè và làm giàu dữ liệu
        if custom_data:
            for k, v in custom_data.items():
                clean_k = str(k).strip()
                if isinstance(v, dict):
                    val_str = str(v.get("value", "") or "").strip()
                    s_date = str(v.get("source_date", "") or "").strip()
                    s_url = str(v.get("source_url", "") or dna.source_url or dna.registration_link or "").strip()
                    s_quote = str(v.get("source_quote", "") or "").strip()
                    if not s_quote and val_str:
                        s_quote = val_str
                    # Nếu là cột Lĩnh vực, luôn giữ nguyên value theo danh mục mẫu
                    if clean_k in ("Lĩnh vực", "Danh mục") and predefined_cat:
                        if not s_quote:
                            s_quote = val_str
                        val_str = str(predefined_cat).strip()
                    data_to_sync[clean_k] = {
                        "value": val_str,
                        "source_date": s_date,
                        "source_url": s_url,
                        "source_quote": s_quote
                    }
                elif v is not None:
                    val_str = str(v).strip()
                    s_quote = val_str
                    if clean_k in ("Lĩnh vực", "Danh mục") and predefined_cat:
                        val_str = str(predefined_cat).strip()
                    data_to_sync[clean_k] = {
                        "value": val_str,
                        "source_date": "",
                        "source_url": str(dna.source_url or dna.registration_link or "").strip(),
                        "source_quote": s_quote
                    }

        # 5. Đồng bộ vào trang 'Phân tích và chỉnh sửa' và liên kết công thức sang trang Tổng hợp
        self.sync_review_sheet(wb, ws, target_row, dna.name, data_to_sync)

        try:
            wb.save(self.file_path)
            print(f"✅ Đã lưu dữ liệu và liên kết công thức vào file Excel: {self.file_path.name} (Hàng #{target_row})")
            return target_row
        except PermissionError:
            raise PermissionError(f"File '{self.file_path.name}' đang được mở bởi ứng dụng khác (Microsoft Excel). Vui lòng đóng file trên máy rồi thử lại.")

    def update_with_custom_mapping(
        self,
        custom_data: Dict[str, Any],
        competition_name: str,
        sheet_name: Optional[str] = None,
        target_row: Optional[int] = None
    ) -> int:
        """
        Ghi dữ liệu vào file Excel theo danh sách cột tùy biến của người dùng,
        đồng thời cập nhật trang 'Phân tích và chỉnh sửa' và liên kết công thức tự động.
        """
        wb = openpyxl.load_workbook(self.file_path, data_only=False)
        ws = self._get_target_sheet(wb, sheet_name)

        norm_name = self._normalize_name(competition_name)

        # 0. Nếu target_row đã được chỉ định
        if target_row is not None and isinstance(target_row, int) and target_row >= 2:
            pass
        else:
            target_row = None

        # Tìm xem cuộc thi đã có trong cột 1 chưa
        if target_row is None:
            for r in range(2, ws.max_row + 1):
                c1_val = self._resolve_cell_value(ws.cell(r, 1), wb)
                if c1_val and norm_name and (norm_name in self._normalize_name(str(c1_val)) or self._normalize_name(str(c1_val)) in norm_name):
                    target_row = r
                    break

        # Nếu chưa có, tìm dòng trống đầu tiên hoặc thêm ở cuối
        if target_row is None:
            last_real = 1
            for r in range(2, ws.max_row + 1):
                if any(ws.cell(r, c).value is not None for c in range(1, ws.max_column + 1)):
                    last_real = r
            target_row = last_real + 1

        # Đồng bộ vào trang 'Phân tích và chỉnh sửa' và liên kết công thức sang trang Tổng hợp
        self.sync_review_sheet(wb, ws, target_row, competition_name, custom_data)

        try:
            wb.save(self.file_path)
            print(f"✅ Đã ghi thành công và liên kết công thức vào hàng #{target_row} trong file Excel {self.file_path.name}")
            return target_row
        except PermissionError:
            raise PermissionError(f"File '{self.file_path.name}' đang được mở bởi ứng dụng khác (Microsoft Excel). Vui lòng đóng file trên máy rồi thử lại.")
