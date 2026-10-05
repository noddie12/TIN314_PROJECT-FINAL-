import re

def test_compare_improvements():
    with open('d:/HA/index.html', 'r', encoding='utf-8') as f:
        html = f.read()

    with open('d:/HA/styles.css', 'r', encoding='utf-8') as f:
        css = f.read()

    with open('d:/HA/app.js', 'r', encoding='utf-8') as f:
        js = f.read()

    # 1. Selector container in index.html
    assert 'id="compareSelectorPanel"' in html, "compareSelectorPanel missing in index.html"
    print("[PASS] compareSelectorPanel container in index.html")

    # 2. CSS styles
    assert '.compare-selector-panel' in css, ".compare-selector-panel missing in styles.css"
    assert '.compare-slots-grid' in css, ".compare-slots-grid missing in styles.css"
    assert '.compare-slot-card' in css, ".compare-slot-card missing in styles.css"
    assert '.compare-slot-select' in css, ".compare-slot-select missing in styles.css"
    assert '.compare-search-input' in css, ".compare-search-input missing in styles.css"
    assert '.compare-search-results' in css, ".compare-search-results missing in styles.css"
    print("[PASS] CSS styling for selector panel, slots grid, search and dropdowns defined")

    # 3. Responsive rule for slots grid
    assert '@media (max-width: 900px)' in css, "responsive breakpoint 900px missing"
    assert 'grid-template-columns: 1fr' in css, "single column on mobile missing"
    print("[PASS] Responsive grid for mobile view defined")

    # 4. JS functions on window
    assert 'window.addCompareFromSelect' in js, "window.addCompareFromSelect missing"
    assert 'window.changeCompareSlot' in js, "window.changeCompareSlot missing"
    assert 'window.clearAllCompare' in js, "window.clearAllCompare missing"
    assert 'window.handleCompareSearchInput' in js, "window.handleCompareSearchInput missing"
    print("[PASS] Compare helper functions exposed on window")

    # 5. Max 3 limit in JS
    assert 'state.compareList.length >= 3' in js, "Limit of 3 comparisons check missing in js"
    print("[PASS] Strict limit of max 3 competitions enforced")

    # 6. Optgroup grouping in select options
    assert '<optgroup label=' in js, "optgroup grouping missing in buildCompetitionSelectOptions"
    print("[PASS] Competitions grouped by category via optgroup in dropdowns")

    # 7. In-table slot selector for empty slot
    assert '+ Thêm cuộc thi #' in js, "In-table selector column missing in renderCompareView"
    print("[PASS] In-table selector column exists when slots < 3")

    print("\nALL 7 COMPARE IMPROVEMENT TESTS PASSED SUCCESSFULLY!")

if __name__ == '__main__':
    test_compare_improvements()
