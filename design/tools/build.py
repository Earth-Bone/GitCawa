"""Build preview.html from template.html, characters.json and sprites/.

Usage: python tools/build.py   (run from the design/ folder)
"""
import base64
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

chars = json.loads((ROOT / "characters.json").read_text(encoding="utf-8"))
for key, c in chars.items():
    data = base64.b64encode((ROOT / "sprites" / f"{key}.png").read_bytes()).decode()
    c["img"] = f"data:image/png;base64,{data}"

html = (ROOT / "template.html").read_text(encoding="utf-8")
html = html.replace("/*__DATA__*/", json.dumps(chars, ensure_ascii=False), 1)
(ROOT / "preview.html").write_text(html, encoding="utf-8")
print(ROOT / "preview.html", len(html))
