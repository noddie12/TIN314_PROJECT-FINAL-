import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

with open('app.js', 'r', encoding='utf-8') as f:
    js = f.read()

ids = set(re.findall(r'getElementById\(["\']([^"\']+)["\']\)', js))
print(f'Total getElementById in app.js: {len(ids)}')

missing = [i for i in sorted(ids) if f'id="{i}"' not in html and f"id='{i}'" not in html]
print(f'Missing IDs: {missing}')
