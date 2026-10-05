import json
import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('data/competitions.json', 'r', encoding='utf-8') as f:
    comps = json.load(f)

print(f'Total comps: {len(comps)}')
no_both = []
no_reg = []
valid_both = []

def is_valid_url(u):
    if not u or u == '#' or u.lower() in ['n/a', 'none', 'not specified', 'chưa rõ'] or 'không xác định' in u.lower():
        return False
    if not (u.startswith('http://') or u.startswith('https://')):
        return False
    return True

for c in comps:
    cid = c.get('id')
    name = c.get('name')
    reg = (c.get('registration_link') or '').strip()
    src = (c.get('source_url') or '').strip()

    valid_reg = is_valid_url(reg)
    valid_src = is_valid_url(src)

    if not valid_reg and not valid_src:
        no_both.append((cid, name, reg, src))
    elif not valid_reg:
        no_reg.append((cid, name, reg, src))
    else:
        valid_both.append((cid, name, reg, src))

print(f'\n1. Cuộc thi KHÔNG CÓ CẢ 2 LINK (reg & src đều rỗng/hỏng): {len(no_both)}')
for item in no_both:
    print(f'   - [{item[0]}] {item[1]} | reg: "{item[2]}" | src: "{item[3]}"')

print(f'\n2. Cuộc thi không có reg_link nhưng có source_url: {len(no_reg)}')
for item in no_reg[:10]:
    print(f'   - [{item[0]}] {item[1]} | reg: "{item[2]}" | src: "{item[3]}"')

print(f'\n3. Cuộc thi có valid reg_link: {len(valid_both)}')
