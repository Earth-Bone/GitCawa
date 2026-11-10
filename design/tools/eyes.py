"""Find filled eyes, skin and ink colour in a 320px sprite.

Usage: python eyes.py SPRITE [SPRITE ...]

Prints JSON per sprite. Works for solid dark eyes; ring-shaped eyes are not
found and must be written into characters.json by hand.
"""
import json
import os
import sys

from PIL import Image


def components(px, w, h, pred):
    seen, comps = set(), []
    for sx in range(w):
        for sy in range(h):
            if (sx, sy) in seen or not pred(px[sx, sy]):
                continue
            st, pts = [(sx, sy)], []
            seen.add((sx, sy))
            while st:
                x, y = st.pop()
                pts.append((x, y))
                for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                    if 0 <= nx < w and 0 <= ny < h and (nx, ny) not in seen and pred(px[nx, ny]):
                        seen.add((nx, ny))
                        st.append((nx, ny))
            xs = [p[0] for p in pts]
            ys = [p[1] for p in pts]
            comps.append(dict(n=len(pts), x0=min(xs), x1=max(xs), y0=min(ys), y1=max(ys)))
    return sorted(comps, key=lambda c: -c["n"])


def find(path):
    im = Image.open(path).convert("RGBA")
    w, h = im.size
    px = im.load()
    comps = components(px, w, h, lambda c: c[3] > 200 and sum(c[:3]) < 330)
    cands = []
    for c in comps[1:]:
        bw, bh = c["x1"] - c["x0"] + 1, c["y1"] - c["y0"] + 1
        if bw >= 10 and bh >= 10 and 0.6 < bw / bh < 1.6 and c["n"] > 0.4 * bw * bh:
            cands.append(c)
    eyes = []
    for e in sorted(cands[:2], key=lambda c: c["x0"]):
        cx, cy = (e["x0"] + e["x1"]) / 2, (e["y0"] + e["y1"]) / 2
        rx, ry = (e["x1"] - e["x0"]) / 2, (e["y1"] - e["y0"]) / 2
        skin = px[int(cx + rx + 4), int(cy)][:3]
        eyes.append(dict(cx=cx, cy=cy, rx=rx, ry=ry, skin="#%02x%02x%02x" % skin))
    ink = [px[x, y] for x in range(w) for y in range(h) if px[x, y][3] > 250 and sum(px[x, y][:3]) < 200][:2000]
    ink = tuple(sum(c[i] for c in ink) // len(ink) for i in range(3))
    return dict(eyes=eyes, ink="#%02x%02x%02x" % ink)


if __name__ == "__main__":
    print(json.dumps({os.path.splitext(os.path.basename(p))[0]: find(p) for p in sys.argv[1:]}, indent=1))
