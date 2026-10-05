import json
import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('data/competitions.json', 'r', encoding='utf-8') as f:
    comps = json.load(f)

for c in comps:
    reg = (c.get('registration_link') or '').strip()
    if reg and not (reg.startswith('http://') or reg.startswith('https://')):
        print(f"ID: {c.get('id')}")
        print(f"Name: {c.get('name')}")
        print(f"  raw_reg: {repr(reg)}")
        print(f"  raw_src: {repr(c.get('source_url'))}")
        print("-" * 50)
