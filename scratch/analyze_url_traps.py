import json
import re
import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('data/competitions.json', 'r', encoding='utf-8') as f:
    comps = json.load(f)

def clean_link(u):
    if not u:
        return None
    u = u.strip()
    if not u or u == '#' or u.lower() in ['n/a', 'none', 'not specified', 'chưa rõ']:
        return None
    # Check if it has Vietnamese phrases like "không xác định", "không có", etc.
    if any(k in u.lower() for k in ['không xác định', 'không có', 'không được đề cập', 'không khả dụng']):
        # But check if there's an embedded url in the text like https://...
        m = re.search(r'https?://[^\s\)]+', u)
        if m:
            return m.group(0)
        return None
    # Check if it is an email
    if '@' in u and not u.startswith('http'):
        return None
    # If missing protocol but looks like domain
    if not u.startswith('http://') and not u.startswith('https://'):
        if '.' in u and not ' ' in u:
            return 'https://' + u
        return None
    return u

relative_url_traps = []

for c in comps:
    raw_reg = c.get('registration_link') or ''
    raw_src = c.get('source_url') or ''
    
    # What current code did:
    old_target = raw_reg or raw_src or '#'
    is_relative = not (old_target.startswith('http://') or old_target.startswith('https://'))
    
    cleaned_reg = clean_link(raw_reg)
    cleaned_src = clean_link(raw_src)
    best_link = cleaned_reg or cleaned_src

    if is_relative or old_target == '#':
        relative_url_traps.append({
            'id': c.get('id'),
            'name': c.get('name'),
            'raw_reg': raw_reg,
            'raw_src': raw_src,
            'old_target': old_target,
            'best_link': best_link
        })

print(f'Total competitions where old code opened our own website: {len(relative_url_traps)} / {len(comps)}!')
for item in relative_url_traps:
    print(f"- [{item['id']}] {item['name']}")
    print(f"    old_target: {repr(item['old_target'])}")
    print(f"    cleaned best_link: {repr(item['best_link'])}\n")
