import json
import re

def clean_data(file_path, is_js=False):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    prefix = ""
    json_str = content
    if is_js:
        # e.g., window.COMPETITIONS_DATA = [...] or const COMPETITIONS_DATA = [...]
        match = re.match(r'^(.*?=\s*)(\[.*\])\s*;?\s*$', content, re.DOTALL)
        if match:
            prefix = match.group(1)
            json_str = match.group(2)
        else:
            print(f"Warning: could not parse JS wrapper in {file_path}")
            return

    comps = json.loads(json_str)

    modified_count = 0
    for c in comps:
        reg = (c.get('registration_link') or '').strip()
        cid = c.get('id')
        
        # Specific fixes
        if cid == 'doanh-nhan-tap-su-2026-actionftu':
            c['registration_link'] = 'https://clbkynangdoanhnhan.com/dnts-2026'
            modified_count += 1
        elif cid == 'rmit-research-challenge-2026-season10':
            c['registration_link'] = 'https://bit.ly/4aWUGs6'
            modified_count += 1
        elif reg and not (reg.startswith('http://') or reg.startswith('https://')):
            # It's an explanatory text or email like 'Not specified' or 'Không xác định...'
            c['registration_link'] = ''
            modified_count += 1

    new_json_str = json.dumps(comps, ensure_ascii=False, indent=2)
    if is_js:
        out_content = prefix + new_json_str + ";\n"
    else:
        out_content = new_json_str + "\n"

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(out_content)
    print(f"Updated {file_path}: {modified_count} competitions cleaned.")

clean_data('data/competitions.json', is_js=False)
clean_data('data/competitions.js', is_js=True)
