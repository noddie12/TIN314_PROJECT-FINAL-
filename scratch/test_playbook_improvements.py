import sys
sys.stdout.reconfigure(encoding='utf-8')

with open("styles.css", "r", encoding="utf-8") as f:
    styles_css = f.read()

with open("app.js", "r", encoding="utf-8") as f:
    app_js = f.read()

tests = [
    # 1. Removal of "Xem DNA" button on Playbook
    ("No 'Xem DNA' button in renderPlaybook", 
     'Xem DNA' not in app_js[app_js.find('function renderPlaybook'):app_js.find('window.openSubmitPlaybookModal')]),
    ("No 'playbook-dna-btn' in app.js", 'playbook-dna-btn' not in app_js),
    ("No 'playbook-dna-btn' in styles.css", '.playbook-dna-btn' not in styles_css),
    ("No 'playbook-title-row' in app.js", 'playbook-title-row' not in app_js),

    # 2. Competition name remains interactive
    ("playbook-comp-name has openDnaModal click handler", 'class="playbook-comp-name" onclick="openDnaModal' in app_js),
    ("playbook-comp-name has pointer cursor and hover in styles.css", 
     ".playbook-comp-name {" in styles_css and "cursor: pointer;" in styles_css and ".playbook-comp-name:hover {" in styles_css),
    ("playbook-card-top has clean tag spacing", ".playbook-card-top {" in styles_css)
]

all_passed = True
for name, passed in tests:
    status = "PASS" if passed else "FAIL"
    print(f"[{status}] {name}")
    if not passed:
        all_passed = False

if all_passed:
    print(f"\nALL {len(tests)} PLAYBOOK REMOVAL TESTS PASSED SUCCESSFULLY!")
else:
    print("\nSOME TESTS FAILED!")
    sys.exit(1)
