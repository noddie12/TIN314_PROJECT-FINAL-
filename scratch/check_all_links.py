import json
import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('data/competitions.json', 'r', encoding='utf-8') as f:
    comps = json.load(f)

for c in comps:
    src = (c.get('source_url') or '').strip()
    if src and not (src.startswith('http://') or src.startswith('https://')):
        print(f"source_url issue: [{c.get('id')}] {src}")
    reg = (c.get('registration_link') or '').strip()
    if reg and not (reg.startswith('http://') or reg.startswith('https://')):
        print(f"registration_link issue: [{c.get('id')}] {reg}")
