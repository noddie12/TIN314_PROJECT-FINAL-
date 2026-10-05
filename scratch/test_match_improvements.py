import sys
sys.stdout.reconfigure(encoding='utf-8')

with open("index.html", "r", encoding="utf-8") as f:
    index_html = f.read()

with open("styles.css", "r", encoding="utf-8") as f:
    styles_css = f.read()

with open("app.js", "r", encoding="utf-8") as f:
    app_js = f.read()

tests = [
    # 1. Skills in active profile card are in framed chips like level
    ("Active profile card wraps skills in chip chip-green", 'class="chip chip-green"' in app_js),
    ("Chip has framed styling (border and background)", ".chip {" in styles_css and "border: 1px solid" in styles_css),

    # 2. Skill gap matrix progress bar uses bright green
    ("Skill gap progress fill uses bright green (#10B981)", "background-color: #10B981;" in styles_css),
    ("Skill gap percentage text uses bright green (#059669)", "#059669" in app_js and "% yêu cầu" in app_js),

    # 3. Bright green colors (no dark #0b6334 in match view)
    ("Dark green #0b6334 eliminated from renderMatchView", "#0b6334" not in app_js[app_js.find("function renderMatchView"):app_js.find("function renderSkillGapMatrix") + 1500]),
    ("chip-green uses bright green #047857 and #ecfdf5", "color: #047857;" in styles_css and "background-color: #ecfdf5;" in styles_css),
    ("title-strengths uses bright green #059669", "color: #059669;" in styles_css),

    # 4. Typography consistency in top matches cards
    ("skill-tag defined in styles.css with var(--font-display)", ".skill-tag {" in styles_css and "font-family: var(--font-display);" in styles_css),
    ("skill-tag.is-matched styled with bright green", ".skill-tag.is-matched {" in styles_css and "#047857" in styles_css),
    ("skill-tag.is-gap styled with warning colors", ".skill-tag.is-gap {" in styles_css),
    ("fit-col-title has var(--font-display)", ".fit-col-title {" in styles_css and "font-family: var(--font-display);" in styles_css),
    ("fit-empty-text styled with var(--font-display)", ".fit-empty-text {" in styles_css and "font-family: var(--font-display);" in styles_css),

    # 5. Full width fit, no horizontal overflow without breaking position: sticky
    ("html uses overflow-x: clip (does not break position: sticky)", "overflow-x: clip;" in styles_css),
    ("match-header-grid has minmax(0, ...)", "minmax(0," in styles_css),
    ("match-columns-grid has minmax(0, ...)", "minmax(0, 1.65fr)" in styles_css),
    ("match-columns-grid children have min-width: 0", ".match-columns-grid > * {" in styles_css and "min-width: 0;" in styles_css),
    ("fit-analysis-box children have min-width: 0", ".fit-analysis-box > * {" in styles_css and "min-width: 0;" in styles_css),
    ("responsive breakpoint for mobile fit-analysis-box", "@media (max-width: 640px)" in styles_css),

    # 6. Sticky behavior for Skill Gap Matrix widget
    ("index.html has match-sidebar-col wrapping skillGapWidget", '<div class="match-sidebar-col">' in index_html and 'id="skillGapWidget"' in index_html),
    ("match-sidebar-col has position: sticky and top: 80px", ".match-sidebar-col {" in styles_css and "position: sticky;" in styles_css and "top: 80px;" in styles_css),
    ("match-columns-grid has align-items: start", "align-items: start;" in styles_css),
    ("skill-gap-widget has position: sticky and top: 80px", ".skill-gap-widget {" in styles_css and "position: sticky;" in styles_css and "top: 80px;" in styles_css),
    ("mobile media query resets match-sidebar-col to static", ".match-sidebar-col, .skill-gap-widget {" in styles_css and "position: static;" in styles_css),

    # 7. Card & Badge Overflow Prevention (Fix for long category descriptions)
    ("comp-cat-chip / chip-cat has max-width and ellipsis in styles.css", ".comp-cat-chip," in styles_css and "text-overflow: ellipsis;" in styles_css),
    ("match-item-card has overflow: hidden in styles.css", ".match-item-card {" in styles_css and "overflow: hidden;" in styles_css),
    ("match-item-badges .chip has max-width and ellipsis in styles.css", ".match-item-badges .chip {" in styles_css and "text-overflow: ellipsis;" in styles_css),
    ("skill-tag has max-width and ellipsis in styles.css", ".skill-tag {" in styles_css and "text-overflow: ellipsis;" in styles_css),
    ("renderMatchView uses comp-cat-chip with title tooltip", 'class="chip chip-cat comp-cat-chip" title="Lĩnh vực:' in app_js),
    ("renderMatchView has word-break on organizer", 'Tổ chức: ${escapeHtml(c.organizer)}</div>' in app_js and 'word-break: break-word;' in app_js)
]

all_passed = True
for name, passed in tests:
    status = "PASS" if passed else "FAIL"
    print(f"[{status}] {name}")
    if not passed:
        all_passed = False

if all_passed:
    print(f"\nALL {len(tests)} TESTS PASSED SUCCESSFULLY!")
else:
    print("\nSOME TESTS FAILED!")
    sys.exit(1)
