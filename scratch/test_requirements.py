import os
import sys
sys.stdout.reconfigure(encoding='utf-8')

with open("index.html", "r", encoding="utf-8") as f:
    index_html = f.read()

with open("styles.css", "r", encoding="utf-8") as f:
    styles_css = f.read()

with open("app.js", "r", encoding="utf-8") as f:
    app_js = f.read()

with open("profile.html", "r", encoding="utf-8") as f:
    profile_html = f.read()

tests = [
    ("Search button is icon-only (no 'Tìm kiếm...' text)", "<span>Tìm kiếm...</span>" not in index_html and 'id="headerSearchBtn"' in index_html),
    ("Search button does NOT have 'Ctrl K' badge", "search-kbd-pill" not in index_html),
    ("Autumn preset completely removed from HTML", "radioPreset2026" not in index_html),
    ("Autumn preset removed from JS logic", "radioPreset2026" not in app_js),
    ("Real device is default checked in HTML", 'id="radioRealDevice" value="real"' in index_html and "checked" in index_html),
    ("Real device is default true in JS state", "useRealDeviceDate: true" in app_js),
    ("Header Profile button has data-tab='profile'", 'id="headerProfileBtn" data-tab="profile"' in index_html),
    ("Profile page section view-profile exists", 'id="view-profile"' in index_html),
    ("Profile layout grid exists in HTML", "profile-layout-grid" in index_html),
    ("Profile form exists", 'id="profilePageForm"' in index_html),
    ("Profile skill categories grid exists", 'id="profileSkillsCategories"' in index_html),
    ("Profile CSS rules defined in styles.css", ".profile-layout-grid" in styles_css),
    ("Header buttons height unified to 38px", "height: 38px" in styles_css),
    ("profile.html redirects to index.html#profile", "index.html#profile" in profile_html),
    ("Duplicate footer tags removed from index.html", index_html.count("</footer>") == 1),
    ("Profile routing tabMap supports #profile", "'#profile': 'profile'" in app_js),
    ("switchTab handles 'profile'", "if (tabId === 'profile') renderProfileView();" in app_js)
]

all_passed = True
for name, passed in tests:
    status = "PASS" if passed else "FAIL"
    print(f"[{status}] {name}")
    if not passed:
        all_passed = False

if all_passed:
    print("\nALL 17 VERIFICATION TESTS PASSED SUCCESSFULLY!")
else:
    print("\nSOME TESTS FAILED!")
