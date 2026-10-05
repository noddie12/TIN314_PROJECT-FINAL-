from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class RawPost(BaseModel):
    url: Optional[str] = None
    text: Optional[str] = ""
    time: Optional[str] = None
    likes: Optional[int] = 0
    commentsCount: Optional[int] = 0
    sharesCount: Optional[int] = 0
    media: Optional[List[str]] = Field(default_factory=list)

class Milestone(BaseModel):
    stage: Optional[int] = Field(default=1, description="Số thứ tự vòng thi (1, 2, 3...)")
    name: str = Field(description="Tên giai đoạn/vòng thi (Vòng đơn, Bán kết, Chung kết...)")
    date: str = Field(description="Thời gian diễn ra hoặc hạn nộp (YYYY-MM-DD hoặc khoảng ngày)")
    description: Optional[str] = Field(default="", description="Mô tả nội dung hoặc bài nộp của vòng này")
    status: Optional[str] = Field(default="upcoming", description="Trạng thái: completed | active | upcoming")

class RequiredSkill(BaseModel):
    name: str = Field(description="Tên kỹ năng (ví dụ: Financial Modeling, Public Speaking, Data Analysis...)")
    priority: str = Field(default="must_have", description="must_have hoặc nice_to_have")
    category: Optional[str] = Field(default="General", description="Phân loại: Analytical | Soft Skills | Domain Knowledge | Presentation")

class TeamSize(BaseModel):
    min: Optional[int] = Field(default=1, description="Số thành viên tối thiểu")
    max: Optional[int] = Field(default=4, description="Số thành viên tối đa")
    type: Optional[str] = Field(default="Team", description="Hình thức: Individual | Team | Individual or Team")

class PlaybookInsights(BaseModel):
    challenging_part: Optional[str] = Field(default="", description="Thử thách lớn nhất của cuộc thi")
    common_mistakes: Optional[str] = Field(default="", description="Sai lầm thí sinh tân binh thường mắc phải")
    key_success_factors: Optional[str] = Field(default="", description="Kỹ năng hoặc yếu tố quyết định chiến thắng")
    prep_advice: Optional[str] = Field(default="", description="Lời khuyên chuẩn bị ôn luyện từ cựu thí sinh/quán quân")

class CompetitionDNA(BaseModel):
    id: str = Field(description="Slug định danh duy nhất (ví dụ: calliope-2026-trendx)")
    name: str = Field(description="Tên chính thức của cuộc thi")
    season: Optional[str] = Field(default="", description="Mùa thi hoặc chủ đề (ví dụ: TrendX 2026, Phục Hưng 2023...)")
    organizer: str = Field(description="Đơn vị, trường đại học hoặc CLB tổ chức")
    category: str = Field(description="Lĩnh vực chính (Business Case, Marketing, Startup, Finance, Research, Debate, Innovation...)")
    short_description: str = Field(description="Mô tả tóm tắt mục tiêu, nội dung chính của cuộc thi")
    eligibility: str = Field(description="Đối tượng tham gia (sinh viên năm mấy, các trường nào, độ tuổi...)")
    deadline: str = Field(description="Hạn cuối đăng ký (YYYY-MM-DD hoặc thời gian cụ thể)")
    duration: Optional[str] = Field(default="", description="Thời gian tổ chức dự kiến (từ tháng nào đến tháng nào)")
    rounds_count: Optional[int] = Field(default=3, description="Tổng số vòng thi")
    rounds_description: Optional[str] = Field(default="", description="Tóm tắt cơ cấu các vòng thi")
    format: Optional[str] = Field(default="Hybrid", description="Online / Offline / Hybrid")
    team_size: TeamSize = Field(default_factory=TeamSize)
    experience_level: Optional[str] = Field(default="Beginner to Intermediate", description="Beginner | Intermediate | Advanced")
    grand_prize: Optional[str] = Field(default="", description="Giải nhất / Quán quân")
    prizes_detail: Optional[str] = Field(default="", description="Chi tiết cơ cấu giải thưởng")
    prizes_breakdown: Optional[Dict[str, Any]] = Field(default=None, description="Phân tích cơ cấu giải thưởng đa chiều (tiền mặt, học bổng, hiện vật, cơ hội, chứng nhận)")
    registration_link: Optional[str] = Field(default="", description="Link đăng ký (Google Form, Website...)")
    source_url: Optional[str] = Field(default="", description="Link Fanpage hoặc bài đăng Facebook gốc")
    required_skills: List[RequiredSkill] = Field(default_factory=list, description="Danh sách kỹ năng cần thiết")
    milestones: List[Milestone] = Field(default_factory=list, description="Lộ trình các mốc thời gian và vòng thi")
    playbook_insights: PlaybookInsights = Field(default_factory=PlaybookInsights, description="Kinh nghiệm thi đấu")
    status: str = Field(default="open", description="open | closing_soon | closed")

    def to_excel_dict(self) -> Dict[str, Any]:
        """Chuyển đổi thành dictionary khớp với các cột trong Excel TAKENOTE"""
        # Định dạng các mốc thời gian dạng text
        milestones_text = " | ".join([f"{m.name}: {m.date}" for m in self.milestones]) if self.milestones else self.duration
        
        # Định dạng hình thức tham gia
        team_str = f"{self.team_size.type} ({self.team_size.min}-{self.team_size.max} người)" if self.team_size else "Cá nhân/Đội"
        format_str = f"{self.format} - {team_str}"

        return {
            "Tên cuộc thi ": self.name,
            "Lĩnh vực ": self.category,
            "Đơn vị tổ chức ": self.organizer,
            "Mô tả ngắn gọn": self.short_description,
            "Đối tượng tham gia ": self.eligibility,
            "Hình thức tham gia ": format_str,
            "Cơ cấu vòng thi ": self.rounds_description or f"{self.rounds_count} vòng",
            "Cơ cấu giải thưởng ": self.grand_prize or self.prizes_detail,
            "Các mốc thời gian ": milestones_text,
            "Mùa thi ": self.season,
            "Deadline đăng ký ": self.deadline,
            "Trạng thái ": "Mở đơn" if self.status == "open" else ("Sắp đóng đơn" if self.status == "closing_soon" else "Đã kết thúc"),
            "Link nguồn chính thức ": self.source_url or self.registration_link
        }
