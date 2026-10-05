/**
 * ============================================================================
 * COMPETEMATE APPLICATION LOGIC (Anti-AI-Slop Engineered Standard)
 * Full implementation: Discover · Match · Compete
 * Follows DESIGN_SYSTEM.md, PRODUCT.md, and Anti-AI-Slop Constitution
 * ============================================================================
 */

(function () {
  'use strict';

  // ==========================================================================
  // 1. UNIFIED GEOMETRIC SVG ICON DICTIONARY (Anti-AI-Slop: Zero raw emojis)
  // ==========================================================================
  const ICONS = {
    search: '<svg class="svg-icon" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>',
    bolt: '<svg class="svg-icon" viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>',
    boltSm: '<svg class="svg-icon-sm" viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>',
    clipboard: '<svg class="svg-icon" viewBox="0 0 24 24"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>',
    lightbulb: '<svg class="svg-icon" viewBox="0 0 24 24"><path d="M9 18h6"></path><path d="M10 22h4"></path><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"></path></svg>',
    scale: '<svg class="svg-icon" viewBox="0 0 24 24"><path d="M12 3v18"></path><path d="M3 7l4 8h-8l4-8z"></path><path d="M21 7l4 8h-8l4-8z"></path><path d="M3 7h18"></path></svg>',
    scaleSm: '<svg class="svg-icon-sm" viewBox="0 0 24 24"><path d="M12 3v18"></path><path d="M3 7l4 8h-8l4-8z"></path><path d="M21 7l4 8h-8l4-8z"></path><path d="M3 7h18"></path></svg>',
    building: '<svg class="svg-icon-sm" viewBox="0 0 24 24"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="9" y1="22" x2="9" y2="22.01"></line><line x1="15" y1="22" x2="15" y2="22.01"></line><line x1="9" y1="6" x2="9" y2="6.01"></line><line x1="15" y1="6" x2="15" y2="6.01"></line><line x1="9" y1="10" x2="9" y2="10.01"></line><line x1="15" y1="10" x2="15" y2="10.01"></line><line x1="9" y1="14" x2="9" y2="14.01"></line><line x1="15" y1="14" x2="15" y2="14.01"></line></svg>',
    clock: '<svg class="svg-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>',
    clockSm: '<svg class="svg-icon-sm" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>',
    trophy: '<svg class="svg-icon" viewBox="0 0 24 24"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.45 1-1 1H7c-.55 0-1 .45-1 1v1h12v-1c0-.55-.45-1-1-1h-2c-.55 0-1-.45-1-1v-2.34"></path><path d="M6 4h12v7a6 6 0 0 1-12 0V4z"></path></svg>',
    trophySm: '<svg class="svg-icon-sm" viewBox="0 0 24 24"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.45 1-1 1H7c-.55 0-1 .45-1 1v1h12v-1c0-.55-.45-1-1-1h-2c-.55 0-1-.45-1-1v-2.34"></path><path d="M6 4h12v7a6 6 0 0 1-12 0V4z"></path></svg>',
    rocket: '<svg class="svg-icon" viewBox="0 0 24 24"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path></svg>',
    rocketSm: '<svg class="svg-icon-sm" viewBox="0 0 24 24"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path></svg>',
    check: '<svg class="svg-icon-sm" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>',
    external: '<svg class="svg-icon-sm" viewBox="0 0 24 24"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>',
    starOutline: '<svg class="svg-icon" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>',
    starSolid: '<svg class="svg-icon" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>',
    edit: '<svg class="svg-icon-sm" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>',
    bookmark: '<svg class="svg-icon-sm" viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>',
    link: '<svg class="svg-icon-sm" viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>',
    settings: '<svg class="svg-icon-sm" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>',
    alert: '<svg class="svg-icon-sm" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
    banknote: '<svg class="svg-icon-sm" viewBox="0 0 24 24"><rect x="2" y="6" width="20" height="12" rx="2"></rect><circle cx="12" cy="12" r="3"></circle><line x1="6" y1="12" x2="6.01" y2="12"></line><line x1="18" y1="12" x2="18.01" y2="12"></line></svg>',
    graduation: '<svg class="svg-icon-sm" viewBox="0 0 24 24"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>',
    certificate: '<svg class="svg-icon-sm" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>',
    users: '<svg class="svg-icon-sm" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>',
    user: '<svg class="svg-icon-sm" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>',
    x: '<svg class="svg-icon-sm" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>'
  };

  // ==========================================================================
  // 2. APPLICATION STATE
  // ==========================================================================
  const state = {
    competitions: [],
    selectedCategory: 'all',
    selectedFormat: 'all',
    selectedMode: 'all',
    selectedLevel: 'all',
    selectedStatus: 'all',
    selectedSort: 'match',
    searchQuery: '',
    searchScope: 'direct', // 'direct' (Name, Organizer, Category, Skills) | 'deep' (Includes Full Description, Rounds & Prizes)
    viewMode: 'grid', // 'grid' | 'table'
    activeTab: 'hub', // 'hub' | 'match' | 'journey' | 'playbook' | 'compare'
    displayLimit: 18, // Batch size for progressive card rendering

    // Theme & Language Modes
    theme: 'light', // 'light' | 'dark'
    lang: 'vi', // 'vi' | 'en'

    // Reference Date for Dynamic Timeline & Stage Determination (Default: Machine Real-time)
    referenceDate: toIsoDate(new Date()),
    useRealDeviceDate: true,

    // User Profile for CompeteMatch
    profileConfigured: false,
    profile: {
      name: '',
      level: 'Intermediate',
      categories: ['Business Case & Chiến lược', 'Khởi nghiệp & Đổi mới sáng tạo', 'Tài chính, Ngân hàng & Kiểm toán'],
      skills: [
        'Problem Solving',
        'Critical Thinking',
        'Presentation & Communication',
        'Data Analysis',
        'Teamwork & Collaboration',
        'Slide Design & Storytelling'
      ],
      format: 'all',
      mode: 'all'
    },

    // Journey Tracker (Saved competitions)
    journey: {},

    // Comparison Basket (up to 3 compIds)
    compareList: [],

    // Community Playbook Submissions
    communityPlaybooks: [],

    // Currently selected competition in Winner's Playbook split view
    selectedPlaybookCompId: null,

    // Playbook Search Query
    playbookSearchQuery: ''
  };

  window.state = state;

  // ==========================================================================
  // I18N & LOCALIZATION SYSTEM (Dual Language: Vietnamese & English)
  // Requirement: In English mode, competition names strictly stay in original Vietnamese
  // ==========================================================================
  const I18N = {
    vi: {
      // Navigation
      navHub: 'CompeteHub',
      navMatch: 'CompeteMatch',
      navJourney: 'My Journey',
      navPlaybook: 'Playbook',
      navCompare: 'So sánh',
      navProfile: 'Hồ sơ',

      // Header & Actions
      dateRefTitle: 'Mốc thời gian xác định giai đoạn (Nhấn để đổi ngày)',
      langToggleTitle: 'Chuyển đổi ngôn ngữ / Switch Language (VI / EN)',
      themeToggleTitle: 'Chuyển đổi giao diện Sáng / Tối',
      profileBtnTitle: 'Thiết lập hồ sơ năng lực cá nhân',
      searchQuickTitle: 'Tìm nhanh cuộc thi (Ctrl+K)',

      // Toolbar Search & Scope
      searchPlaceholder: 'Tìm theo tên cuộc thi, ban tổ chức, kỹ năng (ví dụ: Kawai, Business Case, Data Analysis)...',
      resetFilters: 'Đặt lại',
      searchModeLabel: 'Chế độ tìm:',
      scopeDirect: 'Trực tiếp (Tên / BTC)',
      scopeDeep: 'Mở rộng (Toàn bộ mô tả)',
      btnAdvancedFilters: 'Bộ lọc chi tiết',
      sortBy: 'Sắp xếp:',
      sortMatch: 'Độ phù hợp (Match)',
      sortDeadline: 'Hạn chót gần nhất',
      sortName: 'Tên cuộc thi (A - Z)',
      sortPrize: 'Quy mô giải thưởng',

      // Filter Tray
      filterFormatLabel: 'Hình thức:',
      filterFormatAll: 'Tất cả hình thức',
      filterFormatIndividual: 'Cá nhân',
      filterFormatTeam: 'Theo đội',
      filterModeLabel: 'Địa điểm:',
      filterModeAll: 'Online & Offline',
      filterLevelLabel: 'Trình độ:',
      filterLevelAll: 'Mọi cấp độ',
      filterStatusLabel: 'Giai đoạn / Trạng thái:',
      filterStatusAll: 'Tất cả giai đoạn',
      filterStatusOpen: 'Đang mở đơn đăng ký',
      filterStatusClosing: 'Sắp đóng đơn (≤ 5 ngày)',
      filterStatusActive: 'Đang diễn ra các vòng thi',
      filterStatusUpcoming: 'Sắp tới vòng tiếp theo / Chung kết',
      filterStatusClosed: 'Đã hoàn thành mùa 2026',

      // Results & Cards
      resultsLoading: 'Đang tải dữ liệu 106 cuộc thi...',
      resultsCount: (count, total) => `Hiển thị <strong>${count}</strong> / ${total} cuộc thi phù hợp`,
      loadMore: 'Xem thêm cuộc thi',
      noCompetitionsFound: 'Không tìm thấy cuộc thi phù hợp',
      adjustSearchFilter: 'Hãy điều chỉnh từ khóa tìm kiếm hoặc bấm đặt lại bộ lọc.',
      matchScore: 'Match',
      prizeLabel: 'Giải thưởng:',
      compare: 'So sánh',
      compared: 'Đã so sánh',
      dnaDetails: 'Chi tiết DNA',
      saveJourney: 'Lưu vào Journey',
      savedJourney: 'Đã lưu trong Journey',
      removeJourney: 'Bỏ lưu cuộc thi',
      viewOfficial: 'Trang chính thức',

      // Search Action Button
      searchBtn: 'Tìm',

      // CompeteMatch View
      matchTag: 'CÁ NHÂN HÓA NĂNG LỰC',
      matchHeading: 'CompeteMatch: Đấu trường Phù hợp với Bạn',
      matchDesc: 'Hệ thống đối chiếu hồ sơ năng lực thực tế của bạn với yêu cầu của hơn 100 cuộc thi sinh viên hàng đầu.',
      matchTopHeading: 'Top Cuộc thi Phù Hợp Nhất Với Bạn (Best Matches)',
      matchSortHint: 'Xếp hạng tự động theo điểm Match Score',

      // Journey View
      journeyTag: 'HÀNH TRÌNH THI ĐẤU',
      journeyHeading: 'My Journey Tracker',
      journeyDesc: 'Theo dõi tiến độ nộp đơn, các vòng thử thách và hạn chót thi đấu của riêng bạn.',
      journeyExportBtn: 'Xuất file sao lưu (JSON)',
      journeyImportBtn: 'Khôi phục từ file',
      journeyMetricTracking: 'ĐANG THEO DÕI',
      journeyMetricClosingSoon: 'SẮP ĐÓNG ĐƠN (≤ 7 NGÀY)',
      journeyMetricCompeting: 'ĐANG THI ĐẤU',
      journeyMetricCompleted: 'ĐÃ HOÀN THÀNH',
      kanbanColSaved: 'Đã lưu / Quan tâm',
      kanbanColPreparing: 'Đang chuẩn bị đơn',
      kanbanColInProgress: 'Đang dự thi',
      kanbanColCompleted: 'Đã hoàn thành',

      // Winner's Playbook View
      playbookTag: 'BÍ KÍP QUÁN QUÂN',
      playbookHeading: "Winner's Playbook",
      playbookDesc: 'Tổng hợp lời khuyên thực chiến, phân tích cạm bẫy và yếu tố thành công từ các đội thi đạt giải cao.',
      playbookShareBtn: '+ Chia sẻ kinh nghiệm của bạn',
      playbookSearchPlaceholder: 'Tìm kiếm kinh nghiệm, sai lầm cần tránh, mẹo làm đề án...',

      // Compare View
      compareTag: 'ĐỐI CHIẾU TRỰC DIỆN',
      compareHeading: 'Bàn cân Cuộc thi (Compare Basket)',
      compareDesc: 'Đặt tối đa 3 cuộc thi lên cùng một bảng để đối chiếu trực diện 11 chiều kích thông tin cốt lõi.',

      // Profile View
      profileTag: 'HỒ SƠ NĂNG LỰC',
      profileHeading: 'Hồ Sơ Năng Lực Cá Nhân',
      profileDesc: 'Thiết lập danh mục quan tâm, trình độ và năng lực để tối ưu độ chính xác thuật toán CompeteMatch.',
      profileBasicInfoTitle: '1. Thông tin cơ bản & Mục tiêu',
      profileLabelName: 'Tên hoặc Biệt danh',
      profilePlaceholderName: 'Ví dụ: Minh Hoàng, Team Phoenix...',
      profileLabelLevel: 'Trình độ hiện tại',
      levelBeginner: 'Người mới bắt đầu (Beginner / Freshers)',
      levelIntermediate: 'Đã có kinh nghiệm (Intermediate / Contestant)',
      levelAdvanced: 'Kỳ cựu / Đã từng có giải (Advanced / Winner)',
      profileLabelCategories: 'Lĩnh vực quan tâm hàng đầu',
      profileStatSkillCount: 'NĂNG LỰC ĐÃ CHỌN',
      profileStatReadiness: 'ĐỘ SẴN SÀNG',
      profileReadinessReady: 'Sẵn sàng thi đấu',
      profileFrameworkTitle: '2. Khung 30 Năng lực Chuẩn hóa',
      profileFrameworkSubtitle: 'Bấm chọn các năng lực bạn tự tin để hệ thống ghép nối với yêu cầu của từng cuộc thi',
      profileBtnQuickCore: '⚡ Chọn nhanh 10 kỹ năng cốt lõi',
      profileBtnClearAll: '✕ Bỏ chọn tất cả',
      profileSkillSearchPlaceholder: 'Tìm nhanh năng lực (ví dụ: BMC, Định giá, Financial Modeling, Presentation, SQL, Python, AI...)...',
      profileCustomSkillLabel: 'Kỹ năng đặc thù ngoài khung (tùy chọn):',
      profileCustomSkillPlaceholder: 'Ví dụ: Figma, Prompt Engineering, SPSS, Video Editing (ngăn cách bằng dấu phẩy)...',
      profileBtnAddCustomSkill: '+ Thêm kỹ năng riêng',
      profileBtnResetDefaults: 'Khôi phục mặc định',
      profileBtnSaveAndMatch: 'Lưu Hồ Sơ & Quét Điểm Match →',

      // Modals & Extras
      onboardingStep1: 'Bước 1: Tải CV',
      onboardingStep2: 'Bước 2: Xác nhận kỹ năng',
      onboardingStep3: 'Bước 3: Xem kết quả',
      onboardingTag: '1-CLICK CV ONBOARDING',
      onboardingTitle: 'Kích hoạt Hồ sơ CompeteMatch từ CV',
      onboardingDesc: 'Hệ thống tự động đọc CV và trích xuất kỹ năng, kinh nghiệm để tính điểm tương thích với 100+ cuộc thi.',
      cvDropzoneTitle: 'Kéo thả file CV của bạn vào đây',
      cvDropzoneDesc: 'Hỗ trợ định dạng PDF, DOCX, TXT hoặc PNG/JPG',
      cvChooseFileBtn: 'Chọn file từ máy tính',
      cvDragHint: 'hoặc kéo thả file trực tiếp vào khung này',
      cvPasteToggleBtn: 'Hoặc dán nội dung văn bản CV / LinkedIn / Bio ›',
      cvPasteLabel: 'Dán nội dung văn bản CV:',
      cvPastePlaceholder: 'Dán tóm tắt lý lịch, kỹ năng, kinh nghiệm làm việc hoặc đường link LinkedIn vào đây...',
      cvAnalyzeBtn: 'Phân tích & Quét kỹ năng từ văn bản →',
      cvDetectedTitle: 'Kỹ năng nhận diện từ CV:',
      profileLabelNameReq: 'Họ và tên (*)',
      profileLabelSchool: 'Trường Đại học / Đơn vị (*)',
      profilePlaceholderSchool: 'Ví dụ: ĐH Ngoại Thương, ĐH Bách Khoa, NEU...',
      profilePopularSkillsLabel: 'Kỹ năng phổ biến (Chọn nhanh):',
      modalBtnFillLater: 'Bỏ qua, thiết lập sau',
      modalBtnSaveProfile: 'Lưu & Bắt đầu ghép nối cuộc thi →',
      palettePlaceholder: 'Gõ tên cuộc thi, ban tổ chức, lĩnh vực hoặc kỹ năng để tìm nhanh...',
      submitPlaybookTag: 'ĐÓNG GÓP KINH NGHIỆM',
      submitPlaybookTitle: 'Chia sẻ Bí kíp Thi đấu với Cộng đồng',
      spCompNameLabel: 'Tên cuộc thi (*):',
      spCompNamePlaceholder: 'Ví dụ: Kawai 2026, HSBC Business Case...',
      spAuthorLabel: 'Tên của bạn hoặc Tên đội thi:',
      spAuthorPlaceholder: 'Ví dụ: Minh Anh (Team Alpha)',
      spAchievementLabel: 'Thành tích đạt được (nếu có):',
      spAchievementPlaceholder: 'Ví dụ: Quán quân, Top 4 Chung kết...',
      spChallengeLabel: 'Thách thức lớn nhất trong cuộc thi:',
      spChallengePlaceholder: 'Giai đoạn nào khó khăn nhất và cách đội bạn vượt qua...',
      spMistakesLabel: 'Sai lầm thí sinh mới hay mắc phải:',
      spMistakesPlaceholder: 'Những cạm bẫy cần tránh khi làm đề án / thuyết trình...',
      spSkillsLabel: 'Kỹ năng then chốt tạo nên thành công:',
      spSkillsPlaceholder: 'Ví dụ: Financial Modeling, Storytelling, Phân tích dữ liệu...',
      spAdviceLabel: 'Lời khuyên chuẩn bị cho đội thi (*):',
      spAdvicePlaceholder: 'Bí kíp thực chiến đắt giá nhất bạn muốn gửi gắm...',
      cancelBtn: 'Hủy bỏ',
      submitPlaybookBtn: 'Đăng tải Kinh nghiệm →',
      dateRefTag: 'MỐC THỜI GIAN THỰC CHIẾN',
      dateRefTitleHeading: 'Cài đặt Mốc Thời Gian Tham Chiếu',
      dateRefModalDesc: 'Hệ thống dùng mốc thời gian này để tính số ngày còn lại đến hạn nộp đơn và phân loại giai đoạn (Đang mở đơn, Sắp đóng đơn, Đang thi, v.v.).',
      dateRefModeLabel: 'Chọn chế độ thời gian:',
      dateRefRealTitle: 'Thời gian thực tế (Hôm nay)',
      dateRefRealDesc: 'Tự động lấy ngày giờ thực tế từ đồng hồ hệ thống.',
      dateRefCustomTitle: 'Thời gian tùy chỉnh (Mô phỏng)',
      dateRefCustomDesc: 'Chọn ngày bất kỳ trong mùa giải 2026 để kiểm tra trạng thái.',
      closeModalBtn: 'Đóng',
      dateRefApplyBtn: 'Áp dụng mốc thời gian',

      // Table View Headers
      tableThIdx: '#',
      tableThName: 'Tên cuộc thi / Mùa giải',
      tableThCategory: 'Lĩnh vực',
      tableThOrganizer: 'Đơn vị tổ chức',
      tableThMatch: 'Độ phù hợp',
      tableThDeadline: 'Hạn đăng ký',
      tableThPrize: 'Giải thưởng',
      tableThAction: 'Thao tác',

      // Profile Activation Banner
      pabTag: 'COMPETEMATCH PROFILER',
      pabSubUnconfigured: 'Cá nhân hóa thứ hạng cuộc thi theo thế mạnh của bạn',
      pabTitleUnconfigured: 'Khám phá cuộc thi phù hợp nhất với năng lực của bạn',
      pabDescUnconfigured: 'Tải lên CV (1-Click) hoặc chọn nhanh bộ kỹ năng để hệ thống tự động quét và tính toán điểm tương thích <strong>Match Score</strong> cho toàn bộ cuộc thi.',
      pabUploadCvBtn: 'Tải lên CV (1-Click) →',
      pabQuickSetupBtn: 'Thiết lập nhanh 30s',
      pabConfiguredBadge: '✓ HỒ SƠ ĐÃ KÍCH HOẠT',
      pabDefaultName: 'Thí sinh',
      pabSkillsCountText: (level, count) => `(${level} · ${count} kỹ năng đã kích hoạt)`,
      pabUpdateBtn: 'Cập nhật hồ sơ & CV',

      // Competition DNA Modal
      dnaOrganizedBy: 'Tổ chức bởi:',
      dnaMatchAssessmentTitle: 'Đánh giá độ phù hợp với hồ sơ của bạn',
      dnaMatchScoreLabel: 'Mức độ phù hợp',
      dnaAdjustProfileBtn: 'Tinh chỉnh hồ sơ',
      dnaMatchedStrengths: (count) => `Điểm mạnh trùng khớp (${count})`,
      dnaMissingSkills: (count) => `Kỹ năng cần bổ sung (${count})`,
      dnaClickToAddSkill: '(Nhấn + để thêm vào hồ sơ)',
      dnaAllSkillsMet: 'Bạn đã đáp ứng đủ toàn bộ kỹ năng yêu cầu.',
      dnaNoMatchingSkills: 'Chưa có kỹ năng phù hợp trong hồ sơ.',
      dnaNoSkillData: 'Chưa công bố yêu cầu kỹ năng.',
      dnaDeadlineLabel: 'Hạn đăng ký',
      dnaCurrentStageLabel: 'Giai đoạn hiện tại',
      dnaFormatLevelLabel: 'Hình thức & Trình độ',
      dnaPrizeSpectrumLabel: 'Cơ cấu giải thưởng',
      dnaRoundsTeamSize: (rounds, min, max) => `${rounds} vòng thi · ${min === max ? `${min} thành viên` : `${min} - ${max} thành viên`}`,
      dnaAboutTitle: 'Giới thiệu & Mục tiêu cuộc thi',
      dnaEligibilityTitle: 'Đối tượng tham gia (Eligibility)',
      dnaSkillsTitle: 'Ma trận kỹ năng yêu cầu (Required Skills)',
      dnaTimelineTitle: 'Lộ trình vòng thi (Competition Milestones)',
      dnaJudgingTitle: 'Tiêu chí chấm điểm (Judging Criteria)',
      dnaPrizeDetailedTitle: 'Cơ cấu giải thưởng đa chiều',
      dnaPlaybookTitle: 'Winner\'s Playbook: Lời khuyên chuẩn bị',
      dnaOfficialLinksTitle: 'Tài liệu & Liên kết chính thức',
      dnaBtnSave: 'Lưu vào Journey',
      dnaBtnSaved: 'Đã lưu Journey',
      dnaBtnCompare: 'Thêm vào So sánh',
      dnaBtnInCompare: 'Đã trong So sánh',
      dnaBtnApply: 'Đăng ký tham gia ngay',
      dnaBtnClose: 'Đóng',
      dnaSkillCore: 'Cốt lõi',
      dnaSkillRecommended: 'Khuyến nghị',
      dnaMilestoneActive: 'ĐANG DIỄN RA',
      dnaMilestoneClosed: 'Đã kết thúc',
      dnaMilestoneUpcoming: 'Sắp tới',

      // Request Banner & Modal (Ref: Image 2)
      bannerSub: 'Chung tay phát triển danh sách',
      bannerTitle: 'Chưa tìm thấy cuộc thi của bạn?',
      bannerDesc: 'Gửi tên cuộc thi cho CompeteMate — chúng mình sẽ cập nhật trong 24h.',
      bannerBtn: 'Gửi yêu cầu ngay ›',
      reqModalTitle: 'Đề xuất bổ sung cuộc thi mới',
      reqModalDesc: 'CompeteMate sẽ kiểm duyệt và nạp dữ liệu chi tiết trong vòng 24h.',
      reqModalName: 'Tên cuộc thi (*)',
      reqModalOrg: 'Ban tổ chức / Đơn vị chủ trì',
      reqModalLink: 'Đường link fanpage hoặc website chính thức',
      reqModalNotes: 'Ghi chú thêm (thời gian mở đơn, giải thưởng...)',
      reqModalSubmit: 'Gửi đề xuất cuộc thi →',
      toastReqSuccess: '✓ Cảm ơn bạn! Đề xuất cuộc thi đã được gửi. Chúng mình sẽ cập nhật trong 24h.',

      // Toasts
      toastThemeDark: 'Đã chuyển sang giao diện Tối (Dark mode)',
      toastThemeLight: 'Đã chuyển sang giao diện Sáng (Light mode)',
      toastLangVi: 'Đã chuyển sang giao diện Tiếng Việt',
      toastLangEn: 'Switched to English interface'
    },
    en: {
      // Navigation
      navHub: 'CompeteHub',
      navMatch: 'CompeteMatch',
      navJourney: 'My Journey',
      navPlaybook: 'Playbook',
      navCompare: 'Compare',
      navProfile: 'Profile',

      // Header & Actions
      dateRefTitle: 'Timeline Stage Reference Date (Click to change)',
      langToggleTitle: 'Switch Language (VI / EN)',
      themeToggleTitle: 'Toggle Dark / Light Theme',
      profileBtnTitle: 'Configure personal competency profile',
      searchQuickTitle: 'Quick competition search (Ctrl+K)',

      // Toolbar Search & Scope
      searchPlaceholder: 'Search by competition name, organizer, skills (e.g. Kawai, Business Case, Data Analysis)...',
      resetFilters: 'Reset',
      searchModeLabel: 'Search Mode:',
      scopeDirect: 'Direct (Name / Org)',
      scopeDeep: 'Extended (Full details)',
      btnAdvancedFilters: 'Advanced Filters',
      sortBy: 'Sort by:',
      sortMatch: 'Best Match',
      sortDeadline: 'Nearest Deadline',
      sortName: 'Name (A - Z)',
      sortPrize: 'Prize Pool Size',

      // Filter Tray
      filterFormatLabel: 'Format:',
      filterFormatAll: 'All formats',
      filterFormatIndividual: 'Individual',
      filterFormatTeam: 'Team',
      filterModeLabel: 'Location:',
      filterModeAll: 'Online & Offline',
      filterLevelLabel: 'Level:',
      filterLevelAll: 'All levels',
      filterStatusLabel: 'Stage / Status:',
      filterStatusAll: 'All stages',
      filterStatusOpen: 'Registration open',
      filterStatusClosing: 'Closing soon (≤ 5 days)',
      filterStatusActive: 'Active rounds',
      filterStatusUpcoming: 'Upcoming rounds / Finale',
      filterStatusClosed: 'Season completed',

      // Results & Cards
      resultsLoading: 'Loading 106 competitions...',
      resultsCount: (count, total) => `Showing <strong>${count}</strong> / ${total} matching competitions`,
      loadMore: 'Load more competitions',
      noCompetitionsFound: 'No matching competitions found',
      adjustSearchFilter: 'Please adjust your search keywords or reset filters.',
      matchScore: 'Match',
      prizeLabel: 'Prize:',
      compare: 'Compare',
      compared: 'Compared',
      dnaDetails: 'DNA Details',
      saveJourney: 'Save to Journey',
      savedJourney: 'Saved in Journey',
      removeJourney: 'Remove from Journey',
      viewOfficial: 'Official Site',

      // Search Action Button
      searchBtn: 'Search',

      // CompeteMatch View
      matchTag: 'COMPETENCY PERSONALIZATION',
      matchHeading: 'CompeteMatch: Competitions Tailored for You',
      matchDesc: 'Matching your actual skills and profile against requirements of 100+ premier student competitions.',
      matchTopHeading: 'Top Recommended Competitions (Best Matches)',
      matchSortHint: 'Ranked automatically by Match Score',

      // Journey View
      journeyTag: 'COMPETITION JOURNEY',
      journeyHeading: 'My Journey Tracke',
      journeyDesc: 'Track application deadlines, active challenge rounds, and personalized action items.',
      journeyExportBtn: 'Export Backup (JSON)',
      journeyImportBtn: 'Import from File',
      journeyMetricTracking: 'TRACKING',
      journeyMetricClosingSoon: 'CLOSING SOON (≤ 7 DAYS)',
      journeyMetricCompeting: 'COMPETING',
      journeyMetricCompleted: 'COMPLETED',
      kanbanColSaved: 'Saved / Interested',
      kanbanColPreparing: 'Preparing Application',
      kanbanColInProgress: 'Competing',
      kanbanColCompleted: 'Completed',

      // Winner's Playbook View
      playbookTag: "WINNER'S PLAYBOOK",
      playbookHeading: "Winner's Playbook",
      playbookDesc: 'Real-world advice, common pitfall analysis, and critical success factors from podium winners.',
      playbookShareBtn: '+ Share your experience',
      playbookSearchPlaceholder: 'Search experience, pitfalls to avoid, case study tips...',

      // Compare View
      compareTag: 'SIDE-BY-SIDE EVALUATION',
      compareHeading: 'Competition Comparison Basket',
      compareDesc: 'Place up to 3 competitions side-by-side across 11 comprehensive criteria.',

      // Profile View
      profileTag: 'COMPETENCY PROFILE',
      profileHeading: 'Personal Competency Profile',
      profileDesc: 'Set your target categories, experience level, and verified competencies to calibrate CompeteMatch accuracy.',
      profileBasicInfoTitle: '1. Basic Information & Goals',
      profileLabelName: 'Name or Nickname',
      profilePlaceholderName: 'E.g. Minh Hoang, Team Phoenix...',
      profileLabelLevel: 'Experience Level',
      levelBeginner: 'Beginner / Freshers',
      levelIntermediate: 'Experienced / Contestant',
      levelAdvanced: 'Veteran / Previous Winner',
      profileLabelCategories: 'Top Preferred Categories',
      profileStatSkillCount: 'SELECTED COMPETENCIES',
      profileStatReadiness: 'READINESS',
      profileReadinessReady: 'Competition Ready',
      profileFrameworkTitle: '2. 30 Canonical Competencies Framework',
      profileFrameworkSubtitle: 'Check competencies you are confident in to match against competition requirements',
      profileBtnQuickCore: '⚡ Quick select 10 core skills',
      profileBtnClearAll: '✕ Clear all',
      profileSkillSearchPlaceholder: 'Quick find competencies (e.g. BMC, Valuation, Financial Modeling, Presentation, SQL, Python, AI...)...',
      profileCustomSkillLabel: 'Custom specialized skills (optional):',
      profileCustomSkillPlaceholder: 'E.g. Figma, Prompt Engineering, SPSS, Video Editing (comma separated)...',
      profileBtnAddCustomSkill: '+ Add custom skill',
      profileBtnResetDefaults: 'Reset to Defaults',
      profileBtnSaveAndMatch: 'Save Profile & Calculate Match →',

      // Modals & Extras
      onboardingStep1: 'Step 1: Upload CV',
      onboardingStep2: 'Step 2: Verify Skills',
      onboardingStep3: 'Step 3: View Results',
      onboardingTag: '1-CLICK CV ONBOARDING',
      onboardingTitle: 'Activate CompeteMatch Profile from CV',
      onboardingDesc: 'Automatically parse CV text to extract skills and compute Match Scores across 100+ competitions.',
      cvDropzoneTitle: 'Drag and drop your CV file here',
      cvDropzoneDesc: 'Supports PDF, DOCX, TXT, or PNG/JPG formats',
      cvChooseFileBtn: 'Choose file from computer',
      cvDragHint: 'or drag and drop your file into this box',
      cvPasteToggleBtn: 'Or paste CV / LinkedIn / Bio text ›',
      cvPasteLabel: 'Paste CV text content:',
      cvPastePlaceholder: 'Paste resume summary, skills, experience, or LinkedIn bio here...',
      cvAnalyzeBtn: 'Analyze & Extract Skills from Text →',
      cvDetectedTitle: 'Skills extracted from CV:',
      profileLabelNameReq: 'Full Name (*)',
      profileLabelSchool: 'University / Organization (*)',
      profilePlaceholderSchool: 'E.g. Foreign Trade University, HUST, NEU...',
      profilePopularSkillsLabel: 'Popular Skills (Quick select):',
      modalBtnFillLater: 'Skip, set up later',
      modalBtnSaveProfile: 'Save & Start Matching Competitions →',
      palettePlaceholder: 'Type competition name, organizer, field, or skills to search...',
      submitPlaybookTag: 'COMMUNITY CONTRIBUTION',
      submitPlaybookTitle: 'Share Competition Secrets with Community',
      spCompNameLabel: 'Competition Name (*):',
      spCompNamePlaceholder: 'E.g. Kawai 2026, HSBC Business Case...',
      spAuthorLabel: 'Your Name or Team Name:',
      spAuthorPlaceholder: 'E.g. Minh Anh (Team Alpha)',
      spAchievementLabel: 'Achievement / Award (if any):',
      spAchievementPlaceholder: 'E.g. Champion, Top 4 Finalist...',
      spChallengeLabel: 'Biggest challenge in the competition:',
      spChallengePlaceholder: 'Which stage was hardest and how did your team overcome it...',
      spMistakesLabel: 'Common mistakes new participants make:',
      spMistakesPlaceholder: 'Pitfalls to avoid in proposals or presentations...',
      spSkillsLabel: 'Critical skills that drove success:',
      spSkillsPlaceholder: 'E.g. Financial Modeling, Storytelling, Data Analysis...',
      spAdviceLabel: 'Preparation advice for teams (*):',
      spAdvicePlaceholder: 'Most valuable practical tip you want to pass on...',
      cancelBtn: 'Cancel',
      submitPlaybookBtn: 'Publish Experience →',
      dateRefTag: 'TIMELINE REFERENCE',
      dateRefTitleHeading: 'Timeline Reference Date Settings',
      dateRefModalDesc: 'Used to calculate days remaining until registration deadline and determine stage classification (Open, Closing Soon, Active, etc.).',
      dateRefModeLabel: 'Select time mode:',
      dateRefRealTitle: 'Real-time (Today)',
      dateRefRealDesc: 'Automatically retrieves current date from system clock.',
      dateRefCustomTitle: 'Custom simulated date',
      dateRefCustomDesc: 'Select any date in 2026 season to simulate competition stages.',
      closeModalBtn: 'Close',
      dateRefApplyBtn: 'Apply Reference Date',

      // Table View Headers
      tableThIdx: '#',
      tableThName: 'Competition / Season',
      tableThCategory: 'Category',
      tableThOrganizer: 'Organizer',
      tableThMatch: 'Match Score',
      tableThDeadline: 'Deadline',
      tableThPrize: 'Prize Pool',
      tableThAction: 'Action',

      // Profile Activation Banner
      pabTag: 'COMPETEMATCH PROFILER',
      pabSubUnconfigured: 'Personalize competition rankings to your strengths',
      pabTitleUnconfigured: 'Discover competitions perfectly matched to your skills',
      pabDescUnconfigured: 'Upload your CV (1-Click) or pick your key skills to automatically calculate <strong>Match Scores</strong> across all competitions.',
      pabUploadCvBtn: 'Upload CV (1-Click) →',
      pabQuickSetupBtn: 'Quick Setup (30s)',
      pabConfiguredBadge: '✓ PROFILE ACTIVATED',
      pabDefaultName: 'Candidate',
      pabSkillsCountText: (level, count) => `(${level} · ${count} active skills)`,
      pabUpdateBtn: 'Update Profile & CV',

      // Competition DNA Modal
      dnaOrganizedBy: 'Organized by:',
      dnaMatchAssessmentTitle: 'Match Assessment against your profile',
      dnaMatchScoreLabel: 'Match Score',
      dnaAdjustProfileBtn: 'Adjust Profile',
      dnaMatchedStrengths: (count) => `Matched Strengths (${count})`,
      dnaMissingSkills: (count) => `Skills to Build (${count})`,
      dnaClickToAddSkill: '(Click + to add to profile)',
      dnaAllSkillsMet: 'You meet all required skills.',
      dnaNoMatchingSkills: 'No matching skills found in your profile.',
      dnaNoSkillData: 'Skill requirements not yet published.',
      dnaDeadlineLabel: 'Registration Deadline',
      dnaCurrentStageLabel: 'Current Stage',
      dnaFormatLevelLabel: 'Format & Level',
      dnaPrizeSpectrumLabel: 'Prize Spectrum',
      dnaRoundsTeamSize: (rounds, min, max) => `${rounds} rounds · ${min === max ? `${min} member` : `${min} - ${max} members`}`,
      dnaAboutTitle: 'About & Competition Goals',
      dnaEligibilityTitle: 'Eligibility & Target Participants',
      dnaSkillsTitle: 'Required Skills Matrix',
      dnaTimelineTitle: 'Competition Milestones & Timeline',
      dnaJudgingTitle: 'Judging Criteria & Scoring Breakdown',
      dnaPrizeDetailedTitle: 'Detailed Prize Spectrum',
      dnaPlaybookTitle: 'Winner\'s Playbook: Preparation Advice',
      dnaOfficialLinksTitle: 'Official Links & Documents',
      dnaBtnSave: 'Save to Journey',
      dnaBtnSaved: 'Saved in Journey',
      dnaBtnCompare: 'Add to Compare',
      dnaBtnInCompare: 'In Compare',
      dnaBtnApply: 'Apply on Official Site',
      dnaBtnClose: 'Close',
      dnaSkillCore: 'Core',
      dnaSkillRecommended: 'Recommended',
      dnaMilestoneActive: 'ACTIVE',
      dnaMilestoneClosed: 'Ended',
      dnaMilestoneUpcoming: 'Upcoming',

      // Request Banner & Modal (Ref: Image 2)
      bannerSub: 'Help us grow the list',
      bannerTitle: "Can't find your competition?",
      bannerDesc: "Tell us which one to add — we'll add it within 24h.",
      bannerBtn: 'Submit a request ›',
      reqModalTitle: 'Request to Add a Competition',
      reqModalDesc: 'CompeteMate will review and publish detailed competition DNA within 24h.',
      reqModalName: 'Competition Name (*)',
      reqModalOrg: 'Organizer / University',
      reqModalLink: 'Official Fanpage or Website Link',
      reqModalNotes: 'Additional Notes (timeline, prize pool...)',
      reqModalSubmit: 'Submit Competition Request →',
      toastReqSuccess: "✓ Thank you! Competition request submitted. We'll add it within 24h.",

      // Toasts
      toastThemeDark: 'Switched to Dark theme',
      toastThemeLight: 'Switched to Light theme',
      toastLangVi: 'Đã chuyển sang giao diện Tiếng Việt',
      toastLangEn: 'Switched to English interface'
    }
  };

  function t(key, ...args) {
    const langObj = I18N[state.lang] || I18N.vi;
    const fallbackObj = I18N.vi;
    const val = langObj[key] !== undefined ? langObj[key] : fallbackObj[key];
    if (typeof val === 'function') {
      return val(...args);
    }
    return val !== undefined ? val : key;
  }

  // Category translation map (translates domain/category labels when in English mode)
  const CATEGORY_TRANSLATIONS = {
    'Khởi nghiệp & Đổi mới sáng tạo': 'Startup & Innovation',
    'Business Case & Chiến lược': 'Business Case & Strategy',
    'Tài chính, Ngân hàng & Kiểm toán': 'Finance, Banking & Audit',
    'Tài chính & Chứng khoán': 'Finance & Securities',
    'Công nghệ & Lập trình': 'Technology & Coding',
    'Khoa học dữ liệu & AI': 'Data Science & AI',
    'Marketing & Truyền thông': 'Marketing & Communications',
    'Chuỗi cung ứng & Logistics': 'Supply Chain & Logistics',
    'Quản trị & MT': 'Management Trainee & Leadership',
    'Management Trainee': 'Management Trainee',
    'Tranh biện & Hùng biện': 'Debate & Public Speaking',
    'Nghiên cứu khoa học': 'Academic Research',
    'Môi trường & ESG': 'Environment & ESG',
    'Thiết kế & Sáng tạo': 'Design & Creative',
    'Khác': 'Other'
  };

  function formatCategoryDisplay(cat) {
    if (!cat) return state.lang === 'en' ? 'General' : 'Chung';
    if (state.lang === 'en') {
      if (CATEGORY_TRANSLATIONS[cat]) return CATEGORY_TRANSLATIONS[cat];
      for (const [viKey, enVal] of Object.entries(CATEGORY_TRANSLATIONS)) {
        if (cat.toLowerCase().includes(viKey.toLowerCase())) return enVal;
      }
    }
    return cat;
  }

  // --------------------------------------------------------------------------
  // THEME MANAGEMENT (Dark / Light Mode with Electric Indigo Accent)
  // --------------------------------------------------------------------------
  function initTheme() {
    const saved = localStorage.getItem('competemate_theme');
    if (saved === 'dark' || saved === 'light') {
      state.theme = saved;
    } else {
      state.theme = 'light';
    }
    applyTheme(state.theme, false);
  }

  function applyTheme(newTheme, showToastMsg = false) {
    state.theme = newTheme === 'dark' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', state.theme);
    try {
      localStorage.setItem('competemate_theme', state.theme);
    } catch (e) {
      // LocalStorage access may be restricted
    }

    const themeBtn = document.getElementById('themeToggleBtn');
    if (themeBtn) {
      themeBtn.setAttribute('title', state.theme === 'dark'
        ? (state.lang === 'en' ? 'Switch to Light theme' : 'Chuyển sang giao diện Sáng')
        : (state.lang === 'en' ? 'Switch to Dark theme' : 'Chuyển sang giao diện Tối'));
      themeBtn.setAttribute('aria-label', state.theme === 'dark' ? 'Switch to Light theme' : 'Chuyển sang giao diện Tối');
    }

    const sunIcon = document.querySelector('.theme-icon-sun');
    const moonIcon = document.querySelector('.theme-icon-moon');
    if (sunIcon && moonIcon) {
      sunIcon.style.display = state.theme === 'dark' ? 'inline-block' : 'none';
      moonIcon.style.display = state.theme === 'dark' ? 'none' : 'inline-block';
    }

    if (showToastMsg && typeof showToast === 'function') {
      showToast(state.theme === 'dark' ? t('toastThemeDark') : t('toastThemeLight'));
    }
  }

  let _lastThemeToggle = 0;
  function toggleTheme() {
    const now = Date.now();
    if (now - _lastThemeToggle < 100) return;
    _lastThemeToggle = now;
    applyTheme(state.theme === 'dark' ? 'light' : 'dark', true);
  }

  // --------------------------------------------------------------------------
  // LANGUAGE MANAGEMENT (VI / EN Dual Mode)
  // Rule: Competition names are kept in original Vietnamese form in both modes
  // --------------------------------------------------------------------------
  function initLanguage() {
    const saved = localStorage.getItem('competemate_lang');
    if (saved === 'en' || saved === 'vi') {
      state.lang = saved;
    } else {
      state.lang = 'vi';
    }
    applyLanguage(state.lang, false);
  }

  function applyLanguage(newLang, showToastMsg = false) {
    state.lang = newLang === 'en' ? 'en' : 'vi';
    try {
      localStorage.setItem('competemate_lang', state.lang);
    } catch (e) {
      // LocalStorage access may be restricted
    }

    const langDisplay = document.getElementById('langDisplay');
    if (langDisplay) {
      langDisplay.textContent = state.lang.toUpperCase();
    }

    const pillEn = document.getElementById('langPillEn');
    const pillVi = document.getElementById('langPillVi');
    if (pillEn && pillVi) {
      if (state.lang === 'en') {
        pillEn.classList.add('is-active');
        pillVi.classList.remove('is-active');
      } else {
        pillVi.classList.add('is-active');
        pillEn.classList.remove('is-active');
      }
    }

    const langBtn = document.getElementById('langToggleBtn');
    if (langBtn) {
      langBtn.setAttribute('title', state.lang === 'en' ? 'Switch to Vietnamese' : 'Chuyển sang Tiếng Anh (Switch to English)');
      langBtn.setAttribute('aria-label', state.lang === 'en' ? 'Switch to Vietnamese' : 'Chuyển sang Tiếng Anh');
    }

    const themeBtn = document.getElementById('themeToggleBtn');
    if (themeBtn) {
      themeBtn.setAttribute('title', state.theme === 'dark'
        ? (state.lang === 'en' ? 'Switch to Light theme' : 'Chuyển sang giao diện Sáng')
        : (state.lang === 'en' ? 'Switch to Dark theme' : 'Chuyển sang giao diện Tối'));
      themeBtn.setAttribute('aria-label', state.theme === 'dark' ? 'Switch to Light theme' : 'Chuyển sang giao diện Tối');
    }

    updateStaticTextsForLanguage();

    renderCategoryFilterPills();
    renderAll();

    if (showToastMsg && typeof showToast === 'function') {
      showToast(state.lang === 'en' ? t('toastLangEn') : t('toastLangVi'));
    }
  }

  let _lastLangToggle = 0;
  function toggleLanguage() {
    const now = Date.now();
    if (now - _lastLangToggle < 100) return;
    _lastLangToggle = now;
    applyLanguage(state.lang === 'vi' ? 'en' : 'vi', true);
  }

  function setLanguage(newLang) {
    if (state.lang === newLang) return;
    applyLanguage(newLang, true);
  }

  function updateStaticTextsForLanguage() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      const translated = t(key);
      if (translated && translated !== key) {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.value = translated;
        } else {
          el.textContent = translated;
        }
      }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.dataset.i18nPlaceholder;
      const translated = t(key);
      if (translated && translated !== key) {
        el.setAttribute('placeholder', translated);
      }
    });
  }

  window.toggleTheme = toggleTheme;
  window.toggleLanguage = toggleLanguage;
  window.setLanguage = setLanguage;

  // ==========================================================================
  // SKILLS TAXONOMY, DOMAINS & SYNONYM MAPPING ENGINE
  // ==========================================================================

  // 30 In-Demand Core Skills across 100 Real Competitions
  // 6 Strategic Pillars of Student Competitions
  const CANONICAL_DOMAINS = [
    {
      id: 'all',
      name: 'Tất cả năng lực',
      shortName: 'Tất cả (30)',
      desc: 'Toàn bộ 30 năng lực chuẩn hóa bao trùm 100% kỹ năng & công cụ từ 106 cuộc thi'
    },
    {
      id: 'strategy',
      name: 'Chiến lược & Tư duy',
      shortName: 'Chiến lược (5)',
      desc: 'Tư duy logic, giải quyết case study, phản biện và đổi mới sáng tạo'
    },
    {
      id: 'business',
      name: 'Kinh doanh & Khởi nghiệp',
      shortName: 'Kinh doanh (5)',
      desc: 'Mô hình kinh doanh (BMC), nghiên cứu thị trường, MVP và gọi vốn đầu tư'
    },
    {
      id: 'finance',
      name: 'Tài chính & Dữ liệu',
      shortName: 'Tài chính (4)',
      desc: 'Phân tích tài chính, định giá, kế toán, quản trị rủi ro và phân tích dữ liệu'
    },
    {
      id: 'tech',
      name: 'Công nghệ & AI',
      shortName: 'Công nghệ & AI (3)',
      desc: 'Lập trình phần mềm, ứng dụng AI/Prompt Engineering và thiết kế UI/UX'
    },
    {
      id: 'presentation',
      name: 'Thuyết trình & Marketing',
      shortName: 'Thuyết trình (5)',
      desc: 'Thuyết trình, thiết kế slide, tranh biện, MC và Marketing tăng trưởng'
    },
    {
      id: 'soft_skills',
      name: 'Quản trị & Thực thi',
      shortName: 'Quản trị (8)',
      desc: 'Làm việc nhóm, quản lý dự án, nhân sự, chuỗi cung ứng, ngoại ngữ và ESG'
    }
  ];

  // 30 Standardized Canonical Competencies across 100 Competitions
  const CANONICAL_COMPETENCIES = [
    // --- 1. CHIẾN LƯỢC & TƯ DUY (Strategy & Thinking) ---
    {
      id: 'problem_solving',
      domain: 'strategy',
      name: 'Problem Solving',
      labelVi: 'Giải quyết vấn đề phức tạp',
      subsumes: ['Analytical Problem Solving', 'Root cause analysis', 'Xử lý khủng hoảng', 'Tư duy logic', 'Xử lý tình huống linh hoạt'],
      keywords: ['problem solving', 'giai quyet van de', 'xu ly van de', 'analytical problem', 'logic', 'root cause', 'giai phap', 'xu ly tinh huong', 'problem'],
      isCore: true
    },
    {
      id: 'critical_thinking',
      domain: 'strategy',
      name: 'Critical Thinking',
      labelVi: 'Tư duy phản biện & Đánh giá logic',
      subsumes: ['Analytical Thinking', 'Tư duy phân tích', 'Lập luận logic', 'Đánh giá đa chiều', 'Phản biện sắc bén'],
      keywords: ['critical thinking', 'phan bien', 'analytical thinking', 'tu duy phan bien', 'tu duy phan tich', 'danh gia', 'lap luan logic', 'critical', 'analytical'],
      isCore: true
    },
    {
      id: 'strategic_thinking',
      domain: 'strategy',
      name: 'Strategic Thinking',
      labelVi: 'Tư duy chiến lược & Định vị',
      subsumes: ['Strategic Planning', 'Hoạch định chiến lược', 'Định vị thương hiệu', 'Phân tích SWOT/PESTLE', 'Tầm nhìn dài hạn & Business Acumen'],
      keywords: ['strategic thinking', 'chien luoc', 'strategic', 'dinh vi', 'tam nhin', 'hoach dinh', 'swot', 'pestle', 'tam nhin dai han', 'business acumen', 'business analysis'],
      isCore: true
    },
    {
      id: 'business_case_analysis',
      domain: 'strategy',
      name: 'Business Case Analysis',
      labelVi: 'Phân tích tình huống kinh doanh & Nghiên cứu',
      subsumes: ['Case Study Analysis', 'Giải case kinh doanh', 'Framework tư vấn', 'Bóc tách đề tài học thuật', 'Kinh tế vi mô & vĩ mô', 'Viết báo cáo chuyên sâu'],
      keywords: ['business case', 'case study', 'case analysis', 'giai case', 'tinh huong kinh doanh', 'framework', 'kinh te vi mo', 'kinh te vi mo', 'policy analysis', 'economic', 'research & analysis', 'academic research', 'case writing', 'viet bao cao', 'technical writing', 'nghien cuu & tim toi'],
      isCore: true
    },
    {
      id: 'design_thinking',
      domain: 'strategy',
      name: 'Design Thinking & Innovation',
      labelVi: 'Tư duy thiết kế & Sáng tạo ý tưởng',
      subsumes: ['Creativity & Innovation', 'Ideation', 'Phát triển ý tưởng', 'Brainstorming', 'Khác biệt hóa giá trị', 'Bản sắc & Văn hóa sáng tạo'],
      keywords: ['design thinking', 'creativity', 'innovation', 'sang tao', 'doi moi', 'ideation', 'brainstorming', 'y tuong', 'creative thinking', 'doi moi sang tao', 'cultural industry', 'cultural understanding', 'ban sac'],
      isCore: false
    },

    // --- 2. KINH DOANH, KHỞI NGHIỆP & SẢN PHẨM (Business & Innovation) ---
    {
      id: 'business_model',
      domain: 'business',
      name: 'Business Model Canvas (BMC)',
      labelVi: 'Mô hình kinh doanh & Đổi mới mô hình',
      subsumes: ['Lean Canvas', 'Value Proposition', 'Xây dựng mô hình doanh thu', 'Cấu trúc giá trị', 'Business Modeling'],
      keywords: ['business model', 'mo hinh kinh doanh', 'bmc', 'lean canvas', 'value proposition', 'business modeling', 'mo hinh doanh thu'],
      isCore: true
    },
    {
      id: 'business_planning',
      domain: 'business',
      name: 'Business Planning & Proposal',
      labelVi: 'Lập kế hoạch kinh doanh & Đề án thực thi',
      subsumes: ['Viết đề án / Thuyết minh', 'Kế hoạch hành động', 'Go-to-market', 'Roadmap triển khai', 'Tính khả thi dự án', 'Lean Startup'],
      keywords: ['business plan', 'business planning', 'ke hoach kinh doanh', 'lap ke hoach', 'viet de an', 'thuyet minh', 'go-to-market', 'roadmap', 'trien khai', 'kha thi', 'lean startup', 'business strategy & execution', 'kinh doanh nong nghiep'],
      isCore: false
    },
    {
      id: 'market_research',
      domain: 'business',
      name: 'Market Research & Customer Insights',
      labelVi: 'Nghiên cứu thị trường & Thấu hiểu khách hàng',
      subsumes: ['TAM/SAM/SOM', 'Khảo sát người dùng', 'Customer Persona', 'Phân tích đối thủ', 'Nghiên cứu thực địa', 'Đánh giá tiềm năng thị trường'],
      keywords: ['market research', 'nghien cuu thi truong', 'phan tich thi truong', 'customer research', 'khach hang', 'insights', 'khao sat', 'tam/sam/som', 'market sizing', 'doi thu', 'field research', 'thuc dia', 'market analysis', 'market sensitivity', 'nghien cuu nguoi dung', 'tiem nang thi truong'],
      isCore: false
    },
    {
      id: 'mvp_development',
      domain: 'business',
      name: 'MVP & Product Development',
      labelVi: 'Phát triển sản phẩm mẫu MVP & R&D',
      subsumes: ['PoC (Proof of Concept)', 'User Testing', 'Product Management', 'R&D sản phẩm', 'Kiểm thử người dùng'],
      keywords: ['mvp', 'product development', 'san pham mau', 'product management', 'poc', 'user testing', 'thu nghiem', 'r&d', 'nghien cuu va phat trien san pham', 'user research', 'technical understanding'],
      isCore: false
    },
    {
      id: 'pitching_fundraising',
      domain: 'business',
      name: 'Investor Pitching & Gọi vốn',
      labelVi: 'Pitching & Gọi vốn nhà đầu tư',
      subsumes: ['Hồ sơ Investor-ready', 'Thuyết phục nhà đầu tư', 'Pitch Deck structure', 'Định giá startup gọi vốn'],
      keywords: ['pitching', 'pitch', 'goi von', 'nha dau tu', 'fundraising', 'pitch deck', 'investor', 'dau tu', 'keu goi dau tu'],
      isCore: false
    },

    // --- 3. TÀI CHÍNH, KẾ TOÁN & DỮ LIỆU (Finance & Analytics) ---
    {
      id: 'data_analysis',
      domain: 'finance',
      name: 'Data Analysis & Analytics',
      labelVi: 'Phân tích dữ liệu, Thống kê & SQL/Excel',
      subsumes: ['Excel nâng cao', 'SQL & Truy vấn dữ liệu', 'Tableau / Power BI', 'Data Science & Machine Learning cơ bản', 'Thống kê & Định lượng', 'Data Visualization'],
      keywords: ['data analysis', 'data analytics', 'phan tich du lieu', 'so lieu', 'excel', 'sql', 'power bi', 'tableau', 'data interpretation', 'visualization', 'data synthesis', 'research & data', 'thong ke', 'data science', 'statistical', 'dinh luong'],
      isCore: true
    },
    {
      id: 'financial_analysis',
      domain: 'finance',
      name: 'Financial Analysis & Investment',
      labelVi: 'Phân tích tài chính & Đầu tư',
      subsumes: ['Đọc hiểu Báo cáo tài chính (BCTC)', 'Dự báo tài chính', 'Chỉ số tài chính (ROE, EBITDA)', 'Financial Modeling', 'Phân tích đầu tư (Investment Analysis)', 'Quản lý ngân sách'],
      keywords: ['financial analysis', 'tai chinh', 'financial', 'bctc', 'bao cao tai chinh', 'financial modeling', 'du bao tai chinh', 'ebitda', 'roe', 'budget', 'ngan sach', 'kha thi tai chinh', 'investment analysis', 'phan tich dau tu', 'kien thuc dau tu'],
      isCore: true
    },
    {
      id: 'valuation_accounting',
      domain: 'finance',
      name: 'Valuation & Accounting',
      labelVi: 'Định giá doanh nghiệp, Kế toán & Kiểm toán',
      subsumes: ['Định giá DCF / Multiples', 'Kế toán quản trị & Tài chính', 'Kiểm toán (Audit)', 'Phân tích chi phí & Điểm hòa vốn', 'M&A'],
      keywords: ['valuation', 'accounting', 'ke toan', 'dinh gia', 'cost', 'chi phi', 'hoa von', 'break-even', 'm&a', 'audit', 'kiem toan'],
      isCore: false
    },
    {
      id: 'risk_management',
      domain: 'finance',
      name: 'Risk Management & Markets',
      labelVi: 'Quản lý rủi ro & Thị trường tài chính',
      subsumes: ['Đánh giá rủi ro dự án', 'Kiến thức thị trường chứng khoán', 'Quản trị danh mục', 'Ngân hàng số (Digital Banking) & FinTech', 'Quantitative Finance'],
      keywords: ['risk management', 'rui ro', 'chung khoan', 'thi truong tai chinh', 'co phieu', 'danh muc', 'risk assessment', 'digital banking', 'ngan hang', 'quantitative finance', 'quant'],
      isCore: false
    },

    // --- 4. CÔNG NGHỆ, LẬP TRÌNH & AI (Tech & Development) ---
    {
      id: 'coding_software',
      domain: 'tech',
      name: 'Coding & Software Development',
      labelVi: 'Lập trình & Phát triển phần mềm',
      subsumes: ['Python, C++, Java', 'Web / App Development', 'Thuật toán & Cấu trúc dữ liệu', 'API & Smart Contract', 'Hệ thống công nghệ / STEM'],
      keywords: ['coding', 'lap trinh', 'software', 'phan mem', 'python', 'c++', 'java', 'web', 'app', 'developer', 'algorithm', 'smart contract', 'api', 'stem', 'cong nghe'],
      isCore: false
    },
    {
      id: 'ai_tools',
      domain: 'tech',
      name: 'AI Tools & Prompt Engineering',
      labelVi: 'Ứng dụng AI & Công cụ Trí tuệ nhân tạo',
      subsumes: ['Prompt Engineering', 'GenAI (ChatGPT, Claude, Gemini)', 'Machine Learning ứng dụng', 'AI Workflow Automation'],
      keywords: ['ai', 'artificial intelligence', 'tri tue nhan tao', 'prompt', 'genai', 'machine learning', 'chatgpt', 'automation', 'ai tools'],
      isCore: false
    },
    {
      id: 'ui_ux_design',
      domain: 'tech',
      name: 'UI/UX & Product Design',
      labelVi: 'Thiết kế giao diện UI/UX & Figma',
      subsumes: ['Figma / Wireframing', 'Interactive Prototype', 'User Flow & Trải nghiệm người dùng', 'Design System'],
      keywords: ['ui/ux', 'ui', 'ux', 'figma', 'wireframe', 'prototype', 'thiet ke giao dien', 'user experience', 'design system'],
      isCore: false
    },

    // --- 5. TRUYỀN THÔNG, THUYẾT TRÌNH & TIẾP THỊ (Communication & Marketing) ---
    {
      id: 'presentation_speaking',
      domain: 'presentation',
      name: 'Presentation & Public Speaking',
      labelVi: 'Thuyết trình & Nói trước đám đông',
      subsumes: ['Kỹ năng trình bày tự tin', 'Diễn thuyết sân khấu', 'Hùng biện', 'Giao tiếp thuyết phục', 'Body language & Giọng nói'],
      keywords: ['presentation', 'thuyet trinh', 'public speaking', 'hung bien', 'noi truoc dam dong', 'dien thuyet', 'trinh bay', 'speaking', 'giao tiep', 'communication', 'persuasion', 'stage presence'],
      isCore: true
    },
    {
      id: 'mc_hosting',
      domain: 'presentation',
      name: 'MC, Hosting & Stage Charisma',
      labelVi: 'Dẫn chương trình, MC & Làm chủ sân khấu',
      subsumes: ['Kỹ năng dẫn chương trình (Hosting/MC)', 'Quản lý giọng nói & Ngữ điệu (Voice Modulation)', 'Ứng biến sân khấu', 'Bản lĩnh & Tự tin (Confidence & Composure)', 'Phát thanh & Audio'],
      keywords: ['mc', 'hosting', 'dan chuong trinh', 'voice modulation', 'giong noi', 'ngu dieu', 'san khau', 'confidence & composure', 'improvisation', 'charisma', 'audio production', 'eloquence', 'pronunciation'],
      isCore: false
    },
    {
      id: 'slide_storytelling',
      domain: 'presentation',
      name: 'Slide Design & Visual Storytelling',
      labelVi: 'Thiết kế Slide & Kể chuyện trực quan',
      subsumes: ['Thiết kế Pitch Deck chuyên nghiệp', 'Trình bày trực quan', 'Data Visualization trong slide', 'Sản xuất video ngắn / Demo sản phẩm'],
      keywords: ['slide design', 'slide', 'thiet ke slide', 'storytelling', 'visual communication', 'pitch deck design', 'ke chuyen', 'visual storytelling', 'video', 'deck'],
      isCore: true
    },
    {
      id: 'debate_defense',
      domain: 'presentation',
      name: 'Debate & Q&A Defense',
      labelVi: 'Tranh biện, Phản biện & Q&A Giám khảo',
      subsumes: ['Ứng biến & Đối đáp nhanh', 'Bảo vệ đề án trước Ban giám khảo', 'Xử lý câu hỏi khó (Q&A)', 'Lập luận phản biện sắc bén'],
      keywords: ['debate', 'tranh bien', 'q&a', 'phan bien', 'defense', 'bao ve de an', 'doi dap', 'giam khao', 'lap luan', 'ung bien', 'doi dap nhanh'],
      isCore: false
    },
    {
      id: 'marketing_growth',
      domain: 'presentation',
      name: 'Marketing & Growth Strategy',
      labelVi: 'Marketing, Thương mại điện tử & Tăng trưởng',
      subsumes: ['Digital Marketing (SEO, Ads)', 'Thương mại điện tử & Cross-border', 'Content & Social Media', 'Chiến dịch truyền thông tích hợp (IMC)', 'Branding'],
      keywords: ['marketing', 'tiep thi', 'digital marketing', 'growth', 'truyen thong', 'branding', 'imc', 'content', 'e-commerce', 'thuong mai dien tu', 'social media', 'mang xa hoi', 'cross-border', 'commerce'],
      isCore: false
    },

    // --- 6. QUẢN TRỊ, THỰC THI & PHÁT TRIỂN BỀN VỮNG (Execution & Leadership) ---
    {
      id: 'teamwork',
      domain: 'soft_skills',
      name: 'Teamwork & Collaboration',
      labelVi: 'Làm việc nhóm & Hợp tác đội ngũ',
      subsumes: ['Phân công vai trò & Trách nhiệm', 'Hợp tác liên chức năng', 'Quản trị xung đột đội ngũ', 'Giao tiếp nội bộ'],
      keywords: ['teamwork', 'lam viec nhom', 'collaboration', 'doi nhom', 'hop tac', 'team', 'dong doi'],
      isCore: true
    },
    {
      id: 'leadership',
      domain: 'soft_skills',
      name: 'Leadership & Team Management',
      labelVi: 'Lãnh đạo & Quản trị đội ngũ',
      subsumes: ['Động viên & Truyền cảm hứng', 'Ra quyết định trong tình huống khó', 'Xây dựng văn hóa đội thi', 'Networking'],
      keywords: ['leadership', 'lanh dao', 'dan dat', 'truong nhom', 'decision making', 'networking', 'ket noi', 'lanh dao & quan tri'],
      isCore: false
    },
    {
      id: 'hr_management',
      domain: 'soft_skills',
      name: 'HR & Talent Management',
      labelVi: 'Quản trị nhân sự & Văn hóa tổ chức',
      subsumes: ['Tuyển dụng & Đào tạo', 'Đãi ngộ & Lương thưởng (C&B)', 'Văn hóa tổ chức', 'Phỏng vấn & Chuẩn bị CV (CV/Interview)', 'Trí tuệ cảm xúc (EQ) & Đồng cảm'],
      keywords: ['hr', 'nhan su', 'human resource', 'tuyen dung', 'dao tao', 'luong thuong', 'cv & interview', 'interview', 'emotional intelligence', 'empathy'],
      isCore: false
    },
    {
      id: 'project_management',
      domain: 'soft_skills',
      name: 'Project Management',
      labelVi: 'Quản lý dự án & Điều phối tiến độ',
      subsumes: ['Lập kế hoạch hành động (Action Plan)', 'Theo dõi mốc tiến độ (Milestones)', 'Agile / Scrum cơ bản', 'Quản lý tài nguyên'],
      keywords: ['project management', 'quan ly du an', 'quan tri du an', 'tien do', 'action plan', 'agile', 'scrum', 'dieu phoi'],
      isCore: false
    },
    {
      id: 'time_management',
      domain: 'soft_skills',
      name: 'Time & Pressure Management',
      labelVi: 'Quản lý thời gian & Áp lực thi đấu',
      subsumes: ['Ưu tiên công việc quan trọng', 'Làm việc dưới áp lực thời gian', 'Cấu trúc bài thi đúng thời lượng', 'Thích ứng linh hoạt & Khủng hoảng'],
      keywords: ['time management', 'thoi gian', 'quan ly thoi gian', 'ap luc', 'deadline', 'prioritization', 'adaptability', 'thich ung', 'linh hoat', 'crisis'],
      isCore: false
    },
    {
      id: 'supply_chain',
      domain: 'soft_skills',
      name: 'Supply Chain & Operations',
      labelVi: 'Logistics & Quản trị chuỗi cung ứng',
      subsumes: ['Vận hành chuỗi cung ứng', 'Quản trị kho bãi & Logistics', 'Xuất nhập khẩu & Tiêu chuẩn SPS', 'Tối ưu hóa quy trình vận hành'],
      keywords: ['supply chain', 'chuoi cung ung', 'logistics', 'kho bai', 'van hanh', 'operations', 'xuat nhap khau', 'procurement', 'inventory', 'sps'],
      isCore: false
    },
    {
      id: 'english_proficiency',
      domain: 'soft_skills',
      name: 'English & Global Communication',
      labelVi: 'Ngoại ngữ, Tiếng Anh & Giao tiếp quốc tế',
      subsumes: ['Thuyết trình tiếng Anh chuyên nghiệp', 'Viết báo cáo & Đề án tiếng Anh', 'Giao tiếp đa văn hóa', 'Tiếng Hoa / Ngoại ngữ 2'],
      keywords: ['english', 'tieng anh', 'ngoai ngu', 'ielts', 'toefl', 'cross-cultural', 'da van hoa', 'tieng hoa'],
      isCore: false
    },
    {
      id: 'esg_sustainability',
      domain: 'soft_skills',
      name: 'ESG, Law & Sustainable Business',
      labelVi: 'Phát triển bền vững, Pháp lý & ESG',
      subsumes: ['Tiêu chuẩn ESG (Môi trường - Xã hội - Quản trị)', 'Tác động xã hội (Social Impact)', 'Kinh tế tuần hoàn', 'Pháp lý & Sở hữu trí tuệ', 'Quản trị công ty (Governance)'],
      keywords: ['esg', 'ben vung', 'sustainable', 'sustainability', 'social impact', 'kinh te tuan hoan', 'tac dong xa hoi', 'phap ly', 'phap luat', 'legal', 'governance', 'so huu tri tue', 'sdg', 'luat'],
      isCore: false
    }
  ];

  // Backwards compatibility mappings for existing state/views
  const CORE_SKILLS = CANONICAL_COMPETENCIES.filter(c => c.isCore).map(c => ({
    name: c.name,
    domain: c.domain,
    labelVi: c.labelVi
  }));

  const POPULAR_SKILLS = CORE_SKILLS.map(s => ({
    name: s.name,
    group: s.domain === 'strategy' ? 'Tư duy & Chiến lược'
      : s.domain === 'finance' || s.domain === 'tech' ? 'Dữ liệu, Tài chính & Công nghệ'
        : s.domain === 'presentation' ? 'Truyền thông & Thuyết trình'
          : 'Quản trị & Thực thi'
  }));

  const SKILL_DOMAINS = CANONICAL_DOMAINS;

  // 23 Comprehensive Bilingual Synonym & Equivalence Clusters
  const SYNONYM_GROUPS = [
    ['teamwork', 'team collaboration', 'làm việc nhóm', 'lãnh đạo & làm việc nhóm', 'hợp tác đội nhóm', 'teamwork & collaboration'],
    ['time management', 'quản lý thời gian', 'tổ chức thời gian'],
    ['presentation', 'thuyết trình', 'presentation skills', 'pitching', 'thuyết trình & pitching', 'kỹ năng thuyết trình', 'pitch deck', 'pitch ý tưởng', 'trình bày và phản biện ý tưởng', 'trình bày trước công chúng', 'presentation & communication', 'pitching & presentation', 'kỹ năng trình bày'],
    ['public speaking', 'hùng biện', 'nói trước đám đông', 'diễn thuyết', 'hùng biện & thuyết trình', 'hùng biện & trình bày trước đám đông'],
    ['problem solving', 'giải quyết vấn đề', 'analytical problem solving', 'xử lý vấn đề', 'giải quyết vấn đề và tư duy phản biện', 'problem solving & analytical thinking'],
    ['critical thinking', 'tư duy phản biện', 'phản biện', 'critical thinking & problem solving'],
    ['strategic thinking', 'tư duy chiến lược', 'chiến lược', 'tư duy chiến lược (strategic thinking)', 'strategic planning'],
    ['analytical thinking', 'tư duy phân tích', 'phân tích logic', 'analytical problem solving'],
    ['data analysis', 'phân tích dữ liệu', 'data analytics', 'data interpretation', 'phân tích số liệu', 'excel & data analysis', 'research & data analysis'],
    ['financial analysis', 'phân tích tài chính', 'tài chính', 'financial modeling', 'kế hoạch tài chính', 'tư duy tài chính cơ bản', 'lập kế hoạch và khả thi tài chính', 'financial analysis & valuation'],
    ['market research', 'nghiên cứu thị trường', 'phân tích thị trường', 'thấu hiểu khách hàng', 'customer research', 'phân tích thị trường & nghiên cứu khách hàng', 'market research & validation'],
    ['business model', 'mô hình kinh doanh', 'business model canvas', 'bmc', 'business planning', 'kế hoạch kinh doanh', 'xây dựng mô hình kinh doanh (business model canvas)', 'lập kế hoạch kinh doanh (business plan)', 'business model development', 'tư duy khởi nghiệp và đổi mới mô hình kinh doanh'],
    ['slide design', 'thiết kế slide', 'visual storytelling', 'trình bày trực quan', 'storytelling', 'deck design', 'thiết kế slide và trình bày trực quan', 'slide design & storytelling', 'thiết kế slide / visual storytelling', 'kể chuyện và thiết kế slide', 'slide design & data visualization'],
    ['project management', 'quản lý dự án', 'quản trị dự án'],
    ['marketing', 'tiếp thị', 'digital marketing', 'truyền thông & marketing', 'growth strategy', 'marketing & growth strategy', 'marketing & truyền thông'],
    ['supply chain', 'chuỗi cung ứng', 'logistics', 'vận hành chuỗi cung ứng', 'supply chain management', 'logistics & supply chain knowledge', 'logistics & operations knowledge', 'supply chain & operations'],
    ['leadership', 'lãnh đạo', 'dẫn dắt đội ngũ', 'quản lý đội nhóm', 'làm việc nhóm & lãnh đạo'],
    ['creative thinking', 'creativity', 'sáng tạo', 'tư duy sáng tạo', 'innovation', 'đổi mới sáng tạo', 'creativity & innovation', 'phát triển ý tưởng khởi nghiệp (ideation & innovation)', 'sáng tạo ý tưởng và xây dựng giá trị khác biệt'],
    ['ui/ux', 'product design', 'thiết kế sản phẩm', 'thiết kế giao diện', 'prototyping', 'ui/ux & product design', 'ui/ux design', 'figma'],
    ['risk management', 'quản lý rủi ro', 'kiểm soát rủi ro'],
    ['debate', 'tranh biện', 'lập luận', 'argumentation', 'debate & argumentation', 'argumentation & logic'],
    ['coding', 'lập trình', 'software development', 'phát triển phần mềm', 'coding & ai/tech', 'python', 'sql'],
    ['ai', 'trí tuệ nhân tạo', 'machine learning', 'prompt engineering', 'genai', 'ai tools', 'prompt engineering & ai tools', 'ai literacy', 'ai application']
  ];

  function normalizeSkillText(text) {
    if (!text) return '';
    return text.toString().toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[\(\)\[\],&/\+\-\:]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function keywordMatches(normKw, normText) {
    if (!normKw || !normText) return false;
    if (normKw.length <= 3) {
      const words = normText.split(' ');
      return words.includes(normKw);
    }
    return normText.includes(normKw) || normKw.includes(normText);
  }

  // Pre-normalize canonical metadata once on startup for high-performance matching
  CANONICAL_COMPETENCIES.forEach(c => {
    c._normName = normalizeSkillText(c.name);
    c._normLabelVi = normalizeSkillText(c.labelVi);
    c._normKeywords = (c.keywords || []).map(normalizeSkillText);
    c._normSubsumes = (c.subsumes || []).map(normalizeSkillText);
  });

  const CANONICAL_LOOKUP_CACHE = new Map();
  const SKILL_MATCH_CACHE = new Map();
  state._profileVersion = 1;
  state._cachedProfileSig = '';

  function invalidateProfileMatchCache() {
    state._profileVersion++;
    SKILL_MATCH_CACHE.clear();
  }

  function getProfileSignature(profile) {
    if (!profile) return 'default';
    const s = (profile.skills || []).slice().sort().join('|');
    const c = (profile.categories || []).slice().sort().join('|');
    const l = profile.level || 'Intermediate';
    return `${l}#${c}#${s}`;
  }

  function findCanonicalCompetency(text) {
    if (!text) return null;
    const norm = normalizeSkillText(text);
    if (!norm) return null;

    if (CANONICAL_LOOKUP_CACHE.has(norm)) {
      return CANONICAL_LOOKUP_CACHE.get(norm);
    }

    // Direct match by ID, Name or LabelVi
    for (const c of CANONICAL_COMPETENCIES) {
      if (c.id === text || c._normName === norm || c._normLabelVi === norm) {
        CANONICAL_LOOKUP_CACHE.set(norm, c);
        return c;
      }
    }

    // Match by keywords or subsumed skills
    for (const c of CANONICAL_COMPETENCIES) {
      if (c._normKeywords) {
        for (const kw of c._normKeywords) {
          if (keywordMatches(kw, norm)) {
            CANONICAL_LOOKUP_CACHE.set(norm, c);
            return c;
          }
        }
      }
      if (c._normSubsumes) {
        for (const sub of c._normSubsumes) {
          if (keywordMatches(sub, norm)) {
            CANONICAL_LOOKUP_CACHE.set(norm, c);
            return c;
          }
        }
      }
    }

    CANONICAL_LOOKUP_CACHE.set(norm, null);
    return null;
  }

  function canonicalMatchesSkill(canonical, skillText) {
    if (!canonical || !skillText) return false;
    const targetCanon = findCanonicalCompetency(skillText);
    if (targetCanon) {
      return targetCanon.id === canonical.id;
    }
    const norm = normalizeSkillText(skillText);
    if (!norm) return false;

    if (canonical.id === skillText || canonical._normName === norm || canonical._normLabelVi === norm) {
      return true;
    }

    if (canonical._normKeywords) {
      for (const kw of canonical._normKeywords) {
        if (keywordMatches(kw, norm)) return true;
      }
    }

    if (canonical._normSubsumes) {
      for (const sub of canonical._normSubsumes) {
        if (keywordMatches(sub, norm)) return true;
      }
    }

    return false;
  }

  function areSkillsMatching(userSkill, reqSkill) {
    const u = normalizeSkillText(userSkill);
    const r = normalizeSkillText(reqSkill);
    if (!u || !r) return false;

    const cacheKey = `${u}::${r}`;
    if (SKILL_MATCH_CACHE.has(cacheKey)) {
      return SKILL_MATCH_CACHE.get(cacheKey);
    }

    // 1. Direct match or normalized substring
    if (u === r || u.includes(r) || r.includes(u)) {
      SKILL_MATCH_CACHE.set(cacheKey, true);
      return true;
    }

    // 2. Canonical Competency Mapping:
    const uCanon = findCanonicalCompetency(userSkill);
    const rCanon = findCanonicalCompetency(reqSkill);

    if (uCanon && rCanon && uCanon.id === rCanon.id) {
      SKILL_MATCH_CACHE.set(cacheKey, true);
      return true;
    }

    if (uCanon && canonicalMatchesSkill(uCanon, reqSkill)) {
      SKILL_MATCH_CACHE.set(cacheKey, true);
      return true;
    }

    if (rCanon && canonicalMatchesSkill(rCanon, userSkill)) {
      SKILL_MATCH_CACHE.set(cacheKey, true);
      return true;
    }

    // 3. Fallback to bilingual synonym clusters
    for (const cluster of SYNONYM_GROUPS) {
      const uIn = cluster.some(k => u.includes(k));
      const rIn = cluster.some(k => r.includes(k));
      if (uIn && rIn) {
        SKILL_MATCH_CACHE.set(cacheKey, true);
        return true;
      }
    }

    // 4. Token intersection fallback with stop words
    const stopWords = new Set(['and', 'the', 'of', 'in', 'va', 'cua', 'cac', 'ky', 'nang', 'cho', 'voi', 've']);
    const uTokens = u.split(' ').filter(w => w.length > 2 && !stopWords.has(w));
    const rTokens = new Set(r.split(' ').filter(w => w.length > 2 && !stopWords.has(w)));

    if (uTokens.length >= 1) {
      const common = uTokens.filter(w => rTokens.has(w));
      if (common.length >= 2 || common.some(w => w.length >= 5)) {
        SKILL_MATCH_CACHE.set(cacheKey, true);
        return true;
      }
    }

    SKILL_MATCH_CACHE.set(cacheKey, false);
    return false;
  }

  function getSkillUniverse() {
    if (state._skillUniverseData && state._skillUniverseData.competencies && state._skillUniverseData.competencies.length > 0) {
      return state._skillUniverseData;
    }

    const competitions = state.competitions || [];

    // Dynamically calculate actual competition frequency count for each canonical competency
    CANONICAL_COMPETENCIES.forEach(cs => {
      let compCount = 0;
      competitions.forEach(c => {
        const reqSkills = c.required_skills || [];
        const matches = reqSkills.some(req => canonicalMatchesSkill(cs, req.name));
        if (matches) compCount++;
      });
      cs.count = compCount;
    });

    const byDomain = {};
    CANONICAL_DOMAINS.forEach(d => { byDomain[d.id] = []; });
    byDomain['all'] = CANONICAL_COMPETENCIES;
    byDomain['core'] = CANONICAL_COMPETENCIES.filter(c => c.isCore);

    CANONICAL_COMPETENCIES.forEach(c => {
      if (byDomain[c.domain]) {
        byDomain[c.domain].push(c);
      }
    });

    state._skillUniverseData = {
      domains: CANONICAL_DOMAINS,
      competencies: CANONICAL_COMPETENCIES,
      allSkills: CANONICAL_COMPETENCIES,
      skillsByDomain: byDomain
    };

    return state._skillUniverseData;
  }

  // Standard Category Mapping
  const CATEGORY_MAP = [
    { id: 'all', label: 'Tất cả', labelEn: 'All' },
    { id: 'startup', label: 'Khởi nghiệp', labelEn: 'Startup', keywords: ['khởi nghiệp', 'startup', 'innovation', 'đổi mới sáng tạo', 'entrepreneurship'] },
    { id: 'business_case', label: 'Business Case', labelEn: 'Business Case', keywords: ['business case', 'case competition', 'consulting', 'chiến lược kinh doanh', 'bài toán kinh doanh'] },
    { id: 'management_trainee', label: 'Management Trainee', labelEn: 'Management Trainee', keywords: ['management trainee', 'mt&young talent', 'mt', 'nhân sự', 'human resource', 'lãnh đạo', 'quản trị', 'nguồn nhân lực', 'young talent'] },
    { id: 'finance', label: 'Tài chính', labelEn: 'Finance', keywords: ['tài chính', 'chứng khoán', 'ngân hàng', 'đầu tư', 'finance', 'investment'] },
    { id: 'audit', label: 'Kiểm toán', labelEn: 'Audit', keywords: ['kiểm toán', 'kế toán', 'auditing', 'accounting', 'audit'] },
    { id: 'marketing', label: 'Marketing', labelEn: 'Marketing', keywords: ['marketing', 'thương mại điện tử', 'truyền thông'] },
    { id: 'tech', label: 'Tech & Data', labelEn: 'Tech & Data', keywords: ['công nghệ', 'data', 'blockchain', 'ai', 'cloud', 'phân tích dữ liệu', 'it', 'khoa học dữ liệu', 'business analyst'] },
    { id: 'logistics', label: 'Chuỗi cung ứng', labelEn: 'Supply Chain', keywords: ['logistics', 'chuỗi cung ứng', 'supply chain'] },
    { id: 'debate', label: 'Tranh biện & MC', labelEn: 'Debate & MC', keywords: ['hùng biện', 'tranh biện', 'mc', 'dẫn chương trình', 'debate', 'public speaking', 'thuyết trình'] }
  ];

  // ==========================================================================
  // 3. INITIALIZATION & DATA LOADING
  // ==========================================================================
  document.addEventListener('DOMContentLoaded', async () => {
    loadLocalUserData();
    await fetchCompetitionsData();
    setupRouting();
    setupEventListeners();
    renderAll();

    // Automated first-visit onboarding prompt (if not yet configured and not dismissed)
    setTimeout(() => {
      const isConfigured = state.profileConfigured || localStorage.getItem('competemate_profile_configured') === 'true';
      const isDismissed = sessionStorage.getItem('competemate_onboarding_dismissed') === 'true';
      const currentTab = window.location.hash.replace('#', '') || 'hub';
      if (!isConfigured && !isDismissed && currentTab !== 'profile') {
        if (typeof window.openProfileOnboardingModal === 'function') {
          window.openProfileOnboardingModal();
        }
      }
    }, 450);
  });

  function loadLocalUserData() {
    try {
      initTheme();
      initLanguage();

      state.profileConfigured = localStorage.getItem('competemate_profile_configured') === 'true';

      const savedProfile = localStorage.getItem('competemate_profile');
      if (savedProfile) {
        state.profile = Object.assign({}, state.profile, JSON.parse(savedProfile));
      }

      // If user hasn't configured profile or name is the old default placeholder, ensure empty name
      if (!state.profileConfigured || state.profile.name === 'Thí sinh tiềm năng') {
        state.profile.name = '';
        state.profileConfigured = false;
      }

      const savedJourney = localStorage.getItem('competemate_journey');
      if (savedJourney) {
        state.journey = JSON.parse(savedJourney);
      }

      const savedCompare = localStorage.getItem('competemate_compare');
      if (savedCompare) {
        state.compareList = JSON.parse(savedCompare);
      }

      const savedPlaybooks = localStorage.getItem('competemate_community_playbooks');
      if (savedPlaybooks) {
        state.communityPlaybooks = JSON.parse(savedPlaybooks);
      }

      const savedUseReal = localStorage.getItem('competemate_use_real_date');
      const savedRefDate = localStorage.getItem('competemate_ref_date');
      if (savedUseReal === 'false' && savedRefDate) {
        state.useRealDeviceDate = false;
        state.referenceDate = savedRefDate;
      } else {
        // Default: Always use current machine real-time date
        state.useRealDeviceDate = true;
        state.referenceDate = toIsoDate(new Date());
      }
    } catch (e) {
      console.warn('Could not parse local data:', e);
    }
  }

  function saveLocalUserData() {
    try {
      localStorage.setItem('competemate_profile_configured', state.profileConfigured ? 'true' : 'false');
      localStorage.setItem('competemate_profile', JSON.stringify(state.profile));
      localStorage.setItem('competemate_journey', JSON.stringify(state.journey));
      localStorage.setItem('competemate_compare', JSON.stringify(state.compareList));
      localStorage.setItem('competemate_community_playbooks', JSON.stringify(state.communityPlaybooks));
    } catch (e) {
      console.warn('Could not save local data:', e);
    }
  }

  async function fetchCompetitionsData() {
    if (window.COMPETEMATE_DATABASE && Array.isArray(window.COMPETEMATE_DATABASE) && window.COMPETEMATE_DATABASE.length > 0) {
      state.competitions = cleanCompetitions(window.COMPETEMATE_DATABASE);
      renderCategoryFilterPills();
      return;
    }

    try {
      const res = await fetch('data/competitions.json');
      if (res.ok) {
        const data = await res.json();
        state.competitions = cleanCompetitions(data);
        renderCategoryFilterPills();
        return;
      }
    } catch (e) {
      console.warn('Failed to fetch data/competitions.json:', e);
    }

    if (state.competitions.length === 0) {
      showToast('Chưa nạp được dữ liệu cuộc thi.');
    }
  }

  function getValidExternalUrl(url) {
    if (!url || typeof url !== 'string') return null;
    const trimmed = url.trim();
    if (!trimmed || trimmed === '#' || ['n/a', 'none', 'not specified', 'chưa rõ', 'null', 'undefined'].includes(trimmed.toLowerCase())) {
      return null;
    }
    if (/không (xác định|có|được đề cập|khả dụng|tìm thấy)/i.test(trimmed)) {
      const match = trimmed.match(/https?:\/\/[^\s\)\],]+/i);
      return match ? match[0] : null;
    }
    if (trimmed.includes('@') && !trimmed.startsWith('http')) {
      return `mailto:${trimmed}`;
    }
    if (/^https?:\/\//i.test(trimmed)) {
      return trimmed;
    }
    if (/^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/.*)?$/.test(trimmed)) {
      return `https://${trimmed}`;
    }
    return null;
  }

  function getCompetitionExternalLink(comp) {
    if (!comp) return null;
    const reg = getValidExternalUrl(comp.registration_link);
    if (reg && !reg.startsWith('mailto:')) return reg;
    const src = getValidExternalUrl(comp.source_url);
    if (src) return src;
    if (reg && reg.startsWith('mailto:')) return reg;
    return null;
  }

  function cleanCompetitions(rawList) {
    return rawList.map((item, index) => {
      const id = item.id || `comp-${index}-${slugify(item.name || 'cuoc-thi')}`;
      const name = (item.name || 'Cuộc thi sinh viên').trim();
      const organizer = (item.organizer || 'Ban tổ chức').trim();
      const category = (item.category || 'General').trim();
      const deadline = (item.deadline || '').trim();
      const season = item.season || '2026';
      const status = normalizeStatus(item.status, deadline);
      const grand_prize = item.grand_prize || '';
      const prizes_detail = item.prizes_detail || '';
      const eligibility = item.eligibility || 'Sinh viên trên toàn quốc';
      const duration = item.duration || 'Đang cập nhật';
      const rounds_count = item.rounds_count || (Array.isArray(item.milestones) ? item.milestones.length : 3);
      const rounds_description = item.rounds_description || '';
      const format = item.format || 'Hybrid';
      const team_size = item.team_size || { min: 1, max: 4, type: 'Đội thi' };
      const experience_level = item.experience_level || 'Beginner to Intermediate';
      const registration_link = getValidExternalUrl(item.registration_link) || '';
      const source_url = getValidExternalUrl(item.source_url) || '';
      const short_description = item.short_description || 'Cuộc thi học thuật và rèn luyện kỹ năng thực chiến dành cho sinh viên.';

      let required_skills = [];
      if (Array.isArray(item.required_skills)) {
        required_skills = item.required_skills.map(s => {
          if (typeof s === 'string') {
            return { name: s.trim(), priority: 'must_have', category: 'General' };
          }
          return {
            name: (s.name || '').trim(),
            priority: s.priority || 'must_have',
            category: s.category || 'General'
          };
        }).filter(s => s.name.length > 0);
      }

      let milestones = [];
      if (Array.isArray(item.milestones) && item.milestones.length > 0) {
        milestones = item.milestones;
      } else {
        milestones = [
          { stage: 1, name: 'Vòng 1: Đăng ký & Nộp hồ sơ', date: deadline || 'Giai đoạn 1', status: 'active', description: 'Nộp đơn đăng ký dự thi theo yêu cầu của BTC.' },
          { stage: 2, name: 'Vòng 2: Bán kết / Thử thách chuyên sâu', date: 'Sau vòng 1', status: 'upcoming', description: 'Giải đề bài thực tế hoặc thực hiện bài thi nhóm.' },
          { stage: 3, name: 'Vòng 3: Chung kết & Vinh danh', date: 'Vòng chung cuộc', status: 'upcoming', description: 'Pitching trực tiếp và trao giải thưởng.' }
        ];
      }

      const playbook_insights = item.playbook_insights || {
        challenging_part: 'Quản lý thời gian, phối hợp ăn ý giữa các thành viên và giải quyết bài toán dưới áp lực deadline.',
        common_mistakes: 'Đăng ký sát giờ, nghiên cứu dữ liệu chưa sâu, slide quá nhiều chữ và thiếu phân tích tính khả thi thực tế.',
        key_success_factors: 'Tư duy phản biện logic, cấu trúc bài thuyết trình mạch lạc, trả lời Q&A thuyết phục và tinh thần đồng đội.',
        prep_advice: 'Tìm hiểu kỹ đề thi các mùa trước, phân chia vai trò rõ ràng, luyện tập pitching trước gương và xin feedback từ mentor.'
      };

      return {
        id,
        name,
        organizer,
        category,
        season,
        deadline,
        status,
        grand_prize,
        prizes_detail,
        eligibility,
        duration,
        rounds_count,
        rounds_description,
        format,
        team_size,
        experience_level,
        registration_link,
        source_url,
        short_description,
        required_skills,
        milestones,
        playbook_insights
      };
    });
  }

  // --------------------------------------------------------------------------
  // TIME & STAGE DETERMINATION ENGINE (Dynamic Reference Date & Milestones)
  // --------------------------------------------------------------------------
  function extractAllDates(str, refYear = 2026) {
    if (!str || typeof str !== 'string') return [];
    const dates = [];
    // 1. ISO YYYY-MM-DD
    const isoRegex = /(\d{4})[/-](\d{1,2})[/-](\d{1,2})/g;
    let match;
    while ((match = isoRegex.exec(str)) !== null) {
      dates.push(new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3])));
    }
    // 2. VN DD/MM/YYYY
    const vnRegex = /(\d{1,2})[/-](\d{1,2})[/-](\d{4})/g;
    while ((match = vnRegex.exec(str)) !== null) {
      dates.push(new Date(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1])));
    }
    // 3. YYYY-MM without DD
    const ymRegex = /(\d{4})[/-](\d{1,2})(?![/-]\d)/g;
    while ((match = ymRegex.exec(str)) !== null) {
      dates.push(new Date(parseInt(match[1]), parseInt(match[2]) - 1, 15));
    }
    // 4. tháng MM/YYYY or tháng MM
    const thgRegex = /tháng\s*(\d{1,2})(?:[/-](\d{4}))?/gi;
    while ((match = thgRegex.exec(str)) !== null) {
      const yr = match[2] ? parseInt(match[2]) : refYear;
      dates.push(new Date(yr, parseInt(match[1]) - 1, 15));
    }
    return dates;
  }

  function getCurrentReferenceDate() {
    if (state.useRealDeviceDate) {
      return new Date();
    }
    const [y, m, d] = (state.referenceDate || '2026-09-28').split('-').map(Number);
    return new Date(y, (m || 1) - 1, d || 1);
  }

  function formatDateVn(d) {
    if (!d || isNaN(d.getTime())) return '28/09/2026';
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  function toIsoDate(d) {
    if (!d || isNaN(d.getTime())) return '2026-09-28';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function evaluateMilestones(milestones, refDate) {
    if (!milestones || milestones.length === 0) return [];
    const ref = new Date(refDate.getFullYear(), refDate.getMonth(), refDate.getDate());

    return milestones.map((m) => {
      const dates = extractAllDates(m.date);
      let status = m.status || 'upcoming';
      let start = null, end = null;

      if (dates.length === 1) {
        start = new Date(dates[0].getFullYear(), dates[0].getMonth(), dates[0].getDate());
        end = new Date(dates[0].getFullYear(), dates[0].getMonth(), dates[0].getDate(), 23, 59, 59);
      } else if (dates.length >= 2) {
        start = new Date(dates[0].getFullYear(), dates[0].getMonth(), dates[0].getDate());
        const last = dates[dates.length - 1];
        end = new Date(last.getFullYear(), last.getMonth(), last.getDate(), 23, 59, 59);
      }

      if (start && end) {
        if (ref < start) {
          status = 'upcoming';
        } else if (ref >= start && ref <= end) {
          status = 'active';
        } else {
          status = 'closed';
        }
      } else {
        if (m.status === 'completed' || m.status === 'closed') status = 'closed';
      }

      return {
        ...m,
        dynamicStatus: status,
        start,
        end
      };
    });
  }

  function getCompetitionStage(c, customRefDate) {
    const isEn = state.lang === 'en';
    const refDate = customRefDate || getCurrentReferenceDate();
    const evaluatedMilestones = evaluateMilestones(c.milestones, refDate);
    const daysToDeadline = calculateDaysRemaining(c.deadline);

    // 1. Is there an active milestone right now?
    const activeMilestone = evaluatedMilestones.find(m => m.dynamicStatus === 'active');
    if (activeMilestone) {
      return {
        key: 'active_round',
        name: activeMilestone.name,
        badgeText: isEn ? `Active: ${activeMilestone.name}` : `Đang thi: ${activeMilestone.name}`,
        badgeClass: 'chip-urgent',
        statusGroup: 'active',
        milestones: evaluatedMilestones,
        daysToDeadline
      };
    }

    // 2. Registration window
    if (daysToDeadline !== null) {
      if (daysToDeadline >= 0) {
        if (daysToDeadline <= 5) {
          return {
            key: 'closing_soon',
            name: isEn ? 'Registration (Closing soon)' : 'Đăng ký (Sắp đóng đơn)',
            badgeText: daysToDeadline === 0
              ? (isEn ? 'Deadline today!' : 'Hạn chót hôm nay!')
              : (isEn ? `Closing soon (${daysToDeadline}d)` : `Sắp đóng (${daysToDeadline} ngày)`),
            badgeClass: 'chip-urgent',
            statusGroup: 'closing_soon',
            milestones: evaluatedMilestones,
            daysToDeadline
          };
        }
        return {
          key: 'open',
          name: isEn ? 'Registration open' : 'Đang mở đơn đăng ký',
          badgeText: isEn ? `Open (${daysToDeadline}d left)` : `Mở đơn (còn ${daysToDeadline} ngày)`,
          badgeClass: 'chip-open',
          statusGroup: 'open',
          milestones: evaluatedMilestones,
          daysToDeadline
        };
      }
    }

    // 3. Upcoming round after registration closed
    const upcomingMilestone = evaluatedMilestones.find(m => m.dynamicStatus === 'upcoming');
    if (upcomingMilestone) {
      const daysUntil = upcomingMilestone.start
        ? Math.ceil((upcomingMilestone.start.getTime() - refDate.getTime()) / (1000 * 60 * 60 * 24))
        : null;
      return {
        key: 'upcoming_round',
        name: upcomingMilestone.name,
        badgeText: daysUntil !== null && daysUntil <= 7
          ? (isEn ? `Upcoming: ${upcomingMilestone.name} (${daysUntil}d)` : `Sắp tới: ${upcomingMilestone.name} (${daysUntil} ngày)`)
          : (isEn ? `Upcoming: ${upcomingMilestone.name}` : `Sắp tới: ${upcomingMilestone.name}`),
        badgeClass: 'chip-subtle',
        statusGroup: 'upcoming',
        milestones: evaluatedMilestones,
        daysToDeadline
      };
    }

    // 4. All milestones passed or deadline past with no upcoming rounds
    const allMilestonesClosed = evaluatedMilestones.length > 0 && evaluatedMilestones.every(m => m.dynamicStatus === 'closed');
    if (allMilestonesClosed || (daysToDeadline !== null && daysToDeadline < 0)) {
      return {
        key: 'closed',
        name: isEn ? 'Season 2026 Completed' : 'Đã hoàn thành mùa 2026',
        badgeText: 'Completed',
        badgeClass: 'chip-completed',
        statusGroup: 'closed',
        milestones: evaluatedMilestones,
        daysToDeadline
      };
    }

    // 5. Fallback based on raw status string
    const rawStatus = (c.status || '').toLowerCase();
    if (rawStatus.includes('close') || rawStatus.includes('đóng')) {
      return {
        key: 'closed',
        name: isEn ? 'Closed' : 'Đã kết thúc',
        badgeText: 'Completed',
        badgeClass: 'chip-completed',
        statusGroup: 'closed',
        milestones: evaluatedMilestones,
        daysToDeadline: null
      };
    }

    return {
      key: 'open',
      name: isEn ? 'Open' : 'Đang mở',
      badgeText: isEn ? 'Open' : 'Đang mở',
      badgeClass: 'chip-open',
      statusGroup: 'open',
      milestones: evaluatedMilestones,
      daysToDeadline: null
    };
  }

  function calculateDaysRemaining(deadlineStr) {
    if (!deadlineStr) return null;
    const dates = extractAllDates(deadlineStr);
    if (dates.length === 0) return null;
    const latestDate = dates[dates.length - 1];
    const now = getCurrentReferenceDate();
    const target = new Date(latestDate.getFullYear(), latestDate.getMonth(), latestDate.getDate());
    const ref = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffTime = target.getTime() - ref.getTime();
    return Math.round(diffTime / (1000 * 60 * 60 * 24));
  }

  function normalizeStatus(rawStatus, deadline) {
    if (rawStatus) {
      const s = String(rawStatus).toLowerCase();
      if (s.includes('closing') || s.includes('sắp')) return 'closing_soon';
      if (s.includes('close') || s.includes('đóng')) return 'closed';
      if (s.includes('open') || s.includes('mở') || s.includes('active')) return 'open';
    }
    const days = calculateDaysRemaining(deadline);
    if (days !== null) {
      if (days < 0) return 'closed';
      if (days <= 5) return 'closing_soon';
      return 'open';
    }
    return 'open';
  }

  function formatDeadlineDisplay(c) {
    const isEn = state.lang === 'en';
    if (!c.deadline || !c.deadline.trim()) return isEn ? 'Per organizer update' : 'Theo thông báo BTC';

    const days = calculateDaysRemaining(c.deadline);
    if (days !== null) {
      if (days < 0) return isEn ? 'Closed' : 'Đã đóng đơn';
      if (days === 0) return isEn ? 'Deadline today!' : 'Hạn hôm nay!';
      return isEn ? `${days} days left` : `Còn ${days} ngày`;
    }

    if (c.deadline.includes('http://') || c.deadline.includes('https://')) {
      return isEn ? 'See application link' : 'Xem chi tiết trong đơn';
    }

    const clean = c.deadline.replace(/[()]/g, '').trim();
    if (clean.length > 25) {
      return clean.slice(0, 24) + '...';
    }
    return clean;
  }

  function formatTeamSizeDisplay(c) {
    const isEn = state.lang === 'en';
    if (!c || !c.team_size) return isEn ? 'Flexible team' : 'Đội thi linh hoạt';
    const { min, max, type } = c.team_size;
    const typeStr = (type || '').toLowerCase();
    if (min === 1 && max === 1) return isEn ? 'Individual (1 person)' : 'Cá nhân (1 người)';
    if (min === 1 && max > 1) {
      if (typeStr.includes('individual') && typeStr.includes('team')) {
        return isEn ? `Individual / Team (${min}-${max} members)` : `Cá nhân / Đội (${min}-${max} người)`;
      }
      return isEn ? `Team ${min}-${max} members` : `Đội ${min}-${max} người`;
    }
    if (min > 1 && max === min) return isEn ? `Team of ${min}` : `Đội đúng ${min} người`;
    if (min > 1 && max > min) return isEn ? `Team ${min}-${max} members` : `Đội ${min}-${max} người`;
    return isEn ? 'Team' : 'Đội thi';
  }

  // ==========================================================================
  // MULTI-DIMENSIONAL PRIZE SPECTRUM PARSER & RENDERER
  // ==========================================================================
  function parsePrizeAspects(comp) {
    if (
      comp.prizes_breakdown &&
      typeof comp.prizes_breakdown === 'object' &&
      comp.prizes_breakdown.has_data !== false
    ) {
      return comp.prizes_breakdown;
    }
    const rawGp = (comp.grand_prize || '').trim();
    const rawPd = (comp.prizes_detail || '').trim();
    const fullText = (rawGp + '\n' + rawPd).trim();

    if (
      !fullText ||
      /^(not specified|n\/a|not disclosed|chưa có thông tin chi tiết|đang cập nhật|không xác định rõ từ dữ liệu cung cấp|chưa rõ)$/i.test(
        fullText
      )
    ) {
      return {
        has_data: false,
        total_pool: '',
        highlights: [],
        cash: [],
        scholarship: [],
        opportunity: [],
        in_kind: [],
        certificate: [],
        raw_text: ''
      };
    }

    const aspects = {
      has_data: true,
      total_pool: '',
      highlights: [],
      cash: [],
      scholarship: [],
      opportunity: [],
      in_kind: [],
      certificate: [],
      raw_text: fullText
    };

    const poolMatch = fullText.match(
      /(?:Tổng\s+(?:giá\s+trị\s+)?(?:giải\s+thưởng|phần\s+thưởng|toàn\s+giải|toàn\s+cuộc)[\s\:\~lênđếnvàohoặcnhấtướcítnhấttrên]*)([0-9.,]+\s*(?:triệu|tỷ|tr\b|k\b|usd|\$|vnd|vnđ|cny|jpy|rmb|đ)(?:\s*VNĐ|\s*đồng|\s*USD)?)/i
    );
    if (poolMatch) {
      aspects.total_pool = poolMatch[0]
        .replace(/^(?:[•\-\*\+–—\s]*(?:\d{1,3}[\.\)\:]\s*)?)/, '')
        .trim();
    }

    const sentences = fullText.split(/[\r\n;|•]+|(?<=[.!?])\s+(?=[A-Z0-9À-Ỹ])/);
    const clauses = [];
    sentences.forEach(s => {
      const clean = s.replace(/^(?:[•\-\*\+–—\s]*(?:\d{1,3}[\.\)\:]\s*)?)/, '').trim();
      if (!clean) return;
      if (clean.includes(' + ')) {
        clean.split(' + ').forEach(p => {
          const pc = p.replace(/^(?:[•\-\*\+–—\s]*(?:\d{1,3}[\.\)\:]\s*)?)/, '').trim();
          if (pc.length >= 3) clauses.push(pc);
        });
      } else {
        clauses.push(clean);
      }
    });

    const seen = new Set();
    const tokens = [];
    clauses.forEach(c => {
      const low = c.toLowerCase();
      if (
        c.length >= 3 &&
        !seen.has(low) &&
        !/^(not specified|n\/a|not disclosed|chưa rõ|đang cập nhật)$/i.test(low)
      ) {
        seen.add(low);
        tokens.push(c);
      }
    });

    tokens.forEach(item => {
      const low = item.toLowerCase();
      let matched = false;

      // 1. Scholarship & Training
      if (
        /học bổng|scholarship|khóa học|khoá học|đào tạo|training|inda academy|dol english|ibep|thalic|l&d perks/i.test(
          low
        )
      ) {
        aspects.scholarship.push(item);
        matched = true;
      }

      // 2. Incubation & Opportunities & Career & Travel
      if (
        /ươm tạo|incubation|tuyển dụng|fast-track|vào thẳng|đặc cách|vé máy bay|chuyến đi|hàn quốc|copenhagen|hoa kỳ|singapore|ireland|kết nối|pitching|quỹ đầu tư|vốn không hoàn lại|living labs|tiền ươm tạo|vườn ươm|hỗ trợ cố vấn|mentor 1:1|mentoring|seed funding|nhà đầu tư|demo day/i.test(
          low
        )
      ) {
        aspects.opportunity.push(item);
        matched = true;
      }

      // 3. Cash / Monetary Rewards
      const hasCashNum =
        /\d+\s*(?:tr\b|triệu|tỷ|k\b|vnđ|vnd|usd|\$|đồng|cny|jpy|rmb)/i.test(
          low
        );
      const hasCashWord =
        /tiền mặt|hiện kim|tiền thưởng|thù lao|ngân sách thực chiến|hỗ trợ ngân sách|hỗ trợ tài chính|cash prize/i.test(
          low
        );
      if (
        (hasCashNum || hasCashWord) &&
        !/học bổng|scholarship|khóa học/i.test(low)
      ) {
        if (
          !aspects.total_pool ||
          low !== aspects.total_pool.toLowerCase().trim()
        ) {
          aspects.cash.push(item);
          matched = true;
        }
      }

      // 4. In-kind / Trophy / Merchandise / Gifts
      if (
        /cúp|huy chương|kỷ niệm chương|hiện vật|quà tặng|merchandise|voucher|vật phẩm|áo thi đấu|quà từ|\bcup\b/i.test(
          low
        )
      ) {
        aspects.in_kind.push(item);
        matched = true;
      }

      // 5. Certificate & Academic Points
      if (
        /chứng nhận|giấy khen|bằng khen|certificate|điểm đoàn|điểm rèn luyện|e-certificate/i.test(
          low
        )
      ) {
        aspects.certificate.push(item);
        matched = true;
      }

      // Fallback
      if (
        !matched &&
        /quán quân|á quân|quý quân|giải nhất|giải nhì|giải ba|giải khuyến khích|\b1st\b|\b2nd\b|\b3rd\b/i.test(
          low
        )
      ) {
        aspects.cash.push(item);
      }
    });

    ['cash', 'scholarship', 'opportunity', 'in_kind', 'certificate'].forEach(
      k => {
        const unique = [];
        aspects[k].forEach(line => {
          if (!unique.some(u => u.includes(line) || line.includes(u))) {
            unique.push(line);
          }
        });
        aspects[k] = unique.slice(0, 6);
      }
    );

    const highlights = [];
    if (aspects.cash.length) highlights.push('Tiền mặt');
    if (aspects.scholarship.length) highlights.push('Học bổng');
    if (aspects.opportunity.length) highlights.push('Ươm tạo & Cơ hội');
    if (aspects.in_kind.length) highlights.push('Hiện vật & Cúp');
    if (aspects.certificate.length) highlights.push('Chứng nhận');
    aspects.highlights = highlights;

    if (
      !aspects.cash.length &&
      !aspects.scholarship.length &&
      !aspects.opportunity.length &&
      !aspects.in_kind.length &&
      !aspects.certificate.length
    ) {
      aspects.has_data = false;
    }

    return aspects;
  }

  function formatPrizeDisplay(c) {
    const b = parsePrizeAspects(c);
    if (b && b.total_pool) {
      return b.total_pool.length > 34
        ? b.total_pool.slice(0, 32) + '...'
        : b.total_pool;
    }
    if (b && b.cash && b.cash.length > 0) {
      const topCash = b.cash[0];
      return topCash.length > 34 ? topCash.slice(0, 32) + '...' : topCash;
    }
    if (!c.grand_prize || !c.grand_prize.trim())
      return state.lang === 'en' ? 'Gifts & Certificate' : 'Hiện vật & Chứng nhận';
    const clean = c.grand_prize.trim();
    if (clean.length > 34) {
      return clean.slice(0, 32) + '...';
    }
    return clean;
  }

  function renderAspectCard(typeClass, title, iconSvg, items) {
    if (!items || items.length === 0) return '';
    return `
      <div class="prize-aspect-card aspect-${typeClass}">
        <div class="prize-aspect-header">
          <div class="prize-aspect-icon">${iconSvg}</div>
          <div class="prize-aspect-title">${escapeHtml(title)}</div>
        </div>
        <ul class="prize-aspect-list">
          ${items
        .map(
          item => `
            <li class="prize-aspect-item">
              <span class="prize-aspect-bullet">▪</span>
              <span>${escapeHtml(item)}</span>
            </li>
          `
        )
        .join('')}
        </ul>
      </div>
    `;
  }

  function renderPrizeBreakdownHtml(comp) {
    const breakdown = parsePrizeAspects(comp);
    if (!breakdown || !breakdown.has_data) {
      return `
        <div class="prize-empty-state">
          <div class="prize-empty-icon">${ICONS.trophySm}</div>
          <div>
            <div class="prize-empty-title">Cơ cấu giải thưởng đang được cập nhật</div>
            <div class="prize-empty-desc">Ban tổ chức chưa công bố chi tiết các gói giải thưởng cho mùa giải này. Vui lòng theo dõi fanpage hoặc tài liệu thể lệ chính thức.</div>
          </div>
        </div>
      `;
    }

    const cardsHtml = [
      renderAspectCard(
        'cash',
        'Tiền mặt & Giải ngân',
        ICONS.banknote,
        breakdown.cash
      ),
      renderAspectCard(
        'scholarship',
        'Học bổng & Đào tạo',
        ICONS.graduation,
        breakdown.scholarship
      ),
      renderAspectCard(
        'opportunity',
        'Đặc quyền Ươm tạo & Cơ hội',
        ICONS.rocketSm,
        breakdown.opportunity
      ),
      renderAspectCard(
        'inkind',
        'Hiện vật, Cúp & Quà tặng',
        ICONS.trophySm,
        breakdown.in_kind
      ),
      renderAspectCard(
        'certificate',
        'Chứng nhận & Điểm rèn luyện',
        ICONS.certificate,
        breakdown.certificate
      ),
    ]
      .filter(Boolean)
      .join('');

    return `
      <div class="prize-breakdown-wrapper">
        <div class="prize-breakdown-header">
          <div class="prize-pool-group">
            ${breakdown.total_pool
        ? `
              <div class="prize-pool-badge">
                ${ICONS.trophySm}
                <span>${escapeHtml(breakdown.total_pool)}</span>
              </div>
            `
        : ''
      }
          </div>
          <div class="prize-highlights-tags">
            ${breakdown.highlights
        .map(
          h =>
            `<span class="chip chip-prize-aspect">${escapeHtml(h)}</span>`
        )
        .join('')}
          </div>
        </div>

        <div class="prize-aspects-grid">
          ${cardsHtml}
        </div>

        ${breakdown.raw_text
        ? `
          <div class="prize-raw-container">
            <button type="button" class="prize-raw-toggle-btn" onclick="togglePrizeRawText('${comp.id}')">
              <span>${ICONS.clipboard}</span>
              <span>Xem toàn văn công bố gốc từ BTC</span>
              <span class="prize-raw-arrow" id="prizeRawArrow-${comp.id}">▼</span>
            </button>
            <div class="prize-raw-content" id="prizeRawContent-${comp.id}" style="display: none;">
              ${escapeHtml(breakdown.raw_text)}
            </div>
          </div>
        `
        : ''
      }
      </div>
    `;
  }

  function renderComparePrizeCell(c) {
    const b = parsePrizeAspects(c);
    if (!b || !b.has_data) {
      return `<span style="color: var(--color-muted); font-size: 13px;">Chưa công bố chi tiết</span>`;
    }
    let html = `<div class="compare-prize-block">`;
    if (b.total_pool) {
      html += `<div class="compare-prize-pool">${escapeHtml(b.total_pool)}</div>`;
    }
    if (b.cash.length) {
      html += `<div class="compare-prize-row"><span class="compare-prize-label">Tiền mặt:</span> <span>${escapeHtml(b.cash[0])}</span></div>`;
    }
    if (b.scholarship.length) {
      html += `<div class="compare-prize-row"><span class="compare-prize-label">Học bổng:</span> <span>${escapeHtml(b.scholarship[0])}</span></div>`;
    }
    if (b.opportunity.length) {
      html += `<div class="compare-prize-row"><span class="compare-prize-label">Ươm tạo:</span> <span>${escapeHtml(b.opportunity[0])}</span></div>`;
    }
    if (b.in_kind.length && !b.cash.length && !b.scholarship.length) {
      html += `<div class="compare-prize-row"><span class="compare-prize-label">Hiện vật:</span> <span>${escapeHtml(b.in_kind[0])}</span></div>`;
    }
    if (b.certificate.length && !b.cash.length && !b.scholarship.length) {
      html += `<div class="compare-prize-row"><span class="compare-prize-label">Chứng nhận:</span> <span>${escapeHtml(b.certificate[0])}</span></div>`;
    }
    html += `</div>`;
    return html;
  }

  window.togglePrizeRawText = function (compId) {
    const el = document.getElementById(`prizeRawContent-${compId}`);
    const arrow = document.getElementById(`prizeRawArrow-${compId}`);
    if (!el) return;
    if (el.style.display === 'none') {
      el.style.display = 'block';
      if (arrow) arrow.textContent = '▲';
    } else {
      el.style.display = 'none';
      if (arrow) arrow.textContent = '▼';
    }
  };

  function slugify(text) {
    return text.toString().toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  // ==========================================================================
  // 4. COMPETITION MATCH SCORE ALGORITHM
  // ==========================================================================
  function computeMatchScore(competition, profile, skipMemoize = false) {
    if (!competition) return { score: 20, matchedSkills: [], missingSkills: [], hasSkillData: false };

    // Synchronize profile signature and cache invalidation (when not doing simulation)
    if (!skipMemoize) {
      const currentSig = getProfileSignature(profile);
      if (currentSig !== state._cachedProfileSig) {
        state._cachedProfileSig = currentSig;
        state._profileVersion++;
        SKILL_MATCH_CACHE.clear();
      }

      // High performance match memoization (O(1) on warm tab switches)
      if (competition._match && competition._matchVersion === state._profileVersion) {
        return competition._match;
      }
    }

    let score = 20;
    let matchedSkills = [];
    let missingSkills = [];

    const compSkills = competition.required_skills || [];
    const hasSkillData = compSkills.length > 0;

    if (hasSkillData) {
      let earnedWeighted = 0;
      let totalWeighted = 0;

      // Build active canonical set of user profile for instant O(1) matching
      const userSkills = profile.skills || [];
      const userCanonIds = new Set();
      userSkills.forEach(us => {
        const c = findCanonicalCompetency(us);
        if (c) userCanonIds.add(c.id);
      });

      compSkills.forEach(req => {
        const weight = req.priority === 'must_have' ? 2.5 : 1.0;
        totalWeighted += weight;
        const reqName = req.name || '';

        // O(1) canonical check first
        const rCanon = findCanonicalCompetency(reqName);
        let isMatched = rCanon && userCanonIds.has(rCanon.id);

        // Fallback to detailed match only if canonical check wasn't satisfied
        if (!isMatched) {
          isMatched = userSkills.some(us => areSkillsMatching(us, reqName));
        }

        if (isMatched) {
          earnedWeighted += weight;
          matchedSkills.push(req.name);
        } else {
          missingSkills.push(req.name);
        }
      });

      const skillRatio = totalWeighted > 0 ? (earnedWeighted / totalWeighted) : 0;
      score += Math.round(skillRatio * 50);
    } else {
      score += 5;
    }

    const compCatLower = (competition.category || '').toLowerCase();
    const userCatsLower = (profile.categories || []).map(c => c.toLowerCase());
    const catMatched = userCatsLower.some(uc => compCatLower.includes(uc) || uc.includes(compCatLower));
    if (catMatched) score += 20;

    const compLevel = (competition.experience_level || '').toLowerCase();
    const userLevel = (profile.level || 'Intermediate').toLowerCase();
    if (compLevel.includes(userLevel) || compLevel.includes('to')) {
      score += 10;
    } else if (userLevel === 'beginner' && compLevel.includes('advanced')) {
      score -= 10;
    }

    // Sanity checks:
    // If competition has required skills, but user has ZERO matching skills,
    // match score must NOT exceed 35% (user lacks competitive skill capability).
    if (hasSkillData && matchedSkills.length === 0) {
      score = Math.min(score, 35);
    }

    // If competition has no published skill criteria, cap at preliminary 45%
    if (!hasSkillData) {
      score = Math.min(score, 45);
    }

    // Best Fit tier (>= 80%) requires matching at least 2 relevant skills
    if (hasSkillData && matchedSkills.length < 2 && score >= 80) {
      score = 75;
    }

    score = Math.max(15, Math.min(98, score));
    const result = { score, matchedSkills, missingSkills, hasSkillData };

    if (!skipMemoize) {
      competition._match = result;
      competition._matchVersion = state._profileVersion;
    }
    return result;
  }

  function areSkillsSynonyms(s1, s2) {
    return areSkillsMatching(s1, s2);
  }

  // ==========================================================================
  // 5. ROUTING & NAVIGATION
  // ==========================================================================
  function setupRouting() {
    window.addEventListener('hashchange', handleHash);
    window.addEventListener('popstate', handleHash);

    // Track active page scroll position in real time whenever no modal is open
    window.addEventListener('scroll', () => {
      const hasOpenModal = document.querySelector('.modal-overlay.is-open');
      if (!hasOpenModal) {
        state._lastPageScrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
      }
    }, { passive: true });

    handleHash();
  }

  function handleHash() {
    const hash = window.location.hash || '#hub';
    const openModals = document.querySelectorAll('.modal-overlay.is-open');

    if (hash.startsWith('#dna/')) {
      const compId = hash.replace('#dna/', '');
      openDnaModal(compId);
      return;
    }

    if (hash.startsWith('#playbook/')) {
      const compId = hash.replace('#playbook/', '');
      if (openModals.length > 0) {
        closeAllModals();
      }
      openPlaybookForCompetition(compId);
      return;
    }

    // If modal is currently open and hash is no longer #dna/ (e.g. user pressed browser back button)
    if (openModals.length > 0) {
      closeAllModals();
    }

    const tabMap = {
      '#hub': 'hub',
      '#match': 'match',
      '#journey': 'journey',
      '#playbook': 'playbook',
      '#compare': 'compare',
      '#profile': 'profile'
    };

    const targetTab = tabMap[hash] || 'hub';
    if (targetTab !== state.activeTab) {
      switchTab(targetTab);
    }
  }

  function switchTab(tabId, forceScroll = false) {
    const isSameTab = state.activeTab === tabId;
    state.activeTab = tabId;

    document.querySelectorAll('.nav-link').forEach(link => {
      if (link.dataset.tab === tabId) {
        link.classList.add('is-active');
        link.setAttribute('aria-current', 'page');
      } else {
        link.classList.remove('is-active');
        link.removeAttribute('aria-current');
      }
    });

    document.querySelectorAll('.view-section').forEach(sec => {
      if (sec.id === `view-${tabId}`) {
        sec.classList.add('is-active');
      } else {
        sec.classList.remove('is-active');
      }
    });

    if (!isSameTab) {
      if (tabId === 'hub') renderHub();
      if (tabId === 'match') renderMatchView();
      if (tabId === 'journey') renderJourneyView();
      if (tabId === 'playbook') renderPlaybookView();
      if (tabId === 'compare') renderCompareView();
      if (tabId === 'profile') renderProfileView();
    }

    if (!isSameTab || forceScroll) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // ==========================================================================
  // 6. EVENT LISTENERS
  // ==========================================================================
  function setupEventListeners() {
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const tab = link.dataset.tab;
        if (state.activeTab === tab) {
          if (window.location.hash.startsWith('#dna/')) {
            closeAllModals();
          } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
          return;
        }
        window.location.hash = `#${tab}`;
      });
    });

    const headerBrand = document.querySelector('.header-brand');
    if (headerBrand) {
      headerBrand.addEventListener('click', (e) => {
        e.preventDefault();
        if (state.activeTab === 'hub') {
          if (window.location.hash.startsWith('#dna/')) {
            closeAllModals();
          } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
          return;
        }
        window.location.hash = '#hub';
      });
    }

    const mobileToggle = document.getElementById('mobileNavToggle');
    const navLinksContainer = document.querySelector('.nav-links');
    if (mobileToggle && navLinksContainer) {
      mobileToggle.addEventListener('click', () => {
        navLinksContainer.classList.toggle('is-mobile-open');
      });
    }

    const searchInput = document.getElementById('hubSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        state.searchQuery = e.target.value.toLowerCase().trim();
        state.displayLimit = 18;
        renderHub();
      });
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          triggerHubSearch();
        }
      });
    }

    const playbookSearchInput = document.getElementById('playbookSearchInput');
    if (playbookSearchInput) {
      playbookSearchInput.addEventListener('input', (e) => {
        state.playbookSearchQuery = e.target.value.toLowerCase().trim();
        renderPlaybookView();
      });
    }

    document.querySelectorAll('.search-scope-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.search-scope-btn').forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        state.searchScope = btn.dataset.scope || 'direct';
        state.displayLimit = 18;
        renderHub();
      });
    });

    document.querySelectorAll('.category-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('.category-pill').forEach(p => p.classList.remove('is-active'));
        pill.classList.add('is-active');
        state.selectedCategory = pill.dataset.catId;
        state.displayLimit = 18;
        renderHub();
      });
    });

    // Advanced Filter Tray Toggle (Mặc định mở sẵn, click để đóng/mở)
    const btnToggleAdvanced = document.getElementById('btnToggleAdvanced');
    const advancedFilterTray = document.getElementById('advancedFilterTray');
    if (btnToggleAdvanced && advancedFilterTray) {
      btnToggleAdvanced.addEventListener('click', () => {
        const isOpen = advancedFilterTray.classList.toggle('is-open');
        btnToggleAdvanced.classList.toggle('is-active', isOpen);
        btnToggleAdvanced.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });
    }

    const formatSelect = document.getElementById('filterFormat');
    if (formatSelect) {
      formatSelect.addEventListener('change', (e) => {
        state.selectedFormat = e.target.value;
        state.displayLimit = 18;
        renderHub();
      });
    }

    const modeSelect = document.getElementById('filterMode');
    if (modeSelect) {
      modeSelect.addEventListener('change', (e) => {
        state.selectedMode = e.target.value;
        state.displayLimit = 18;
        renderHub();
      });
    }

    const statusSelect = document.getElementById('filterStatus');
    if (statusSelect) {
      statusSelect.addEventListener('change', (e) => {
        state.selectedStatus = e.target.value;
        state.displayLimit = 18;
        renderHub();
      });
    }

    const levelSelect = document.getElementById('filterLevel');
    if (levelSelect) {
      levelSelect.addEventListener('change', (e) => {
        state.selectedLevel = e.target.value;
        state.displayLimit = 18;
        renderHub();
      });
    }

    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        state.selectedSort = e.target.value;
        state.displayLimit = 18;
        renderHub();
      });
    }

    // Load More Button
    const btnLoadMore = document.getElementById('btnLoadMore');
    if (btnLoadMore) {
      btnLoadMore.addEventListener('click', () => {
        state.displayLimit += 18;
        renderHub();
      });
    }

    const btnGridView = document.getElementById('btnGridView');
    const btnTableView = document.getElementById('btnTableView');
    if (btnGridView && btnTableView) {
      btnGridView.addEventListener('click', () => {
        state.viewMode = 'grid';
        btnGridView.classList.add('is-active');
        btnTableView.classList.remove('is-active');
        renderHub();
      });
      btnTableView.addEventListener('click', () => {
        state.viewMode = 'table';
        btnTableView.classList.add('is-active');
        btnGridView.classList.remove('is-active');
        renderHub();
      });
    }

    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        openSearchPalette();
      }
      if (e.key === 'Escape') {
        closeAllModals();
      }
    });

    const headerSearchBtn = document.getElementById('headerSearchBtn');
    if (headerSearchBtn) headerSearchBtn.addEventListener('click', openSearchPalette);

    const langToggleBtn = document.getElementById('langToggleBtn');
    if (langToggleBtn) {
      langToggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        toggleLanguage();
      });
    }

    const themeToggleBtn = document.getElementById('themeToggleBtn');
    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        toggleTheme();
      });
    }

    const headerProfileBtn = document.getElementById('headerProfileBtn');
    if (headerProfileBtn) {
      headerProfileBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.hash = '#profile';
      });
    }

    const profilePageForm = document.getElementById('profilePageForm');
    if (profilePageForm) {
      profilePageForm.addEventListener('submit', (e) => {
        e.preventDefault();
        saveProfileFromPage();
      });
    }

    const btnAddCustomSkill = document.getElementById('btnAddCustomSkill');
    const inputCustomSkill = document.getElementById('profilePageCustomSkill');
    if (btnAddCustomSkill && inputCustomSkill) {
      const addCustom = () => {
        const val = inputCustomSkill.value.trim();
        if (!val) return;
        const skillsToAdd = val.split(',').map(s => s.trim()).filter(Boolean);
        skillsToAdd.forEach(s => {
          if (!state.profile.skills.some(existing => existing.toLowerCase() === s.toLowerCase())) {
            state.profile.skills.push(s);
          }
        });
        inputCustomSkill.value = '';
        renderProfileView();
        showToast(`Đã thêm ${skillsToAdd.length} kỹ năng mới vào hồ sơ.`);
      };
      btnAddCustomSkill.addEventListener('click', addCustom);
      inputCustomSkill.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          addCustom();
        }
      });
    }

    const btnResetProfile = document.getElementById('btnResetProfilePage');
    if (btnResetProfile) {
      btnResetProfile.addEventListener('click', () => {
        state.profile = {
          name: 'Thí sinh tiềm năng',
          level: 'Intermediate',
          categories: ['Business Case & Chiến lược', 'Khởi nghiệp & Đổi mới sáng tạo', 'Tài chính, Ngân hàng & Kiểm toán'],
          skills: [
            'Problem Solving',
            'Critical Thinking',
            'Presentation & Communication',
            'Data Analysis',
            'Teamwork & Collaboration',
            'Slide Design & Storytelling'
          ],
          format: 'all',
          mode: 'all'
        };
        renderProfileView();
        showToast('Đã khôi phục hồ sơ về mặc định.');
      });
    }

    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          e.preventDefault();
          closeAllModals();
        }
      });
    });

    document.querySelectorAll('.btn-close-modal').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        closeAllModals();
      });
    });

    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
      profileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        saveProfileFromModal();
      });
    }

    const cvFileInput = document.getElementById('cvFileInput');
    const cvDropzone = document.getElementById('cvDropzone');

    if (cvFileInput) {
      cvFileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          handleCVFileUpload(e.target.files[0]);
        }
      });
    }

    if (cvDropzone) {
      cvDropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        cvDropzone.classList.add('is-dragover');
      });
      cvDropzone.addEventListener('dragleave', () => {
        cvDropzone.classList.remove('is-dragover');
      });
      cvDropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        cvDropzone.classList.remove('is-dragover');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          handleCVFileUpload(e.dataTransfer.files[0]);
        }
      });
    }

    const submitPlaybookForm = document.getElementById('submitPlaybookForm');
    if (submitPlaybookForm) {
      submitPlaybookForm.addEventListener('submit', (e) => {
        e.preventDefault();
        saveCommunityPlaybook();
      });
    }

    const dateRefBtn = document.getElementById('dateRefBtn');
    if (dateRefBtn) dateRefBtn.addEventListener('click', openDateRefModal);

    const btnSaveRefDate = document.getElementById('btnSaveRefDate');
    if (btnSaveRefDate) btnSaveRefDate.addEventListener('click', saveReferenceDate);

    const btnExportJourney = document.getElementById('btnExportJourney');
    if (btnExportJourney) btnExportJourney.addEventListener('click', exportJourneyData);

    const inputImportJourney = document.getElementById('inputImportJourney');
    if (inputImportJourney) inputImportJourney.addEventListener('change', importJourneyData);

    const langBtn = document.getElementById('langToggleBtn');
    if (langBtn) langBtn.addEventListener('click', toggleLanguage);

    const themeBtn = document.getElementById('themeToggleBtn');
    if (themeBtn) themeBtn.addEventListener('click', toggleTheme);
  }

  // ==========================================================================
  // 7. RENDER LOGIC
  // ==========================================================================
  function renderAll() {
    updateHeaderCounters();
    updateHeaderDateDisplay();
    renderHub();
    renderMatchView();
    renderJourneyView();
    renderPlaybookView();
    renderCompareView();
  }

  function updateHeaderCounters() {
    const savedCount = Object.keys(state.journey).length;
    const navJourneyCount = document.getElementById('navJourneyCounter');
    if (navJourneyCount) {
      navJourneyCount.textContent = savedCount;
      navJourneyCount.style.display = savedCount > 0 ? 'inline-block' : 'none';
    }

    const profileBtn = document.getElementById('headerProfileBtn');
    const profileText = document.getElementById('headerProfileName');
    const avatarLetter = document.getElementById('headerAvatarLetter');

    const displayName = state.profile.name && state.profile.name !== 'Thí sinh tiềm năng'
      ? state.profile.name
      : (state.lang === 'en' ? 'Profile' : 'Hồ sơ');

    if (avatarLetter) {
      const parts = displayName.trim().split(/\s+/);
      const lastWord = parts[parts.length - 1] || 'H';
      avatarLetter.textContent = lastWord.charAt(0).toUpperCase();
    }

    if (profileBtn) {
      profileBtn.setAttribute('title', state.profileConfigured && state.profile.name
        ? `${state.profile.name} (${state.profile.level}) - ${state.lang === 'en' ? 'Click to adjust profile' : 'Nhấn để tùy chỉnh hồ sơ'}`
        : (state.lang === 'en' ? 'Configure Personal Profile' : 'Thiết lập Hồ sơ Năng lực'));
    }

    if (profileText) {
      if (!state.profileConfigured || !state.profile.name) {
        profileText.textContent = state.lang === 'en' ? 'Profile' : 'Hồ sơ';
        let alertBadge = profileBtn ? profileBtn.querySelector('.header-profile-unconfigured-badge') : null;
        if (!alertBadge && profileBtn) {
          alertBadge = document.createElement('span');
          alertBadge.className = 'header-profile-unconfigured-badge';
          profileBtn.appendChild(alertBadge);
        }
        if (alertBadge) alertBadge.textContent = state.lang === 'en' ? 'Unconfigured' : 'Chưa thiết lập';
      } else {
        const badge = profileBtn ? profileBtn.querySelector('.header-profile-unconfigured-badge') : null;
        if (badge) badge.remove();
        profileText.textContent = state.profile.name;
      }
    }
  }

  // --------------------------------------------------------------------------
  // 7.1 COMPETEHUB
  // --------------------------------------------------------------------------
  function filterAndSortCompetitions() {
    let list = [...state.competitions];

    if (state.searchQuery) {
      const q = state.searchQuery.trim();
      const normQ = normalizeSearchText(q);
      const tokens = getSearchTokens(q);
      const normTokens = tokens.map(t => normalizeSearchText(t)).filter(Boolean);

      const isDeep = state.searchScope === 'deep';
      const scoredList = [];
      list.forEach(c => {
        const nameNorm = normalizeSearchText(c.name);
        const orgNorm = normalizeSearchText(c.organizer);
        const catNorm = normalizeSearchText(c.category);
        const skillsNorm = (c.required_skills || []).map(s => normalizeSearchText(s.name)).join(' ');
        const deepTextNorm = isDeep ? normalizeSearchText(`${c.short_description || ''} ${c.rounds_description || ''} ${c.grand_prize || ''} ${c.prizes_detail || ''}`) : '';

        let relevance = 0;
        let matched = false;

        // Exact match of full phrase receives high bonus
        if (normQ.length > 0) {
          if (nameNorm.includes(normQ)) {
            relevance += (nameNorm === normQ ? 150 : 100);
            matched = true;
          }
          if (orgNorm.includes(normQ)) {
            relevance += (orgNorm === normQ ? 80 : 50);
            matched = true;
          }
          if (catNorm.includes(normQ)) {
            relevance += 40;
            matched = true;
          }
          if (skillsNorm.includes(normQ)) {
            relevance += 35;
            matched = true;
          }
          if (isDeep && deepTextNorm.includes(normQ)) {
            relevance += 20;
            matched = true;
          }
        }

        // Token-level matching (checks all words for high precision)
        let tokenMatchCount = 0;
        normTokens.forEach(tok => {
          let hit = false;
          if (nameNorm.includes(tok)) {
            relevance += 25;
            hit = true;
          }
          if (orgNorm.includes(tok)) {
            relevance += 15;
            hit = true;
          }
          if (catNorm.includes(tok)) {
            relevance += 12;
            hit = true;
          }
          if (skillsNorm.includes(tok)) {
            relevance += 10;
            hit = true;
          }
          if (isDeep && deepTextNorm.includes(tok)) {
            relevance += 6;
            hit = true;
          }
          if (hit) tokenMatchCount++;
        });

        // If multi-word search, prioritize items matching all/most tokens
        if (normTokens.length > 1 && tokenMatchCount === normTokens.length) {
          relevance += 40;
          matched = true;
        } else if (tokenMatchCount > 0) {
          matched = true;
        }

        if (matched) {
          c._searchRelevance = relevance;
          scoredList.push(c);
        }
      });

      list = scoredList;
    } else {
      list.forEach(c => { c._searchRelevance = 0; });
    }

    if (state.selectedCategory !== 'all') {
      const catConfig = CATEGORY_MAP.find(c => c.id === state.selectedCategory);
      if (catConfig && catConfig.keywords) {
        list = list.filter(c => {
          const text = ((c.category || '') + ' ' + (c.name || '') + ' ' + (c.short_description || '')).toLowerCase();
          return catConfig.keywords.some(k => text.includes(k));
        });
      }
    }

    if (state.selectedFormat !== 'all') {
      list = list.filter(c => {
        const f = c.format.toLowerCase();
        const t = (c.team_size.type || '').toLowerCase();
        if (state.selectedFormat === 'individual') return f.includes('cá nhân') || t.includes('individual') || c.team_size.max === 1;
        if (state.selectedFormat === 'team') return f.includes('đội') || t.includes('team') || c.team_size.max > 1;
        return true;
      });
    }

    if (state.selectedMode !== 'all') {
      list = list.filter(c => c.format.toLowerCase().includes(state.selectedMode.toLowerCase()));
    }

    if (state.selectedStatus !== 'all') {
      list = list.filter(c => {
        const stage = getCompetitionStage(c);
        if (state.selectedStatus === 'open') return stage.key === 'open';
        if (state.selectedStatus === 'closing_soon') return stage.key === 'closing_soon';
        if (state.selectedStatus === 'active_round') return stage.key === 'active_round';
        if (state.selectedStatus === 'upcoming_round') return stage.key === 'upcoming_round';
        if (state.selectedStatus === 'closed') return stage.key === 'closed';
        return c.status === state.selectedStatus;
      });
    }

    if (state.selectedLevel !== 'all') {
      list = list.filter(c => c.experience_level.toLowerCase().includes(state.selectedLevel.toLowerCase()));
    }

    list.forEach(c => {
      c._match = computeMatchScore(c, state.profile);
    });

    list.sort((a, b) => {
      if (state.searchQuery && (b._searchRelevance || 0) !== (a._searchRelevance || 0)) {
        return (b._searchRelevance || 0) - (a._searchRelevance || 0);
      }
      if (state.selectedSort === 'match') return b._match.score - a._match.score;
      if (state.selectedSort === 'deadline') {
        const da = calculateDaysRemaining(a.deadline) ?? 9999;
        const db = calculateDaysRemaining(b.deadline) ?? 9999;
        return da - db;
      }
      if (state.selectedSort === 'name') return a.name.localeCompare(b.name, 'vi');
      if (state.selectedSort === 'prize') return (b.grand_prize || '').length - (a.grand_prize || '').length;
      return 0;
    });

    return list;
  }

  function renderCategoryFilterPills() {
    const strip = document.getElementById('hubCategoryStrip');
    if (!strip) return;

    const counts = {};
    counts['all'] = state.competitions.length;
    CATEGORY_MAP.forEach(cat => {
      if (cat.id === 'all') return;
      counts[cat.id] = state.competitions.filter(c => {
        const text = ((c.category || '') + ' ' + (c.name || '') + ' ' + (c.short_description || '')).toLowerCase();
        return cat.keywords.some(k => text.includes(k));
      }).length;
    });

    strip.innerHTML = CATEGORY_MAP.map(cat => {
      const isActive = state.selectedCategory === cat.id;
      const count = counts[cat.id] || 0;
      return `
        <button type="button"
                class="hub-cat-pill ${isActive ? 'is-active' : ''}"
                role="tab"
                aria-selected="${isActive ? 'true' : 'false'}"
                data-cat-id="${cat.id}">
          <span>${escapeHtml(state.lang === 'en' ? (cat.labelEn || cat.label) : cat.label)}</span>
          <span class="hub-cat-count">${count}</span>
        </button>
      `;
    }).join('');

    strip.querySelectorAll('.hub-cat-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        const catId = btn.dataset.catId;
        state.selectedCategory = catId;
        state.displayLimit = 18;
        renderHub();
      });
    });
  }

  function renderHub() {
    renderHubProfileBanner();
    renderCategoryFilterPills();
    const list = filterAndSortCompetitions();
    const countEl = document.getElementById('resultsCount');
    if (countEl) {
      countEl.innerHTML = t('resultsCount', list.length, state.competitions.length);
    }

    const gridContainer = document.getElementById('competitionsGrid');
    const tableContainer = document.getElementById('tableViewContainer');
    const tableBody = document.getElementById('takenoteTableBody');

    if (state.viewMode === 'grid') {
      if (gridContainer) gridContainer.style.display = 'grid';
      if (tableContainer) tableContainer.style.display = 'none';
      if (gridContainer) renderGridCards(list, gridContainer);
    } else {
      if (gridContainer) gridContainer.style.display = 'none';
      if (tableContainer) tableContainer.style.display = 'block';
      if (tableBody) renderTableRows(list, tableBody);
    }
  }

  window.handleCardClick = function (event, compId) {
    if (event.target.closest('button') || event.target.closest('a') || event.target.closest('input')) return;
    openDnaModal(compId);
  };

  function renderGridCards(list, container) {
    const loadMoreWrap = document.getElementById('loadMoreWrap');
    const loadMoreBtn = document.getElementById('btnLoadMore');

    if (list.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 48px 20px; background: var(--nf-bg-3); border-radius: var(--radius-container); border: 1px dashed var(--color-border-subtle);">
          <div style="margin-bottom: 8px; color: var(--color-muted);">${ICONS.search}</div>
          <div style="font-family: var(--font-display); font-size: 17px; font-weight: 700; margin-bottom: 6px;">${t('noCompetitionsFound')}</div>
          <div style="font-size: 13px; color: var(--color-muted);">${t('adjustSearchFilter')}</div>
          <button class="btn btn-secondary btn-sm" style="margin-top: 14px;" onclick="resetHubFilters()">${t('resetFilters')}</button>
        </div>
      `;
      if (loadMoreWrap) loadMoreWrap.style.display = 'none';
      return;
    }

    const displayItems = list.slice(0, state.displayLimit);

    container.innerHTML = displayItems.map(c => {
      const isSaved = !!state.journey[c.id];
      const stage = getCompetitionStage(c);
      const days = calculateDaysRemaining(c.deadline);
      const daysDisplay = formatDeadlineDisplay(c);
      const teamSizeDisplay = formatTeamSizeDisplay(c);
      const isUrgent = stage.key === 'closing_soon';
      const isCompared = state.compareList.includes(c.id);

      const scoreClass = c._match.score >= 75 ? 'score-high' : (c._match.score >= 50 ? 'score-med' : 'score-low');
      const prizeSnippet = formatPrizeDisplay(c);
      const sourceUrl = getValidExternalUrl(c.source_url);
      const displayCategory = formatCategoryDisplay(c.category);

      return `
        <article class="comp-card" id="card-${c.id}" onclick="handleCardClick(event, '${c.id}')" title="${state.lang === 'en' ? 'Click to inspect Competition DNA' : 'Nhấn để xem phân tích chuyên sâu Competition DNA'}">
          <div>
            <div class="comp-card-top">
              <div class="comp-badges-left">
                <span class="match-score-badge ${scoreClass}" title="${state.lang === 'en' ? 'Match score based on your profile' : 'Độ phù hợp theo hồ sơ của bạn'}">
                  ${ICONS.boltSm} ${c._match.score}% ${t('matchScore')}
                </span>
                <span class="chip comp-stage-chip ${stage.badgeClass}" title="${state.lang === 'en' ? 'Stage: ' : 'Giai đoạn: '}${escapeHtml(stage.name)}">
                  ${escapeHtml(stage.badgeText)}
                </span>
                <span class="chip chip-pill comp-cat-chip" title="${state.lang === 'en' ? 'Category: ' : 'Lĩnh vực: '}${escapeHtml(displayCategory)}">${highlightSearchText(displayCategory, state.searchQuery)}</span>
              </div>
              <button class="icon-action-btn ${isSaved ? 'is-saved' : ''}"
                      title="${isSaved ? t('savedJourney') : t('saveJourney')}"
                      aria-label="${isSaved ? t('removeJourney') : t('saveJourney')}"
                      onclick="event.stopPropagation(); toggleSaveJourney('${c.id}')">
                ${isSaved ? ICONS.starSolid : ICONS.starOutline}
              </button>
            </div>

            <!-- Competition name strictly preserved in original Vietnamese form -->
            <h3 class="comp-card-title">
              ${highlightSearchText(c.name, state.searchQuery)}
            </h3>

            <div class="comp-card-org">
              ${ICONS.building}
              <span class="text-truncate">${highlightSearchText(c.organizer, state.searchQuery)}</span>
            </div>

            <!-- Key Specs: Team Size & Deadline Countdown (No duplicate stage row) -->
            <div class="comp-card-specs">
              <span class="comp-spec-pill" title="${state.lang === 'en' ? 'Team size' : 'Quy mô đội thi'}">
                ${teamSizeDisplay.includes('Cá nhân') || teamSizeDisplay.includes('Individual') ? ICONS.user : ICONS.users}
                <span>${escapeHtml(teamSizeDisplay)}</span>
              </span>
              <span class="comp-spec-pill ${isUrgent ? 'is-urgent' : ''}" title="${state.lang === 'en' ? 'Registration deadline' : 'Hạn nộp hồ sơ'}">
                ${ICONS.clockSm}
                <span>${escapeHtml(daysDisplay)}</span>
              </span>
            </div>

            <!-- Grand Prize Row (Clean & Hairline) -->
            ${prizeSnippet && !['not specified', 'chưa rõ', 'đang cập nhật'].includes(prizeSnippet.toLowerCase()) ? `
              <div class="comp-card-prize-line" style="font-size: 11.5px; color: var(--color-muted); display: flex; align-items: center; gap: 6px; margin-bottom: var(--space-3);">
                ${ICONS.trophySm}
                <span class="text-truncate" title="${escapeHtml(c.grand_prize || '')}">${t('prizeLabel')} <strong style="color: var(--color-primary);">${escapeHtml(prizeSnippet)}</strong></span>
              </div>
            ` : ''}
          </div>

          <div class="comp-card-footer">
            <div style="display: flex; align-items: center; gap: 6px;">
              <button class="btn btn-sm ${isCompared ? 'btn-orange' : 'btn-subtle'}"
                      style="font-size: 11.5px; padding: 4px 8px; height: 28px;"
                      title="${isCompared ? t('compared') : t('compare')}"
                      onclick="event.stopPropagation(); toggleCompare('${c.id}')">
                ${ICONS.scaleSm} ${isCompared ? t('compared') : t('compare')}
              </button>
              ${sourceUrl ? `
                <a href="${escapeHtml(sourceUrl)}"
                   target="_blank"
                   rel="noopener noreferrer"
                   class="btn btn-sm btn-subtle"
                   style="font-size: 11.5px; padding: 4px 8px; height: 28px;"
                   title="${state.lang === 'en' ? 'Open official source link' : 'Mở Fanpage hoặc Website cuộc thi'}"
                   aria-label="${state.lang === 'en' ? 'Open official source link' : 'Mở Fanpage hoặc Website cuộc thi'}"
                   onclick="event.stopPropagation();">
                  ${ICONS.external} Link
                </a>
              ` : ''}
            </div>
            <span class="comp-card-cta">
              ${t('dnaDetails')} <svg class="svg-icon-sm" viewBox="0 0 24 24" style="width: 14px; height: 14px; margin-left: 2px;"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </span>
          </div>
        </article>
      `;
    }).join('');

    if (loadMoreWrap && loadMoreBtn) {
      if (list.length > state.displayLimit) {
        loadMoreWrap.style.display = 'flex';
        loadMoreBtn.textContent = state.lang === 'en'
          ? `Load more (${state.displayLimit} / ${list.length})`
          : `Xem thêm cuộc thi (${state.displayLimit} / ${list.length})`;
      } else {
        loadMoreWrap.style.display = 'none';
      }
    }
  }

  function renderTableRows(list, tbody) {
    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 40px;">${state.lang === 'en' ? 'No matching competitions found.' : 'Không có cuộc thi nào phù hợp.'}</td></tr>`;
      return;
    }

    tbody.innerHTML = list.map((c, i) => {
      const isSaved = !!state.journey[c.id];
      const displayCategory = formatCategoryDisplay(c.category);
      return `
        <tr>
          <td style="font-family: var(--font-mono); font-size: 11px; color: var(--color-muted);">${i + 1}</td>
          <td>
            <!-- Competition name strictly preserved in original Vietnamese form -->
            <div class="table-comp-name" onclick="openDnaModal('${c.id}')">${highlightSearchText(c.name, state.searchQuery)}</div>
            <div style="font-size: 11px; color: var(--color-muted);">${escapeHtml(c.season)}</div>
          </td>
          <td><span class="chip">${highlightSearchText(displayCategory, state.searchQuery)}</span></td>
          <td>${highlightSearchText(c.organizer, state.searchQuery)}</td>
          <td>
            <span class="match-score-badge ${c._match.score >= 70 ? 'score-high' : 'score-med'}">
              ${c._match.score}%
            </span>
          </td>
          <td><span style="font-weight: 600;">${escapeHtml(c.deadline || (state.lang === 'en' ? 'TBA' : 'Chưa rõ'))}</span></td>
          <td><span style="color: var(--color-awards); font-weight: 600;">${escapeHtml(formatPrizeDisplay(c))}</span></td>
          <td>
            <div style="display: flex; gap: 4px;">
              <button class="btn btn-sm btn-secondary" onclick="openDnaModal('${c.id}')">DNA</button>
              <button class="icon-action-btn ${isSaved ? 'is-saved' : ''}" style="width: 28px; height: 28px;" onclick="toggleSaveJourney('${c.id}')" aria-label="${isSaved ? t('removeJourney') : t('saveJourney')}">
                ${isSaved ? ICONS.starSolid : ICONS.starOutline}
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  window.triggerHubSearch = function () {
    const input = document.getElementById('hubSearchInput');
    if (input) {
      state.searchQuery = input.value.toLowerCase().trim();
      state.displayLimit = 18;
      renderHub();
      if (state.activeTab !== 'hub') {
        window.location.hash = '#hub';
      }
    }
  };

  window.resetHubFilters = function () {
    state.searchQuery = '';
    state.selectedCategory = 'all';
    state.selectedFormat = 'all';
    state.selectedMode = 'all';
    state.selectedStatus = 'all';
    state.selectedLevel = 'all';
    state.selectedSort = 'match';
    state.displayLimit = 18;

    const input = document.getElementById('hubSearchInput');
    if (input) input.value = '';

    const formatSelect = document.getElementById('filterFormat');
    if (formatSelect) formatSelect.value = 'all';

    const modeSelect = document.getElementById('filterMode');
    if (modeSelect) modeSelect.value = 'all';

    const levelSelect = document.getElementById('filterLevel');
    if (levelSelect) levelSelect.value = 'all';

    const statusSelect = document.getElementById('filterStatus');
    if (statusSelect) statusSelect.value = 'all';

    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) sortSelect.value = 'match';

    state.searchScope = 'direct';
    document.querySelectorAll('.search-scope-btn').forEach(b => {
      if (b.dataset.scope === 'direct') b.classList.add('is-active');
      else b.classList.remove('is-active');
    });

    renderHub();
  };

  // --------------------------------------------------------------------------
  // 7.2 COMPETITION DNA MODAL
  // --------------------------------------------------------------------------
  window.openDnaModal = function (compId) {
    const comp = state.competitions.find(c => c.id === compId);
    if (!comp) return;

    const modal = document.getElementById('dnaModal');
    const modalContent = document.getElementById('dnaModalBody');
    const modalTitle = document.getElementById('dnaModalTitle');
    const modalFooterActions = document.getElementById('dnaModalFooterActions');

    if (!modal || !modalContent) return;

    // Capture user's scroll position before modal opens if not already inside an open modal
    if (!modal.classList.contains('is-open')) {
      const currentScroll = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
      state._scrollBeforeModal = currentScroll > 0 ? currentScroll : (state._lastPageScrollY || 0);
    }

    const matchData = computeMatchScore(comp, state.profile);
    const stage = getCompetitionStage(comp);
    const days = calculateDaysRemaining(comp.deadline);
    const daysText = days !== null
      ? (days > 0
        ? (state.lang === 'en' ? `${days} days left before registration closes` : `Còn ${days} ngày trước khi đóng đơn`)
        : (days === 0
          ? (state.lang === 'en' ? 'Registration closes TODAY' : 'Đóng đơn HÔM NAY')
          : (state.lang === 'en' ? 'Registration closed' : 'Cuộc thi đã đóng đơn đăng ký')))
      : (state.lang === 'en' ? 'Deadline not yet announced' : 'Thời hạn chưa công bố chính thức');

    const isSaved = !!state.journey[comp.id];
    const displayCategory = formatCategoryDisplay(comp.category);

    if (modalTitle) {
      modalTitle.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px; flex-wrap: wrap;">
          <span class="chip chip-pill">${escapeHtml(displayCategory)}</span>
          <span class="chip comp-stage-chip ${stage.badgeClass}" title="${state.lang === 'en' ? 'Stage: ' : 'Giai đoạn: '}${escapeHtml(stage.name)}">${escapeHtml(stage.badgeText)}</span>
          <span class="chip">${escapeHtml(comp.season)}</span>
        </div>
        <!-- Competition name strictly preserved in original Vietnamese form -->
        <div style="font-size: 22px; font-weight: 800; font-family: var(--font-display); line-height: 1.3;">
          ${escapeHtml(comp.name)}
        </div>
        <div style="font-size: 13px; color: var(--color-muted); font-weight: 500; margin-top: 4px;">
          ${t('dnaOrganizedBy')} <strong style="color: var(--color-primary);">${escapeHtml(comp.organizer)}</strong>
        </div>
      `;
    }

    const milestonesHtml = (stage.milestones || []).map(m => {
      const isPast = m.dynamicStatus === 'closed';
      const isActive = m.dynamicStatus === 'active';
      return `
        <div class="timeline-step">
          <div class="timeline-dot ${isActive ? 'is-active' : (isPast ? 'is-closed' : '')}"></div>
          <div class="timeline-content ${isActive ? 'is-highlighted-stage' : ''}">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; gap: 8px; flex-wrap: wrap;">
              <span style="font-weight: 700; font-size: 14.5px; font-family: var(--font-display); color: var(--color-primary);">
                ${escapeHtml(m.name)}
              </span>
              <div style="display: flex; align-items: center; gap: 6px;">
                ${isActive
          ? `<span class="chip chip-orange" style="font-size: 11px; font-weight: 700;">${t('dnaMilestoneActive')}</span>`
          : (isPast
            ? `<span class="chip" style="font-size: 10.5px;">${t('dnaMilestoneClosed')}</span>`
            : `<span class="chip chip-subtle" style="font-size: 10.5px;">${t('dnaMilestoneUpcoming')}</span>`)}
                <span class="chip chip-subtle" style="font-size: 11px;">
                  ${escapeHtml(m.date || (state.lang === 'en' ? 'Timeline' : 'Lịch trình'))}
                </span>
              </div>
            </div>
            <div style="font-size: 13.5px; color: var(--color-muted); line-height: 1.5;">
              ${escapeHtml(m.description || (state.lang === 'en' ? 'Round requirements as officially announced.' : 'Chi tiết các yêu cầu vòng thi theo thông báo của BTC.'))}
            </div>
          </div>
        </div>
      `;
    }).join('');

    const skillsHtml = comp.required_skills.map(s => {
      const isMatched = matchData.matchedSkills.includes(s.name);
      return `
        <span class="chip ${isMatched ? 'chip-green' : 'chip-subtle'}" style="padding: 6px 12px; font-size: 13px;">
          ${isMatched ? ICONS.check : '•'} ${escapeHtml(s.name)}
          <span style="font-size: 11px; opacity: 0.8; margin-left: 3px;">(${s.priority === 'must_have' ? t('dnaSkillCore') : t('dnaSkillRecommended')})</span>
        </span>
      `;
    }).join('');

    const prizeBreakdown = parsePrizeAspects(comp);
    let prizeHeadline = state.lang === 'en' ? 'Updating' : 'Đang cập nhật';
    if (prizeBreakdown.total_pool) {
      prizeHeadline = prizeBreakdown.total_pool;
    } else if (prizeBreakdown.cash && prizeBreakdown.cash.length > 0) {
      prizeHeadline = prizeBreakdown.cash[0];
    } else if (comp.grand_prize) {
      prizeHeadline = comp.grand_prize;
    }
    const prizeSubText = (prizeBreakdown.highlights && prizeBreakdown.highlights.length > 0)
      ? prizeBreakdown.highlights.join(' · ')
      : (state.lang === 'en' ? 'In-kind & Opportunities' : 'Hiện vật & Cơ hội');

    modalContent.innerHTML = `
      <!-- Dynamic Match Analysis banner -->
      <div style="background-color: var(--nf-bg-2); border-radius: var(--radius-container); padding: 16px; border: 1px solid var(--color-border-subtle); display: flex; flex-direction: column; gap: 12px;">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
          <div>
            <div style="font-size: 12px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em; color: var(--color-muted); margin-bottom: 2px;">
              ${t('dnaMatchAssessmentTitle')}
            </div>
            <div style="font-size: 24px; font-weight: 800; font-family: var(--font-display); display: flex; align-items: center; gap: 6px;">
              ${ICONS.bolt} ${matchData.score}% ${t('dnaMatchScoreLabel')}
            </div>
          </div>
          <button class="btn btn-sm btn-subtle" onclick="openProfileModal()">
            ${ICONS.settings} ${t('dnaAdjustProfileBtn')}
          </button>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div style="background: var(--nf-bg-3); padding: 12px 14px; border-radius: var(--radius-button); border: 1px solid var(--color-border-light);">
            <div style="font-size: 12px; text-transform: uppercase; font-weight: 700; color: #0b6334; margin-bottom: 6px; display: flex; align-items: center; gap: 4px;">
              ${ICONS.check} ${t('dnaMatchedStrengths', matchData.matchedSkills.length)}
            </div>
            <div style="font-size: 13px; color: var(--color-primary); line-height: 1.5;">
              ${matchData.matchedSkills.length > 0
        ? matchData.matchedSkills.map(s => `<span class="skill-tag is-matched" style="margin-right: 4px; display: inline-block;">${escapeHtml(s)}</span>`).join('')
        : (matchData.hasSkillData
          ? `<span style="color: var(--color-muted); font-style: italic;">${t('dnaNoMatchingSkills')}</span>`
          : `<span style="color: var(--color-muted); font-style: italic;">${t('dnaNoSkillData')}</span>`)}
            </div>
          </div>

          <div style="background: var(--nf-bg-3); padding: 12px 14px; border-radius: var(--radius-button); border: 1px solid var(--color-border-light);">
            <div style="font-size: 12px; text-transform: uppercase; font-weight: 700; color: var(--color-orange); margin-bottom: 6px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 4px;">
              <span style="display: flex; align-items: center; gap: 4px;">${ICONS.alert} ${t('dnaMissingSkills', matchData.missingSkills.length)}</span>
              ${matchData.missingSkills.length > 0 ? `<span style="font-size: 10px; color: var(--color-muted); font-weight: 500;">${t('dnaClickToAddSkill')}</span>` : ''}
            </div>
            <div style="font-size: 13px; color: var(--color-primary); line-height: 1.5;">
              ${matchData.missingSkills.length > 0
        ? matchData.missingSkills.slice(0, 6).map(s => `<button type="button" class="skill-tag is-gap is-addable" onclick="quickAddSkillToProfile('${escapeHtml(s)}', event)" title="Nhấn để thêm kỹ năng này vào hồ sơ của bạn" style="margin-right: 4px; margin-bottom: 4px; display: inline-block;">+ ${escapeHtml(s)}</button>`).join('')
        : (matchData.hasSkillData && matchData.matchedSkills.length > 0
          ? `<span style="color: #0b6334; font-weight: 600;">${t('dnaAllSkillsMet')}</span>`
          : `<span style="color: var(--color-muted); font-style: italic;">${t('dnaNoSkillData')}</span>`)}
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Specs Cards -->
      <div class="dna-specs-grid">
        <div class="spec-cell">
          <div class="spec-title">${t('dnaDeadlineLabel')}</div>
          <div class="spec-val ${days !== null && days <= 5 ? 'text-urgent' : ''}">${escapeHtml(comp.deadline || (state.lang === 'en' ? 'TBA' : 'Chưa rõ'))}</div>
          <div class="spec-sub">${daysText}</div>
        </div>
        <div class="spec-cell">
          <div class="spec-title">${t('dnaCurrentStageLabel')}</div>
          <div class="spec-val">${escapeHtml(stage.name)}</div>
          <div class="spec-sub">${escapeHtml(stage.badgeText)}</div>
        </div>
        <div class="spec-cell">
          <div class="spec-title">${t('dnaFormatLevelLabel')}</div>
          <div class="spec-val">${escapeHtml(comp.format)} · ${escapeHtml(comp.experience_level)}</div>
          <div class="spec-sub">${t('dnaRoundsTeamSize', comp.rounds_count, comp.team_size.min, comp.team_size.max)}</div>
        </div>
        <div class="spec-cell">
          <div class="spec-title">${t('dnaPrizeSpectrumLabel')}</div>
          <div class="spec-val" style="color: #b45309; font-weight: 700;">${escapeHtml(prizeHeadline.length > 36 ? prizeHeadline.slice(0, 34) + '...' : prizeHeadline)}</div>
          <div class="spec-sub">${escapeHtml(prizeSubText)}</div>
        </div>
      </div>

      <div>
        <h4 class="dna-section-title">
          ${t('dnaAboutTitle')}
        </h4>
        <p style="font-size: 14.5px; line-height: 1.65; color: var(--color-primary);">
          ${escapeHtml(comp.short_description)}
        </p>
      </div>

      <div>
        <h4 class="dna-section-title">
          ${t('dnaEligibilityTitle')}
        </h4>
        <div style="background-color: var(--nf-bg-2); padding: 12px 16px; border-radius: var(--radius-button); font-size: 14px; line-height: 1.6; border: 1px solid var(--color-border-light); color: var(--color-primary);">
          ${escapeHtml(comp.eligibility)}
        </div>
      </div>

      <div>
        <h4 class="dna-section-title">
          ${t('dnaSkillsTitle')}
        </h4>
        <div style="display: flex; flex-wrap: wrap; gap: 6px;">
          ${skillsHtml}
        </div>
      </div>

      <div>
        <h4 class="dna-section-title">
          ${t('dnaTimelineTitle')}
        </h4>
        <div class="roadmap-timeline">
          ${milestonesHtml}
        </div>
      </div>

      <div>
        <h4 class="dna-section-title">
          ${t('dnaPrizeDetailedTitle')}
        </h4>
        ${renderPrizeBreakdownHtml(comp)}
      </div>

      <div style="border-top: 1px solid var(--color-border-light); padding-top: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <h4 class="dna-section-title" style="margin-bottom: 0;">
            ${t('dnaPlaybookTitle')}
          </h4>
          <button class="btn btn-sm btn-ghost" onclick="openPlaybookForCompetition('${comp.id}')" title="${state.lang === 'en' ? 'Open Winner\'s Playbook for this competition' : 'Mở chi tiết kinh nghiệm thi đấu của cuộc thi này trong Winner\'s Playbook'}">
            ${state.lang === 'en' ? 'Open Playbook →' : 'Mở Playbook →'}
          </button>
        </div>
        <div class="qa-block">
          <div class="qa-question">${state.lang === 'en' ? 'Key success factors:' : 'Bí quyết then chốt để thành công:'}</div>
          <div class="qa-answer">${escapeHtml(comp.playbook_insights.key_success_factors || comp.playbook_insights.prep_advice)}</div>
        </div>
      </div>
    `;

    if (modalFooterActions) {
      modalFooterActions.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
          <button class="btn btn-sm ${isSaved ? 'btn-orange' : 'btn-secondary'}" onclick="toggleSaveJourney('${comp.id}')">
            ${isSaved ? ICONS.starSolid : ICONS.starOutline} ${isSaved ? t('dnaBtnSaved') : t('dnaBtnSave')}
          </button>
          <button class="btn btn-sm btn-subtle" onclick="shareCompetition('${comp.id}')">
            ${ICONS.link} ${state.lang === 'en' ? 'Copy DNA Link' : 'Sao chép link DNA'}
          </button>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          ${(() => {
          const dnaLink = getCompetitionExternalLink(comp);
          if (dnaLink) {
            return `
                <a href="${escapeHtml(dnaLink)}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-orange">
                  ${t('dnaBtnApply')} ${ICONS.external}
                </a>
              `;
          }
          return `
              <button type="button" class="btn btn-sm btn-secondary" onclick="showToast('${state.lang === 'en' ? 'No direct registration link currently available.' : 'Cuộc thi này hiện chưa có đường dẫn đăng ký trực tiếp.'}');" title="${state.lang === 'en' ? 'No link available' : 'Chưa có link đăng ký'}">
                ${state.lang === 'en' ? 'No registration link' : 'Chưa có link đăng ký'}
              </button>
            `;
        })()}
        </div>
      `;
    }

    modal.classList.add('is-open');
    if (window.location.hash !== `#dna/${comp.id}`) {
      try {
        history.pushState(null, '', `#dna/${comp.id}`);
      } catch (e) {
        window.location.hash = `#dna/${comp.id}`;
      }
    }
  };

  window.shareCompetition = function (compId) {
    const url = `${window.location.origin}${window.location.pathname}#dna/${compId}`;
    navigator.clipboard.writeText(url).then(() => {
      showToast('Đã sao chép liên kết Competition DNA vào bộ nhớ tạm!');
    }).catch(() => {
      showToast(`Link DNA: ${url}`);
    });
  };

  // --------------------------------------------------------------------------
  // 7.3 COMPETEMATCH VIEW
  // --------------------------------------------------------------------------
  function renderMatchView() {
    const scoredList = state.competitions.map(c => ({
      ...c,
      _match: computeMatchScore(c, state.profile)
    })).sort((a, b) => b._match.score - a._match.score);

    const profileSummaryContainer = document.getElementById('matchProfileSummary');
    if (profileSummaryContainer) {
      const isEn = state.lang === 'en';
      const displayName = state.profile.name ? escapeHtml(state.profile.name) : `<span style="color: var(--color-muted); font-style: italic;">${isEn ? 'Profile name not set' : 'Chưa thiết lập tên hồ sơ'}</span>`;
      profileSummaryContainer.innerHTML = `
        <div class="profile-card-header">
          <div>
            <div style="font-size: 10.5px; text-transform: uppercase; font-weight: 700; color: var(--color-muted); font-family: var(--font-display); letter-spacing: 0.05em;">${isEn ? 'Active Competency Profile' : 'Hồ sơ năng lực đang kích hoạt'}</div>
            <div style="font-family: var(--font-display); font-size: 18px; font-weight: 800;">${displayName}</div>
          </div>
          <button class="btn btn-sm btn-secondary" onclick="openProfileModal()">
            ${ICONS.edit} ${isEn ? 'Edit Profile' : 'Chỉnh sửa'}
          </button>
        </div>
        <div style="margin-bottom: 10px; font-size: 12.5px; display: flex; align-items: center; gap: 8px;">
          <strong style="font-family: var(--font-display); font-size: 11.5px; text-transform: uppercase; color: var(--color-muted);">${isEn ? 'Level:' : 'Trình độ:'}</strong>
          <span class="chip">${escapeHtml(state.profile.level)}</span>
        </div>
        <div style="font-size: 10.5px; text-transform: uppercase; font-weight: 700; color: var(--color-muted); margin-bottom: 6px; font-family: var(--font-display); letter-spacing: 0.04em;">
          ${isEn ? `Your Verified Skills (${state.profile.skills.length}):` : `Kỹ năng của bạn (${state.profile.skills.length}):`}
        </div>
        <div class="profile-skills-summary">
          ${state.profile.skills.map(s => `<span class="chip chip-green">${escapeHtml(s)}</span>`).join('')}
        </div>
      `;
    }

    const topMatchesContainer = document.getElementById('topMatchesList');
    if (topMatchesContainer) {
      const isEn = state.lang === 'en';
      const top10 = scoredList.slice(0, 10);
      topMatchesContainer.innerHTML = top10.map((c, i) => `
        <div class="match-item-card">
          <div class="match-item-top">
            <div style="min-width: 0; flex: 1;">
              <div class="match-item-badges">
                <span class="chip chip-count">#${i + 1} Best Fit</span>
                <span class="chip chip-cat comp-cat-chip" title="${isEn ? 'Category: ' : 'Lĩnh vực: '}${escapeHtml(formatCategoryDisplay(c.category))}">${escapeHtml(formatCategoryDisplay(c.category))}</span>
                <span class="chip" title="${isEn ? 'Season: ' : 'Mùa thi: '}${escapeHtml(c.season)}">${escapeHtml(c.season)}</span>
              </div>
              <h4 class="match-item-title" onclick="openDnaModal('${c.id}')">
                ${escapeHtml(c.name)}
              </h4>
              <div style="font-size: 12px; color: var(--color-muted); font-family: var(--font-body); margin-top: 2px; word-break: break-word; overflow-wrap: break-word;">${isEn ? 'Organizer: ' : 'Tổ chức: '}${escapeHtml(c.organizer)}</div>
            </div>
            <div class="match-score-big" style="color: ${c._match.score >= 80 ? '#059669' : (c._match.score >= 60 ? '#10B981' : 'var(--color-primary)')};">
              ${c._match.score}<span>%</span>
            </div>
          </div>

          <div class="fit-analysis-box">
            <div>
              <div class="fit-col-title title-strengths">${ICONS.check} ${isEn ? 'Matched Strengths' : 'Điểm mạnh trùng khớp'}</div>
              <div class="fit-col-list">
                ${!c._match.hasSkillData
          ? `<span class="fit-empty-text" style="color: var(--color-muted);">${isEn ? 'Skill requirements not published' : 'Chưa công bố yêu cầu kỹ năng'}</span>`
          : (c._match.matchedSkills.length > 0
            ? c._match.matchedSkills.map(s => `<span class="skill-tag is-matched">${escapeHtml(s)}</span>`).join('')
            : `<span class="fit-empty-text" style="color: var(--color-muted);">${isEn ? 'No matching skills' : 'Chưa có kỹ năng phù hợp'}</span>`)}
              </div>
            </div>
            <div>
              <div class="fit-col-title title-gap">${ICONS.alert} ${isEn ? 'Skills to Build' : 'Kỹ năng cần trau dồi'}</div>
              <div class="fit-col-list">
                ${!c._match.hasSkillData
          ? `<span class="fit-empty-text" style="color: var(--color-muted);">${isEn ? 'Updating' : 'Đang cập nhật'}</span>`
          : (c._match.missingSkills.length > 0
            ? c._match.missingSkills.slice(0, 3).map(s => `<button type="button" class="skill-tag is-gap is-addable" onclick="quickAddSkillToProfile('${escapeHtml(s)}', event)" title="${isEn ? 'Click to add to your profile' : 'Nhấn để thêm kỹ năng này vào hồ sơ của bạn'}">+ ${escapeHtml(s)}</button>`).join('')
            : (c._match.matchedSkills.length > 0
              ? `<span class="fit-empty-text" style="color: #059669;">${isEn ? 'All core skills met' : 'Đã hội tụ đủ kỹ năng'}</span>`
              : `<span class="fit-empty-text" style="color: var(--color-muted);">${isEn ? 'No data' : 'Chưa có dữ liệu'}</span>`))}
              </div>
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 12px; padding-top: 10px; border-top: 1px solid var(--color-border-light); flex-wrap: wrap; gap: 8px;">
            <span style="font-size: 12px; color: var(--color-muted); font-family: var(--font-body); word-break: break-word; overflow-wrap: break-word;">${isEn ? 'Deadline: ' : 'Hạn đăng ký: '}<strong>${escapeHtml(c.deadline || (isEn ? 'TBA' : 'Chưa rõ'))}</strong></span>
            <button class="btn btn-sm btn-secondary" onclick="openDnaModal('${c.id}')">${isEn ? 'View Competition DNA →' : 'Xem Competition DNA →'}</button>
          </div>
        </div>
      `).join('');
    }

    renderSkillGapMatrix(scoredList.slice(0, 30));
  }

  function renderSkillGapMatrix(targetCompetitions) {
    const container = document.getElementById('skillGapWidget');
    if (!container || container.style.display === 'none') return;

    const gapCounts = {};
    let totalComps = targetCompetitions.length;

    targetCompetitions.forEach(c => {
      if (c._match && c._match.missingSkills) {
        c._match.missingSkills.forEach(s => {
          gapCounts[s] = (gapCounts[s] || 0) + 1;
        });
      }
    });

    const sortedGaps = Object.entries(gapCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 7);

    // Calculate real simulated score uplift for the top missing skill
    let recommendationHtml = '';
    if (sortedGaps.length === 0) {
      recommendationHtml = `
        <div style="margin-top: 16px; padding: 12px 14px; background: var(--nf-bg-2); border-radius: var(--radius-button); border: 1px solid var(--color-border-subtle); border-left: 3px solid #10B981; font-size: 12px; line-height: 1.5; font-family: var(--font-body);">
          ${ICONS.check} <strong>Hồ sơ hoàn thiện:</strong> Bạn đã sở hữu đầy đủ các kỹ năng cốt lõi được yêu cầu trong nhóm giải đấu này! Hãy tiếp tục duy trì và nâng cao trình độ thực chiến.
        </div>
      `;
    } else {
      const topSkill = sortedGaps[0][0];
      const targetCount = sortedGaps[0][1];

      // Simulate profile with topSkill added
      const simulatedProfile = {
        ...state.profile,
        skills: [...(state.profile.skills || []), topSkill]
      };

      let currentSum = 0;
      let simulatedSum = 0;
      let improvedCount = 0;
      let maxIndividualDelta = 0;

      targetCompetitions.forEach(c => {
        const curScore = c._match ? c._match.score : 20;
        currentSum += curScore;

        const simMatch = computeMatchScore(c, simulatedProfile, true);
        const simScore = simMatch ? simMatch.score : curScore;
        simulatedSum += simScore;

        const delta = simScore - curScore;
        if (delta > 0) {
          improvedCount++;
          if (delta > maxIndividualDelta) maxIndividualDelta = delta;
        }
      });

      const avgDelta = totalComps > 0 ? Math.round((simulatedSum - currentSum) / totalComps) : 0;
      const displayDelta = avgDelta > 0 ? avgDelta : (maxIndividualDelta > 0 ? maxIndividualDelta : 5);

      recommendationHtml = `
        <div style="margin-top: 16px; padding: 12px 14px; background: var(--nf-bg-2); border-radius: var(--radius-button); border: 1px solid var(--color-border-subtle); border-left: 3px solid #10B981; font-size: 12px; line-height: 1.5; font-family: var(--font-body);">
          ${ICONS.lightbulb} <strong>Khuyến nghị lộ trình:</strong> Nếu rèn luyện thêm <em>${escapeHtml(topSkill)}</em>, tỷ lệ Match Score dự kiến tăng thêm <strong>+${displayDelta}%</strong> (trực tiếp nâng độ phù hợp tại <strong>${targetCount}</strong> cuộc thi).
        </div>
      `;
    }

    container.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; flex-wrap: wrap; gap: 6px;">
        <h4 style="font-family: var(--font-display); font-size: 15px; font-weight: 800; text-transform: uppercase;">
          Ma trận thiếu hụt kỹ năng
        </h4>
        <span class="chip chip-count">Skill Gap</span>
      </div>
      <p style="font-size: 12px; color: var(--color-muted); line-height: 1.5; margin-bottom: 14px; font-family: var(--font-body);">
        Tần suất các kỹ năng được ban giám khảo yêu cầu nhiều nhất trong danh mục mục tiêu mà bạn chưa có:
      </p>

      ${sortedGaps.length === 0 ? `
        <div style="padding: 20px; text-align: center; color: var(--color-muted); font-size: 13px;">
          Không có kỹ năng nào bị thiếu hụt trong danh mục hiện tại.
        </div>
      ` : sortedGaps.map(([skill, count]) => {
      const pct = Math.round((count / totalComps) * 100);
      return `
          <div class="gap-bar-item">
            <div class="gap-bar-label">
              <span style="font-family: var(--font-display); font-weight: 600; font-size: 12.5px;">${escapeHtml(skill)}</span>
              <span style="color: #059669; font-weight: 700; font-family: var(--font-display); font-size: 12px;">${pct}% yêu cầu</span>
            </div>
            <div class="gap-progress-track">
              <div class="gap-progress-fill" style="width: ${pct}%;"></div>
            </div>
          </div>
        `;
    }).join('')}

      ${recommendationHtml}
    `;
  }

  // --------------------------------------------------------------------------
  // 7.4 MY JOURNEY
  // --------------------------------------------------------------------------
  window.toggleSaveJourney = function (compId) {
    if (state.journey[compId]) {
      delete state.journey[compId];
      showToast('Đã xóa cuộc thi khỏi Journey của bạn.');
    } else {
      state.journey[compId] = {
        stage: 'saved',
        savedAt: new Date().toISOString(),
        notes: '',
        checklist: [
          { text: 'Nghiên cứu đề bài và tiêu chí chấm điểm', done: false },
          { text: 'Tìm kiếm đồng đội và phân chia vai trò', done: false },
          { text: 'Hoàn thiện hồ sơ & đăng ký đúng hạn', done: false }
        ]
      };
      showToast('Đã thêm vào Journey! Bạn có thể quản lý hạn chót tại tab My Journey.');
    }

    saveLocalUserData();
    updateHeaderCounters();
    renderHub();
    renderJourneyView();
  };

  function renderJourneyView() {
    const savedIds = Object.keys(state.journey);
    const savedComps = savedIds.map(id => {
      const comp = state.competitions.find(c => c.id === id);
      return comp ? { ...comp, _journey: state.journey[id] } : null;
    }).filter(Boolean);

    const totalSaved = savedComps.length;
    let closingSoonCount = 0;
    let inProgressCount = 0;
    let completedCount = 0;

    savedComps.forEach(c => {
      const days = calculateDaysRemaining(c.deadline);
      if (days !== null && days >= 0 && days <= 7) closingSoonCount++;
      if (c._journey.stage === 'in_progress') inProgressCount++;
      if (c._journey.stage === 'completed') completedCount++;
    });

    const mTotal = document.getElementById('metricTotalSaved');
    const mUrgent = document.getElementById('metricUrgent');
    const mProgress = document.getElementById('metricInProgress');
    const mDone = document.getElementById('metricCompleted');

    if (mTotal) mTotal.textContent = totalSaved;
    if (mUrgent) mUrgent.textContent = closingSoonCount;
    if (mProgress) mProgress.textContent = inProgressCount;
    if (mDone) mDone.textContent = completedCount;

    const isEn = state.lang === 'en';
    const stages = [
      { id: 'saved', title: isEn ? 'Saved / Interested' : 'Đã lưu / Quan tâm', containerId: 'kanbanSaved' },
      { id: 'preparing', title: isEn ? 'Preparing Application' : 'Đang chuẩn bị đơn', containerId: 'kanbanPreparing' },
      { id: 'in_progress', title: isEn ? 'Competing' : 'Đang dự thi', containerId: 'kanbanInProgress' },
      { id: 'completed', title: isEn ? 'Completed' : 'Đã hoàn thành', containerId: 'kanbanCompleted' }
    ];

    stages.forEach(st => {
      const container = document.getElementById(st.containerId);
      if (!container) return;

      const itemsInStage = savedComps.filter(c => c._journey.stage === st.id);

      const badgeCount = document.getElementById(`count-${st.id}`);
      if (badgeCount) badgeCount.textContent = itemsInStage.length;

      if (itemsInStage.length === 0) {
        container.innerHTML = `<div class="kanban-empty-state">${isEn ? 'No competitions in this stage yet' : 'Chưa có cuộc thi nào ở giai đoạn này'}</div>`;
        return;
      }

      container.innerHTML = itemsInStage.map(c => {
        const days = calculateDaysRemaining(c.deadline);
        const daysBadge = days !== null
          ? `<span class="chip ${days <= 5 ? 'chip-orange' : ''}">${isEn ? `${days} days left` : `Còn ${days} ngày`}</span>`
          : `<span class="chip">${isEn ? 'Deadline: ' : 'Hạn: '}${escapeHtml(c.deadline || (isEn ? 'TBA' : 'Chưa rõ'))}</span>`;

        const checklistHtml = (c._journey.checklist || []).map((chk, chkIdx) => `
          <label class="check-item ${chk.done ? 'is-done' : ''}">
            <input type="checkbox" ${chk.done ? 'checked' : ''} onchange="toggleJourneyTask('${c.id}', ${chkIdx})">
            <span>${escapeHtml(chk.text)}</span>
          </label>
        `).join('');

        return `
          <div class="kanban-item-card">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <span class="chip chip-pill comp-cat-chip" style="font-size: 10px;" title="${isEn ? 'Category: ' : 'Lĩnh vực: '}${escapeHtml(formatCategoryDisplay(c.category))}">${escapeHtml(formatCategoryDisplay(c.category))}</span>
              ${daysBadge}
            </div>

            <!-- Competition name strictly preserved in original Vietnamese form -->
            <div class="kanban-item-title" onclick="openDnaModal('${c.id}')">
              ${escapeHtml(c.name)}
            </div>

            <div style="font-size: 11.5px; color: var(--color-muted); display: flex; align-items: center; gap: 4px;">
              ${ICONS.building} ${escapeHtml(c.organizer)}
            </div>

            <div class="kanban-checklist">
              <div style="font-size: 10.5px; text-transform: uppercase; font-weight: 700; color: var(--color-muted); margin-bottom: 4px;">
                ${isEn ? 'Round Tasks & Milestones:' : 'Nhiệm vụ vòng thi:'}
              </div>
              ${checklistHtml}
              <button class="btn btn-ghost" style="padding: 2px 0; font-size: 11px; color: var(--color-muted);" onclick="promptAddTask('${c.id}')">
                ${isEn ? '+ Add task' : '+ Thêm việc cần làm'}
              </button>
            </div>

            <div class="kanban-item-actions">
              <select style="font-size: 11px; background: var(--nf-bg-2); border-radius: 4px; padding: 3px 6px; border: 1px solid var(--color-border-subtle);"
                      onchange="moveJourneyStage('${c.id}', this.value)" aria-label="${isEn ? 'Change stage' : 'Chuyển trạng thái'}">
                <option value="saved" ${c._journey.stage === 'saved' ? 'selected' : ''}>${isEn ? 'Saved' : 'Đã lưu'}</option>
                <option value="preparing" ${c._journey.stage === 'preparing' ? 'selected' : ''}>${isEn ? 'Preparing' : 'Đang làm đơn'}</option>
                <option value="in_progress" ${c._journey.stage === 'in_progress' ? 'selected' : ''}>${isEn ? 'Competing' : 'Đang thi'}</option>
                <option value="completed" ${c._journey.stage === 'completed' ? 'selected' : ''}>${isEn ? 'Completed' : 'Hoàn thành'}</option>
              </select>

              <button class="btn-close-modal" style="width: 24px; height: 24px; font-size: 11px;" title="${isEn ? 'Remove from Journey' : 'Xóa khỏi Journey'}" onclick="toggleSaveJourney('${c.id}')" aria-label="${isEn ? 'Remove from Journey' : 'Xóa khỏi Journey'}">
                ${ICONS.x}
              </button>
            </div>
          </div>
        `;
      }).join('');
    });
  }

  window.moveJourneyStage = function (compId, newStage) {
    if (state.journey[compId]) {
      state.journey[compId].stage = newStage;
      saveLocalUserData();
      renderJourneyView();
      showToast(`Đã chuyển giai đoạn sang: ${newStage}`);
    }
  };

  window.toggleJourneyTask = function (compId, taskIndex) {
    if (state.journey[compId] && state.journey[compId].checklist[taskIndex]) {
      state.journey[compId].checklist[taskIndex].done = !state.journey[compId].checklist[taskIndex].done;
      saveLocalUserData();
      renderJourneyView();
    }
  };

  window.promptAddTask = function (compId) {
    const text = prompt('Nhập nhiệm vụ mới cần làm cho cuộc thi này:');
    if (text && text.trim()) {
      if (state.journey[compId]) {
        state.journey[compId].checklist = state.journey[compId].checklist || [];
        state.journey[compId].checklist.push({ text: text.trim(), done: false });
        saveLocalUserData();
        renderJourneyView();
      }
    }
  };

  function exportJourneyData() {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state.journey, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `competemate_journey_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Đã tải xuống file sao lưu Journey!');
  }

  function importJourneyData(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (evt) {
      try {
        const imported = JSON.parse(evt.target.result);
        if (typeof imported === 'object') {
          state.journey = Object.assign({}, state.journey, imported);
          saveLocalUserData();
          updateHeaderCounters();
          renderJourneyView();
          renderHub();
          showToast('Nhập dữ liệu Journey thành công!');
        }
      } catch (err) {
        alert('Lỗi đọc file JSON: ' + err.message);
      }
    };
    reader.readAsText(file);
  }

  // --------------------------------------------------------------------------
  // 7.5 WINNER'S PLAYBOOK VIEW (Master-Detail Split Layout)
  // --------------------------------------------------------------------------
  window.selectPlaybookItem = function (key) {
    if (state.selectedPlaybookCompId === key) {
      // Toggle off if clicking the already selected card
      state.selectedPlaybookCompId = null;
    } else {
      state.selectedPlaybookCompId = key;
    }
    renderPlaybookView();

    // On mobile devices, smoothly scroll down to the detail section
    if (state.selectedPlaybookCompId && window.innerWidth <= 992) {
      setTimeout(() => {
        const detailEl = document.getElementById('playbookRightDetail');
        if (detailEl) detailEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    }
  };

  window.openPlaybookForCompetition = function (compId) {
    // 1. Close DNA Modal
    closeAllModals({ preserveScroll: false });

    // 2. Clear any lingering search filter in Playbook to make sure the competition is visible
    state.playbookSearchQuery = '';
    const searchInput = document.getElementById('playbookSearchInput');
    if (searchInput) searchInput.value = '';

    // 3. Set the target competition as the selected active item
    state.selectedPlaybookCompId = `comp_${compId}`;

    // 4. Navigate to playbook tab
    window.location.hash = '#playbook';
    switchTab('playbook', true);

    // 5. Ensure playbook view is rendered with split layout
    renderPlaybookView();

    // 6. Smoothly scroll into the split container or detail pane, and scroll left list to active card
    setTimeout(() => {
      const activeCard = document.getElementById(`playbook-item-comp_${compId}`);
      if (activeCard) {
        activeCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }

      if (window.innerWidth <= 992) {
        const detailEl = document.getElementById('playbookRightDetail') || document.getElementById('playbookGrid');
        if (detailEl) {
          detailEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }, 120);
  };

  window.closePlaybookDetail = function () {
    state.selectedPlaybookCompId = null;
    renderPlaybookView();
  };

  window.resetPlaybookSearch = function () {
    state.playbookSearchQuery = '';
    const input = document.getElementById('playbookSearchInput');
    if (input) input.value = '';
    renderPlaybookView();
  };

  function renderPlaybookView() {
    const container = document.getElementById('playbookGrid');
    if (!container) return;

    let list = state.competitions.filter(c => c.playbook_insights && (c.playbook_insights.challenging_part || c.playbook_insights.key_success_factors));
    let communityList = [...state.communityPlaybooks];

    // Filter by playbookSearchQuery if user has entered search terms
    const query = (state.playbookSearchQuery || '').trim();
    if (query) {
      const normQ = normalizeSearchText(query);
      const tokens = getSearchTokens(query).map(t => normalizeSearchText(t)).filter(Boolean);

      const matchesSearch = (textToSearch) => {
        const normTarget = normalizeSearchText(textToSearch);
        if (normTarget.includes(normQ)) return true;
        return tokens.length > 0 && tokens.every(tok => normTarget.includes(tok));
      };

      list = list.filter(c => {
        const insights = c.playbook_insights || {};
        const combinedText = `${c.name} ${c.organizer} ${c.category} ${insights.challenging_part || ''} ${insights.common_mistakes || ''} ${insights.key_success_factors || ''} ${insights.prep_advice || ''}`;
        return matchesSearch(combinedText);
      });

      communityList = communityList.filter(item => {
        const combinedText = `${item.competitionName || ''} ${item.author || ''} ${item.achievement || ''} ${item.challenging_part || ''} ${item.common_mistakes || ''} ${item.key_skills || ''} ${item.prep_advice || ''}`;
        return matchesSearch(combinedText);
      });
    }

    // Check if an item is currently selected for the split view
    const selectedKey = state.selectedPlaybookCompId;

    // Check for empty state
    const isEn = state.lang === 'en';
    if (list.length === 0 && communityList.length === 0) {
      container.className = 'playbook-grid';
      container.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 48px 20px; text-align: center; background-color: var(--nf-bg-3); border-radius: var(--radius-container); border: 1px solid var(--color-border-subtle);">
          <div style="font-size: 32px; margin-bottom: 12px; color: var(--color-muted);">🔍</div>
          <h3 style="font-family: var(--font-display); font-size: 18px; font-weight: 700; margin-bottom: 8px;">${isEn ? 'No playbook insights found' : 'Không tìm thấy kinh nghiệm phù hợp'}</h3>
          <p style="color: var(--color-muted); font-size: 14px; max-width: 500px; margin: 0 auto 16px auto;">
            ${isEn
          ? `No insights matched keyword <strong>"${escapeHtml(query)}"</strong> in the Playbook. Try another term or reset search.`
          : `Không có kết quả nào khớp với từ khóa <strong>"${escapeHtml(query)}"</strong> trong Playbook. Vui lòng thử tìm với từ khóa khác hoặc xóa bộ lọc.`}
          </p>
          <button class="btn btn-secondary btn-sm" onclick="resetPlaybookSearch()">
            ${isEn ? 'Reset Search' : 'Đặt lại tìm kiếm'}
          </button>
        </div>
      `;
      return;
    }

    if (!selectedKey) {
      // DEFAULT VIEW: Responsive multi-column grid
      container.className = 'playbook-grid';
      container.innerHTML = `
        ${communityList.map(item => {
        const itemKey = `comm_${item.id || item.competitionName}`;
        return `
            <article class="playbook-card" style="border-left: 4px solid var(--color-orange);" onclick="selectPlaybookItem('${escapeHtml(itemKey)}')">
              <div class="playbook-card-top">
                <span class="chip chip-orange" style="font-weight: 700;">${isEn ? 'Community Insight' : 'Chia sẻ từ Cộng đồng'}</span>
                <span class="chip">${escapeHtml(item.achievement || (isEn ? 'Contestant' : 'Thí sinh'))}</span>
              </div>
              <h3 class="playbook-comp-name">${highlightSearchText(item.competitionName, query)}</h3>
              <div style="font-size: 12px; color: var(--color-muted); margin-bottom: 8px;">${isEn ? 'Contributed by: ' : 'Đóng góp bởi: '}<strong>${highlightSearchText(item.author || (isEn ? 'Anonymous' : 'Ẩn danh'), query)}</strong></div>

              <div class="qa-accordion">
                <div class="qa-block">
                  <div class="qa-question">${isEn ? 'Biggest Challenge:' : 'Thách thức lớn nhất:'}</div>
                  <div class="qa-answer">${highlightSearchText(item.challenging_part || (isEn ? 'Updating' : 'Đang cập nhật'), query)}</div>
                </div>
                <div class="qa-block">
                  <div class="qa-question">${isEn ? 'Pitfalls to Avoid:' : 'Sai lầm cần tránh:'}</div>
                  <div class="qa-answer">${highlightSearchText(item.common_mistakes || (isEn ? 'Updating' : 'Đang cập nhật'), query)}</div>
                </div>
                <div class="qa-block">
                  <div class="qa-question">${isEn ? 'Critical Success Skills:' : 'Kỹ năng then chốt:'}</div>
                  <div class="qa-answer">${highlightSearchText(item.key_skills || (isEn ? 'Updating' : 'Đang cập nhật'), query)}</div>
                </div>
                <div class="qa-block">
                  <div class="qa-question">${isEn ? 'Preparation Advice:' : 'Bí kíp chuẩn bị:'}</div>
                  <div class="qa-answer">${highlightSearchText(item.prep_advice || (isEn ? 'Updating' : 'Đang cập nhật'), query)}</div>
                </div>
              </div>
            </article>
          `;
      }).join('')}

        ${list.map(c => {
        const itemKey = `comp_${c.id}`;
        return `
            <article class="playbook-card" onclick="selectPlaybookItem('${escapeHtml(itemKey)}')">
              <div class="playbook-card-top">
                <span class="chip chip-pill comp-cat-chip" title="${isEn ? 'Category: ' : 'Lĩnh vực: '}${escapeHtml(formatCategoryDisplay(c.category))}">${highlightSearchText(formatCategoryDisplay(c.category), query)}</span>
                <span class="chip">${escapeHtml(c.season)}</span>
              </div>

              <!-- Competition name strictly preserved in original Vietnamese form -->
              <h3 class="playbook-comp-name">
                ${highlightSearchText(c.name, query)}
              </h3>
              <div style="font-size: 12px; color: var(--color-muted); margin-bottom: 6px;">
                ${isEn ? 'Organizer: ' : 'Ban tổ chức: '}<strong>${highlightSearchText(c.organizer, query)}</strong>
              </div>

              <div class="qa-accordion">
                <div class="qa-block">
                  <div class="qa-question">${isEn ? '1. What is the biggest challenge?' : '1. Thách thức lớn nhất là gì?'}</div>
                  <div class="qa-answer">${highlightSearchText(c.playbook_insights.challenging_part, query)}</div>
                </div>
                <div class="qa-block">
                  <div class="qa-question">${isEn ? '2. Common pitfalls new participants make?' : '2. Sai lầm thí sinh mới hay mắc phải?'}</div>
                  <div class="qa-answer">${highlightSearchText(c.playbook_insights.common_mistakes, query)}</div>
                </div>
                <div class="qa-block">
                  <div class="qa-question">${isEn ? '3. Key success factors to win?' : '3. Yếu tố then chốt tạo nên chiến thắng?'}</div>
                  <div class="qa-answer">${highlightSearchText(c.playbook_insights.key_success_factors, query)}</div>
                </div>
                <div class="qa-block">
                  <div class="qa-question">${isEn ? '4. Preparation advice for teams?' : '4. Lời khuyên chuẩn bị cho đội thi?'}</div>
                  <div class="qa-answer">${highlightSearchText(c.playbook_insights.prep_advice, query)}</div>
                </div>
              </div>
            </article>
          `;
      }).join('')}
      `;
      return;
    }

    // SPLIT VIEW: Left list (compact cards) + Right detailed pane
    container.className = 'playbook-split-container';

    let rightPaneHtml = '';
    let selectedIsCommunity = selectedKey.startsWith('comm_');

    if (selectedIsCommunity) {
      const commId = selectedKey.replace('comm_', '');
      const commItem = state.communityPlaybooks.find(i => (i.id || i.competitionName) === commId) || communityList[0];
      const matchedComp = commItem ? state.competitions.find(c => c.name.toLowerCase() === (commItem.competitionName || '').toLowerCase() || c.id === commItem.competitionId) : null;

      if (commItem) {
        rightPaneHtml = `
          <div class="playbook-right-detail" id="playbookRightDetail">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; gap: 8px;">
              <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                <span class="chip chip-orange" style="font-weight: 700;">${isEn ? 'Community Insight' : 'Kinh nghiệm từ Cộng đồng'}</span>
                <span class="chip">${escapeHtml(commItem.achievement || (isEn ? 'Contestant' : 'Thí sinh'))}</span>
              </div>
              <button class="btn btn-sm btn-ghost" onclick="closePlaybookDetail()" title="${isEn ? 'Close expanded detail' : 'Đóng chế độ mở rộng'}" aria-label="${isEn ? 'Close detail' : 'Đóng chi tiết'}">
                ${ICONS.x} ${isEn ? 'Close' : 'Đóng'}
              </button>
            </div>

            <!-- Competition name strictly preserved in original Vietnamese form -->
            <h2 style="font-family: var(--font-display); font-size: 22px; font-weight: 800; line-height: 1.3; color: var(--color-primary); margin-bottom: 6px;">
              ${highlightSearchText(commItem.competitionName, query)}
            </h2>

            <div style="font-size: 13px; color: var(--color-muted); margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid var(--color-border-light);">
              ${isEn ? 'Contributed by: ' : 'Đóng góp bởi: '}<strong style="color: var(--color-primary);">${highlightSearchText(commItem.author || (isEn ? 'Anonymous' : 'Ẩn danh'), query)}</strong>
              ${matchedComp ? ` · ${isEn ? 'Category: ' : 'Thuộc danh mục: '}<strong>${escapeHtml(formatCategoryDisplay(matchedComp.category))}</strong>` : ''}
            </div>

            <div class="qa-accordion" style="gap: 12px;">
              <div class="qa-block" style="border-left: 3px solid var(--color-orange);">
                <div class="qa-question" style="color: var(--color-orange); font-size: 13px;">${isEn ? '1. Biggest challenge in the competition:' : '1. Thách thức lớn nhất trong cuộc thi:'}</div>
                <div class="qa-answer" style="font-size: 14.5px;">${highlightSearchText(commItem.challenging_part || (isEn ? 'Updating' : 'Đang cập nhật'), query)}</div>
              </div>
              <div class="qa-block" style="border-left: 3px solid #dc2626;">
                <div class="qa-question" style="color: #dc2626; font-size: 13px;">${isEn ? '2. Common mistakes new participants make:' : '2. Sai lầm thí sinh mới hay mắc phải:'}</div>
                <div class="qa-answer" style="font-size: 14.5px;">${highlightSearchText(commItem.common_mistakes || (isEn ? 'Updating' : 'Đang cập nhật'), query)}</div>
              </div>
              <div class="qa-block" style="border-left: 3px solid #059669;">
                <div class="qa-question" style="color: #059669; font-size: 13px;">${isEn ? '3. Critical skills that drove success:' : '3. Kỹ năng then chốt tạo nên thành công:'}</div>
                <div class="qa-answer" style="font-size: 14.5px;">${highlightSearchText(commItem.key_skills || (isEn ? 'Updating' : 'Đang cập nhật'), query)}</div>
              </div>
              <div class="qa-block" style="border-left: 3px solid #7928CA;">
                <div class="qa-question" style="color: #7928CA; font-size: 13px;">${isEn ? '4. Preparation advice for teams:' : '4. Bí kíp chuẩn bị & Lời khuyên cho đội thi:'}</div>
                <div class="qa-answer" style="font-size: 14.5px;">${highlightSearchText(commItem.prep_advice || (isEn ? 'Updating' : 'Đang cập nhật'), query)}</div>
              </div>
            </div>

            <div style="margin-top: 20px; padding-top: 14px; border-top: 1px solid var(--color-border-light); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
              ${matchedComp ? `
                <button class="btn btn-sm btn-secondary" onclick="openDnaModal('${matchedComp.id}')">
                  ${isEn ? 'View Complete Competition DNA →' : 'Xem Competition DNA đầy đủ →'}
                </button>
              ` : `<span></span>`}
              <button class="btn btn-sm btn-subtle" onclick="closePlaybookDetail()">
                ${isEn ? 'Collapse View' : 'Thu gọn lại bảng'}
              </button>
            </div>
          </div>
        `;
      }
    } else {
      const compId = selectedKey.replace('comp_', '');
      const comp = state.competitions.find(c => c.id === compId) || list[0];

      if (comp) {
        const stage = getCompetitionStage(comp);
        const matchData = computeMatchScore(comp, state.profile);

        rightPaneHtml = `
          <div class="playbook-right-detail" id="playbookRightDetail">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; gap: 8px;">
              <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                <span class="chip chip-pill comp-cat-chip">${escapeHtml(formatCategoryDisplay(comp.category))}</span>
                <span class="chip comp-stage-chip ${stage.badgeClass}">${escapeHtml(stage.badgeText)}</span>
                <span class="chip">${escapeHtml(comp.season)}</span>
              </div>
              <button class="btn btn-sm btn-ghost" onclick="closePlaybookDetail()" title="${isEn ? 'Close expanded detail' : 'Đóng chế độ mở rộng'}" aria-label="${isEn ? 'Close detail' : 'Đóng chi tiết'}">
                ${ICONS.x} ${isEn ? 'Close' : 'Đóng'}
              </button>
            </div>

            <!-- Competition name strictly preserved in original Vietnamese form -->
            <h2 style="font-family: var(--font-display); font-size: 22px; font-weight: 800; line-height: 1.3; color: var(--color-primary); margin-bottom: 6px;">
              ${highlightSearchText(comp.name, query)}
            </h2>

            <div style="font-size: 13px; color: var(--color-muted); margin-bottom: 14px; padding-bottom: 10px; border-bottom: 1px solid var(--color-border-light); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 6px;">
              <span>${isEn ? 'Organizer: ' : 'Ban tổ chức: '}<strong style="color: var(--color-primary);">${highlightSearchText(comp.organizer, query)}</strong></span>
              <span class="match-score-badge score-${matchData.score >= 75 ? 'high' : (matchData.score >= 50 ? 'med' : 'low')}" style="padding: 2px 8px; font-size: 12px;">
                ${ICONS.boltSm} ${matchData.score}% ${t('matchScore')}
              </span>
            </div>

            <div class="qa-accordion" style="gap: 12px;">
              <div class="qa-block" style="border-left: 3px solid var(--color-orange);">
                <div class="qa-question" style="color: var(--color-orange); font-size: 13px;">${isEn ? '1. What is the biggest challenge?' : '1. Thách thức lớn nhất là gì?'}</div>
                <div class="qa-answer" style="font-size: 14.5px;">${highlightSearchText(comp.playbook_insights.challenging_part, query)}</div>
              </div>
              <div class="qa-block" style="border-left: 3px solid #dc2626;">
                <div class="qa-question" style="color: #dc2626; font-size: 13px;">${isEn ? '2. Common pitfalls new participants make?' : '2. Sai lầm thí sinh mới hay mắc phải?'}</div>
                <div class="qa-answer" style="font-size: 14.5px;">${highlightSearchText(comp.playbook_insights.common_mistakes, query)}</div>
              </div>
              <div class="qa-block" style="border-left: 3px solid #059669;">
                <div class="qa-question" style="color: #059669; font-size: 13px;">${isEn ? '3. Key success factors to win?' : '3. Yếu tố then chốt tạo nên chiến thắng?'}</div>
                <div class="qa-answer" style="font-size: 14.5px;">${highlightSearchText(comp.playbook_insights.key_success_factors, query)}</div>
              </div>
              <div class="qa-block" style="border-left: 3px solid #7928CA;">
                <div class="qa-question" style="color: #7928CA; font-size: 13px;">${isEn ? '4. Preparation advice for teams?' : '4. Lời khuyên chuẩn bị cho đội thi?'}</div>
                <div class="qa-answer" style="font-size: 14.5px;">${highlightSearchText(comp.playbook_insights.prep_advice, query)}</div>
              </div>
            </div>

            <div style="margin-top: 20px; padding-top: 14px; border-top: 1px solid var(--color-border-light); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
              <button class="btn btn-sm btn-secondary" onclick="openDnaModal('${comp.id}')">
                ${isEn ? 'View Detailed Competition DNA →' : 'Xem Competition DNA chi tiết →'}
              </button>
              <button class="btn btn-sm btn-subtle" onclick="closePlaybookDetail()">
                ${isEn ? 'Collapse View' : 'Thu gọn lại bảng'}
              </button>
            </div>
          </div>
        `;
      }
    }

    // Left List (Compact Cards for fast scrolling and quick switching)
    const leftListHtml = `
      <div class="playbook-left-list">
        <div style="font-size: 12px; color: var(--color-muted); font-weight: 600; text-transform: uppercase; margin-bottom: 2px;">
          ${isEn ? `Found Results (${communityList.length + list.length})` : `Kết quả tìm thấy (${communityList.length + list.length})`}
        </div>

        ${communityList.map(item => {
      const itemKey = `comm_${item.id || item.competitionName}`;
      const isSelected = selectedKey === itemKey;
      return `
            <article id="playbook-item-${escapeHtml(itemKey)}" class="playbook-card ${isSelected ? 'is-active-selection' : ''}" style="padding: 12px 14px; border-left: 4px solid var(--color-orange);" onclick="selectPlaybookItem('${escapeHtml(itemKey)}')">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; gap: 6px;">
                <span class="chip chip-orange" style="font-size: 10px; font-weight: 700; padding: 2px 6px;">${isEn ? 'Community' : 'Cộng đồng'}</span>
                <span style="font-size: 11px; color: var(--color-muted);">${escapeHtml(item.achievement || (isEn ? 'Contestant' : 'Thí sinh'))}</span>
              </div>
              <h4 style="font-family: var(--font-display); font-size: 15px; font-weight: 700; color: ${isSelected ? 'var(--color-orange)' : 'var(--color-primary)'}; margin-bottom: 4px; line-height: 1.3;">
                ${highlightSearchText(item.competitionName, query)}
              </h4>
              <p style="font-size: 12px; color: var(--color-muted); line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin: 0;">
                ${highlightSearchText(item.prep_advice || item.challenging_part || '', query)}
              </p>
            </article>
          `;
    }).join('')}

        ${list.map(c => {
      const itemKey = `comp_${c.id}`;
      const isSelected = selectedKey === itemKey;
      return `
            <article id="playbook-item-${escapeHtml(itemKey)}" class="playbook-card ${isSelected ? 'is-active-selection' : ''}" style="padding: 12px 14px;" onclick="selectPlaybookItem('${escapeHtml(itemKey)}')">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; gap: 6px;">
                <span class="chip chip-pill comp-cat-chip" style="font-size: 10.5px; padding: 2px 8px;">${highlightSearchText(formatCategoryDisplay(c.category), query)}</span>
                <span style="font-size: 11px; color: var(--color-muted); font-family: var(--font-mono);">${escapeHtml(c.season)}</span>
              </div>
              <h4 style="font-family: var(--font-display); font-size: 15px; font-weight: 700; color: ${isSelected ? 'var(--color-orange)' : 'var(--color-primary)'}; margin-bottom: 4px; line-height: 1.3;">
                ${highlightSearchText(c.name, query)}
              </h4>
              <p style="font-size: 12px; color: var(--color-muted); line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin: 0;">
                ${highlightSearchText(c.playbook_insights.prep_advice || c.playbook_insights.key_success_factors || '', query)}
              </p>
            </article>
          `;
    }).join('')}
      </div>
    `;

    container.innerHTML = leftListHtml + rightPaneHtml;
  }

  window.openSubmitPlaybookModal = function () {
    const modal = document.getElementById('submitPlaybookModal');
    if (modal) modal.classList.add('is-open');
  };

  function saveCommunityPlaybook() {
    const compName = document.getElementById('playbookCompName').value.trim();
    const author = document.getElementById('playbookAuthor').value.trim();
    const achievement = document.getElementById('playbookAchievement').value.trim();
    const challenge = document.getElementById('playbookChallenge').value.trim();
    const mistakes = document.getElementById('playbookMistakes').value.trim();
    const skills = document.getElementById('playbookSkills').value.trim();
    const advice = document.getElementById('playbookAdvice').value.trim();

    if (!compName || !advice) {
      alert('Vui lòng điền tên cuộc thi và lời khuyên chuẩn bị.');
      return;
    }

    state.communityPlaybooks.unshift({
      id: 'comm-' + Date.now(),
      competitionName: compName,
      author: author || 'Thí sinh',
      achievement: achievement || 'Finalist',
      challenging_part: challenge,
      common_mistakes: mistakes,
      key_skills: skills,
      prep_advice: advice,
      submittedAt: new Date().toISOString()
    });

    saveLocalUserData();
    closeAllModals();
    renderPlaybookView();
    showToast('Cảm ơn bạn! Kinh nghiệm quý giá của bạn đã được ghi nhận vào Playbook.');
  }

  // --------------------------------------------------------------------------
  // 7.6 MULTI-COMPETITION COMPARE
  // --------------------------------------------------------------------------
  window.toggleCompare = function (compId) {
    const idx = state.compareList.indexOf(compId);
    if (idx >= 0) {
      state.compareList.splice(idx, 1);
      showToast('Đã bỏ cuộc thi khỏi danh sách so sánh.');
    } else {
      if (state.compareList.length >= 3) {
        showToast('Chỉ có thể so sánh tối đa 3 cuộc thi cùng lúc. Vui lòng bỏ bớt 1 cuộc thi.');
        return;
      }
      state.compareList.push(compId);
      showToast('Đã thêm vào danh sách so sánh!');
    }

    saveLocalUserData();
    renderHub();
    renderCompareView();
  };

  window.addCompareFromSelect = function (compId) {
    if (!compId) return;
    if (state.compareList.includes(compId)) {
      showToast('Cuộc thi này đã có trên bàn cân so sánh!');
      return;
    }
    if (state.compareList.length >= 3) {
      showToast('Đã đủ tối đa 3 cuộc thi. Hãy bỏ bớt 1 cuộc thi trước.');
      return;
    }
    state.compareList.push(compId);
    saveLocalUserData();
    renderHub();
    renderCompareView();
    const comp = state.competitions.find(c => c.id === compId);
    showToast(`Đã thêm ${comp ? comp.name : 'cuộc thi'} vào bàn cân so sánh!`);
  };

  window.changeCompareSlot = function (slotIndex, newCompId) {
    if (!newCompId) return;
    if (state.compareList.includes(newCompId) && state.compareList[slotIndex] !== newCompId) {
      showToast('Cuộc thi này đã được chọn ở vị trí khác.');
      renderCompareView();
      return;
    }
    state.compareList[slotIndex] = newCompId;
    saveLocalUserData();
    renderHub();
    renderCompareView();
    showToast('Đã đổi cuộc thi trên bàn cân!');
  };

  window.clearAllCompare = function () {
    state.compareList = [];
    saveLocalUserData();
    renderHub();
    renderCompareView();
    showToast('Đã làm trống bàn cân so sánh.');
  };

  window.handleCompareSearchInput = function (query) {
    const resultsContainer = document.getElementById('compareSearchResults');
    if (!resultsContainer) return;
    const q = (query || '').trim().toLowerCase();
    if (!q) {
      resultsContainer.style.display = 'none';
      return;
    }

    const matches = state.competitions.filter(c =>
      c.name.toLowerCase().includes(q) ||
      (c.organizer && c.organizer.toLowerCase().includes(q)) ||
      (c.category && c.category.toLowerCase().includes(q))
    ).slice(0, 8);

    if (matches.length === 0) {
      resultsContainer.innerHTML = `
        <div style="padding: 12px 16px; font-size: 13px; color: var(--color-muted); text-align: center;">
          Không tìm thấy cuộc thi phù hợp với từ khóa "${escapeHtml(query)}"
        </div>
      `;
      resultsContainer.style.display = 'block';
      return;
    }

    resultsContainer.innerHTML = matches.map(c => {
      const isSelected = state.compareList.includes(c.id);
      const isFull = state.compareList.length >= 3 && !isSelected;
      return `
        <div class="compare-search-item">
          <div style="min-width: 0; flex: 1;">
            <div style="font-family: var(--font-display); font-size: 13.5px; font-weight: 700; line-height: 1.3; margin-bottom: 2px;">
              ${escapeHtml(c.name)}
            </div>
            <div style="font-size: 11.5px; color: var(--color-muted);">
              ${escapeHtml(c.organizer)} · <span class="chip" style="font-size: 9.5px; padding: 1px 5px;">${escapeHtml(c.category)}</span>
            </div>
          </div>
          <div>
            ${isSelected
          ? `<button class="btn btn-sm btn-subtle" onclick="event.stopPropagation(); toggleCompare('${c.id}');" style="color: var(--color-orange);">Đã chọn (Bỏ)</button>`
          : (isFull
            ? `<button class="btn btn-sm btn-subtle" disabled style="opacity: 0.5;">Đã đủ 3</button>`
            : `<button class="btn btn-sm btn-secondary" onclick="event.stopPropagation(); addCompareFromSelect('${c.id}'); document.getElementById('compareSearchResults').style.display='none';">+ Chọn</button>`
          )
        }
          </div>
        </div>
      `;
    }).join('');
    resultsContainer.style.display = 'block';
  };

  // Close compare search results on click outside
  document.addEventListener('click', function (e) {
    const resultsContainer = document.getElementById('compareSearchResults');
    const searchInput = document.getElementById('compareSearchInput');
    if (resultsContainer && searchInput && !searchInput.contains(e.target) && !resultsContainer.contains(e.target)) {
      resultsContainer.style.display = 'none';
    }
  });

  function buildCompetitionSelectOptions(selectedCompId = '', excludeIds = []) {
    const categories = {};
    state.competitions.forEach(c => {
      const cat = c.category || 'Khác';
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(c);
    });

    let html = `<option value="">-- Chọn cuộc thi từ danh sách --</option>`;
    for (const [cat, comps] of Object.entries(categories)) {
      const availableComps = comps.filter(c => c.id === selectedCompId || !excludeIds.includes(c.id));
      if (availableComps.length === 0) continue;
      html += `<optgroup label="${escapeHtml(cat)}">`;
      availableComps.forEach(c => {
        const isSel = c.id === selectedCompId ? ' selected' : '';
        html += `<option value="${c.id}"${isSel}>${escapeHtml(c.name)} (${escapeHtml(c.organizer)})</option>`;
      });
      html += `</optgroup>`;
    }
    return html;
  }

  function renderCompareView() {
    const selectorContainer = document.getElementById('compareSelectorPanel');
    const tableContainer = document.getElementById('compareTableContainer');
    if (!selectorContainer && !tableContainer) return;

    const items = state.compareList.map(id => state.competitions.find(c => c.id === id)).filter(Boolean);

    // 1. Render Selector Panel (Slots & Quick Search)
    if (selectorContainer) {
      const slotCardsHtml = [0, 1, 2].map(slotIdx => {
        const comp = items[slotIdx];

        if (comp) {
          return `
            <div class="compare-slot-card">
              <div>
                <div class="compare-slot-header">
                  <span class="slot-badge">Vị trí #${slotIdx + 1}</span>
                  <button class="btn btn-sm btn-ghost" style="color: var(--color-orange); padding: 2px 6px;" onclick="toggleCompare('${comp.id}')" title="Bỏ cuộc thi này khỏi so sánh">
                    ✕ Bỏ
                  </button>
                </div>
                <h4 class="slot-comp-name" onclick="openDnaModal('${comp.id}')" title="Xem phân tích DNA">
                  ${escapeHtml(comp.name)}
                </h4>
                <div class="slot-org">${escapeHtml(comp.organizer)}</div>
              </div>
              <div>
                <div style="margin-bottom: 6px; display: flex; gap: 4px; align-items: center; flex-wrap: wrap;">
                  <span class="chip chip-pill comp-cat-chip" style="font-size: 10px;" title="Lĩnh vực: ${escapeHtml(comp.category)}">${escapeHtml(comp.category)}</span>
                  <span class="chip" style="font-size: 10px;">${escapeHtml(comp.season)}</span>
                </div>
                <label style="font-size: 11px; color: var(--color-muted); display: block; margin-bottom: 4px;">Đổi sang cuộc thi khác:</label>
                <select class="compare-slot-select" onchange="changeCompareSlot(${slotIdx}, this.value)">
                  ${buildCompetitionSelectOptions(comp.id, state.compareList)}
                </select>
              </div>
            </div>
          `;
        } else {
          return `
            <div class="compare-slot-card is-empty">
              <div>
                <div class="compare-slot-header">
                  <span class="slot-badge" style="color: var(--color-muted);">Vị trí #${slotIdx + 1} (Trống)</span>
                </div>
                <div style="font-size: 12.5px; color: var(--color-muted); margin-bottom: 8px;">
                  Chọn cuộc thi để đối chiếu thông số tại cột này:
                </div>
              </div>
              <div>
                <select class="compare-slot-select" onchange="addCompareFromSelect(this.value)">
                  ${buildCompetitionSelectOptions('', state.compareList)}
                </select>
              </div>
            </div>
          `;
        }
      }).join('');

      selectorContainer.innerHTML = `
        <div class="compare-selector-panel">
          <div class="compare-panel-header">
            <div>
              <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                <span class="chip chip-count" style="font-weight: 800;">
                  ${state.compareList.length}/3 Cuộc thi
                </span>
                <strong style="font-family: var(--font-display); font-size: 15px; text-transform: uppercase;">
                  Chọn cuộc thi để đối chiếu trực tiếp
                </strong>
              </div>
              <p style="font-size: 12.5px; color: var(--color-muted); margin-top: 4px; margin-bottom: 0;">
                Chọn tối đa 3 cuộc thi từ 3 vị trí bên dưới hoặc gõ tìm kiếm nhanh để so sánh ngay:
              </p>
            </div>
            <div>
              ${state.compareList.length > 0 ? `
                <button class="btn btn-sm btn-subtle" onclick="clearAllCompare()" style="color: var(--color-orange);">
                  ✕ Đặt lại bàn cân
                </button>
              ` : ''}
            </div>
          </div>

          <div class="compare-search-wrap">
            <span class="search-icon">${ICONS.search}</span>
            <input type="text"
                   id="compareSearchInput"
                   class="compare-search-input"
                   placeholder="Gõ tên cuộc thi, ban tổ chức hoặc lĩnh vực để thêm nhanh vào bàn cân..."
                   autocomplete="off"
                   oninput="handleCompareSearchInput(this.value)"
                   onfocus="handleCompareSearchInput(this.value)">
            <div id="compareSearchResults" class="compare-search-results" style="display: none;"></div>
          </div>

          <div class="compare-slots-grid">
            ${slotCardsHtml}
          </div>
        </div>
      `;
    }

    // 2. Render Table Container
    if (tableContainer) {
      const isEn = state.lang === 'en';
      if (items.length === 0) {
        tableContainer.innerHTML = `
          <div style="text-align: center; padding: 48px 20px;">
            <div style="margin-bottom: 8px; color: var(--color-muted);">${ICONS.scale}</div>
            <div style="font-family: var(--font-display); font-size: 18px; font-weight: 700; margin-bottom: 6px;">
              ${isEn ? 'No competitions in comparison yet' : 'Chưa có cuộc thi nào trên bàn cân'}
            </div>
            <p style="color: var(--color-muted); font-size: 13.5px; max-width: 520px; margin: 0 auto;">
              ${isEn
            ? 'Select up to 3 competitions from the slots above or use quick search to compare across 11 detailed criteria.'
            : 'Hãy chọn tối đa 3 cuộc thi ở 3 vị trí phía trên hoặc dùng thanh tìm kiếm nhanh để đối chiếu 11 tiêu chí chi tiết.'}
            </p>
          </div>
        `;
        return;
      }

      const hasEmptySlot = items.length < 3;

      const rows = [
        {
          label: isEn ? 'Competition Name' : 'Tên cuộc thi', fn: c => `
          <!-- Competition name strictly preserved in original Vietnamese form -->
          <div class="compare-col-header" onclick="openDnaModal('${c.id}')" style="cursor: pointer;" title="${isEn ? 'View Competition DNA' : 'Xem DNA cuộc thi'}">
            ${escapeHtml(c.name)}
          </div>
        ` },
        {
          label: isEn ? 'Match Score' : 'Độ phù hợp (Match)', fn: c => {
            const m = computeMatchScore(c, state.profile);
            return `<span class="match-score-badge ${m.score >= 70 ? 'score-high' : 'score-med'}">${ICONS.boltSm} ${m.score}% ${t('matchScore')}</span>`;
          }
        },
        { label: isEn ? 'Category' : 'Lĩnh vực', fn: c => `<span class="chip chip-pill comp-cat-chip" title="${isEn ? 'Category: ' : 'Lĩnh vực: '}${escapeHtml(formatCategoryDisplay(c.category))}">${escapeHtml(formatCategoryDisplay(c.category))}</span>` },
        { label: isEn ? 'Organizer' : 'Ban tổ chức', fn: c => escapeHtml(c.organizer) },
        { label: isEn ? 'Registration Deadline' : 'Hạn đăng ký', fn: c => `<span style="font-weight: 700;">${escapeHtml(c.deadline || (isEn ? 'TBA' : 'Chưa rõ'))}</span>` },
        { label: isEn ? 'Prize Spectrum' : 'Giải thưởng', fn: c => renderComparePrizeCell(c) },
        { label: isEn ? 'Format & Team' : 'Hình thức & Đội', fn: c => `${escapeHtml(c.format)} (${c.team_size.min}-${c.team_size.max} ${isEn ? 'members' : 'người'})` },
        { label: isEn ? 'Rounds Count' : 'Số vòng thi', fn: c => `${c.rounds_count} ${isEn ? 'challenge rounds' : 'vòng thử thách'}` },
        { label: isEn ? 'Experience Level' : 'Trình độ', fn: c => escapeHtml(c.experience_level) },
        { label: isEn ? 'Key Required Skills' : 'Kỹ năng yêu cầu', fn: c => c.required_skills.slice(0, 5).map(s => `<span class="skill-tag" style="display:inline-block; margin:2px;">${escapeHtml(s.name)}</span>`).join('') },
        {
          label: isEn ? 'Action' : 'Thao tác', fn: c => `
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            <button class="btn btn-sm btn-secondary" onclick="openDnaModal('${c.id}')">${isEn ? 'View DNA →' : 'Xem DNA →'}</button>
            <button class="btn btn-sm btn-ghost" style="color: var(--color-orange);" onclick="toggleCompare('${c.id}')">${isEn ? 'Remove' : 'Bỏ so sánh'}</button>
          </div>
        `}
      ];

      tableContainer.innerHTML = `
        <table class="compare-table" aria-label="${isEn ? 'Detailed Competition Comparison Table' : 'Bảng so sánh chi tiết cuộc thi'}">
          <thead>
            <tr>
              <th scope="col" style="width: 180px;">${isEn ? 'Comparison Criteria' : 'Tiêu chí đối chiếu'}</th>
              ${items.map(c => `
                <th scope="col" style="text-align: left; vertical-align: top;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                    <span class="chip chip-count" style="font-size: 10px;">${isEn ? 'Competition' : 'Cuộc thi'}</span>
                    <button class="btn btn-sm btn-ghost" style="color: var(--color-orange); padding: 2px 6px;" onclick="toggleCompare('${c.id}')" title="${isEn ? 'Remove this competition' : 'Bỏ cuộc thi này'}">✕ ${isEn ? 'Remove' : 'Bỏ'}</button>
                  </div>
                  <!-- Competition name strictly preserved in original Vietnamese form -->
                  <div style="font-family: var(--font-display); font-size: 14px; font-weight: 700; color: var(--color-primary); cursor: pointer;" onclick="openDnaModal('${c.id}')">
                    ${escapeHtml(c.name)}
                  </div>
                </th>
              `).join('')}
              ${hasEmptySlot ? `
                <th scope="col" style="border: 1px dashed var(--color-border); background-color: transparent; vertical-align: top; width: 260px;">
                  <div style="padding: 4px;">
                    <div style="font-family: var(--font-display); font-size: 11px; text-transform: uppercase; color: var(--color-muted); font-weight: 700; margin-bottom: 6px;">
                      ${isEn ? `+ Add competition #${items.length + 1}` : `+ Thêm cuộc thi #${items.length + 1}`}
                    </div>
                    <select class="compare-slot-select" onchange="addCompareFromSelect(this.value)">
                      ${buildCompetitionSelectOptions('', state.compareList)}
                    </select>
                  </div>
                </th>
              ` : ''}
            </tr>
          </thead>
          <tbody>
            ${rows.map(r => `
              <tr>
                <th scope="row">${r.label}</th>
                ${items.map(c => `<td>${r.fn(c)}</td>`).join('')}
                ${hasEmptySlot ? `<td style="border: 1px dashed var(--color-border-subtle); background-color: rgba(0,0,0,0.01); text-align: center; color: var(--color-muted); font-size: 12px;">--</td>` : ''}
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }
  }

  // --------------------------------------------------------------------------
  // 7.7 VIEW: PROFILE VIEW & USER CONFIGURATOR (Dedicated Setup Page)
  // --------------------------------------------------------------------------
  window.openProfileModal = function () {
    window.location.hash = '#profile';
  };

  // ==========================================================================
  // PROFILE VIEW & SKILL SELECTION CONTROLLER
  // ==========================================================================

  state._profilePageActiveTab = 'all';
  state._profilePageSearchQuery = '';

  function computeDomainCompetencyCounts(domainId, userSkillsSet, universe) {
    const isCompSelected = (c) => {
      const n = c.name.toLowerCase();
      if (userSkillsSet.has(n)) return true;
      if (c.id && userSkillsSet.has(c.id.toLowerCase())) return true;
      return false;
    };

    if (domainId === 'all') {
      return {
        totalCount: universe.competencies.length,
        selectedCount: (state.profile.skills || []).length
      };
    } else if (domainId === 'core') {
      const core = universe.skillsByDomain['core'] || [];
      return {
        totalCount: core.length,
        selectedCount: core.filter(isCompSelected).length
      };
    } else {
      const domainSkills = universe.skillsByDomain[domainId] || [];
      return {
        totalCount: domainSkills.length,
        selectedCount: domainSkills.filter(isCompSelected).length
      };
    }
  }

  const DOMAIN_TRANSLATIONS = {
    all: { name: 'All Competencies', shortName: 'All (30)', desc: 'All 30 standardized competencies covering skills & tools from 106 competitions' },
    strategy: { name: 'Strategy & Thinking', shortName: 'Strategy (5)', desc: 'Logical thinking, case study problem solving, critical analysis and innovation' },
    business: { name: 'Business & Entrepreneurship', shortName: 'Business (5)', desc: 'Business Model Canvas (BMC), market research, MVP and fundraising' },
    finance: { name: 'Finance & Data', shortName: 'Finance (4)', desc: 'Financial modeling, valuation, accounting, risk management and data analysis' },
    tech: { name: 'Technology & AI', shortName: 'Tech & AI (3)', desc: 'Software engineering, AI/Prompt engineering applications and UI/UX design' },
    presentation: { name: 'Presentation & Marketing', shortName: 'Presentation (5)', desc: 'Pitching, slide storytelling, debate, moderation and growth marketing' },
    soft_skills: { name: 'Leadership & Execution', shortName: 'Execution (8)', desc: 'Teamwork, project management, HR, supply chain, languages and ESG' }
  };

  function renderProfilePageSkillTabs() {
    const tabsContainer = document.getElementById('profilePageSkillTabs');
    if (!tabsContainer) return;

    const isEn = state.lang === 'en';
    const universe = getSkillUniverse();
    const activeTab = state._profilePageActiveTab || 'all';
    const userSkillsSet = new Set((state.profile.skills || []).map(s => s.toLowerCase()));

    tabsContainer.innerHTML = universe.domains.map(d => {
      const isActive = d.id === activeTab;
      const { totalCount, selectedCount } = computeDomainCompetencyCounts(d.id, userSkillsSet, universe);
      const dName = (isEn && DOMAIN_TRANSLATIONS[d.id]) ? DOMAIN_TRANSLATIONS[d.id].name : d.name;
      const dShort = (isEn && DOMAIN_TRANSLATIONS[d.id]) ? DOMAIN_TRANSLATIONS[d.id].shortName : (d.shortName || d.name);

      return `
        <button type="button"
                class="skill-tab-btn ${isActive ? 'is-active' : ''}"
                onclick="setProfilePageSkillTab('${d.id}')"
                title="${escapeHtml(dName)}: ${isEn ? `Selected ${selectedCount}/${totalCount} competencies` : `Đã chọn ${selectedCount}/${totalCount} năng lực`}">
          <span>${escapeHtml(dShort)}</span>
          <span class="tab-domain-selected-badge ${selectedCount > 0 ? 'has-selected' : ''}">(${selectedCount})</span>
        </button>
      `;
    }).join('');
  }

  function renderProfileView() {
    const isEn = state.lang === 'en';
    const nameInput = document.getElementById('profilePageName');
    const levelSelect = document.getElementById('profilePageLevel');
    if (nameInput) nameInput.value = state.profile.name || '';
    if (levelSelect) levelSelect.value = state.profile.level || 'Intermediate';

    // 1. Render Categories Checkboxes
    const catWrap = document.getElementById('profileCategoriesWrap');
    if (catWrap) {
      catWrap.innerHTML = CATEGORY_MAP.filter(c => c.id !== 'all').map(c => {
        const isChecked = (state.profile.categories || []).some(catName =>
          catName.toLowerCase().includes(c.label.toLowerCase()) ||
          c.label.toLowerCase().includes(catName.toLowerCase()) ||
          catName.toLowerCase().includes(c.id)
        );
        const displayLabel = formatCategoryDisplay(c.label);
        return `
          <label class="profile-cat-checkbox-item">
            <input type="checkbox" value="${escapeHtml(c.label)}" ${isChecked ? 'checked' : ''} class="profile-cat-checkbox">
            <span>${escapeHtml(displayLabel)}</span>
          </label>
        `;
      }).join('');
    }

    // 2. Render Domain Filter Tabs for Profile Page
    renderProfilePageSkillTabs();

    // 3. Render Categorized Skills
    renderProfilePageSkillsGrid();

    // 4. Update Metrics Preview
    updateProfileMetricsPreview();
  }

  function renderProfilePageSkillsGrid() {
    const skillsGrid = document.getElementById('profileSkillsCategories');
    if (!skillsGrid) return;

    const isEn = state.lang === 'en';
    const universe = getSkillUniverse();
    const activeTab = state._profilePageActiveTab || 'all';
    const query = (state._profilePageSearchQuery || '').toLowerCase().trim();
    const userSkillsSet = new Set((state.profile.skills || []).map(s => s.toLowerCase()));

    let displayBlocks = [];

    if (query) {
      // Search across name, labelVi, subsumes, and keywords
      const filtered = universe.competencies.filter(c =>
        c.name.toLowerCase().includes(query) ||
        (c.labelVi && c.labelVi.toLowerCase().includes(query)) ||
        (c.subsumes && c.subsumes.some(s => s.toLowerCase().includes(query))) ||
        (c.keywords && c.keywords.some(kw => kw.toLowerCase().includes(query)))
      );
      displayBlocks.push({
        title: isEn ? `Search results for "${escapeHtml(query)}" (${filtered.length} competencies)` : `Kết quả tìm kiếm cho "${escapeHtml(query)}" (${filtered.length} năng lực)`,
        desc: isEn ? 'Standardized competencies and matching tools matching your search query' : 'Hiển thị các năng lực chuẩn hóa và công cụ liên quan khớp với từ khóa tìm kiếm',
        skills: filtered
      });
    } else if (activeTab === 'all') {
      // Show all 6 strategic domains with descriptions
      universe.domains.filter(d => !['all', 'core'].includes(d.id)).forEach(d => {
        const domainSkills = universe.skillsByDomain[d.id] || [];
        if (domainSkills.length > 0) {
          const trans = isEn && DOMAIN_TRANSLATIONS[d.id];
          displayBlocks.push({
            title: trans ? trans.name : d.name,
            desc: trans ? trans.desc : d.desc,
            domainId: d.id,
            skills: domainSkills
          });
        }
      });
    } else if (activeTab === 'core') {
      displayBlocks.push({
        title: isEn ? '10 Most In-Demand Core Competencies in 100 Competitions' : '10 Năng lực Nền tảng Phổ biến Nhất trong 100 Cuộc thi',
        desc: isEn ? 'Required across business, entrepreneurship, and academic student competitions' : 'Được yêu cầu xuyên suốt trong hầu hết các cuộc thi kinh doanh, khởi nghiệp & học thuật sinh viên',
        skills: universe.skillsByDomain['core'] || []
      });
    } else {
      const targetDomain = universe.domains.find(d => d.id === activeTab);
      const trans = isEn && targetDomain && DOMAIN_TRANSLATIONS[targetDomain.id];
      const domainSkills = universe.skillsByDomain[activeTab] || [];
      displayBlocks.push({
        title: trans ? trans.name : (targetDomain ? targetDomain.name : (isEn ? 'Competencies' : 'Năng lực')),
        desc: trans ? trans.desc : (targetDomain ? targetDomain.desc : ''),
        domainId: activeTab,
        skills: domainSkills
      });
    }

    // Add user custom skills block if any exist (skills not mapped to canonical)
    const canonicalNamesLower = new Set(universe.competencies.map(s => s.name.toLowerCase()));
    const customUserSkills = (state.profile.skills || []).filter(s => {
      const lower = s.toLowerCase();
      if (canonicalNamesLower.has(lower)) return false;
      const canonical = findCanonicalCompetency(s);
      return !canonical;
    });

    if (customUserSkills.length > 0 && !query) {
      displayBlocks.unshift({
        title: isEn ? `Custom Specialized Skills (${customUserSkills.length})` : `Kỹ năng Chuyên biệt Tự thêm (${customUserSkills.length})`,
        desc: isEn ? 'Custom specialized skills you added outside the canonical framework' : 'Các kỹ năng đặc thù do bạn tự gõ thêm ngoài khung chuẩn',
        skills: customUserSkills.map(name => ({
          name,
          labelVi: isEn ? 'Custom individual skill' : 'Kỹ năng đặc thù cá nhân',
          subsumes: [],
          count: 0,
          isCustom: true
        }))
      });
    }

    if (displayBlocks.length === 0 || displayBlocks.every(b => b.skills.length === 0)) {
      skillsGrid.innerHTML = `
        <div style="padding: 24px; text-align: center; color: var(--color-muted); background: var(--nf-bg-2); border-radius: var(--radius-card); border: 1px dashed var(--color-border-subtle);">
          ${isEn ? `No competencies matched keyword "${escapeHtml(query)}".` : `Không tìm thấy năng lực nào khớp với từ khóa "${escapeHtml(query)}".`}
          <div style="margin-top: 8px;">
            <button type="button" class="btn btn-sm btn-secondary" onclick="document.getElementById('profilePageSkillSearch').value=''; onProfilePageSkillSearch('');">
              ${isEn ? 'Clear Search' : 'Xóa tìm kiếm'}
            </button>
          </div>
        </div>
      `;
      return;
    }

    skillsGrid.innerHTML = displayBlocks.map(block => `
      <div class="profile-skill-category-block" style="margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
          <div>
            <div class="profile-skill-cat-title" style="margin-bottom: 2px;">${escapeHtml(block.title)}</div>
            ${block.desc ? `<div style="font-size: 12px; color: var(--color-muted);">${escapeHtml(block.desc)}</div>` : ''}
          </div>
          ${block.domainId && block.domainId !== 'all' ? `
            <button type="button" class="btn btn-xs btn-ghost" onclick="selectDomainSkills('${block.domainId}')" style="font-size: 11px; padding: 3px 8px; font-weight: 600;">
              ${isEn ? `+ Select group (${block.skills.length})` : `+ Chọn cả nhóm (${block.skills.length})`}
            </button>
          ` : ''}
        </div>
        <div class="competency-cards-grid">
          ${block.skills.map(c => {
      const isSelected = userSkillsSet.has(c.name.toLowerCase()) ||
        (state.profile.skills || []).some(us => us.toLowerCase() === c.name.toLowerCase() || (c.id && us.toLowerCase() === c.id.toLowerCase()));
      return `
              <label class="competency-card ${isSelected ? 'is-selected' : ''}">
                <div class="competency-card-top">
                  <input type="checkbox" value="${escapeHtml(c.name)}" ${isSelected ? 'checked' : ''} onchange="toggleProfileSkill(this)">
                  <div class="competency-info">
                    <div class="competency-title-row">
                      <span class="competency-name">${escapeHtml(c.name)}</span>
                      ${c.isCore ? `<span class="chip chip-orange" style="font-size: 9.5px; padding: 1px 6px;">${isEn ? 'Core' : 'Cốt lõi'}</span>` : ''}
                      ${c.count > 0 ? `<span class="competency-count-badge">${c.count} ${isEn ? 'competitions' : 'cuộc thi'}</span>` : ''}
                    </div>
                    <div class="competency-label-vi">${escapeHtml(c.labelVi)}</div>
                  </div>
                </div>
                ${c.subsumes && c.subsumes.length > 0 ? `
                  <div class="competency-subsumes-row">
                    <span class="subsumes-label">${isEn ? 'Includes:' : 'Bao trùm:'}</span>
                    <span class="subsumes-items">${c.subsumes.map(s => escapeHtml(s)).join(' · ')}</span>
                  </div>
                ` : ''}
                ${c.isCustom ? `
                  <div style="margin-top: 8px; display: flex; justify-content: flex-end;">
                    <button type="button" class="btn btn-xs btn-ghost" onclick="removeCustomSkill('${escapeHtml(c.name)}', event)" style="font-size: 11px; color: var(--color-danger); padding: 2px 6px;">✕ ${isEn ? 'Delete' : 'Xóa'}</button>
                  </div>
                ` : ''}
              </label>
            `;
    }).join('')}
        </div>
      </div>
    `).join('');
  }

  window.removeCustomSkill = function (skillName, e) {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    state.profile.skills = (state.profile.skills || []).filter(s => s.toLowerCase() !== skillName.toLowerCase());
    renderProfileView();
    showToast(`Đã xóa kỹ năng tùy biến "${skillName}".`);
  };

  window.setProfilePageSkillTab = function (tabId) {
    state._profilePageActiveTab = tabId;
    state._profilePageSearchQuery = '';
    const searchInput = document.getElementById('profilePageSkillSearch');
    if (searchInput) searchInput.value = '';

    const tabsContainer = document.getElementById('profilePageSkillTabs');
    if (tabsContainer) {
      tabsContainer.querySelectorAll('.skill-tab-btn').forEach(btn => btn.classList.remove('is-active'));
    }
    renderProfileView();
  };

  window.onProfilePageSkillSearch = function (query) {
    state._profilePageSearchQuery = query;
    renderProfilePageSkillsGrid();
  };

  window.selectDomainSkills = function (domainId) {
    const universe = getSkillUniverse();
    const skills = universe.skillsByDomain[domainId] || [];
    skills.forEach(s => {
      if (!state.profile.skills.some(us => us.toLowerCase() === s.name.toLowerCase())) {
        state.profile.skills.push(s.name);
      }
    });
    renderProfileView();
    showToast(`Đã thêm tất cả năng lực trong nhóm vào hồ sơ.`);
  };

  window.toggleProfileSkill = function (checkbox) {
    const card = checkbox.closest('.competency-card') || checkbox.parentElement;
    const skillName = checkbox.value;
    if (checkbox.checked) {
      if (card) card.classList.add('is-selected');
      if (!state.profile.skills.some(s => s.toLowerCase() === skillName.toLowerCase())) {
        state.profile.skills.push(skillName);
      }
    } else {
      if (card) card.classList.remove('is-selected');
      state.profile.skills = state.profile.skills.filter(s => s.toLowerCase() !== skillName.toLowerCase());
      // If it was a custom skill and now unchecked, re-render to refresh custom skills block
      const canonical = findCanonicalCompetency(skillName);
      if (!canonical) {
        renderProfilePageSkillsGrid();
      }
    }
    updateProfileMetricsPreview();
  };

  function updateProfileMetricsPreview() {
    const isEn = state.lang === 'en';
    const countEl = document.getElementById('profileSelectedSkillCount');
    const badgeEl = document.getElementById('profileReadinessBadge');
    const count = (state.profile.skills || []).length;
    if (countEl) countEl.textContent = count;
    if (badgeEl) {
      if (count < 3) {
        badgeEl.textContent = isEn ? 'Beginner' : 'Mới bắt đầu';
        badgeEl.className = 'chip chip-subtle';
      } else if (count < 6) {
        badgeEl.textContent = isEn ? 'Developing' : 'Tiềm năng';
        badgeEl.className = 'chip chip-blue';
      } else if (count < 10) {
        badgeEl.textContent = isEn ? 'Competition Ready' : 'Sẵn sàng thi đấu';
        badgeEl.className = 'chip chip-green';
      } else {
        badgeEl.textContent = isEn ? 'Comprehensive (High Fit)' : 'Toàn diện (High Fit)';
        badgeEl.className = 'chip chip-orange';
      }
    }
    renderProfilePageSkillTabs();
  }

  function saveProfileFromPage() {
    const nameInput = document.getElementById('profilePageName');
    const levelSelect = document.getElementById('profilePageLevel');

    const selectedCategories = [];
    document.querySelectorAll('.profile-cat-checkbox:checked').forEach(cb => {
      selectedCategories.push(cb.value);
    });

    state.profile.name = nameInput && nameInput.value.trim() ? nameInput.value.trim() : 'Thí sinh';
    state.profile.level = levelSelect ? levelSelect.value : 'Intermediate';
    state.profile.categories = selectedCategories.length > 0 ? selectedCategories : ['Business Case & Chiến lược', 'Khởi nghiệp & Đổi mới sáng tạo'];

    state.profileConfigured = true;
    localStorage.setItem('competemate_profile_configured', 'true');

    saveLocalUserData();
    updateHeaderCounters();
    renderAll();
    showToast('Đã lưu hồ sơ năng lực thành công! Đang chuyển đến bảng đo lường CompeteMatch...');

    setTimeout(() => {
      window.location.hash = '#match';
    }, 600);
  }

  function renderHubProfileBanner() {
    const container = document.getElementById('hubProfileActivationBanner');
    if (container) container.innerHTML = '';
  }

  // ==========================================================================
  // QUICK ONBOARDING PROFILE MODAL CONTROLLER
  // ==========================================================================

  // Known skills for regex matching in CV text
  const CV_KNOWN_SKILLS = [
    { name: 'Problem Solving', regex: /\b(problem\s*solving|giải\s*quyết\s*vấn\s*đề)\b/i },
    { name: 'Critical Thinking', regex: /\b(critical\s*thinking|tư\s*duy\s*phản\s*biện)\b/i },
    { name: 'Presentation & Communication', regex: /\b(presentation|thuyết\s*trình|communication|giao\s*tiếp|public\s*speaking)\b/i },
    { name: 'Data Analysis', regex: /\b(data\s*analysis|phân\s*tích\s*dữ\s*liệu|power\s*bi|tableau)\b/i },
    { name: 'Financial Modeling', regex: /\b(financial\s*model|mô\s*hình\s*tài\s*chính|corporate\s*finance|tài\s*chính\s*doanh\s*nghiệp)\b/i },
    { name: 'Valuation', regex: /\b(valuation|định\s*giá|dcf|comparable)\b/i },
    { name: 'Audit & Accounting', regex: /\b(audit|kiểm\s*toán|accounting|kế\s*toán|ifrs|vas)\b/i },
    { name: 'Market Research', regex: /\b(market\s*research|nghiên\s*cứu\s*thị\s*trường|industry\s*analysis)\b/i },
    { name: 'Business Model Canvas', regex: /\b(business\s*model|bmc|canvas|lean\s*startup)\b/i },
    { name: 'Pitching', regex: /\b(pitching|pitch\s*deck|gọi\s*vốn)\b/i },
    { name: 'Python', regex: /\b(python|pandas|numpy)\b/i },
    { name: 'SQL', regex: /\b(sql|mysql|postgresql)\b/i },
    { name: 'Excel & Advanced Formulas', regex: /\b(excel|vlookup|xlookup|pivot\s*table)\b/i },
    { name: 'Teamwork & Collaboration', regex: /\b(teamwork|làm\s*việc\s*nhóm|collaboration)\b/i },
    { name: 'Leadership', regex: /\b(leadership|lãnh\s*đạo|project\s*management|quản\s*lý\s*dự\s*án)\b/i },
    { name: 'Slide Design & Storytelling', regex: /\b(slide\s*design|storytelling|powerpoint|canva)\b/i },
    { name: 'Digital Marketing & Growth', regex: /\b(marketing|seo|sem|content|social\s*media|growth)\b/i },
    { name: 'Case Cracking', regex: /\b(case\s*cracking|case\s*competition|consulting)\b/i }
  ];

  const CV_KNOWN_UNIVERSITIES = [
    { name: 'Đại học Ngoại Thương (FTU)', regex: /\b(ftu|ngoại\s*thương|foreign\s*trade)\b/i },
    { name: 'ĐH Kinh tế Quốc dân (NEU)', regex: /\b(neu|kinh\s*tế\s*quốc\s*dân|national\s*economics)\b/i },
    { name: 'ĐH Kinh tế TP.HCM (UEH)', regex: /\b(ueh|kinh\s*tế\s*tp\.?\s*hcm)\b/i },
    { name: 'RMIT University', regex: /\b(rmit)\b/i },
    { name: 'Học viện Tài chính (HVTC)', regex: /\b(hvtc|học\s*viện\s*tài\s*chính|academy\s*of\s*finance)\b/i },
    { name: 'Học viện Ngoại giao (DAV)', regex: /\b(dav|học\s*viện\s*ngoại\s*giao|diplomatic\s*academy)\b/i },
    { name: 'ĐH Bách Khoa (HUST / BK)', regex: /\b(hust|bách\s*khoa|polytechnic)\b/i },
    { name: 'ĐHQG (VNU / UEL / USSH)', regex: /\b(vnu|uel|ussh|đại\s*học\s*quốc\s*gia)\b/i },
    { name: 'ĐH FPT', regex: /\b(fpt)\b/i },
    { name: 'British University Vietnam (BUV)', regex: /\b(buv)\b/i }
  ];

  function parseCVText(text) {
    if (!text || typeof text !== 'string') return { name: '', school: '', skills: [] };

    let detectedSchool = '';
    for (const u of CV_KNOWN_UNIVERSITIES) {
      if (u.regex.test(text)) {
        detectedSchool = u.name;
        break;
      }
    }

    let detectedName = '';
    const nameMatch = text.match(/(?:họ\s*(?:và|&)\s*tên|full\s*name|name)\s*[:\-]\s*([^\n\r,;]{2,35})/i);
    if (nameMatch && nameMatch[1]) {
      detectedName = nameMatch[1].trim();
    } else {
      const firstLine = text.trim().split(/[\r\n]+/)[0].trim();
      if (firstLine.length > 2 && firstLine.length < 30 && !/cv|curriculum|vitae|resume|tiểu sử/i.test(firstLine)) {
        detectedName = firstLine;
      }
    }

    const detectedSkills = [];
    for (const sk of CV_KNOWN_SKILLS) {
      if (sk.regex.test(text)) {
        detectedSkills.push(sk.name);
      }
    }

    return {
      name: detectedName,
      school: detectedSchool,
      skills: detectedSkills
    };
  }

  const POPULAR_SKILLS_FOR_ONBOARDING = [
    'Problem Solving',
    'Critical Thinking',
    'Presentation & Communication',
    'Data Analysis',
    'Financial Modeling',
    'Business Model Canvas',
    'Pitching',
    'Teamwork & Collaboration',
    'Excel & Advanced Formulas',
    'Python',
    'Market Research',
    'Valuation'
  ];

  function renderPopularSkillsPills() {
    const container = document.getElementById('popularSkillsPills');
    if (!container) return;

    const userSkills = new Set((state.profile.skills || []).map(s => s.toLowerCase()));

    container.innerHTML = POPULAR_SKILLS_FOR_ONBOARDING.map(sk => {
      const isSelected = userSkills.has(sk.toLowerCase());
      return `
        <button type="button"
                class="popular-skill-pill ${isSelected ? 'is-selected' : ''}"
                onclick="togglePopularSkillOnboarding('${escapeHtml(sk)}')">
          ${isSelected ? '✓ ' : '+ '}${escapeHtml(sk)}
        </button>
      `;
    }).join('');
  }

  window.togglePopularSkillOnboarding = function (skillName) {
    if (!state.profile.skills) state.profile.skills = [];
    const lower = skillName.toLowerCase();
    const idx = state.profile.skills.findIndex(s => s.toLowerCase() === lower);
    if (idx >= 0) {
      state.profile.skills.splice(idx, 1);
    } else {
      state.profile.skills.push(skillName);
    }
    renderPopularSkillsPills();
    renderDetectedSkills();
  };

  function renderDetectedSkills(skillsList) {
    const box = document.getElementById('detectedSkillsBox');
    const list = document.getElementById('detectedSkillsList');
    if (!box || !list) return;

    const skillsToShow = skillsList || state.profile.skills.slice(0, 10);
    if (!skillsToShow || skillsToShow.length === 0) {
      box.style.display = 'none';
      return;
    }

    box.style.display = 'block';
    list.innerHTML = skillsToShow.map(sk => `
      <span class="detected-skill-pill">
        ${ICONS.check}
        <span>${escapeHtml(sk)}</span>
      </span>
    `).join('');
  }

  function updateOnboardingStep(step) {
    [1, 2, 3].forEach(num => {
      const el = document.getElementById(`stepIndicator${num}`);
      if (el) {
        el.classList.toggle('is-active', num === step);
      }
    });
  }

  window.handleCVFileUpload = function (file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) {
      const content = e.target.result || '';
      applyParsedCVData(parseCVText(content));
    };
    reader.onerror = function () {
      showToast('Không thể đọc tệp CV. Hãy thử dán nội dung văn bản CV trực tiếp.');
    };
    reader.readAsText(file);
  };

  window.toggleCVPasteArea = function () {
    const box = document.getElementById('cvPasteBox');
    if (!box) return;
    const isOpen = box.classList.toggle('is-open');
    if (isOpen) {
      const ta = document.getElementById('cvPasteTextarea');
      if (ta) ta.focus();
    }
  };

  window.processPastedCVText = function () {
    const ta = document.getElementById('cvPasteTextarea');
    if (!ta || !ta.value.trim()) {
      showToast('Vui lòng dán nội dung tóm tắt CV vào ô văn bản.');
      return;
    }
    const result = parseCVText(ta.value);
    applyParsedCVData(result);
  };

  function applyParsedCVData(parsed) {
    const nameInput = document.getElementById('profileNameInput');
    const schoolInput = document.getElementById('profileSchoolInput');

    if (parsed.name && nameInput && !nameInput.value) {
      nameInput.value = parsed.name;
    }
    if (parsed.school && schoolInput) {
      schoolInput.value = parsed.school;
    }

    if (!state.profile.skills) state.profile.skills = [];
    parsed.skills.forEach(sk => {
      if (!state.profile.skills.some(s => s.toLowerCase() === sk.toLowerCase())) {
        state.profile.skills.push(sk);
      }
    });

    renderDetectedSkills(parsed.skills);
    renderPopularSkillsPills();
    updateOnboardingStep(2);

    const skillsCount = parsed.skills.length;
    showToast(`✓ Đã quét CV thành công: Nhận diện ${skillsCount} kỹ năng${parsed.school ? ` & trường ${parsed.school}` : ''}!`);
  }

  window.openProfileOnboardingModal = function (mode = 'cv') {
    const modal = document.getElementById('profileModal');
    if (!modal) return;

    const nameInput = document.getElementById('profileNameInput');
    const schoolInput = document.getElementById('profileSchoolInput');
    const levelSelect = document.getElementById('profileLevelSelect');

    if (nameInput) nameInput.value = (state.profile.name && state.profile.name !== 'Thí sinh tiềm năng') ? state.profile.name : '';
    if (schoolInput) schoolInput.value = state.profile.school || '';
    if (levelSelect) levelSelect.value = state.profile.level || 'Intermediate';

    renderPopularSkillsPills();
    renderDetectedSkills();
    updateOnboardingStep(mode === 'cv' ? 1 : 2);

    modal.classList.add('is-open');
    if (mode === 'manual' && nameInput) {
      setTimeout(() => nameInput.focus(), 60);
    }
  };

  // Universal 1-Click Skill Adder (Callable from ANY Competition Card or DNA Modal)
  window.quickAddSkillToProfile = function (skillName, event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (!skillName) return;

    if (!state.profile.skills) state.profile.skills = [];
    const lower = skillName.toLowerCase();
    if (!state.profile.skills.some(s => s.toLowerCase() === lower)) {
      state.profile.skills.push(skillName);
      state.profileConfigured = true;
      localStorage.setItem('competemate_profile_configured', 'true');
      saveLocalUserData();

      showToast(`✓ Đã thêm kỹ năng "${skillName}" vào hồ sơ! Tỷ lệ Match Score đã được cập nhật.`);

      updateHeaderCounters();

      // Refresh DNA Modal if currently open
      const openDnaModalId = window.location.hash.startsWith('#dna/') ? window.location.hash.replace('#dna/', '') : null;
      if (openDnaModalId) {
        openDnaModal(openDnaModalId);
      }

      // Refresh Match view if active
      if (state.activeTab === 'match') {
        renderMatchView();
      } else if (state.activeTab === 'profile') {
        renderProfileView();
      }
    } else {
      showToast(`Kỹ năng "${skillName}" đã có sẵn trong hồ sơ của bạn.`);
    }
  };

  window.dismissProfileModal = function () {
    sessionStorage.setItem('competemate_onboarding_dismissed', 'true');
    closeAllModals();
    showToast('Đang hiển thị với hồ sơ mẫu. Bạn có thể thiết lập bất cứ lúc nào qua nút "Hồ sơ" trên menu.');
  };

  window.saveProfileFromModal = function () {
    const nameInput = document.getElementById('profileNameInput');
    const schoolInput = document.getElementById('profileSchoolInput');
    const levelSelect = document.getElementById('profileLevelSelect');

    const enteredName = nameInput && nameInput.value.trim() ? nameInput.value.trim() : 'Thí sinh CompeteMate';
    state.profile.name = enteredName;
    if (schoolInput && schoolInput.value.trim()) {
      state.profile.school = schoolInput.value.trim();
    }
    state.profile.level = levelSelect ? levelSelect.value : 'Intermediate';

    if (!state.profile.skills || state.profile.skills.length === 0) {
      state.profile.skills = [
        'Problem Solving',
        'Critical Thinking',
        'Presentation & Communication',
        'Teamwork & Collaboration'
      ];
    }

    state.profileConfigured = true;
    localStorage.setItem('competemate_profile_configured', 'true');
    saveLocalUserData();

    state.competitions.forEach(c => {
      c._match = computeMatchScore(c, state.profile);
    });

    closeAllModals();
    updateHeaderCounters();
    renderAll();
    showToast(`✓ Đã kích hoạt hồ sơ thành công cho ${state.profile.name}! Match Score đã được cập nhật.`);
  };

  // --------------------------------------------------------------------------
  // 7.8 SEARCH PALETTE MODAL (CTRL+K)
  // --------------------------------------------------------------------------
  function openSearchPalette() {
    const modal = document.getElementById('paletteModal');
    const input = document.getElementById('paletteInput');
    const resultsContainer = document.getElementById('paletteResults');
    if (!modal || !input) return;

    modal.classList.add('is-open');
    input.value = '';
    input.focus();

    renderPaletteResults('', resultsContainer);

    input.oninput = (e) => {
      renderPaletteResults(e.target.value.toLowerCase().trim(), resultsContainer);
    };
  }

  function renderPaletteResults(query, container) {
    if (!container) return;

    let matches = state.competitions;
    if (query) {
      matches = matches.filter(c =>
        c.name.toLowerCase().includes(query) ||
        c.organizer.toLowerCase().includes(query) ||
        c.category.toLowerCase().includes(query)
      );
    }

    const items = matches.slice(0, 8);
    if (items.length === 0) {
      container.innerHTML = `<div style="padding: 20px; text-align: center; color: var(--color-muted); font-size: 13px;">Không tìm thấy cuộc thi nào.</div>`;
      return;
    }

    container.innerHTML = items.map(c => `
      <div class="palette-result-item" onclick="closeAllModals(); openDnaModal('${c.id}');">
        <div class="palette-result-text">
          <div class="palette-result-title">${escapeHtml(c.name)}</div>
          <div class="palette-result-meta">${escapeHtml(c.organizer)} · ${escapeHtml(c.category)}</div>
        </div>
        <span class="chip chip-subtle palette-result-chip" title="${escapeHtml(c.deadline || '')}">${escapeHtml(c.deadline || 'Hạn chót')}</span>
      </div>
    `).join('');
  }

  // --------------------------------------------------------------------------
  // 7.9 TIME REFERENCE & SIMULATION MODAL HANDLERS
  // --------------------------------------------------------------------------
  window.openDateRefModal = function () {
    const modal = document.getElementById('dateRefModal');
    if (!modal) return;

    const realDateEl = document.getElementById('realDeviceDatePreview');
    if (realDateEl) {
      const now = new Date();
      realDateEl.textContent = `Ngày giờ trên máy hiện tại: ${formatDateVn(now)}`;
    }

    const rReal = document.getElementById('radioRealDevice');
    const rCustom = document.getElementById('radioCustomDate');
    const customInput = document.getElementById('customDateInput');

    if (state.useRealDeviceDate) {
      if (rReal) rReal.checked = true;
    } else {
      if (rCustom) rCustom.checked = true;
    }

    if (customInput) {
      customInput.value = state.referenceDate || toIsoDate(new Date());
    }

    modal.classList.add('is-open');
  };

  window.saveReferenceDate = function () {
    const rReal = document.getElementById('radioRealDevice');
    const customInput = document.getElementById('customDateInput');

    if (rReal && rReal.checked) {
      state.useRealDeviceDate = true;
      const now = new Date();
      state.referenceDate = toIsoDate(now);
      localStorage.setItem('competemate_use_real_date', 'true');
      localStorage.removeItem('competemate_ref_date');
    } else {
      state.useRealDeviceDate = false;
      const customVal = customInput && customInput.value ? customInput.value : toIsoDate(new Date());
      state.referenceDate = customVal;
      localStorage.setItem('competemate_use_real_date', 'false');
      localStorage.setItem('competemate_ref_date', customVal);
    }

    updateHeaderDateDisplay();
    closeAllModals();

    // Rerender active view
    if (state.activeTab === 'hub') renderHub();
    else if (state.activeTab === 'match') renderMatchView();
    else if (state.activeTab === 'journey') renderJourneyView();
    else if (state.activeTab === 'compare') renderCompareView();
    else if (state.activeTab === 'profile') renderProfileView();

    const currentD = getCurrentReferenceDate();
    showToast(`Đã áp dụng mốc thời gian: ${formatDateVn(currentD)}! Các giai đoạn cuộc thi đã được tính toán lại.`);
  };

  function updateHeaderDateDisplay() {
    const el = document.getElementById('headerDateDisplay');
    if (el) {
      const d = getCurrentReferenceDate();
      el.textContent = formatDateVn(d);
    }
  }

  window.closeAllModals = function (options = {}) {
    const { preserveScroll = true } = options;
    const targetY = typeof state._scrollBeforeModal === 'number'
      ? state._scrollBeforeModal
      : (typeof state._lastPageScrollY === 'number' ? state._lastPageScrollY : (window.scrollY || 0));

    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('is-open'));

    if (window.location.hash.startsWith('#dna/')) {
      const targetHash = `#${state.activeTab || 'hub'}`;
      try {
        history.replaceState(null, '', targetHash);
      } catch (e) {
        try {
          history.pushState(null, '', targetHash);
        } catch (e2) { }
      }
    }

    if (preserveScroll && typeof targetY === 'number') {
      const restoreY = () => {
        window.scrollTo({ top: targetY, behavior: 'instant' });
        document.documentElement.scrollTop = targetY;
        document.body.scrollTop = targetY;
      };
      restoreY();
      requestAnimationFrame(restoreY);
      setTimeout(restoreY, 40);
      state._scrollBeforeModal = null;
    }
  };

  function showToast(msg) {
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `${ICONS.check} <span>${escapeHtml(msg)}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(8px)';
      toast.style.transition = 'all 0.2s ease';
      setTimeout(() => toast.remove(), 200);
    }, 3000);
  }
  window.showToast = showToast;

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function normalizeSearchText(str) {
    if (!str) return '';
    return String(str)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'd')
      .trim();
  }

  function getSearchTokens(query) {
    if (!query) return [];
    const trimmed = String(query).trim();
    if (!trimmed) return [];
    // Split into tokens: keep multi-word chunks and individual words
    const words = trimmed.split(/\s+/).filter(w => w.length > 0);
    // Combine full query (if multiple words) and individual words, sorted by length descending
    const set = new Set();
    if (words.length > 1) {
      set.add(trimmed);
    }
    words.forEach(w => {
      if (w.length >= 2) set.add(w);
      else if (words.length === 1) set.add(w);
    });
    return Array.from(set).sort((a, b) => b.length - a.length);
  }

  function highlightSearchText(text, query) {
    if (!text) return '';
    const safeText = String(text);
    if (!query || !query.trim()) {
      return escapeHtml(safeText);
    }

    const tokens = getSearchTokens(query);
    if (tokens.length === 0) {
      return escapeHtml(safeText);
    }

    // Find all match intervals using normalized matching to support non-accented search for accented Vietnamese
    const normText = normalizeSearchText(safeText);
    const intervals = [];

    tokens.forEach(tok => {
      const normTok = normalizeSearchText(tok);
      if (!normTok) return;

      // 1. Direct case-insensitive match on original text
      const escapedTok = tok.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const directRegex = new RegExp(escapedTok, 'gi');
      let m;
      while ((m = directRegex.exec(safeText)) !== null) {
        intervals.push([m.index, m.index + m[0].length]);
        if (directRegex.lastIndex === m.index) directRegex.lastIndex++;
      }

      // 2. Normalized matching (matches Vietnamese accents when searching without accent)
      let normIdx = 0;
      while ((normIdx = normText.indexOf(normTok, normIdx)) !== -1) {
        // Find matching slice in original text by char index mapping
        const start = normIdx;
        const end = normIdx + normTok.length;
        if (start < safeText.length && end <= safeText.length) {
          intervals.push([start, end]);
        }
        normIdx += normTok.length;
      }
    });

    if (intervals.length === 0) {
      return escapeHtml(safeText);
    }

    // Merge overlapping/adjacent intervals
    intervals.sort((a, b) => a[0] - b[0] || b[1] - a[1]);
    const merged = [];
    let current = intervals[0];
    for (let i = 1; i < intervals.length; i++) {
      const next = intervals[i];
      if (next[0] <= current[1]) {
        current[1] = Math.max(current[1], next[1]);
      } else {
        merged.push(current);
        current = next;
      }
    }
    merged.push(current);

    // Build highlighted string with escapeHtml on each segment
    let result = '';
    let lastIdx = 0;
    for (const [start, end] of merged) {
      if (start > lastIdx) {
        result += escapeHtml(safeText.slice(lastIdx, start));
      }
      result += `<span class="search-match-highlight">${escapeHtml(safeText.slice(start, end))}</span>`;
      lastIdx = end;
    }
    if (lastIdx < safeText.length) {
      result += escapeHtml(safeText.slice(lastIdx));
    }

    return result;
  }

  window.openRequestCompetitionModal = function () {
    const modal = document.getElementById('requestCompModal');
    if (modal) modal.classList.add('is-open');
  };

  window.submitCompetitionRequest = function (event) {
    if (event) event.preventDefault();
    const nameInput = document.getElementById('reqCompName');
    const compName = nameInput ? nameInput.value.trim() : '';
    if (!compName) {
      showToast(state.lang === 'en' ? 'Please enter competition name.' : 'Vui lòng nhập tên cuộc thi.');
      return;
    }
    const modal = document.getElementById('requestCompModal');
    if (modal) modal.classList.remove('is-open');
    if (nameInput) nameInput.value = '';
    const orgInput = document.getElementById('reqCompOrg');
    if (orgInput) orgInput.value = '';
    const linkInput = document.getElementById('reqCompLink');
    if (linkInput) linkInput.value = '';
    const notesInput = document.getElementById('reqCompNotes');
    if (notesInput) notesInput.value = '';

    showToast(state.lang === 'en'
      ? "✓ Thank you! Competition request submitted. We'll add it within 24h."
      : "✓ Cảm ơn bạn! Đề xuất cuộc thi đã được gửi. Chúng mình sẽ cập nhật trong 24h.");
  };

})();
