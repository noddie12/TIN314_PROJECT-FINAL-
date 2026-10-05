import os
import ssl
import json
import urllib3
import requests
from dotenv import load_dotenv

urllib3.disable_warnings()
load_dotenv()

# SSL Patch for Windows Corporate Proxy
_orig_create_default_context = ssl.create_default_context
def _patched_create_default_context(purpose=ssl.Purpose.SERVER_AUTH, **kwargs):
    ctx = _orig_create_default_context(purpose=purpose, **kwargs)
    try:
        ctx.set_ciphers('DEFAULT@SECLEVEL=1')
    except Exception:
        pass
    try:
        ctx.load_default_certs(purpose)
    except Exception:
        pass
    return ctx
ssl.create_default_context = _patched_create_default_context

APIFY_TOKEN = os.getenv("APIFY_TOKEN")
print(f"Testing Apify Token: {APIFY_TOKEN[:10]}...")

# Check actor info or test run
# Actor: apify/facebook-posts-scraper
actor_id = "apify~facebook-posts-scraper"
url = f"https://api.apify.com/v2/acts/{actor_id}"

r = requests.get(url, headers={"Authorization": f"Bearer {APIFY_TOKEN}"}, verify=False)
print("Actor status:", r.status_code)
if r.status_code == 200:
    data = r.json().get("data", {})
    print("Actor Name:", data.get("name"), "Title:", data.get("title"))
else:
    print("Response:", r.text[:200])
