import json
import sqlite3
from pathlib import Path
from typing import List, Dict, Any, Optional

from pipeline.config import COMPETITIONS_JSON, COMPETITIONS_DB
from pipeline.models import CompetitionDNA

class DatabaseSyncer:
    def __init__(self, json_path: Optional[Path] = None, db_path: Optional[Path] = None):
        self.json_path = json_path or COMPETITIONS_JSON
        self.db_path = db_path or COMPETITIONS_DB
        self._init_sqlite()

    def _init_sqlite(self):
        """Khởi tạo cấu trúc bảng SQLite nếu chưa có."""
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS competitions (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                season TEXT,
                organizer TEXT,
                category TEXT,
                short_description TEXT,
                eligibility TEXT,
                deadline TEXT,
                duration TEXT,
                rounds_count INTEGER,
                format TEXT,
                team_min INTEGER,
                team_max INTEGER,
                team_type TEXT,
                experience_level TEXT,
                grand_prize TEXT,
                registration_link TEXT,
                source_url TEXT,
                status TEXT,
                full_dna_json TEXT,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """)
            
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS milestones (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                competition_id TEXT,
                stage INTEGER,
                name TEXT,
                date TEXT,
                description TEXT,
                status TEXT,
                FOREIGN KEY (competition_id) REFERENCES competitions(id) ON DELETE CASCADE
            )
            """)
            
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS required_skills (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                competition_id TEXT,
                name TEXT,
                priority TEXT,
                category TEXT,
                FOREIGN KEY (competition_id) REFERENCES competitions(id) ON DELETE CASCADE
            )
            """)
            conn.commit()

    def sync_competition(self, dna: CompetitionDNA):
        """Lưu hoặc cập nhật CompetitionDNA vào cả file JSON và SQLite."""
        self.sync_json(dna)
        self.sync_sqlite(dna)

    def sync_json(self, dna: CompetitionDNA):
        """Cập nhật vào data/competitions.json."""
        data: List[Dict[str, Any]] = []
        if self.json_path.exists():
            try:
                with open(self.json_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
            except Exception:
                data = []

        # Kiểm tra xem ID đã tồn tại chưa để cập nhật
        dna_dict = dna.model_dump()
        found = False
        for idx, item in enumerate(data):
            if item.get("id") == dna.id:
                data[idx] = dna_dict
                found = True
                break

        if not found:
            data.append(dna_dict)

        with open(self.json_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        # Xuất file JS để các file HTML tĩnh đọc được ngay cả với giao thức file:///
        js_path = self.json_path.parent / "competitions.js"
        with open(js_path, "w", encoding="utf-8") as f:
            f.write(f"window.COMPETEMATE_DATABASE = {json.dumps(data, ensure_ascii=False, indent=2)};\n")

        print(f"📁 [JSON Sync] Đã lưu vào {self.json_path} và {js_path} (Tổng cộng: {len(data)} cuộc thi)")

    def sync_sqlite(self, dna: CompetitionDNA):
        """Cập nhật vào data/competitions.db."""
        dna_json_str = dna.model_dump_json()

        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # Upsert competition record
            cursor.execute("""
            INSERT INTO competitions (
                id, name, season, organizer, category, short_description,
                eligibility, deadline, duration, rounds_count, format,
                team_min, team_max, team_type, experience_level,
                grand_prize, registration_link, source_url, status,
                full_dna_json, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(id) DO UPDATE SET
                name=excluded.name,
                season=excluded.season,
                organizer=excluded.organizer,
                category=excluded.category,
                short_description=excluded.short_description,
                eligibility=excluded.eligibility,
                deadline=excluded.deadline,
                duration=excluded.duration,
                rounds_count=excluded.rounds_count,
                format=excluded.format,
                team_min=excluded.team_min,
                team_max=excluded.team_max,
                team_type=excluded.team_type,
                experience_level=excluded.experience_level,
                grand_prize=excluded.grand_prize,
                registration_link=excluded.registration_link,
                source_url=excluded.source_url,
                status=excluded.status,
                full_dna_json=excluded.full_dna_json,
                updated_at=CURRENT_TIMESTAMP
            """, (
                dna.id, dna.name, dna.season, dna.organizer, dna.category, dna.short_description,
                dna.eligibility, dna.deadline, dna.duration, dna.rounds_count, dna.format,
                dna.team_size.min, dna.team_size.max, dna.team_size.type, dna.experience_level,
                dna.grand_prize, dna.registration_link, dna.source_url, dna.status,
                dna_json_str
            ))

            # Refresh milestones & skills
            cursor.execute("DELETE FROM milestones WHERE competition_id = ?", (dna.id,))
            for m in dna.milestones:
                cursor.execute("""
                INSERT INTO milestones (competition_id, stage, name, date, description, status)
                VALUES (?, ?, ?, ?, ?, ?)
                """, (dna.id, m.stage, m.name, m.date, m.description, m.status))

            cursor.execute("DELETE FROM required_skills WHERE competition_id = ?", (dna.id,))
            for s in dna.required_skills:
                cursor.execute("""
                INSERT INTO required_skills (competition_id, name, priority, category)
                VALUES (?, ?, ?, ?)
                """, (dna.id, s.name, s.priority, s.category))

            conn.commit()
            print(f"🗄️ [SQLite Sync] Đã đồng bộ vào cơ sở dữ liệu {self.db_path.name}")
